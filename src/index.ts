import mongoose from 'mongoose';
import vk from './bot';
import config from '../config';

(async () => {
  try {
    await mongoose.connect(config.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions);
    await vk.updates
      .start()
      .then(() => console.log('Bot was started'))
      .catch(console.error);
  } catch (e) {
    console.error(`mongo connect ERROR: ${e as string}`);
  }
})();
