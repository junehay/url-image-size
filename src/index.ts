import { URL } from 'url';
import http from 'http';
import https from 'https';
import sizeOf from 'image-size';

export interface ISize {
  width: number | undefined;
  height: number | undefined;
  orientation?: number;
  type?: string;
}
export interface ISizeCalculationResult extends ISize {
  images?: ISize[];
}

export const getImageSize = async (imageUrl: string): Promise<ISizeCalculationResult> => {
  const imgUrl = new URL(imageUrl);

  return new Promise((resolve, reject) => {
    const incomingMessageToSizeOf = (res: http.IncomingMessage) => {
      if (!res.statusCode) {
        return reject(new Error(`no Status Code`));
      }

      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`Status Code: ${res.statusCode}`));
      }

      const data: Buffer[] = [];
      res.on('data', (chunk) => {
        data.push(chunk);
      });

      res.on('end', () => resolve(sizeOf(Buffer.concat(data))));
    };

    const req = (() => {
      if (imgUrl.protocol === 'http:') {
        return http.get(imgUrl, (res) => incomingMessageToSizeOf(res));
      }
      if (imgUrl.protocol === 'https:') {
        return https.get(imgUrl, (res) => incomingMessageToSizeOf(res));
      }
    })();

    if (!req) {
      return reject(new Error(`protocol error`));
    }

    req.on('error', reject);

    req.end();
  });
};

export default getImageSize;
