import * as network from 'network';

export async function getLocalIPAddress(): Promise<string> {
  return new Promise((resolve, reject) => {
    network.get_private_ip((err, ip) => {
      if (err) {
        return reject(err);
      }
      return resolve(ip);
    });
  });
}
