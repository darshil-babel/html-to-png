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
  var clip = {
        x: 0,
        y: 0,
        width: 1366,
        height: 768
  }  
    await page.screenshot({ path: "public/" + filename, clip: clip });
  await browser.close();
  return filename;
}

app.get('/convert-html-to-png', function(req, res) {
  let filename = crypto.createHash('md5').update(req.query.url).digest('hex') + ".png";
  let result = createScreenShot(req.query.url, filename).then(function() {
    var options = {
      root: __dirname + '/public/',
    };

    res.sendFile(filename, options, function(err) {
      if (err) {
   	console.log("Error:" + err);
        res.status(500).send(err);
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
