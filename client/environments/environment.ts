import { baseEnv, devServer } from './baseEnvironment';

export const environment = {
  ...baseEnv,
  envName: 'DEV',
  production: false,
  test: false,
  apiUrl: `${devServer}:5858/dev_center`, 
};
