import app from './src/app.js';
import { env } from './src/config/env.js';
import { logger } from './src/utils/logger.js';

app.listen(env.PORT, () => {
  logger.info(`Target Classes API listening on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
});
