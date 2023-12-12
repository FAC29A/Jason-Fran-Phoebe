const { Client, GatewayIntentBits } = require('discord.js');
const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI
});

// Discord Client
const client = new Client({
  intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// When discord bot has started up
client.once('ready', () => {
    console.log('Bot is ready!');
});


const threadMap = {};

const getOpenAiThreadId = (discordThreadId) => {
    // Replace this in-memory implementation with a database (e.g. DynamoDB, Firestore, Redis)
    return threadMap[discordThreadId];
}

const addThreadToMap = (discordThreadId, openAiThreadId) => {
    threadMap[discordThreadId] = openAiThreadId;
}

const terminalStates = ["cancelled", "failed", "completed", "expired"];
const statusCheckLoop = async (openAiThreadId, runId) => {
    const run = await openai.beta.threads.runs.retrieve(
        openAiThreadId,
        runId
    );

    if(terminalStates.indexOf(run.status) < 0){
        await sleep(1000);
        return statusCheckLoop(openAiThreadId, runId);
    }

    return run.status;
}

const addMessage = (threadId, content) => {
    
    return openai.beta.threads.messages.create(
        threadId,
        { role: "user", content }
    )
}

// This event will run every time a message is received
client.on('messageCreate', async message => {
    if (message.author.bot || !message.content || message.content === '') return; //Ignore bot messages
    
    const discordThreadId = message.channel.id;
    let openAiThreadId = getOpenAiThreadId(discordThreadId);

    let messagesLoaded = false;
    if(!openAiThreadId){
        const thread = await openai.beta.threads.create();
        openAiThreadId = thread.id;
        addThreadToMap(discordThreadId, openAiThreadId);
        if(message.channel.isThread()){

            //Gather all thread messages to fill out the OpenAI thread
            const starterMsg = await message.channel.fetchStarterMessage();
            const otherMessagesRaw = await message.channel.messages.fetch();

            const otherMessages = Array.from(otherMessagesRaw.values())
                .map(msg => msg.content)
                .reverse(); //oldest first

            const messages = [starterMsg.content, ...otherMessages]
                .filter(msg => !!msg && msg !== '')

            
            await Promise.all(messages.map(msg => addMessage(openAiThreadId, msg)));
            messagesLoaded = true;
        }
    }

    
    if(!messagesLoaded){ //If this is for a thread, assume msg was loaded via .fetch() earlier
        await addMessage(openAiThreadId, message.content);
    }

    const run = await openai.beta.threads.runs.create(
        openAiThreadId,
        { assistant_id: process.env.ASSISTANT_ID }
    )
    const status = await statusCheckLoop(openAiThreadId, run.id);

    const messages = await openai.beta.threads.messages.list(openAiThreadId);
    let response = messages.data[0].content[0].text.value;
    response = response.substring(0, 1999) //msg length limit
    
    message.reply(response);
});

// Authenticate Discord
client.login(process.env.TOKEN);








// require("dotenv").config();
// const { OpenAI } = require("openai");
// const openai = new OpenAI({
//   apiKey: process.env['OPENAI']
// });

// const {
//   Client,
//   IntentsBitField,
//   GatewayIntentBits,
//   Partials,
// } = require("discord.js");

// const { commandsList, commandLog } = require("./commands");

// const prefix = "!";

// const client = new Client({
//   intents: [
//     IntentsBitField.Flags.Guilds,
//     IntentsBitField.Flags.GuildMessages,
//     IntentsBitField.Flags.GuildMembers,
//     IntentsBitField.Flags.MessageContent,
//     GatewayIntentBits.Guilds,
//     GatewayIntentBits.DirectMessages,
//   ],
//   partials: [Partials.Message, Partials.Channel, Partials.Reaction],
// });

// const mentionsLog = [];

// client.once("ready", (c) => {
//   console.log(`${c.user.tag} is online!`);
// });

// const threadMap = {};

// const getOpenAiThreadId = (discordThreadId) => {
//   return threadMap[discordThreadId];
// }

// const addThreadToMap = (discordThreadId, openAiThreadId) => {
//   return threadMap[discordThreadId] = openAiThreadId;
// }

// const statusCheckLoop = async (openAiThreadId, runId)

// client.on("messageCreate", async (message) => {
// //console.log(message.channel.id)
  
//   // check if the bot has been mentioned and set botMentioned variable to true or false
//   const botMentioned = message.mentions.has(client.user.id)|| message.channel.type === 'DM';
//   //console.log(`Bot mentioned: ${botMentioned}`);

//   if (
//     message.author.bot ||
//     (!message.content.startsWith(prefix) && !botMentioned)
//   ) {
//     return;
//   }

//   const discordThreadId = message.channel.id;
//   let openAiThreadId = threadMap[discordThreadId];

//   if (!openAiThreadId) {
//     const thread = await openai.beta.threads.create();
//     openAiThreadId = thread.id;
//     addThreadToMap(discordThreadId,openAiThreadId);
//   }

//   await openai.beta.threads.messages.create(
//     openAiThreadId,
//     { role: "user", content: message.content }
//   );

//   const run = await openai.beta.threads.runs.create(
//     openAiThreadId,
//     { assistant_id: process.env.ASSISTANT_ID },
//   )

//   const messages = await openai.beta.threads.messages.list(openAiThreadId)
//   const response = messages.data[0].content[0].text.value;

//   message.reply(response);

//   // Remove the prefix or mention from the message content
//   const command = botMentioned
//    ? message.content.split(' ')[1].slice(prefix.length).trim()
//    : message.content.split(' ')[0].slice(prefix.length).trim();
//   //console.log(`command passed: ${command}`);
// //message.reply('hello')
  
// });

// client.login(process.env.TOKEN);


// // Old code:
// // client.on("messageCreate", (message) => {

// //   if (message.mentions.has(client.user.id)) {
// //     const mentionInfo = {
// //       content: message.content,
// //       author: message.author.username,
// //       timestamp: new Date(),
// //       channel: message.channel.name,
// //     };

// //     mentionsLog.push(mentionInfo);
// //   }

// //   // check if the bot has been mentioned and set botMentioned variable to true or false
// //   const botMentioned = message.mentions.has(client.user.id)|| message.channel.type === 'DM';
// //   //console.log(`Bot mentioned: ${botMentioned}`);

// //   if (
// //     message.author.bot ||
// //     (!message.content.startsWith(prefix) && !botMentioned)
// //   ) {
// //     return;
// //   }

// //   //check context of message
// //   if(botMentioned) {
// //     if(message.content.includes('?') && !message.content.includes('!chat')) {
// //     message.reply("That's a good question! Try starting your question with !chat");
// //     } 

// //     const greeting = ["hi", "hello", "hey"];
// //     for (const greet of greeting) {
// //       if (message.content.includes(greet)) {
// //         message.reply(`Hi, ${message.author}, how can I help you?`);
// //       }
// //     }
// //   };

 
// //   // Remove the prefix or mention from the message content
// //   const command = botMentioned
// //    ? message.content.split(' ')[1].slice(prefix.length).trim()
// //    : message.content.split(' ')[0].slice(prefix.length).trim();
// //   //console.log(`command passed: ${command}`);

// //   const isSpaceSeparatedCommand = command.includes(" ");
// //   if (isSpaceSeparatedCommand) {
// //     const [commandName, ...commandArgs] = command.split(" ");
// //     if (commandName in commandsList) {
// //       commandLog.push(message.content);
// //       commandsList[commandName](message, commandArgs.join(" "));
// //     }
// //   } else {
// //     if (command in commandsList) {
// //       commandLog.push(message.content);
// //       commandsList[command](message);
// //     }
// //   }
// // });