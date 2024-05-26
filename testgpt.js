const os = require('os');
const dotenv = require('dotenv');
const path = require('path');
const { setCookies } = require('./g4f/cookies');
const express = require('express');

const app = express();
const port = 3000;
app.get('/', (req, res) => {
  const imagePath = path.join(__dirname, 'index.html');
  res.sendFile(imagePath);
});
app.listen(port, () => {
  console.log(`🔗 Listening to GlaceYT : http://localhost:${port}`);
    
});

dotenv.load();

if (require.main === module) {
  setCookies('.bing.com', {
    '_U': process.env.BING_COOKIE
  });
  setCookies('.google.com', {
    '__Secure-1PSID': process.env.GOOGLE_PSID
  });
  require('./src/bot').runDiscordBot();
}
