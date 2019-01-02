import { baseEnv, devServer } from './baseEnvironment';

export const environment = {
  ...baseEnv,
  envName: 'PROD',
  production: true,
  port: 5860,
  devServer,
  test: false
};

environment.apiUrl = `${environment.devServer}:${environment.port}/dev_center`;