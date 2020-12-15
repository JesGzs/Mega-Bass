const { canModifyQueue } = require("../util/EvobotUtil");
const Discord = require("discord.js")
module.exports = {
  name: "stop",
  description: "Stops the music",
  execute(message) {
    const queue = message.client.queue.get(message.guild.id);

    if (!queue) return message.reply("There is nothing playing.").catch(console.error);
    if (!canModifyQueue(message.member)) return;

    queue.songs = [];
    queue.connection.dispatcher.end();
    const embed = new Discord.MessageEmbed()
    .setDescription(`⏹ stopped the music [${message.author}]`)
    .setColor("#FDDB00")
    queue.textChannel.send(embed).catch(console.error);
  }
};
