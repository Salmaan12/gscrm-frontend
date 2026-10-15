// //Install express server
const express = require('express');

// const path = require('path');

const app = express();

// Serve only the static files form the dist directory
// app.use('/static', express.static(__dirname + '/dist'));

app.use(express.static(__dirname + '/dist/cuba'));

app.get('/*', function(req,res) {
    res.sendFile(path.join(__dirname+'/dist/cuba/index.html'));
});

// // Start the app by listening on the default Heroku port
// const puppeteer = require('puppeteer');

// (async () => {

//   const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });

//   const page = await browser.newPage();
//   await page.goto('https://facebook.com/login');


//   await page.evaluate(() => {


//     document.getElementById('email').value = 'hammad.malick@paz.agency';
//     document.getElementById('pass').value = 'Lesa@1284';
//     document.querySelector('button[type=submit]').click();
//     //  document.getElementById('password').value = 'Lesa@1284'
//     //let btn =  document.getElementById('loginbutton');
//     //btn.click();
//   });
//   page.goto('https://facebook.com');

//   await page.screenshot({ path: 'screenshot.png' });
// })();
// window.location.href = 'https://facebook.com'
app.listen(process.env.PORT || 8001);
