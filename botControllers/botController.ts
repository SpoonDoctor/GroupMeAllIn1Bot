import { GroupmeRequest } from '../connectors/groupmeConnector.js';
/*
 * Abstract class to be implemented by bot controllers. Bot Controllers are called by the Bot Manager when
 * one or more commandRegex matches the input string
 */
export abstract class BotController{
    /**
     * The ID for this specific GroupMe bot.
     */
    protected abstract groupmeBotID: string;
    /**
     * If input string matches one of a Bot Controller's commandRegex, the command is sent to the Bot Controller's handleCommand function. 
     */
    public abstract commandRegex: RegExp[];
    /**
     * Main logic of the bot goes here.
     * 
     * @returns {string} Result text of bot logic.
     */
    protected abstract handleBotLogic(command: string, messageText: string, user: string): Promise<string>;
    /**
     * TODO: get help info for a bot
     */
    // public abstract getHelp();
    /**
     * Called by the Bot Manager. Checks if there's a matching commandRegex and builds the GroupmeRequest object based off the result of handleBotLogic
     * 
     * @returns {GroupmeRequest} Contains the result text of the bot logic and the bot's groupme endpoint
     */
    public async handleCommand(command: string, messageText: string, user: string): Promise<GroupmeRequest> {
        return {
            text: await this.handleBotLogic(command, messageText, user),
            bot_id: this.groupmeBotID
        }
    }
}