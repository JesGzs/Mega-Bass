const { canModifyQueue } = require("../util/EvobotUtil");
const Discord = require("discord.js")

module.exports = {
  name: "pause",
  description: "Pause the currently playing music",
  execute(message) {
    const queue = message.client.queue.get(message.guild.id);
    if (!queue) return message.reply("There is nothing playing.").catch(console.error);
    if (!canModifyQueue(message.member)) return;

    if (queue.playing) {
      queue.playing = false;
      queue.connection.dispatcher.pause(true);
      const embed = new Discord.MessageEmbed()
      .setDescription(`⏸ paused the music [${message.author}]`)
      .setColor("#FDDB00")
      return queue.textChannel.send(embed).catch(console.error);
    }
  }
};
