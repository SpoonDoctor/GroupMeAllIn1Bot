import { BotController } from './BotController.js';
import { getMongoClient } from '../connectors/mongoConnector.js';
import { WithId, Document, Collection } from 'mongodb'

interface Quote extends WithId<Document> {
    user: string;
    quote: string;
}

class QuotebotController extends BotController {
    private quotes: Quote[];
    private quoteCollection: Collection<Document>;
    protected groupmeBotID: string;
    public commandRegex: RegExp[] = [
        /^\/q[uw]o[m]{0,1}te(stats){0,1}/gmi,
        /^\/addquote/gmi
    ]


    constructor() {
        super();
        this.groupmeBotID = process.env.QUOTEBOTID!;
    }


    // Since we can't do async in a constructor...
    private async finishSetup(){
        if(!this.quotes){
            console.log('1');
            let mongoDbClient = await getMongoClient();
            console.log('2');
            this.quoteCollection = mongoDbClient.db('Quotes').collection('quote');
            console.log('3');
            this.quotes = await this.quoteCollection.find({}).toArray() as Quote[];
        }
    }

    private getQuoteStats() {
        const TOPQUOTECOUNT = 10;
        let quoteCounts: any = {};
        for(const quote of this.quotes){
            let quoteTarget: string = quote.user.toUpperCase();
            if (!(quoteTarget in quoteCounts)) {
                quoteCounts[quoteTarget] = 1
            } else {
                quoteCounts[quoteTarget] = quoteCounts[quoteTarget] + 1;
            }
        }

        let quoteStatString: string = 'TOP QUOTED:\n';
        for (let i = 0; i < TOPQUOTECOUNT; i++) {
            let topKey: string = Object.keys(quoteCounts).reduce((a, b) => { return quoteCounts[a] > quoteCounts[b] ? a : b })
            quoteStatString = quoteStatString + topKey + ": " + quoteCounts[topKey] + "\n";
            delete quoteCounts[topKey];
        }

        return quoteStatString;
    }

    private getQuoteCount(quoteTarget: string) {
        let targetCount: number = 0;
        this.quotes.forEach((quote) => {
            if (quote.user.toUpperCase() == quoteTarget.toUpperCase()) {
                targetCount += 1;
            }
        });

        return (quoteTarget + " currently has " + targetCount + " quote(s).");
    }

    //Cheems logic and comments used taken from https://cheems.mirazmac.com/?fbclid=IwAR2hsL3CK68FEGEEYFRtH3IDVqPGFC0bsiqJg0jpJlY6eG4K4vuKIp_0x-A and slightly modified
    private holyWords: any = {
        burger: 'burmger',
        bad: 'bamd',
        batman: 'bamtman',
        cheese: 'cheems',
        cheems: 'cheems',
        cheeseburger: 'cheemsburger',
        doge: 'domge',
        history: 'himstory',
        walter: 'walmter',
        motherfucker: 'momtherfumcker',
    };


    private englishToCheems(text: string) {
        // sorry kimg but no line breakms
        text = text.replace(/(\r\n|\n|\r)/gm, " ");

        // Explode them words
        let words: string[] = text.split(" ");
        let cheemedText: string[] = [];

        let symbols = [',', '.', ':', '!', '?', '&', '%', '/'];

        for (let i = words.length - 1; i >= 0; i--) {
            // Get rid of extra spaces
            let word = words[i]!.trim().toLowerCase();

            let needLastCharater = false;

            let lastChar = word.charAt(word.length - 1);

            if (symbols.includes(lastChar)) {
                word = word.slice(0, -1);
                needLastCharater = true;
            }

            // Handle basic plurals
            if (lastChar == 's') {
                let withoutS = word.slice(0, -1);

                if (this.holyWords[withoutS]) {
                    word = this.holyWords[withoutS] + 's';
                    cheemedText[i] = word;
                    continue;
                }
            }

            if (this.holyWords[word]) {
                word = this.holyWords[word];
            } else {
                word = this.cheemsAlgorithm(word);
            }

            if (needLastCharater) {
                word = word + lastChar;
            }

            cheemedText[i] = word;
        }


        return cheemedText.join(' ');
    }

    private cheemsAlgorithm(word: string) {
        if (word.length < 4) {
            return word;
        }

        let vowels = ['a', 'e', 'i', 'o', 'u'];

        let vowelMatches = word.match(/[aeiou]/gi);
        let vowelCount = vowelMatches === null ? 0 : vowelMatches.length;

        let newWord: string[] = [];
        let addedM = false;
        let lastChar = word.charAt(word.length - 1);

        for (let i = 0; i < word.length; i++) {
            let char = word.charAt(i);

            if (i > 0 && addedM == false) {
                if (vowelCount > 1 && i == 1 && vowels.includes(char) && !vowels.includes(lastChar)) {
                    newWord[i] = char;
                    continue;
                }

                let prev = word.charAt(i - 1);
                let next = word.charAt(i + 1);

                if (vowels.includes(char) && next != 'm' && prev != 'm' && !vowels.includes(next)) {
                    char = char + 'm';

                    addedM = true;
                }
            }

            if (newWord[i] == undefined) {
                newWord[i] = char;
            }
        }


        return newWord.join('');
    }

    private UwU(uwuableString: string) {
        uwuableString = uwuableString.replace(/l/g, "w");
        uwuableString = uwuableString.replace(/L/g, "W");
        uwuableString = uwuableString.replace(/r/g, "w");
        uwuableString = uwuableString.replace(/R/g, "W");

        return uwuableString;
    }

