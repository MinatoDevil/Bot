const fs = require("fs-extra");
const { utils } = global;

module.exports = {
  config: {
    name: "prefix",
    version: "1.4",
    author: "NTKhang",
    countDown: 5,
    role: 0,
    description: "Change the bot's prefix in your chat group or globally (admin only)",
    category: "config",
    guide: {
      en: "{pn} <new prefix>: change prefix in your chat group" +
        "\n Example:" +
        "\n {pn} #" +
        "\n\n {pn} <new prefix> -g: change prefix globally (admin only)" +
        "\n Example:" +
        "\n {pn} # -g" +
        "\n\n {pn} reset: reset prefix in your chat group to default"
    }
  },
  
  langs: {
    en: {
      reset: "Your prefix has been reset to default: %1",
      onlyAdmin: "Only admin can change the global prefix",
      confirmGlobal: "React to this message to confirm global prefix change",
      confirmThisThread: "React to this message to confirm prefix change in your chat",
      successGlobal: "Global prefix changed to: %1",
      successThisThread: "Prefix changed in your chat to: %1",
      myPrefix: "🌐 System prefix: %1\n🛸 Your chat prefix: %2"
    }
  },

  onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
    if (!args[0]) return message.SyntaxError();
    
    if (args[0] === 'reset') {
      await threadsData.set(event.threadID, null, "data.prefix");
      return message.reply(getLang("reset", global.GoatBot.config.prefix));
    }

    const newPrefix = args[0];
    const formSet = { commandName, author: event.senderID, newPrefix };
    
    if (args[1] === "-g") {
      if (role < 2) return message.reply(getLang("onlyAdmin"));
      formSet.setGlobal = true;
    } else {
      formSet.setGlobal = false;
    }

    return message.reply(
      formSet.setGlobal ? getLang("confirmGlobal") : getLang("confirmThisThread"), 
      (err, info) => {
        formSet.messageID = info.messageID;
        global.GoatBot.onReaction.set(info.messageID, formSet);
      }
    );
  },

  onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
    const { author, newPrefix, setGlobal } = Reaction;
    if (event.userID !== author) return;
    
    if (setGlobal) {
      global.GoatBot.config.prefix = newPrefix;
      fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
      return message.reply(getLang("successGlobal", newPrefix));
    } else {
      await threadsData.set(event.threadID, newPrefix, "data.prefix");
      return message.reply(getLang("successThisThread", newPrefix));
    }
  },

  onChat: async function ({ event, message, getLang }) {
    if (event.body && event.body.toLowerCase() === "prefix") {
      const imageUrl = "https://i.ibb.co/sHHMNq1/image.gif";
      const prefixInfo = `┏𝗣𝗥𝗘𝗙𝗜𝗫\n┗━━━⦿【${utils.getPrefix(event.threadID)}】`;
      
      return message.reply({
        body: prefixInfo,
        attachment: await utils.getStreamFromURL(imageUrl)
      });
    }
  }
};
