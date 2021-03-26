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
        this.start_time = Date.now();
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
            if(this.channel && Date.now() - this.start_time > 10000){
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
        let messages = [];
        for (const [sourceName, source] of Object.entries(this.state)) {
            let message = [`Pour le site ${sourceName}:`];
            for (const [card, status] of Object.entries(source)) {
                message.push(`• ${status.card} -> ${status.status} | ${status.price}`);
            }
            messages.push(message);
        }
        return messages;
    }

}

// Import and start watchers
const sources = [require("./src/nvidia-fr"), require("./src/smi-distri"), require("./src/top-achat")];
const main = new Main(sources, client);
main.startWatching();

// Listen to discord call to cahtbot
main.client.on("message", (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith('!status')) return;
    console.log(main.getState());
    main.getState().forEach((element) => message.reply(element.slice(0, 15)));
})
