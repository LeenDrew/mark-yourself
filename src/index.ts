import mongoose from 'mongoose';
import { vk } from './bot';
import { config } from './config';

(() => {
  mongoose
    .connect(config.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions)
    .catch(console.error);
  vk.updates
    .start()
    .then(() => console.log('Bot was started'))
    .catch(console.error);
})();
