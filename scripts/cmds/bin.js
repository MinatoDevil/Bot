const PastebinAPI = require('pastebin-js');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "bin",
    version: "1.1",
    author: "SANDIP",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Upload files to Pastebin and send link"
    },
    longDescription: {
      en: "Uploads files to Pastebin and provides a link to access the file."
    },
    category: "owner",
    guide: {
      en: "Use {p}bin <filename> to upload a file to Pastebin. The file must be located in the 'cmds' folder."
    }
  },

  onStart: async function ({ api, event, args }) {
    const pastebin = new PastebinAPI({
      api_dev_key: 'LFhKGk5aRuRBII5zKZbbEpQjZzboWDp9'
    });

    if (!args[0]) {
      return api.sendMessage("❌ Please specify a file name.", event.threadID);
    }

    const fileName = args[0];
    const filePath = path.join(__dirname, '..', 'cmds', `${fileName}.js`);

    if (!fs.existsSync(filePath)) {
      return api.sendMessage("❌ File not found! Ensure the file exists in the 'cmds' folder.", event.threadID);
    }

    try {
      const data = fs.readFileSync(filePath, 'utf8');
      const paste = await pastebin.createPaste({
        text: data,
        title: fileName,
        format: null,
        privacy: 1, // Private paste
      });

      const rawPaste = paste.replace("pastebin.com", "pastebin.com/raw");
      api.sendMessage(`✅ Successfully uploaded to Pastebin:\n${rawPaste}`, event.threadID);

    } catch (error) {
      console.error("Error uploading to Pastebin:", error.message || error);
      api.sendMessage("❌ Failed to upload to Pastebin. Please check logs for details.", event.threadID);
    }
  }
};
