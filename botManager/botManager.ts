import { BotController } from "../botControllers/BotController.js";
import { GroupmeRequest, GroupmeMessage, sendGroupmeRequest } from "../connectors/groupmeConnector.js";
import quotebotController from "../botControllers/quotebotController.js";

// TODO: Add a way to disable/enable bots with flags
class BotManager{
    private bots: BotController[] = [];

    constructor(){
        this.registerBots();
    }

    // There has to be a better way to register the controllers than this, but trying to register the bots from their own
    // modules seems to cause the modules not to be loaded and the registration not to happen. Figure it out later.
    public registerBots(){
        this.bots.push(quotebotController);
    }

    public async handleMessage(groupmeMessage: GroupmeMessage): Promise<void>{
        if(groupmeMessage.sender_type !== 'user'){
            return;
        }
        let sanitizedText = groupmeMessage.text.trim().replace(/“/g, '"').replace(/”/g, '"').replace(/‘/g, "'").replace(/’/, "'");
        let groupmeRequests: GroupmeRequest[] = [];
        for(const bot of this.bots){
            for(const regex of bot.commandRegex){
                let regexMatch = sanitizedText.match(regex);
                if(regexMatch){
                    try{
                        groupmeRequests.push(await bot.handleCommand(regexMatch[0], sanitizedText, groupmeMessage.name));
                    } catch {
                        console.log('An error occured while handling the command.')
                    }
                }
            }
        }

        if(groupmeRequests.length > 0 && process.env.OFFLINE !== 'true'){
            for(const request of groupmeRequests){
                await sendGroupmeRequest(request);
            }
        } else if(process.env.OFFLINE == 'true'){
            for(const request of groupmeRequests){
                console.log(request.text);
            }
        }
    }
}

export default new BotManager();