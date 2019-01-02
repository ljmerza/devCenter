import { baseEnv, devServer } from './baseEnvironment';

export const environment = {
  ...baseEnv,
  envName: 'TEST',
  production: false,
  port: 5859,
  devServer,
  test: true
};

environment.apiUrl = `${environment.devServer}:${environment.port}/dev_center`;