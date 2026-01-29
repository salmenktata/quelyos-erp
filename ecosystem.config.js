module.exports = {
  apps: [
    {
      name: 'vitrine-quelyos',
      cwd: './vitrine-quelyos',
      script: 'npm',
      args: 'run start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      error_file: './logs/vitrine-quelyos-error.log',
      out_file: './logs/vitrine-quelyos-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'vitrine-client',
      cwd: './vitrine-client',
      script: 'npm',
      args: 'run start',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      error_file: './logs/vitrine-client-error.log',
      out_file: './logs/vitrine-client-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'dashboard-client',
      cwd: './dashboard-client',
      script: 'npm',
      args: 'run preview -- --port 5175',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      error_file: './logs/dashboard-error.log',
      out_file: './logs/dashboard-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
}
