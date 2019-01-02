import { baseEnv, devServer } from './baseEnvironment';

export const environment = {
  ...baseEnv,
  envName: 'PROD',
  production: true,
  apiUrl: `${devServer}:5859/devcenter_beta`,
  devServer,
  test: false,
};
