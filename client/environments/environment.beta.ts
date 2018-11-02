import { baseEnv, devServer } from './baseEnvironment';

export const environment = {
  ...baseEnv,
  envName: 'PROD',
  production: true,
  test: false,
  i18nPrefix: '/angular-ngrx-material-starter',
  apiUrl: devServer, 
  devServer,
  port: 5859,
};
