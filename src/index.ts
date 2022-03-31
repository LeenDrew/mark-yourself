import { vk } from './bot';
import { config } from './config';

(() => {
  vk.updates
    .start()
    .then(() => console.log('Bot was started'))
    .catch(console.error);
})();