    // String similarity algorithm I found on stack overflow using "edit distance"
    private editDistance(s1: string, s2: string): number {
        s1 = s1.toLowerCase();
        s2 = s2.toLowerCase();

        let costs: number[] = [];
        for (let i = 0; i <= s1.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= s2.length; j++) {
                if (i == 0)
                    costs[j] = j;
                else {
                    if (j > 0) {
                        let newValue = costs[j - 1];
                        if (s1.charAt(i - 1) != s2.charAt(j - 1))
                            newValue = Math.min(Math.min(newValue!, lastValue),
                                costs[j]!) + 1;
                        costs[j - 1] = lastValue;
                        lastValue = newValue!;
                    }
                }
            }
            if (i > 0)
                costs[s2.length] = lastValue;
        }
        return costs[s2.length]!;
    }

    private stringSimilarity(s1: string, s2: string) {
        let longer: string = s1;
        let shorter: string = s2;
        if (s1.length < s2.length) {
            longer = s2;
            shorter = s1;
        }
        let longerLength = longer.length;
        if (longerLength == 0) {
            return 1.0;
        }
        return (longerLength - this.editDistance(longer, shorter)) / longerLength;
    }

    private getRandomInt(max: number): number {
        return Math.floor(Math.random() * Math.floor(max));
    }

    private findBestQuote(messageText: string, quoteTarget: string): string {
        console.log(this.quotes);
        // Quote target might be more than one word, so anything after the command should be included
        if (messageText && quoteTarget === '') {
            quoteTarget = messageText;
        }

        if (!quoteTarget) {
            let numQuotes = this.quotes.length;
            let chosenQuote = this.getRandomInt(numQuotes);
            return this.quotes[chosenQuote]!.quote;
        }

        let targetMatches: Quote[] = [];
        let targetSubStringOf: Quote[] = [];
        this.quotes.forEach((quote) => {
            7
            if (quoteTarget.charAt(0) === "!" && (quote.user.toUpperCase() !== quoteTarget.toUpperCase())) {
                targetMatches.push(quote);
            } else if (quote.user.toUpperCase() === quoteTarget.toUpperCase()) {
                targetMatches.push(quote);
            } else if (quote.user.toUpperCase().includes(quoteTarget.toUpperCase())) {
                targetSubStringOf.push(quote);
            }
        });

        if (targetMatches.length > 0) {
            let numQuotes: number = targetMatches.length;
            let chosenQuote: number = this.getRandomInt(numQuotes);
            return targetMatches[chosenQuote]!.quote;
        } else if (targetSubStringOf.length > 0) {
            let numQuotes: number = targetSubStringOf.length;
            let chosenQuote: number = this.getRandomInt(numQuotes);
            return targetSubStringOf[chosenQuote]!.quote;
        } else {
            let bestQuotes: Quote[] = [];
            let bestSimilarity: number = 0;
            this.quotes.forEach((quote) => {
                let curSim = this.stringSimilarity(quote.user, quoteTarget)
                if (curSim > bestSimilarity) {
                    bestSimilarity = curSim;
                    bestQuotes = [quote];
                } else if (curSim == bestSimilarity) {
                    bestQuotes.push(quote);
                }
            });

            let numQuotes = bestQuotes.length;
            let chosenQuote = this.getRandomInt(numQuotes);
            return bestQuotes[chosenQuote]!.quote;
        }
    }

    protected async handleBotLogic(command: string, messageText: string, _user: string): Promise<string> {
        await this.finishSetup();
        messageText = messageText.substring(command.length + 1)
        let quoteTarget = '';
        switch (command.toUpperCase()) {
            case '/DREVV':
                quoteTarget = 'drevv';
            // Fall-through
            case '/QUOTE':
                console.log('hello')
                // Find random quote of specified quote target
                return this.findBestQuote(messageText, quoteTarget)
            case '/QWOTE': //Time for something a little weird and fun....
                return this.UwU(this.findBestQuote(messageText, quoteTarget))
            case '/QUOMTE': //Cheems
                return this.englishToCheems(this.findBestQuote(messageText, quoteTarget))
            case '/QWOMTE': //Both
                return this.UwU(this.englishToCheems(this.findBestQuote(messageText, quoteTarget)))
            case '/REMOVEQUOTE': //Not yet implemented. Maybe never
                break;
            case '/QUOTESTATS':
                if (messageText && quoteTarget === '') {
                    quoteTarget = messageText;
                }
                if (quoteTarget) {
                    return this.getQuoteCount(quoteTarget);
                } else {
                    return this.getQuoteStats();
                }
            case '/ADDQUOTE':
                if (messageText.length < 2) {
                    return '';
                }

                let quoteText = '';

                if ((messageText.match(/"/g) || []).length >= 2) {
                    let quoteIndex: number = -1;
                    quoteIndex = messageText.indexOf('"');

                    quoteTarget = messageText.substring(0, quoteIndex - 1);
                    quoteText = messageText.substring(quoteIndex + 1, messageText.length - 1);

                } else {
                    quoteTarget = messageText.split(' ')[1]!;
                    quoteText = messageText.substring(quoteTarget.length + 1);
                }
                await this.quoteCollection.insertOne({
                    user: quoteTarget.toUpperCase(),
                    quote: ('"' + quoteText + '" ~' + quoteTarget)
                });
                // Refresh cached quotes
                this.quotes = await this.quoteCollection.find({}).toArray() as Quote[];
                return 'Saved new quote.';
            default:
                return '';
        }
        return '';
    }
}

export default new QuotebotController();