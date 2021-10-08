import mongoose from 'mongoose';
import vk from './bot';
import logger from './common/logger';
import config from './config';

(async () => {
  try {
    await mongoose.connect(config.mongo.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions);
    await vk.updates.start();
    logger.log({
      level: 'info',
      message: `Bot was successfully started`,
    });
  } catch (e: unknown) {
    logger.log({
      level: 'error',
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      message: `mongo connect ERROR: ${e}`,
    });
  }
})();
