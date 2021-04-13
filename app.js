var http = require('http');
require('dotenv').config();
const Discord = require('discord.js');
const Redis = require("redis");

const redis = Redis.createClient(process.env.REDIS_URL);
const client = new Discord.Client();

const KARMA_KEY_PREFIX = 'everbot_karma_'

redis.on("error", (error) => {
  console.error(error);
});

client.on('ready', () => {
  console.log('Bot is ready');
});

client.login(process.env.BOT_TOKEN);

const points = new Map();

client.on('message', (msg) => {
  console.log('============================================')
  if (msg.content.toLowerCase() === 'Hello') {
    msg.reply('Hi');
  }

  const matches = msg.content.match(/(\w+)\+\+/g);

  if (matches && matches.length > 0) {
    for (const fullTerm of matches) {
      const term = fullTerm.slice(0, -2);

      redis.hgetall(KARMA_KEY_PREFIX, (err, existingPoints) => {
        if (err) {
          console.error(err);
        }

        console.log(existingPoints);

        let points = Number(existingPoints[term]);

        console.log('points', points);
        points++;
        console.log(points)

        redis.hmset([key, term, points], () => {
          msg.reply(`${term}: ${points}`);
        });
      })
    }
  }

  if (msg.content === 'everbot points') {
    let message = '\n';

    redis.hgetall(KARMA_KEY_PREFIX, (err, value) => {
      console.log(value);

      if (err) {
        console.error(err);
      }

      for (const [key, points] of value.entries()) {
        message += `${key}: ${points}\n`;
      }
    });

    msg.reply(message);
  }
});


http.createServer((req, res) => {
  res.write('Hello World!'); //write a response to the client
  res.end(); //end the response
}).listen(process.env.PORT);