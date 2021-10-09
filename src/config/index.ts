import * as dotenv from 'dotenv';

dotenv.config();

const initConfig = () => ({
  VK_API_TOKEN: process.env.VK_API_TOKEN || '',
  VK_API_LIMIT: parseInt(process.env.VK_API_LIMIT ?? '', 10),
  VK_API_CALLBACK_RESPONSE: process.env.VK_API_CALLBACK_RESPONSE || '',
  VK_GROUP_ID: parseInt(process.env.VK_GROUP_ID ?? '', 10),
  MONGO_LOGIN: process.env.MONGO_LOGIN || '',
  MONGO_PASSWORD: process.env.MONGO_PASSWORD || '',
  MONGO_URI: process.env.MONGO_URI || '',
});

export const config = initConfig();
