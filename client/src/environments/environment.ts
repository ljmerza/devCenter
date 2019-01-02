import { baseEnv, devServer } from './baseEnvironment';

export const environment = {
  ...baseEnv,
  envName: 'DEV',
  production: false,
  apiUrl: `${devServer}:5859/devcenter_dev`,
  devServer,
  test: false,
};
