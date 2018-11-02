'use strict';
const bodyParser = require('body-parser');
const express = require('express');
const request = require("request");
const cheerio = require('cheerio');

let port = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// keys should be an array
function searchBody(html, keys) {
  console.log(keys);
  let found = false;
  while(keys.length > 0 && !found) {
    found = html.includes(keys.pop()) ? true : false;
  }
  return found;
};

function parseEmail(source) {
  let sourceSplit = source.split(' ');
  let possibleEmails = [];
  let stop = false;
  while(!stop && !sourceSplit == []) {
    let newStr = sourceSplit.pop();
    if(newStr && newStr.includes('mailto')) {
      possibleEmails.push(newStr);
    }
    if(newStr == undefined) {
      stop = true;
    }
  }
  return possibleEmails;
};

app.post('/techSearch', async (req, res) => {
  let url = req.body.url;
  let techKeys = req.body.keys;
  console.log(techKeys);
  if (url.includes('https') == false || url.includes('http') == false) {
    url = `http://${url}`;
    console.log(url);
  }
  try {
    request(url, (error, response, body) => {
        if (!error) {
          let searchResult = searchBody(body, techKeys);
          res.send({ "result": searchResult });
        } else {
          console.log(error);
          res.send({ "error": error });
        }
    });
  } catch (e) {
    console.log(e);
    res.send('some error occured - check server logs');
  }
});

app.post('/getDomain', async (req, res) => {
  let searchCompany = req.body.company.replace(' ', '+');
  console.log(company);
  try {
    request(`https://www.google.ca/search?q=test+test&rlz=1C5CHFA_enCA774CA775&oq=${searchCompany}`, (error, response, body) => {
      if(!error) {
        let $ = cheerio.load(body);
        let list = $("a");
        let hrefList = list("href");
        console.log(hrefList.html());
      } else {
        res.send({"error": error});
      }
    });
  } catch (e) {
    console.log(e);
    res.send('some error occurred - check server logs')
  }
});

app.post('/domainEmail', async (req, res) => {
  try {
    let url = req.body.url;
    if (!url.includes('https') && !url.includes('http')) {
      url = `http://${url}`;
      console.log(url);
    }
    request(url, (error, response, body) => {
        if (!error) {
          let searchResult = parseEmail(body);
          res.send({ "result": searchResult });
        } else {
          res.send({ "error": error });
        }
    });
  } catch (e) {
    console.log(e);
    res.send('some error occured - check server logs');
  }
});

app.listen(port, () => {
  console.log(`Server listening on port: ${port}`);
});
