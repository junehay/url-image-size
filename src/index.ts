import url from 'url';
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
  const imgUrl = url.parse(imageUrl);

  return new Promise((resolve, reject) => {
    const aa = (res: http.IncomingMessage) => {
      if (!res.statusCode) {
        return reject(new Error(`no statucCode`));
      } else {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`Status Code: ${res.statusCode}`));
        }

        const data: Buffer[] = [];
        res.on('data', (chunk) => {
          data.push(chunk);
        });

        res.on('end', () => resolve(sizeOf(Buffer.concat(data))));
      }
    };

    let req;
    if (imgUrl.protocol === 'http:') {
      req = http.get(imgUrl, (res) => {
        aa(res);
      });
    } else if (imgUrl.protocol === 'https:') {
      req = https.get(imgUrl, (res) => {
        aa(res);
      });
    }

    if (!req) {
      return reject(new Error(`protocol error`));
    }

    req.on('error', reject);

    req.end();
  });
};

export default getImageSize;
