import tcpPing from '../utils/tcp-ping';

const connectionPool = new Map<string, URL>();

export default {
  add(proxyUrl: string, upstreamUrl: string) {
    const parsedUrl = new URL(upstreamUrl);
    const parsedPort = parseInt(parsedUrl.port, 10);

    if (!parsedUrl.hostname || isNaN(parsedPort)) {
      throw new Error('Invalid host or port provided');
    }

    if (!connectionPool.get(proxyUrl)) {
      connectionPool.set(proxyUrl, parsedUrl);
    }
  },
  getActiveHostUrl(): string {
    if (connectionPool.size === 0) {
      throw new Error('No active servers in connection pool');
    }
    const connection = connectionPool.values().next().value as URL;
    return `${connection.protocol}//${connection.host}`;
  },
  async probe() {
    const connectionsToRemove: string[] = [];

    for (let [key, connection] of connectionPool.entries()) {
      try {
        const isRunning = await tcpPing.probe(
          connection.hostname,
          parseInt(connection.port, 10)
        );
        if (!isRunning) {
          throw new Error(`${connection.host} is no longer active`);
        }
      } catch (err) {
        connectionsToRemove.push(key);
      }
    }

    for (const key of connectionsToRemove) {
      connectionPool.delete(key);
    }
  }
};
