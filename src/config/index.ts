export const config: Config = {
  apiPort: parseInt(process.env.API_PORT as string, 10) || 8080,
  proxyPort: parseInt(process.env.PROXY_PORT as string, 10) || 8000,
  additionalProxyHost: process.env.PROXY_HOST as string
};
