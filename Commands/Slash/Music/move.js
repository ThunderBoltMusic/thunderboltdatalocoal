const { CommandInteraction } = require("discord.js");
const thunder = require("../../../handlers/Client");
const { Queue } = require("distube");

module.exports = {
  name: "move",
  description: `move a song in current queue`,
  userPermissions: ["CONNECT"],
  botPermissions: ["CONNECT"],
  category: "Music",
  cooldown: 5,
  type: "CHAT_INPUT",
  inVoiceChannel: true,
  inSameVoiceChannel: true,
  Player: true,
  djOnly: true,
  options: [
    {
      name: "trackindex",
      description: `Song Index`,
      type: "NUMBER",
      required: true,
    },
    {
      name: "targetindex",
      description: `Target Song Index`,
      type: "NUMBER",
      required: true,
    },
  ],

  
  run: async (client, interaction, args, queue) => {
    let songIndex = interaction.options.getNumber("trackindex");
    let position = interaction.options.getNumber("targetindex");
    if (position >= queue.songs.length || position < 0) position = -1;
    if (songIndex > queue.songs.length - 1) {
      return client.embed(
        interaction,
        ` **The last Song in the Queue has the Index: \`${queue.songs.length}\`**`
      );
    } else if (position === 0) {
      return client.embed(
        interaction,
        `**Cannot move Song before Playing Song!**`
      );
    } else {
      let song = queue.songs[songIndex];
      queue.songs.splice(songIndex);
      queue.addToQueue(song, position);
      client.embed(
        interaction,
        `📑 Moved **${
          song.name
        }** to the **\`${position}th\`** Place right after **_${
          queue.songs[position - 1].name
        }_!**`
      );
    }
  },
};
