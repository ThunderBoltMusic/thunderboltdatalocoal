const {
  Interaction,
  Collection,
  Client,
  GuildMember,
  Permissions,
  MessageActionRow,
  MessageButton,
} = require("discord.js");
const { embed: ee, emoji, PREFIX } = require("../settings/config");
const client = require("../index");
const { Song } = require("distube");


function cooldown(interaction, cmd) {
  if (!interaction || !cmd) return;
  let { client, member } = interaction;
  if (!client.cooldowns.has(cmd.name)) {
    client.cooldowns.set(cmd.name, new Collection());
  }
  const now = Date.now();
  const timestamps = client.cooldowns.get(cmd.name);
  const cooldownAmount = cmd.cooldown * 1000;
  if (timestamps.has(member.id)) {
    const expirationTime = timestamps.get(member.id) + cooldownAmount;
    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      
      return timeLeft;
    } else {
      timestamps.set(member.id, now);
      setTimeout(() => timestamps.delete(member.id), cooldownAmount);
      return false;
    }
  } else {
    timestamps.set(member.id, now);
    setTimeout(() => timestamps.delete(member.id), cooldownAmount);
    return false;
  }
}


async function check_dj(client, member, song = null) {
  if (!client) return false;
  let roleid = await client.music.get(`${member.guild.id}.djrole`);
  var isdj = false;
  if (!roleid) return false;
  if (!member.guild.roles.cache.get(roleid)) {
    await client.music.set(`${member.guild.id}.djrole`, null);
    return;
  }
  if (member.roles.cache.has(roleid)) isdj = true;

  if (
    !isdj &&
    !member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) &&
    song?.user.id !== member.id
  ) {
    return `<@${roleid}>`;
  } else {
    return false;
  }
}

async function databasing(guildID, userID) {
  await client.music.ensure(guildID, {
    prefix: PREFIX,
    djrole: null,
    vc: {
      enable: false,
      channel: null,
    },
    music: {
      channel: null,
      pmsg: null,
      qmsg: null,
    },
    autoresume : false,
    
  });
  await client.queue.ensure(userID, {
    TEMPLATEQUEUEINFORMATION: ["queue", "sadasd"],
  });
}

async function swap_pages(interaction, embeds) {
  let currentPage = 0;
  let allbuttons = new MessageActionRow().addComponents([
    new MessageButton().setStyle("SECONDARY").setCustomId("0").setLabel("<<"),
    // .setEmoji(`⏪`),
    new MessageButton().setStyle("SECONDARY").setCustomId("1").setLabel("<"),
    // .setEmoji(`◀️`),
    new MessageButton().setStyle("DANGER").setCustomId("2").setLabel("⛔️"),
    // .setEmoji(`🗑`),
    new MessageButton().setStyle("SECONDARY").setCustomId("3").setLabel(">"),
    // .setEmoji(`▶️`),
    new MessageButton().setStyle("SECONDARY").setCustomId("4").setLabel(">>"),
    // .setEmoji(`⏩`),
  ]);
  if (embeds.length === 1) {
    if (interaction.deferred) {
      return interaction.followUp({
        embeds: [embeds[0]],
        fetchReply: true,
      });
    } else {
      return interaction.reply({
        embeds: [embeds[0]],
        fetchReply: true,
      });
    }
  }
  embeds = embeds.map((embed, index) => {
    return embed.setColor(client.config.embed.color).setFooter({
      text: `Page ${index + 1} / ${embeds.length}`,
      iconURL: interaction.guild.iconURL({ dynamic: true }),
    });
  });
  let swapmsg;
  if (interaction.deferred) {
    swapmsg = await interaction.followUp({
      embeds: [embeds[0]],
      components: [allbuttons],
    });
  } else {
    swapmsg = await interaction.reply({
      embeds: [embeds[0]],
      components: [allbuttons],
    });
  }
  const collector = swapmsg.createMessageComponentCollector({
    time: 2000 * 60,
  });
  collector.on("collect", async (b) => {
    if (b.isButton()) {
      await b.deferUpdate().catch((e) => {});
      // page first
      if (b.customId == "0") {
        if (currentPage !== 0) {
          currentPage = 0;
          await swapmsg
            .edit({
              embeds: [embeds[currentPage]],
              components: [allbuttons],
            })
            .catch((e) => null);
        }
      }
      if (b.customId == "1") {
        if (currentPage !== 0) {
          currentPage -= 1;
          await swapmsg
            .edit({
              embeds: [embeds[currentPage]],
              components: [allbuttons],
            })
            .catch((e) => null);
        } else {
          currentPage = embeds.length - 1;
          await swapmsg
            .edit({
              embeds: [embeds[currentPage]],
              components: [allbuttons],
            })
            .catch((e) => null);
        }
      }
      else if (b.customId == "2") {
        try {
          allbuttons.components.forEach((btn) => btn.setDisabled(true));
          swapmsg
            .edit({
              embeds: [embeds[currentPage]],
              components: [allbuttons],
            })
            .catch((e) => null);
        } catch (e) {}
      }

      else if (b.customId == "3") {
        if (currentPage < embeds.length - 1) {
          currentPage++;
          await swapmsg
            .edit({
              embeds: [embeds[currentPage]],
              components: [allbuttons],
            })
            .catch((e) => null);
        } else {
          currentPage = 0;
          await swapmsg
            .edit({
              embeds: [embeds[currentPage]],
              components: [allbuttons],
            })
            .catch((e) => null);
        }
      }
      if (b.customId == "4") {
        currentPage = embeds.length - 1;
        await swapmsg
          .edit({
            embeds: [embeds[currentPage]],
            components: [allbuttons],
          })
          .catch((e) => null);
      }
    }
  });

  collector.on("end", () => {
    allbuttons.components.forEach((btn) => btn.setDisabled(true));
    swapmsg.edit({ components: [allbuttons] }).catch((e) => null);
  });
}

function shuffle(array) {
  try {
    var j, x, i;
    for (i = array.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = array[i];
      array[i] = array[j];
      array[j] = x;
    }
    return array;
  } catch (e) {
    console.log(String(e.stack).bgRed);
  }
}

function createBar(total, current, size = 25, line = "▬", slider = "🔷") {
  try {
    if (!total) throw "MISSING MAX TIME";
    if (!current) return `**[${slider}${line.repeat(size - 1)}]**`;
    let bar =
      current > total
        ? [line.repeat((size / 2) * 2), (current / total) * 100]
        : [
            line
              .repeat(Math.round((size / 2) * (current / total)))
              .replace(/.$/, slider) +
              line.repeat(size - Math.round(size * (current / total)) + 1),
            current / total,
          ];
    if (!String(bar).includes(slider)) {
      return `**[${slider}${line.repeat(size - 1)}]**`;
    } else {
      return `**[${bar[0]}]**`;
    }
  } catch (e) {
    console.log(String(e.stack).bgRed);
  }
}

module.exports = {
  cooldown,
  check_dj,
  databasing,
  swap_pages,
  shuffle,
  createBar,
};