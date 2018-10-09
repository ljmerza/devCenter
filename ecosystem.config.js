module.exports = {
  apps: [{
    name: "app",
    interpreter: '/home/lm240n/python/bin'
    script: "/opt/app/lm240n/www/devcenterdev/server",
    env: {
      NODE_ENV: "development"
    },
    env_production: {
      NODE_ENV: "production",
    },
    node_args:['prodhost']
  }]
}