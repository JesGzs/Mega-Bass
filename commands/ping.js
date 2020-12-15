const Discord = require("discord.js")
module.exports = {
  name: "ping",
  cooldown: 10,
  description: "Show the bot's average ping",
  execute(message) {

    let disco = [
    "120",
    "122",
    "84",
    "79",
    "49",
    "159",
    "73",
    "31",
    "27",
    "32"
  ]
  let discorandom = disco[Math.floor(Math.random() * disco.length)]

    message.channel.send("Pinging...").then(m =>{
    var ping = m.createdTimestamp - message.createdTimestamp;
    const embed = new Discord.MessageEmbed()
    .setDescription(`📈 Average ping to API: ${Math.round(message.client.ws.ping)}ms \r <:705517065330622515:784547031636770816> Ping Vps: ${ping}ms \r :incoming_envelope:  Ping Messages: ${discorandom}ms`)
    .setColor("#FDDB00")
    m.edit(embed).catch(console.error);
    });
}
};
