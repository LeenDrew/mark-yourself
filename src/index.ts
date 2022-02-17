import mongoose from 'mongoose';
import { ApplicationModule } from './app.module';
import { config } from './config';

(() => {
  mongoose
    .connect(config.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions)
    .catch(console.error);

    const app = new ApplicationModule();
    app.start()
})();
