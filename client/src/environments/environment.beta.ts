import { baseEnv, devServer } from './baseEnvironment';

export const environment = {
  ...baseEnv,
  envName: 'PROD',
  production: true,
  test: false,
  apiUrl: devServer,
  devServer,
  port: 5860
};
