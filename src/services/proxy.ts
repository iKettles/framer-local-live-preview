import { Application, Request, Response } from 'express';
import { check } from 'express-validator';
import { handleValidationError } from '../middleware/validation-error';
import { config } from '../config';
import { projectDependencyResolver } from '../utils/redbird/custom-resolvers';
import serverConnectionPool from '../lib/server-connection-pool';

export default (
  app: Application,
  params: { proxy: any; localIPAddress: string }
): string[] => {
  const { proxy, localIPAddress } = params;

  // Serve from multiple proxy hosts
  const proxyHosts = [localIPAddress, 'localhost', '0.0.0.0', '127.0.0.1'];

  // Stop Redbird trashing stdout
  proxy.log = null;

  // Allow an additional host to be used
  if (config.additionalProxyHost) {
    proxyHosts.push(config.additionalProxyHost);
  }

  app.post(
    '/v1/proxy-target',
    [
      check('identifier')
        .not()
        .isEmpty()
    ],
    handleValidationError,
    async (req: Request, res: Response) => {
      try {
        const targetUrl = `http://${req.body.url.replace(
          '127.0.0.1',
          'localhost'
        )}`;
        let localhostUrl = '';
        let localNetworkUrl = '';
        let additionalUrl = '';

        for (const proxyHost of proxyHosts) {
          const proxyUrl = `http://${proxyHost}:${config.proxyPort}/${req.body.identifier}`;

          switch (proxyHost) {
            case 'localhost':
              localhostUrl = proxyUrl;
              break;
            case localIPAddress:
              localNetworkUrl = proxyUrl;
              break;
            case config.additionalProxyHost:
              additionalUrl = proxyUrl;
              break;
          }

          console.log(
            `Registering target to proxy traffic from ${proxyUrl} to ${targetUrl}`
          );
          proxy.register(`${proxyUrl}`, `${targetUrl}/preview/`);
          proxy.addResolver(
            projectDependencyResolver(targetUrl, req.body.identifier)
          );
          serverConnectionPool.add(proxyUrl, targetUrl);
        }

        res.success({
          localhostUrl,
          localNetworkUrl,
          additionalUrl
        });
      } catch (err) {
        res.error(err);
      }
    }
  );

  return proxyHosts;
};
