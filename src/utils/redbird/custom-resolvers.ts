import debug from '../debug';
const proxyTargets = new Map<string, string>();

// Handles the proxying of all assets for a prototype
export const projectDependencyResolver = (
  host: string,
  url: string,
  req: any
) => {
  const refererPath = req.headers.referer
    ? new URL(req.headers.referer).pathname
    : url;

  // Format: /identifier. Removes the preceding slash from the pathname
  let identifier = refererPath.replace('/', '');

  const targetUrl = proxyTargets.get(identifier);

  /**
   * This can happen if you restart the proxy server whilst an in-app preview
   * is open. To allow our error scenario for the server connection pool
   * to function as necessary we'll just return a blank string to avoid
   * this from erroring out the entire server
   */
  if (!targetUrl) {
    debug(`⚠️  Unable to find target URL for identifier ${identifier}`);
    return '';
  }

  let path = url;

  if (url === `/${identifier}/` || url === `/${identifier}`) {
    // Ensures requests to the identifier get proxied to the preview
    path = '/preview/';
  } else if (url.startsWith(`/node_modules`) || url.startsWith('/socket.io')) {
    // node_modules and socket.io are not served via /preview - we just need to return the proxy target (the path will get appended)
    return proxyTargets.get(identifier);
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
    return `${targetUrl}/preview/`;
  } else if (url !== '/preview/') {
    // Appends the path to /preview
    path = `/preview${url}`;
  }

  debug(`⏩ [${host}${url}] Proxying to ${targetUrl}${path}`);

  return {
    url: `${targetUrl}`,
    path,
    opts: {},
  };
};

projectDependencyResolver.priority = 100;

export default {
  register(identifier: string, targetUrl: string) {
    console.log(
      `✅ [customResolver.register] Identifier: ${identifier} Target Host: ${targetUrl}`
    );
    proxyTargets.set(identifier, targetUrl);
  },
  unregisterWithIdentifier(identifier: string) {
    debug(`❌ [customResolver.unregisterWithIdentifier] ${identifier}`);
    proxyTargets.delete(identifier);
  },
  unregisterWithTargetUrl(targetUrlToUnregister: string) {
    debug(
      `❌ [customResolver.unregisterWithTargetUrl] ${targetUrlToUnregister}`
    );
    for (const [identifier, targetUrl] of proxyTargets.entries()) {
      if (targetUrl === targetUrlToUnregister) {
        proxyTargets.delete(identifier);
      }
    }
  },
  projectDependencyResolver,
};
