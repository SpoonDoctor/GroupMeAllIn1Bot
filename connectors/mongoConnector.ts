const userName: string = process.env.DBUSERNAME!;
const password: string = process.env.DBPASSWORD!;
const dbUri: string = process.env.DBURI!;

import {connect, model, Schema} from 'mongoose';

export interface IQuote {
    user: string;
    quote: string;
}

const QuoteSchema = new Schema<IQuote>({
    user: {
        type: String
    },
    quote: {
        type: String
    }
});

export const Quote = model<IQuote>('Quote', QuoteSchema);

export let startMongoClient = async function(): Promise<void> {
    try{
        const uri = `mongodb+srv://${userName}:${password}@${dbUri}/quotes`;
        console.log('connecting to ', uri);
        await connect(uri);
        console.log('done connecting');
    } catch {
        console.log('An error occured connecting to mongodb')
        throw('An error occured');
    }
}