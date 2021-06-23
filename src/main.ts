import http from '0http';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import cors from "cors";
import timeout from "connect-timeout";
import compression from "compression";
import morgan from "morgan";
import winston from "winston";
import expressWinston from "express-winston";
import path from "path";
import cluster from 'cluster';
import os from 'os';
import { generateParts, joinParts } from './lib/shamir';
const { router, server } = http();

// Warning bodyParser @deprecated
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(helmet());
router.use(cors());
router.use(timeout());
router.use(compression());

/*
|---------------------------
| Error Handling
|---------------------------
*/
const errorHandler = (err, _req, res) => {
  res.setHeader('content-type', 'application/json');
  res.statusCode = 500;
  res.end(JSON.stringify({
    success: false,
    message: err.message,
  }));
};

router.use('/', async (req, res, next) => {
  try {
    await next()
  } catch (err) {
    errorHandler(err, req, res)
  }
});


/*
|---------------------------
| Logger
|---------------------------
*/
router.use(morgan('combined'));
router.use(expressWinston.logger({
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, './../logs/router-error.log'),
      level: 'error'
    }),
    new winston.transports.File({
      filename: path.join(__dirname, './../logs/router-combined.log')
    })
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  ),
  meta: true,
  msg: "{{res.statusCode}} HTTP {{req.method}} {{res.responseTime}}ms {{req.url}}",
  expressFormat: true,
  colorize: false
}));


/*
|---------------------------
| Generate Key parts
|
| POST { secret: string, parts: number, quorum: number}
| @secret => secret string
| @parts  => how many parts should be generated
| @quorum => the number of parts that required to generate secret
|---------------------------
*/
router.post('/generate', (req: any, res: any) => {
  res.setHeader('content-type', 'application/json');

  try {
    const p: any = generateParts(req.body.secret, req.body.parts, req.body.quorum);
    const parts: any[] = [];

    for(let i=1; i<=req.body.parts; i++) {
      parts.push(Object.values(p[i]));
    }

    res.end(JSON.stringify({
      success: true,
      message: 'Success',
      parts
    }));
  } catch(err) {
    errorHandler(err, req, res)
  }
});


/*
|---------------------------
| Merge part to get secret
|
| POST { parts:[] }
| @parts => the array of the parts to get secret
|---------------------------
*/
router.post('/join', (req: any, res: any) => {
  res.setHeader('content-type', 'application/json');

  const result = {};

  for(let i=0; i<(req.body.parts).length; i++) {
    result[i+1] = new Uint8Array(req.body.parts[i]);
  }

  try {
    res.end(JSON.stringify({
      success: true,
      message: 'Success',
      secret: joinParts(result),
    }));
  } catch(err) {
    errorHandler(err, req, res)
  }
});


/*
|---------------------------
| Starting
|---------------------------
*/
if (cluster.isMaster) {
  (os.cpus()).forEach(() => cluster.fork());
} else {
  server.listen(3000, '0.0.0.0', () => {
    console.log('Service has been started...');
  });
}


/*
|---------------------------
| Graceful shutdown
|---------------------------
*/
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Service has been closed...');
  });
});