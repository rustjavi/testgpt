const os = require('os');
const dotenv = require('dotenv');
const { setCookies } = require('./g4f/cookies');

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
