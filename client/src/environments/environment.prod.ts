import { baseEnv, devServer } from './baseEnvironment';

export const environment = {
  ...baseEnv,
  envName: 'PROD',
  production: true,
  apiUrl: `${devServer}:5858/devcenter`,
  devServer,
  test: false,
};
