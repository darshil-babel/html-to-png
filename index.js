const express = require('express')
const puppeteer = require("puppeteer");
const crypto = require('crypto');
var fs = require('fs');

const app = express()

const createScreenShot = async function(url) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  console.log(url);
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  await page.setViewport({ width: 1366, height: 768});
  await page.goto(url, { waitUntil: "networkidle0" });
  await page.addScriptTag({url: 'https://s3-ap-southeast-1.amazonaws.com/ajstatic.in/html2canvas.min.js'}).then(()=>{
    console.log("Script Added");
  });
  await page.evaluate(() => {
      html2canvas(document.querySelector("section")).then(canvas => {
          window.image_data = canvas.toDataURL();
      });
  });
  await page.waitFor(4000);
  const image_data = await page.evaluate(() => {
      return window.image_data;
  });
  await browser.close();
  return image_data;
}

app.get('/convert-html-to-png', function(req, res) {
  createScreenShot(req.query.url).then(result =>{
    console.log('image_data: '+result);
    var im = result.split(",")[1];
    var img = new Buffer(im, 'base64');
    console.log("Sending File");
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': img.length
    });
    res.end(img);
  }); 
})

app.use(express.static('public'))

app.listen(3011, () => {
  console.log('Server started')
})
