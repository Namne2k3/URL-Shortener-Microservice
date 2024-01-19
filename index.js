require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const dns = require('dns')
const shortId = require('shortid');
const connectDB = require('./connectDB')
const url = require('url')
// Basic Configuration
const port = process.env.PORT || 3000;
const URL_Model = require('./models/Url')
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

app.get('/api/shorturl/:short_url', async function (req, res) {
  const shortUrl = req.params.short_url
  const findUrl = await URL_Model.findOne({ short_url: +shortUrl })
  res.redirect(findUrl?.original_url)
})

function middleWare(req, res, next) {
  const inputUrl = req.body.url
  const parsedUrl = new URL(inputUrl)
  dns.lookup(parsedUrl.hostname, function (err, addresses) {
    if (!addresses) {
      res.json({ error: 'invalid url' })
    }

    req.body.url = parsedUrl
    next();
  })

}

app.post('/api/shorturl', middleWare, async function (req, res) {
  try {
    const countUrl = await URL_Model.countDocuments({})
    const URLData = {
      original_url: req.body.url,
      short_url: countUrl
    }

    const newURL = await URL_Model.create(URLData)
    await newURL.save()

    res.json({
      original_url: newURL.original_url,
      short_url: newURL.short_url
    });

  } catch (err) {
    res.json({
      error: err.message
    })
  }
})



app.listen(port, async function () {
  await connectDB();
  console.log(`Listening on port ${port}`);
});
