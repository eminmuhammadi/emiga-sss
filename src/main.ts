import http from '0http';
import bodyParser from 'body-parser';
import { generateParts, joinParts } from './lib/shamir';
const { router, server } = http();

// Warning bodyParser @deprecated
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
    extended: true
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
    const p: any = generateParts(req.body.secret, req.body.parts, req.body.quorum);
    const parts: Uint8Array[] = [];

    for(let i=1; i<=req.body.parts; i++) {
        parts.push(p[i]);
    }

    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({
        parts
    }));
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
        result[i+1] = new Uint8Array(Object.values(req.body.parts[i]));
    }

    res.end(JSON.stringify({
        secret: joinParts(result),
    }));
});

/*
|---------------------------
| Starting
|---------------------------
*/
server.listen(3000, '0.0.0.0', () => {
    console.log('Service has been started...');
});

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