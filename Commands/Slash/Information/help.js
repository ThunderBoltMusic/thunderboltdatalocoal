const {
  CommandInteraction,
  MessageEmbed,
  MessageActionRow,
  MessageSelectMenu,
} = require("discord.js");
const thunder = require("../../../handlers/Client");
const { Queue } = require("distube");

module.exports = {
  name: "help",
  description: `need help ? here is my all commands`,
  userPermissions: ["SEND_MESSAGES"],
  botPermissions: ["EMBED_LINKS"],
  category: "Information",
  cooldown: 5,
  type: "CHAT_INPUT",
  inVoiceChannel: false,
  inSameVoiceChannel: false,
  Player: false,
  djOnly: false,

  
  run: async (client, interaction, args, queue) => {
    const emoji = {
      Information: "🔰",
      Music: "🎵",
      Settings: "⚙️",
    };

    let allcommands = client.commands.size;
    let allguilds = client.guilds.cache.size;
    let botuptime = `<t:${Math.floor(
      Date.now() / 1000 - client.uptime / 1000
    )}:R>`;

    let raw = new MessageActionRow().addComponents([
      new MessageSelectMenu()
        .setCustomId("help-menu")
        .setPlaceholder(`Click to see my all Category`)
        .addOptions([
          {
            label: `Home`,
            value: "home",
            emoji: `🏘️`,
            description: `Click to Go On HomePage`,
          },
          client.scategories.map((cat) => {
            return {
              label: `${cat.toLocaleUpperCase()}`,
              value: cat,
              emoji: emoji[cat],
              description: `Click to See Commands of ${cat}`,
            };
          }),
        ]),
    ]);

    let help_embed = new MessageEmbed()
      .setColor(client.config.embed.color)
      .setAuthor({
        name: client.user.tag,
        iconURL: client.user.displayAvatarURL({ dynamic: true }),
      })
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setDescription(
        ``
      )
      .setFooter(client.getFooter(interaction.user));

    let main_msg = await interaction.followUp({
      embeds: [help_embed],
      components: [raw],
    });

    let filter = (i) => i.user.id === interaction.user.id;
    let colector = await main_msg.createMessageComponentCollector({
      filter: filter,
      time: 20000,
    });
    colector.on("collect", async (i) => {
      if (i.isSelectMenu()) {
        await i.deferUpdate().catch((e) => {});
        if (i.customId === "help-menu") {
          let [directory] = i.values;
          if (directory == "home") {
            main_msg.edit({ embeds: [help_embed] }).catch((e) => {});
          } else {
            main_msg
              .edit({
                embeds: [
                  new MessageEmbed()
                    .setColor(client.config.embed.color)
                    .setTitle(
                      `${emoji[directory]} ${directory} Commands ${emoji[directory]}`
                    )
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .setDescription(
                      `>>> ${client.commands
                        .filter((cmd) => cmd.category === directory)
                        .map((cmd) => {
                          return `\`${cmd.name}\``;
                        })
                        .join(" ' ")}`
                    )
                    .setFooter(client.getFooter(interaction.user)),
                ],
              })
              .catch((e) => null);
          }
        }
      }
    });

    colector.on("end", async (c, i) => {
      raw.components.forEach((c) => c.setDisabled(true));
      main_msg.edit({ components: [raw] }).catch((e) => {});
    });
  },
};
