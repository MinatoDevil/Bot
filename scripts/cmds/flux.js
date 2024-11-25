const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "flux",
    aliases: [],
    author: "Vex_Kshitiz",
    version: "1.0",
    cooldowns: 20,
    role: 0,
    shortDescription: "Generate an image using Flux.",
    longDescription: "flux text to imagine",
    category: "fun",
    guide: "{p}flux <prompt>",
  },
  onStart: async function ({ message, args, api, event }) {
    api.setMessageReaction("🕐", event.messageID, (err) => {}, true);
    try {
      const prompt = args.join(" ");
      const fluxApiUrl = "https://flux-dev-vfv3.onrender.com/flux";

      const fluxResponse = await axios.get(fluxApiUrl, {
        params: {
          prompt: prompt
        },
        responseType: "arraybuffer"
      });

      const cacheFolderPath = path.join(__dirname, "/cache");
      if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
      }
      const imagePath = path.join(cacheFolderPath, `${Date.now()}_generated_flux_image.png`);
      fs.writeFileSync(imagePath, Buffer.from(fluxResponse.data, "binary"));

      const stream = fs.createReadStream(imagePath);
      message.reply({
        body: "",
        attachment: stream
      });
    } catch (error) {
      console.error("Error:", error);
      message.reply("❌ | An error occurred..");
    }
  }
};
