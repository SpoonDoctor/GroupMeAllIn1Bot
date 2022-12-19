import * as readlineSync from 'readline-sync';
import botManager from './botManager/botManager.js'
import { GroupmeMessage } from './connectors/groupmeConnector.js';

let offlineEntryExitPoint = async function(): Promise<void> {
    process.env.OFFLINE = 'true';
    var entryText = '';
    // Loop until we see 'stop'
    while(true){
        entryText = readlineSync.question(``);
        if(entryText === 'stop') return;
        // Create an object with similar structure to a groupme payload to make handling consistent across offline and offline apps
        let mockMessage: GroupmeMessage = {
            text: entryText,
            sender_type: 'user',
            name: 'test user'
        }

        await botManager.handleMessage(mockMessage).catch(()=>{
            console.log('Some error occured');
        });
    }
}
    
offlineEntryExitPoint().then(()=>{
    console.log('done');
});