module.exports = {
  apps: [
    {
      name: 'dev-center-dev',
      cwd: '/opt/app/lm240n/www/devcenter_dev',
      script: 'python -m devcenter --devui',
      env: {

      }
    },
    {
      name: 'dev-center-beta',
      cwd: '/opt/app/lm240n/www/devcenter_beta',
      script: 'python -m devcenter --betaui',
      env: {

      }
    },
    {
      name: 'dev-center-prod',
      cwd: '/opt/app/lm240n/www/devcenter',
      script: 'python -m devcenter --prod',
      env: {

      }
    },
    {
      name: 'dev-center-prod-beta',
      cwd: '/opt/app/lm240n/www/devcenter',
      script: 'python -m devcenter --prod --beta',
      env: {

      }
    },
    {
      name: 'dev-center-prod-betanow',
      script: '/opt/app/lm240n/www/devcenter',
      script: 'python -m devcenter --prod --beta --betanow',
      env: {

      }
    },
  ]
};
