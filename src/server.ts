import express, {Application} from 'express';
import sizeOf from 'image-size';

const app: Application = express();

app.get('/', (req, res) => {
  res.send('OK');
});

// server
const options = {
  host: process.env.NODE_HOST || 'localhost',
  port: process.env.NODE_PORT || 4000
};

app.listen(options, () => console.log(`server on!!! ${options.host}:${options.port}`));
