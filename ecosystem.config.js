module.exports = {
  apps: [{
    name: 'llmmood',
    script: 'node',
    args: 'start-production.js',
    env: {
      NODE_ENV: 'production'
    },
    cwd: '/home/llmmood',
    watch: false,
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    max_memory_restart: '1G',
    error_file: '/root/.pm2/logs/llmmood-error.log',
    out_file: '/root/.pm2/logs/llmmood-out.log',
    log_file: '/root/.pm2/logs/llmmood-combined.log',
    time: true
  }]
};