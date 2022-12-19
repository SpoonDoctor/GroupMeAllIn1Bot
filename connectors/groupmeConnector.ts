import axios from 'axios';

export interface GroupmeRequest {
    bot_id: string;
    text: string;
}

export interface GroupmeMessage {
    text: string;
    sender_type: string;
    name: string;
}

export let sendGroupmeRequest = async function(request: GroupmeRequest): Promise<void> {
    try {
        await axios.post('https://api.groupme.com/v3/bots/post', request, {headers:{"Content-Type": "application/json"}})
    } catch {
        console.log('Failed while making groupme request')
    }
}