module.exports = {
  apps: [{
    name: 'ravin-bot-twitch',
    script: './build/index.js',
    watch: false,
    env: {
      pm2: true,
    },
    max_restarts: 5,
    restart_delay: 5000,
  }],
};

