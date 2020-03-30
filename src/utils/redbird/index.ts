import * as Redbird from 'redbird';
import { config } from '../../config';

export const redbird = (Redbird as any)({
  port: config.proxyPort
});
