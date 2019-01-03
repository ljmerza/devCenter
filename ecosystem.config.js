module.exports = {
  apps: [
    {
      name: 'dev-center-dev',
      script: '/opt/app/lm240n/www/devcenter_dev/server/__main__.py',
      args: ['devui']
    },
    {
      name: 'dev-center-beta',
      script: '/opt/app/lm240n/www/devcenter_beta/server/__main__.py',
      args: ['betaui']
    },
    {
      name: 'dev-center-prod',
      script: '/opt/app/lm240n/www/devcenter/server/__main__.py',
      args: ['prod']
    },
    {
      name: 'dev-center-prod-beta',
      script: '/opt/app/lm240n/www/devcenter/server/__main__.py',
      args: ['prod', 'beta']
    },
    {
      name: 'dev-center-prod-betanow',
      script: '/opt/app/lm240n/www/devcenter/server/__main__.py',
      args: ['prod', 'beta', 'betanow']
    },
  ]
};
