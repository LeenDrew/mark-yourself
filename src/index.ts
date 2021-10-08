import mongoose from 'mongoose';
import vk from './bot';
import config from './config';

(async () => {
  try {
    await mongoose.connect(config.mongo.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions);
    await vk.updates.start();
  } catch (e) {
    console.error(`mongo connect ERROR: ${e as string}`);
  }
})();
