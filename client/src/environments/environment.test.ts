import { baseEnv, devServer } from './baseEnvironment';

export const environment = {
  ...baseEnv,
  envName: 'TEST',
  production: false,
  apiUrl: 'http://localhost',
  devServer,
  test: true,
};
