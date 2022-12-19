const userName: string = process.env.DBUSERNAME!;
const password: string = process.env.DBPASSWORD!;
const dbUri: string = process.env.DBURI!;

import {MongoClient, ServerApiVersion} from 'mongodb'

export let getMongoClient = async function(): Promise<MongoClient> {
    try{
        const uri = `mongodb+srv://${userName}:${password}@${dbUri}/Quotes?retryWrites=true&w=majority`;
        const client = await MongoClient.connect(uri, {serverApi: ServerApiVersion.v1});
        return client;
    } catch {
        console.log('An error occured connecting to mongodb')
        throw('An error occured');
    }
}