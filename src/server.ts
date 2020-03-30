import 'source-map-support/register';
import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import { config } from './config';
import proxyService from './services/proxy';
import { redbird } from './utils/redbird';
import successResponder from './middleware/response-success';
import errorResponder from './middleware/response-error';
import serverConnectionPool from './lib/server-connection-pool';
import { getLocalIPAddress } from './utils/network';

export const app = express();

const corsOptions: cors.CorsOptions = {
  origin: '*',
  credentials: true,
  methods: 'GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD'
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(bodyParser.json());
app.use(successResponder);
app.use(errorResponder);

export async function start() {
  try {
    const localIPAddress = await getLocalIPAddress();
    const proxyHosts = proxyService(app, { proxy: redbird, localIPAddress });
    const server = await app.listen(config.apiPort);
    server.setTimeout(60000);
    setInterval(serverConnectionPool.probe, 1000);
    console.log(
      `Framer Preview Local Proxy running on API Port ${
        config.apiPort
      } and serving using the following hosts:\n ${proxyHosts
        .map(host => `${host}:${config.proxyPort}`)
        .join(', ')}`
    );
    console.log(
      `Set your Proxy Server URL in the configuration for the Framer package to: http://localhost:${config.apiPort}`
    );
  } catch (err) {
    console.error(
      `Error starting Franer Preview Local Proxy: ${err.message}`,
      err
    );
    process.exit(1);
  }
}
