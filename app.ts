import express, {Express} from 'express';
import sls from 'serverless-http';
import botManager from './botManager/botManager.js'
import { getMongoClient } from './connectors/mongoConnector.js';
import sanitize from 'mongo-sanitize';

const app: Express = express();
app.use(express.json());

app.post('/', async (req, res)=> {
    await botManager.handleMessage(req.body);
    res.status(200).send();
});

function getQuoteQueryResults(client, name, quote){
    return new Promise(function (resolve, reject) {
        client.connect(err => {
            if(err) {
                reject(err);
            }
            console.log("test: ", client);
            collection = client.db("Quotes").collection("quote");
            collection.find({"user":{$regex: name.toUpperCase()}, "quote":{$regex: quote, $options: "i"}}).toArray(function(err, docs){
                if(err){
                    reject(err);
                }
                for(doc in docs){
                    timestampedDoc = docs[doc];
                    docTimestamp = ObjectID(timestampedDoc._id).getTimestamp();
                    timestampedDoc.timestamp = docTimestamp;
                    docs[doc] = timestampedDoc;
                }
                resolve(docs);
            });
        });
    });
}

app.get("/quotes", async function (req,res){
    var nameParam = ".*"
    var quoteParam = ".*"
    if(req.query.name){
        nameParam = sanitize(req.query.name)
    }
    if(req.query.quote){
        quoteParam = sanitize(req.query.quote)
    }
    var client = await getMongoClient();
    quoteLogic.getQuoteQueryResults(client, nameParam, quoteParam).then((results) => {
        res.status(200).send({"results": results});
        client.close()
    }).catch(function(error){
        console.log("err: ", error);
    });
});

export const server = sls(app)