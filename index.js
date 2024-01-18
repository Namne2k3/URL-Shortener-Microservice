require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const dns = require('dns')
const shortId = require('shortid');
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/shorturl', function (req, res) {
  res.json({ greeting: "Hello World" })
});

const urls = {};
app.get('/api/shorturl/:short_url', function (req, res) {
  // console.log("Check req.params", req.params.short_url);

  const longUrl = urls[req.params.short_url]

  if (longUrl) {
    console.log("Redirecting to:", longUrl);

    // Check if the long URL starts with a protocol (http:// or https://)
    if (longUrl.startsWith('http://') || longUrl.startsWith('https://')) {
      res.redirect(longUrl);
    } else {
      // If not, assume it's an external URL and prepend 'http://' to it
      res.redirect(`http://${longUrl}`);
    }
  } else {
    res.json({ error: 'Short URL not found' });
  }
})


function middleWare(req, res, next) {
  dns.lookup(req.body?.url, function (err, addresses) {
    if (err) {
      res.json({ error: 'invalid url' })
    }
    const id = shortId.generate()
    req.body.short_url = id
    urls[id] = req.body?.url

    console.log("Check req.body >>> ", req.body);
    next();
  })
}

app.post('/api/shorturl', middleWare, function (req, res) {

  res.json({
    original_url: req.body?.url,
    short_url: req.body.short_url
  });
})



app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
