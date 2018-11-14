import { baseEnv, devServer } from './baseEnvironment';

export const environment = {
  ...baseEnv,
  envName: 'PROD',
  production: true,
  apiUrl: devServer,
  devServer,
  port: 5858,
  test: false,
};
