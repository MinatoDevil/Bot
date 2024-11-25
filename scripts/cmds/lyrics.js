const axios = require("axios");

module.exports = {
  config: {
    name: "lyrics",
    aliases: ['ly'], 
    version: "1.1", // Updated version
    author: "Rishad | Ace",
    countDown: 15,
    role: 0,
    description: {
      en: "Get song lyrics with their Images"
    },
    category: "music",
    guide: {
      en: "{pn} <song name>"
    }
  },
  
  onStart: async function ({ event, args, message }) {
    const prompt = args.join(' ');
    if (!prompt) {
      return message.reply("Please provide a song name!");
    }

    try {
      // First API attempt
      const response = await axios.get(`https://lyrist.vercel.app/api/${encodeURIComponent(prompt)}`);
      const { title, artist, lyrics, image } = response.data;

      // If we get a valid response, send it
      const messageData = {
        body: `❏ Title: ${title || 'Unknown'}\n\n❏ Artist: ${artist || 'Unknown'}\n\n❏ Lyrics:\n\n${lyrics || 'No lyrics available.'}`,
        attachment: await global.utils.getStreamFromURL(image)
      };
      return message.reply(messageData);
      
    } catch (error) {
      console.error("First API failed, trying the second API...", error);

      try {
        // Fallback to the new API
        const response = await axios.get(`https://newlyricsapi.com/api/${encodeURIComponent(prompt)}`);
        const { title, artist, lyrics, image } = response.data;

        // If we get a valid response, send it
        const messageData = {
          body: `❏ Title: ${title || 'Unknown'}\n\n❏ Artist: ${artist || 'Unknown'}\n\n❏ Lyrics:\n\n${lyrics || 'No lyrics available.'}`,
          attachment: await global.utils.getStreamFromURL(image)
        };
        return message.reply(messageData);

      } catch (error) {
        console.error("Both APIs failed.", error);
        return message.reply("An error occurred while fetching lyrics from both APIs!");
      }
    }
  }
};
