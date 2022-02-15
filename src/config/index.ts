import * as dotenv from 'dotenv';

dotenv.config();

enum Env {
  VK_API_TOKEN = 'VK_API_TOKEN',
  VK_API_LIMIT = 'VK_API_LIMIT',
  VK_API_CALLBACK_RESPONSE = 'VK_API_CALLBACK_RESPONSE',
  VK_GROUP_ID = 'VK_GROUP_ID',
  MONGO_LOGIN = 'MONGO_LOGIN',
  MONGO_PASSWORD = 'MONGO_PASSWORD',
  MONGO_URI = 'MONGO_URI',
}

const checkEnv = (envName: string): string => {
  const envValue = process.env[envName];
  if (!envValue) {
    throw new Error(`Check that '${envName}' really exist in your .env file`);
  }
  return envValue;
};

const initConfig = () => ({
  VK_API_TOKEN: checkEnv(Env.VK_API_TOKEN),
  VK_API_LIMIT: parseInt(checkEnv(Env.VK_API_LIMIT), 10),
  VK_API_CALLBACK_RESPONSE: checkEnv(Env.VK_API_CALLBACK_RESPONSE),
  VK_GROUP_ID: parseInt(checkEnv(Env.VK_GROUP_ID), 10),
  MONGO_LOGIN: checkEnv(Env.MONGO_LOGIN),
  MONGO_PASSWORD: checkEnv(Env.MONGO_PASSWORD),
  MONGO_URI: checkEnv(Env.MONGO_URI),
});

export const config = initConfig();
