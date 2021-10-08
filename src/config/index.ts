/* eslint-disable class-methods-use-this */
/* eslint-disable radix */
import * as dotenv from 'dotenv';

dotenv.config();

export type Config = {
  vk: {
    api: {
      token: string;
      limit: number;
      callbackResponse: string;
    };
    group: {
      id: number;
    };
  };
  mongo: {
    password: string;
    login: string;
    uri: string;
  };
};

class ConfigService {
  private config: Config;

  constructor() {
    this.config = {
      vk: {
        api: {
          token: this.getEnvironment('VK_API_TOKEN'),
          limit: Number.parseInt(this.getEnvironment('VK_API_LIMIT')),
          callbackResponse: this.getEnvironment('VK_API_CALLBACK_RESPONSE'),
        },
        group: {
          id: Number.parseInt(this.getEnvironment('VK_GROUP_ID')),
        },
      },
      mongo: {
        password: this.getEnvironment('MONGO_PASSWORD'),
        login: this.getEnvironment('MONGO_LOGIN'),
        uri: this.getEnvironment('MONGO_URI'),
      },
    };
  }

  public getEnvironment(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error('Invalid environment');
    }
    return value;
  }

  public getConfig(): Config {
    return this.config;
  }
}

const configService = new ConfigService();
export default configService.getConfig();
