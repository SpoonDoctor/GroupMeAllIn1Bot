const userName: string = process.env.USERNAME!;
const password: string = process.env.PASSWORD!;
const dbUri: string = process.env.DBURI!;

import {MongoClient, ServerApiVersion} from 'mongodb'

let getMongoClient = async function(): Promise<MongoClient> {
    try{
        const uri = `mongodb+srv://${userName}:${password}@${dbUri}/?retryWrites=true&w=majority`;
        console.log('before connect');
        const client = await MongoClient.connect(uri, {serverApi: ServerApiVersion.v1});
        return client;
    } catch {
        console.log('An error occured connecting to mongodb')
        throw('An error occured');
    }
}

export {getMongoClient};