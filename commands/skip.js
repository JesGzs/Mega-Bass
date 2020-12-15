const { canModifyQueue } = require("../util/EvobotUtil");
const Discord = require("discord.js")
module.exports = {
  name: "skip",
  aliases: ["s"],
  description: "Skip the currently playing song",
  execute(message) {
    const queue = message.client.queue.get(message.guild.id);
    if (!queue)
      return message.reply("There is nothing playing that I could skip for you.").catch(console.error);
    if (!canModifyQueue(message.member)) return;

    queue.playing = true;
    queue.connection.dispatcher.end();
    const embed = new Discord.MessageEmbed()
    .setDescription(`⏭ skipped the song [${message.author}]`)
    .setColor("#FDDB00")
    queue.textChannel.send(embed).catch(console.error);
  }
};
