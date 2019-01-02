import { baseEnv, devServer } from './baseEnvironment';

export let environment = {
  ...baseEnv,
  envName: 'DEV',
  production: false,
  port: 5859,
  devServer,
  test: false
};

environment.apiUrl = `${environment.devServer}:${environment.port}/dev_center`;