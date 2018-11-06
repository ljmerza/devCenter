import { baseEnv, devServer } from './baseEnvironment';

export const environment = {
  ...baseEnv,
  envName: 'TEST',
  production: false,
  test: true,
  apiUrl: 'http://localhost',
  devServer,
  port: 3000
};
