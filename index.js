require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

//non persistent for practice purpose only
let shortUrlCounter = 1;
let shortUrlDatabase = {};

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function(req, res) { 
  try {
    const url = req.body.url;
    const urlObject = new URL(url);
    const urlHostname = urlObject.hostname;

    dns.lookup(urlHostname, function(err, address) {
      if (err) {
        res.json({ error: 'invalid url' });
      } else {
        //increment shortUrlCounter and store shortenedUrl with original one
        const shortUrl = shortUrlCounter;
        shortUrlCounter++;
        shortUrlDatabase[shortUrl] = url;
        res.json({
          original_url: url,
          short_url: shortUrl
        });
      }
    });
  } catch (err) {
    res.json({ error: 'invalid url' });
  }
});

app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = req.params.short_url;
  const url = shortUrlDatabase[shortUrl];

  if (!url) {
    res.json({error: "No url found for given short url"});
  } else {
    res.redirect(url);
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
