require('dotenv').config();
const Discord = require("discord.js");
const util = require('util');

const client = new Discord.Client();

class Main{

    constructor(sources, client){
        this.state = {};
        this.sources = sources;
        this.client = client;
        this.channel = null;
        for (let i = 0; i < this.sources.length; i++){
            this.state[this.sources[i].getName()] = {};
        }
        this.connectClient();
    }

    async connectClient(){
        await this.client.login(process.env.BOT_TOKEN);
        this.channel = this.client.channels.cache.get(process.env.CHANNEL);
    }

    updateState(source, id, card, status, price, link){
        const tmp = {card, price, link, status};
        if (!util.isDeepStrictEqual(this.state[source][id], tmp)){
            this.state[source][id] = tmp;
            console.log(`${source}: La carte ${card} est passé au status ${status} au prix de ${price}.\nLien: ${link}`);
            if(this.channel){
                this.channel.send(`${source}: La carte ${card} est passé au status ${status} au prix de ${price}.\nLien: ${link}`);
            }
        }
    }

    startWatching(){
        for (let i = 0; i < this.sources.length; i++){
            this.sources[i].startWatching(this.updateState.bind(this));
        }
    }

    getState(){
        let message = [];
        for (const [sourceName, source] of Object.entries(this.state)) {
            message.push(`Pour le site ${sourceName}:`);
            for (const [card, status] of Object.entries(source)) {
                message.push(`• ${status.card} -> ${status.status} | ${status.price}`);
            }
        }
        return message;
    }

}

// Import and start watchers
const sources = [require("./nvidia-fr")];
const main = new Main(sources, client);
main.startWatching();

// Listen to discord call to cahtbot
main.client.on("message", (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith('!status')) return;
    console.log(main.getState());
    message.reply(main.getState());
})

