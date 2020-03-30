import * as tcpp from 'tcp-ping';

export default {
  async probe(host: string, port: number) {
    return new Promise((resolve, reject) => {
      tcpp.probe(host, port, (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  }
};
