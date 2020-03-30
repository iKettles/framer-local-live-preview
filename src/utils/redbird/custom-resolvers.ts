import serverConnectionPool from '../../lib/server-connection-pool';

// Handles the proxying of all assets for a prototype
export const projectDependencyResolver = (
  targetHost: string,
  identifier: string
) => {
  console.log(`[customResolver.register] ${targetHost}`);

  return (host: string, url: string, req: Request) => {
    console.log(`[projectDependencyResolver] Host: "${host}" URL: "${url}"`);

    let path = url;

    if (url === `/${identifier}/` || url === `/${identifier}`) {
      // Ensures requests to the identifier get proxied to the preview
      path = '/preview/';
    } else if (
      url.startsWith(`/node_modules`) ||
      url.startsWith('/socket.io')
    ) {
      // node_modules/socket.io are not served via /preview - pick a random host to serve them from
      return serverConnectionPool.getActiveHostUrl();
    } else if (
      url.startsWith('/scripts/') ||
      url.startsWith('/styles/') ||
      url.startsWith('/preview.js')
    ) {
      /**
       * We don't need to rewrite the path for these assets as they are served directly from / and not via
       * the identifier. Due to the / used in the URL in Framer's preview, the URL sent by the preview frontend
       * does not include the identifier. By returning a string here, the original request path is appended
       * to the returned string
       */
      return `${targetHost}/preview/`;
    } else if (url !== '/preview/') {
      // Appends the path to /preview
      path = `/preview${url}`;
    }

    console.log(`Proxying to ${targetHost}${path}`);
    console.log(`\n`);

    return {
      url: `${targetHost}`,
      path,
      opts: {}
    };
  };
};

projectDependencyResolver.priority = 100;
