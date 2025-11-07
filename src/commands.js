const { openaiResponse } = require("./openai");
const commandLog = [];
const chatHistory = [];

const commandsList = {
  greet: (message) =>
    replyToMessage(message, `Hello ${message.author.username}!`),
  help: help,
  log: logCommands,
  chat: chat,
  // assistant: assist,
};

function replyToMessage(msg, answer) {
  // Check if the answer is not undefined and not an empty string
  if (answer !== undefined && answer !== "") {
    msg.reply(answer);
  } else {
    console.warn("Tried to send an empty message. Ignoring.");
  }
}

// help function lists all of the commands available
function help(message) {
  const availableCommands = Object.keys(commandsList).join(", ");
  replyToMessage(message, `Available commands: ${availableCommands}`);
}


//Function to display logged commands
function logCommands(message) {
  if (commandLog.length > 0) {
    message.channel.send(
      `Command Log:\n\`\`\`json\n${JSON.stringify(commandLog, null, 2)}\n\`\`\``
    );
  } else {
    message.channel.send("The command log is empty.");
  }
}


// function to access openai
async function chat(message) {
  const prompt = message.content;
  console.log(`current prompt: ${prompt}`);

  if (prompt) {
    try {
      // Concatenate chat history with the current prompt
      const fullPrompt =
        "Previous chat history for reference:\n" +
        chatHistory
          .map(
            (entry) => `${entry.user}: ${entry.prompt}\nBot: ${entry.response}`
          )
          .join("\n") +
        `\n\nCurrent question: ${prompt}`;

      console.log(`full prompt: ${fullPrompt}`);
      const response = await openaiResponse(fullPrompt);

      // Log chat history
      const chatElement = {
        user: message.author.username,
        prompt: prompt,
        response: response,
        timestamp: new Date(),
      };

      chatHistory.push(chatElement);

      // console.log(chatHistory);

      // Send the response back to the user
      replyToMessage(message, response);
    } catch (error) {
      console.error("Error in openaiResponse:", error);
      replyToMessage(
        message,
        "An error occurred while processing the request."
      );
    }
  } else {
    // Inform the user that they need to provide a prompt
    replyToMessage(message, "Please provide a prompt after `!chat`.");
  }
}

module.exports = { commandsList, commandLog, chatHistory };
