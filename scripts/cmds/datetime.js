const moment = require('moment-timezone');

module.exports = {
  config: {
    name: "datetime",
    aliases: ["time", "date"],
    version: "1.4",
    author: "Itachiffx",
    countdown: 5,
    role: 0,
    shortDescription: "Displays the current date and time in Nepal.",
    longDescription: "Fetches the current date and time in Nepal Standard Time (NST) timezone.",
    category: "misc",
    guide: "{prefix}{name}",
  },

  onStart: async function({ message }) {
    try {
      const nepaliTime = moment.tz("Asia/Kathmandu").format("h:mm:ss A");
      const nepaliDate = moment.tz("Asia/Kathmandu").format("dddd, DD MMMM YYYY");

      const reply = `🇳🇵 Nepal Date & Time:\n` +
                    `❏ Date: ${nepaliDate}\n` +
                    `❏ Time: ${nepaliTime}`;

      message.reply(reply);
    } catch (error) {
      console.error("Error fetching date and time:", error);
      message.reply("❌ | An error occurred while fetching the date and time.");
    }
  },
};
