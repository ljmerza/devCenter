const packageJson = require('../../package.json');

export const baseEnv = {
  appName: 'Dev Center',
  i18nPrefix: '',
  versions: {
    app: packageJson.version,
    angular: packageJson.dependencies['@angular/core'],
    ngrx: packageJson.dependencies['@ngrx/store'],
    material: packageJson.dependencies['@angular/material'],
    bootstrap: packageJson.dependencies.bootstrap,
    rxjs: packageJson.dependencies.rxjs,
    ngxtranslate: packageJson.dependencies['@ngx-translate/core'],
    fontAwesome:
      packageJson.dependencies['@fortawesome/fontawesome-free-webfonts'],
    angularCli: packageJson.devDependencies['@angular/cli'],
    typescript: packageJson.devDependencies['typescript'],
    cypress: packageJson.devDependencies['cypress']
  },

  rootDomain: 'gcsc.att.com',

  jiraUrl: 'http://jira.web.att.com',
  crucibleUrl: 'https://icode3.web.att.com',
  codeCloudUrl: 'https://codecloud.web.att.com',
  betaUrl: 'http://chrapud16b.gcsc.att.com',
  wikiUrl: 'https://wiki.web.att.com',
  msrpLink: 'http://ix.web.att.com',

  jiraPath: '/secure/Dashboard.jspa',
  cruciblePath: '/cru/browse/CR-UD',
  codeCloudPath: '/projects',
  scrumBoardPath:
    '/secure/RapidBoard.jspa?rapidView=178&view=planning.nodetail&versions=visible',

  myApex: 'https://myapex.apexsystemsinc.com/psp/MYAPEX/',

  chatUrl: 'qto://talk',
  chatIconUrl: 'http://presence.q.att.com/presence',

  devServers: ['rldv0210', 'rldv0211', 'm5devacoe01'],

  emberBuilds: [
    { label: 'Development Server', value: 'dev' },
    { label: 'Local Server', value: 'local' }
  ],

  themes: [
    { value: 'DEFAULT-THEME', label: 'blue' },
    { value: 'LIGHT-THEME', label: 'light' },
    { value: 'NATURE-THEME', label: 'nature' },
    { value: 'BLACK-THEME', label: 'dark' }
  ]
};

export const devServer = `http://rldv0211.${baseEnv.rootDomain}`;
