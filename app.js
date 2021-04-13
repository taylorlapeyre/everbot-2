var http = require('http');
require('dotenv').config();
const Discord = require('discord.js');
const Redis = require("redis");
const fetch = require('node-fetch');

const redis = Redis.createClient(process.env.REDIS_URL);
const client = new Discord.Client();

const KARMA_KEY = 'everbot_karma'
const imageQueryUrl = (q) => `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(q)}&searchType=image&safe=high&fields=items(link)&cx=018286577215759953988%3Ak2zgjf6rwcm&key=AIzaSyDWj4vC3DUpwaEwJzhvNk8-URBjN66rgpM`

redis.on("error", (error) => {
  console.error(error);
});

client.on('ready', () => {
  console.log('Bot is ready');
});

client.login(process.env.BOT_TOKEN);

const points = new Map();

client.on('message', (msg) => {
  console.log('============================================');

  if (msg.content.toLowerCase() === 'hello') {
    msg.reply('World');
  }

  if (msg.content.match(/^everbot image me/)) {
    const matches = msg.content.match(/^everbot image me (.*)$/);
    if (matches.length > 0) {
      fetch(imageQueryUrl(matches[0])).then(response => response.json()).then(json => {
        const { items } = json;
        msg.reply(items[0].link);
      })
    }
  }

  const matches = msg.content.match(/(\w+)\+\+/g);

  if (matches && matches.length > 0) {
    for (const fullTerm of matches) {
      const term = fullTerm.slice(0, -2);

      redis.hgetall(KARMA_KEY, (err, existingPoints = {}) => {
        if (err) {
          console.error(err);
        }

        console.log(existingPoints);

        let points = existingPoints[term] ? Number(existingPoints[term]) : 0;

        console.log('points', points);
        points++;
        console.log(points)

        redis.hmset([KARMA_KEY, term, points], () => {
          msg.reply(`${term}: ${points}`);
        });
      })
    }
  }

  if (msg.content === 'everbot points') {
    let message = '\n';

    redis.hgetall(KARMA_KEY, (err, value) => {
      console.log(value);

      if (err) {
        console.error(err);
      }

      for (const [key, points] of Object.entries(value)) {
        message += `${key}: ${points}\n`;
      }

      msg.reply(message);
    });
  }
});


http.createServer((req, res) => {
  res.write('Hello World!'); //write a response to the client
  res.end(); //end the response
}).listen(process.env.PORT);