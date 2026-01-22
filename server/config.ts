import dotenv from 'dotenv';
import moduleAlias from 'module-alias';
import path from 'path';

// eslint-disable-next-line no-process-env
const NODE_ENV = process.env.NODE_ENV ?? 'development';

const envPath = path.join(__dirname, './.env');

const result2 = dotenv.config({
  path: envPath,
});

if (result2.error) {
  if (NODE_ENV === 'production') {
    console.log(`[Config] No .env file found at ${envPath}. Assuming variables are set in environment.`);
  } else {
    throw result2.error;
  }
}

if (__filename.endsWith('js')) {
  moduleAlias.addAlias('@src', __dirname + '/dist');
}
