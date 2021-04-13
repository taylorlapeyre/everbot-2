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
      const key = `${KARMA_KEY_PREFIX}${term}`;

      redis.get(key, (existingPoints) => {
        console.log(existingPoints);
        let points = Number(existingPoints);
        console.log('points', points);
        points++;
        console.log(points)
        redis.set(key, points, () => {
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
        console.log(err);
      }

      for (const [key, value] of value.entries()) {
        message += `${key}: ${value}\n`;
      }
    });

    for (const key of points.keys()) {
      message += `${key}: ${points.get(key)}\n`;
    }

    msg.reply(message);
  }
});
