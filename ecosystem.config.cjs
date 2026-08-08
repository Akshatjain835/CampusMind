module.exports = {
  apps: [
    {
      name: 'campusmind-ai-service',
      cwd: './ai-service',
      script: 'uvicorn',
      args: 'app.main:app --host 0.0.0.0 --port 8000 --workers 2',
      interpreter: 'none',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        PORT: 8000
      }
    },
    {
      name: 'campusmind-express-server',
      cwd: './server',
      script: 'src/server.js',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    }
  ]
};
