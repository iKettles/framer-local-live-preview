import { Application, Request, Response } from 'express';
import { check } from 'express-validator';
import { handleValidationError } from '../middleware/validation-error';
import { config } from '../config';
import customResolvers from '../utils/redbird/custom-resolvers';

interface ProxyTargetDefinitions {
  proxyTargets: {
    [proxyHost: string]: string;
  };
  targetUrl: string;
  identifier: string;
}

const registeredProxyTargets = new Map<string, ProxyTargetDefinitions>();

export default (
  app: Application,
  params: { proxy: any; localIPAddress: string }
): string[] => {
  const { proxy, localIPAddress } = params;

  // Serve from multiple interfaces
  const proxyHosts = [localIPAddress, 'localhost', '0.0.0.0', '127.0.0.1'];

  // Stop Redbird trashing stdout
  proxy.log = null;

  // Allow an additional host to be used
  if (config.additionalProxyHost) {
    proxyHosts.push(config.additionalProxyHost);
  }

  // Add a custom resolver to resolve project dependencies that use inconsistent URL formats
  proxy.addResolver(customResolvers.projectDependencyResolver);

  app.post(
    '/v1/proxy-target',
    [check('identifier').not().isEmpty()],
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

        // If a proxy target has already been registered for this URL we should clean it up before registering it again
        if (registeredProxyTargets.has(targetUrl)) {
          unregisterProxy(
            proxy,
            proxyHosts,
            registeredProxyTargets.get(targetUrl) as ProxyTargetDefinitions
          );
        }

        const targetDefinitions: ProxyTargetDefinitions = {
          proxyTargets: {},
          targetUrl,
          identifier: req.body.identifier,
        };

        for (const proxyHost of proxyHosts) {
          // Build the proxy URL using the proxy host, port and identifier sent from the Framer component
          const proxyUrl = `http://${proxyHost}:${config.proxyPort}/${req.body.identifier}`;

          // Set the URLs the Framer component needs to display the various ways to access the prototype
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

          // Cache the proxy URL for this proxy host
          targetDefinitions.proxyTargets[proxyHost] = proxyUrl;

          console.log(
            `🎯 Registering target to proxy traffic from ${proxyUrl} to ${targetUrl} 🎯`
          );

          // Register this target with the custom resolvers
          customResolvers.register(req.body.identifier, targetUrl);

          // Proxy traffic from the proxy URL to the Framer preview
          proxy.register(`${proxyUrl}`, `${targetUrl}/preview/`);
        }

        // Cache this proxy target definition so we can clean it up later
        registeredProxyTargets.set(targetUrl, targetDefinitions);

        res.success({
          localhostUrl,
          localNetworkUrl,
          additionalUrl,
        });
      } catch (err) {
        res.error(err);
      }
    }
  );

  return proxyHosts;
};

function unregisterProxy(
  proxy: any,
  proxyHosts: string[],
  proxyTargetDefinitions: ProxyTargetDefinitions
) {
  // Remove the listeners for each individual proxy host
  for (const proxyHost of proxyHosts) {
    // Get the proxy target URL for this proxy host
    const proxyTarget = proxyTargetDefinitions.proxyTargets[proxyHost];

    // Unregister listener
    proxy.unregister(proxyTarget, proxyTargetDefinitions.targetUrl);

    // Unregister target from custom resolver
    customResolvers.unregisterWithTargetUrl(proxyTargetDefinitions.targetUrl);
  }
}
