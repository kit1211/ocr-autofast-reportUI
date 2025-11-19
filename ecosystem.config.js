module.exports = {
  apps: [
    {
      name: 'report-ocr-autofast',
      script: 'bun',
      args: 'src/index.tsx',
      cwd: '/path/to/dashboard-requestLog-aiOCR_v2', // เปลี่ยนเป็น path จริงของโปรเจค
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0',
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      watch: false,
    },
  ],
};

