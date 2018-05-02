const express = require('express')
const puppeteer = require("puppeteer");
const crypto = require('crypto');
var fs = require('fs');

const app = express()

const createScreenShot = async function(url, filename) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  console.log(url);
  await page.goto(url, { waitUntil: "networkidle0" });
  await page.screenshot({ path: "public/" + filename });
  await browser.close();
}

app.get('/convert-html-to-png', function(req, res, next) {
  filename = crypto.createHash('md5').update(req.query.url).digest('hex') + ".png";
  let result = createScreenShot(req.query.url, filename).then(function() {
    var options = {
      root: __dirname + '/public/',
    };

    res.sendFile(filename, options, function(err) {
      if (err) {
        next(err);
      } else {
        fs.unlinkSync(__dirname + '/public/' + filename);
      }
    });
  });
})

app.use(express.static('public'))

app.listen(3011, () => {
  console.log('Server started')
})
