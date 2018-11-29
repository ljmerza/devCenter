import { baseEnv, devServer } from './baseEnvironment';

export const environment = {
  ...baseEnv,
  envName: 'DEV',
  production: false,
  test: false,
  devServer,
  apiUrl: `${devServer}:5859/dev_center`
};
