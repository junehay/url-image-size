import express, { Application } from 'express';
import url from 'url';
import http from 'http';
import https from 'https';
import sizeOf from 'image-size';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();

const getImageSize = async (url: url.UrlWithStringQuery) => {
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
    if (url.protocol === 'http:') {
      req = http.get(url, (res) => {
        aa(res);
      });
    } else if (url.protocol === 'https:') {
      req = https.get(url, (res) => {
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

// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.get('/', async (req, res) => {
  const imgUrl = process.env.IMAGE_URL as string;
  const options = url.parse(imgUrl);
  const result = await getImageSize(options);

  res.json(result);
});

// server
const options = {
  host: process.env.NODE_HOST || 'localhost',
  port: process.env.NODE_PORT || 4000
};

app.listen(options, () => console.log(`server on!!! ${options.host}:${options.port}`));
