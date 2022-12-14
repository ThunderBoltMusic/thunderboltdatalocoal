const { CommandInteraction } = require("discord.js");
const thunder = require("../../../handlers/Client");
const { Queue } = require("distube");

module.exports = {
  name: "247",
  description: `toggle 24/7 system on/off`,
  userPermissions: ["MANAGE_GUILD"],
  botPermissions: ["EMBED_LINKS"],
  category: "Settings",
  cooldown: 5,
  type: "CHAT_INPUT",
  inVoiceChannel: true,
  inSameVoiceChannel: true,
  Player: false,
  djOnly: false,

 
  run: async (client, interaction, args, queue) => {
 
    let data = await client.music.get(`${interaction.guild.id}.vc`);
    let mode = data.enable;
    let channel = interaction.member.voice.channel;

    if (mode === true) {
      let dataOptions = {
        enable: false,
        channel: null,
      };
      await client.music.set(`${interaction.guild.id}.vc`, dataOptions);
      client.embed(
        interaction,
        `** ${client.config.emoji.ERROR}  24/7 System Disabled **`
      );
    } else {
      let dataOptions = {
        enable: true,
        channel: channel.id,
      };
      await client.music.set(`${interaction.guild.id}.vc`, dataOptions);
      client.embed(
        interaction,
        `** ${client.config.emoji.SUCCESS} 24/7 System Enabled **`
      );
    }
  },
};
