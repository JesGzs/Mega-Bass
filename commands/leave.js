const Discord = require("discord.js")
module.exports = {
  name: "leave",
  aliases: ["lv"],
  description: "Toggle music loop",
  execute(message) {

    let canalvoz = message.member.voice.channel;

    if (!canalvoz || canalvoz.type !== 'voice') {
      const noconectado = new Discord.MessageEmbed()
        .setDescription("Necesitas unirte a un canal de voz.")
        .setColor("RED")
      message.channel.send(noconectado);

    } else if (message.guild.voiceConnection) {
      const yaconectado = new Discord.MessageEmbed()
        .setDescription("Ya estoy desconectado.")
        .setColor("RED")
      message.channel.send(yaconectado);

    } else {
      const conectando = new Discord.MessageEmbed()
        .setDescription("Desconectando...")
        .setColor("GREEN")
      message.channel.send(conectando)
        canalvoz.leave()

    };
  }
  };