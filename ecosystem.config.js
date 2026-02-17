module.exports = {
  apps: [
    {
      name: 'tag-padrin-backend',
      cwd: '/home/jorgenunes/projetos/tag-padrin/backend',
      script: 'dist/src/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/home/jorgenunes/projetos/tag-padrin/log/tag-padrin-backend-error.log',
      out_file: '/home/jorgenunes/projetos/tag-padrin/log/tag-padrin-backend-out.log',
      log_file: '/home/jorgenunes/projetos/tag-padrin/log/tag-padrin-backend-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },
    {
      name: 'tag-padrin-frontend',
      script: '/home/jorgenunes/projetos/tag-padrin/start-frontend.sh',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      error_file: '/home/jorgenunes/projetos/tag-padrin/log/tag-padrin-frontend-error.log',
      out_file: '/home/jorgenunes/projetos/tag-padrin/log/tag-padrin-frontend-out.log',
      log_file: '/home/jorgenunes/projetos/tag-padrin/log/tag-padrin-frontend-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
};
