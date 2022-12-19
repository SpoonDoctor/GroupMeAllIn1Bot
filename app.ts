import express, {Express} from 'express';
import sls from 'serverless-http';
import botManager from './botManager/botManager.js'

const app: Express = express();
app.use(express.json());

app.post('/', async (req, res)=> {
    await botManager.handleMessage(req.body);
    res.status(200).send();
});
module.exports.server = sls(app)