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
          token: this.getEnvironmentValueByKey('VK_API_TOKEN'),
          limit: Number.parseInt(this.getEnvironmentValueByKey('VK_API_LIMIT')),
          callbackResponse: this.getEnvironmentValueByKey('VK_API_CALLBACK_RESPONSE'),
        },
        group: {
          id: Number.parseInt(this.getEnvironmentValueByKey('VK_GROUP_ID')),
        },
      },
      mongo: {
        password: this.getEnvironmentValueByKey('MONGO_PASSWORD'),
        login: this.getEnvironmentValueByKey('MONGO_LOGIN'),
        uri: this.getEnvironmentValueByKey('MONGO_URI'),
      },
    };
  }

  private getEnvironmentValueByKey(key: string): string {
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
