require("dotenv").config();
const { OpenAI } = require("openai");
const openai = new OpenAI({
  apiKey: process.env['OPENAI']
});

const {
  Client,
  IntentsBitField,
  GatewayIntentBits,
  Partials,
} = require("discord.js");


const client = new Client({
    intents: [
      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.GuildMessages,
      IntentsBitField.Flags.GuildMembers,
      IntentsBitField.Flags.MessageContent,
      GatewayIntentBits.Guilds,
      GatewayIntentBits.DirectMessages,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
  });

  client.once("ready", (c) => {
    console.log(`${c.user.tag} is online!`);
  });

  client.on("messageCreate", async (message) => {
    if(message.author.bot){return;}
    let thread;
    const run = await openai.beta.threads.runs.create(
        thread.id,
        { assistant_id: process.env.ASSISTANT_ID },
      )
      
     async function createThread(message) {
        thread = await openai.createThread({
          messages: [{
            role: 'user',
            content: message.content
          }]
        }); 
      };

      async function addMessage(message) {
        await openai.addMessage(thread.id, {
          role: 'user',
          content: message.content
        });
      }

      async function runAssistant(message) {
        const run = await openai.createRun(thread.id, {
          assistantId: assistant.id
        });

        while(!run.completed) {
            await sleep(2000); 
            run = await openai.retrieveRun(thread.id, run.id);
          }
      }

    const messages = await openai.listMessages(thread.id); 
    return messages[messages.length - 1].content;

        
  })

  

client.login(process.env.TOKEN);




// require("dotenv").config();
// const openai = require("openai");
// // const openai = new OpenAI();

// async function main() {
// const openaikey = await process.env.OPENAI;
// const assistant = await openai.beta.assistants.create({
//     name: "Learnbot",
//     instructions: `
//       You are an expert in coding & pedagogy. The ultimate result of this interaction is to create a detailed plan that the user can follow in order to learn a certain concept or achieve a certain goal. The plan must be broken into individual units (or "sessions") of work. Each unit must have a clear and tangible end goal, and these session goals must cumulatively lead towards the ultimate goal desired by the user. This plan should be generated via a casual conversation with the user.
//       You must ascertain the following details before creating this plan, and the answers must be meaningfully incorporated into the final result.
//       - The ideal length of time that the user would like to spend on an individual learning session
//       - The overall length of time that this plan must be completed within
//       - The regularity with which the user would like to engage in a learning session
//       - Whether the user is more comfortable learning a concept in depth before utilising it, or would like to create working results before fully understanding why it works
//       - Whether the user prefers to learn through a practical project or via a more theory-based approach
//       - Any limitations or obstacles in how the user likes to learn, including media formats they don't enjoy, approaches they dislike or specific access requirements & disabilities.
//       - Topics outside of coding that the user enjoys, and any other preferences they have
//       Each detail should be ascertained one at a time, not in a long list of questions within one message. If a detail can be reasonably inferred from previous answers, you may infer it without asking explicitly.
//       The user must be free to skip a question, and the highest priority is reducing how much mental effort the user exerts in using this assistant. If the user chooses not to answer a question, you should infer a reasonable answer based on the other details that have been given. If the plan involves using other technologies, you must check for the user's current level of knowledge about those technologies. Where possible, the user should not be asked to use unfamiliar technologies, but if this is not possible then the requisite learning must be included within the session plan.
//       If the ultimate end goal is not realistically achievable when all details are considered, a revised end goal should be offered and, if accepted by the user, a new plan generated accordingly.
//       Generally, avoid open-ended questions and, where possible, offer example options. Periodically remind the user that they may skip a question.
//       Begin by introducing yourself and your purpose to the user, and asking the user what they would like the plan to focus on.
//     `,
//     model: "gpt-4"
//   });

// const thread = await openai.beta.threads.create();

// const message = await openai.beta.threads.messages.create(
//     thread.id,
//     {
//       role: "user",
//       //   content: `${input}`
//       content: "can you solve 2+2 for me?"
//     }
// );

//   const run = await openai.beta.threads.runs.create(
//     thread.id,
//     { 
//       assistant_id: assistant.id,
//     }
//   );

//   const messages = await openai.beta.threads.messages.list(
//     thread.id
//   );

// }
// main()