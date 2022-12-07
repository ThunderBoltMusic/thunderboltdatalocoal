const { CommandInteraction } = require("discord.js");
const thunder = require("../../../handlers/Client");
const { Queue } = require("distube");

module.exports = {
  name: "play",
  description: `play song by song Name/Link`,
  userPermissions: ["CONNECT"],
  botPermissions: ["CONNECT"],
  category: "Music",
  cooldown: 5,
  type: "CHAT_INPUT",
  inVoiceChannel: true,
  inSameVoiceChannel: true,
  Player: false,
  djOnly: false,
  options: [
    {
      name: "song",
      description: `song Name/Link`,
      type: "STRING",
      required: true,
    },
  ],

 
  run: async (client, interaction, args, queue) => {
    let song = interaction.options.getString("song");
    let { channel } = interaction.member.voice;
    client.distube.play(channel, song, {
      member: interaction.member,
      textChannel: interaction.channel,
    });
    interaction
      .followUp({
        content: `<a:6362idle:1049950746793222174> Searching \`${song}\``,
        ephemeral: true,
      })
      .then((msg) => {
        setTimeout(() => {
          msg.delete().catch((e) => {})
        }, 3000);
      });
  },
};
