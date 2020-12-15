const db = require("quick.db")
const Discord = require("discord.js")
module.exports = {
  name: "setprefix",
  aliases: [],
  description: "Move songs around in the queue",
  execute(message, args) {

 if(!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send('No tienes permsisos sufcientes para utilizar este comando.');

        if(!args[0]) return message.channel.send('Por favor Dime tu nuevo prefix');

        if(args[1]) return message.channel.send('El prefix\'No puede tener espacios');

        db.set(`prefix_${message.guild.id}`, args[0])

        const embed = new Discord.MessageEmbed()
        .setDescription(`This server's prefix is now **${args[0]}** Commands must now use  **${args[0]}** as their prefix. For example, \`${args[0]}play\`.`)
        .setColor("#FDDB00")
        message.channel.send(embed)

}
};
