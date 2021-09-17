const Discord = require("discord.js")
const { Client, Collection } = require("discord.js");
const { readdirSync } = require("fs");
const { join } = require("path");
const { TOKEN, default_prefix } = require("./config.json");
const db = require("quick.db")

const client = new Client({ disableMentions: "everyone" });
client.commands = new Collection();
client.queue = new Map();
const cooldowns = new Collection();
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function presencia(){
client.user.setPresence({
    status: "online",
    activity: {
      name: "-help and -play",
      type: "LISTENING",
    }
  });
}

client.on('ready', () => {
console.log(`Logged as ${client.user.tag}!`);
presencia();
});

client.on("warn", (info) => console.log(info));
client.on("error", console.error);

const commandFiles = readdirSync(join(__dirname, "commands")).filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(join(__dirname, "commands", `${file}`));
  client.commands.set(command.name, command);
}

client.on("message", async (message) => {

let PREFIX = await  db.get(`prefix_${message.guild.id}`);
if(PREFIX === null) PREFIX = default_prefix;
if (!message.content.startsWith(PREFIX) || message.author.bot) return;

client.prefix = PREFIX;

let blacklist = await db.fetch(`blacklist_${message.author.id}`)
if (blacklist === "Blacklisted") return;

  if (message.author.bot) return;
  if (!message.guild) return;

  const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(PREFIX)})\\s*`);
  if (!prefixRegex.test(message.content)) return;

  const [, matchedPrefix] = message.content.match(prefixRegex);

  const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command =
    client.commands.get(commandName) ||
    client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 1) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(
        `please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`
      );
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply("There was an error executing that command.").catch(console.error);
  }
});

///help

client.on('message', async message => {
let PREFIX = await  db.get(`prefix_${message.guild.id}`);
if(PREFIX === null) PREFIX = default_prefix;
if (!message.content.startsWith(PREFIX) || message.author.bot) return;
  if (message.content === `${PREFIX}help`) {
    const embed = new Discord.MessageEmbed()
.setAuthor("Help Panel", "https://i.imgur.com/nGk0GyH.png")
.setDescription(`Mega boss commands use **${message.client.prefix}<command>**`)
.addField("Bot", "`ping`, `setprefix`, `clear`")
.addField("Musica", '`play (p)`, `search (s)`, `pause`, `resume,queue (q)`, `skip (s)`, `volume (v)`, `skipto (st)`, `remove`, `pruning`, `loop (l)`, `playlist (pl)`, `stop`, `shuffle`, `np`, `join`, `leave`, `move`, `lyrics (ly)`')
.addField("Links", "[➜ Invite me](https://discord.com/oauth2/authorize?client_id=${message.client.user.id}&permissions=70282305&scope=bot) \r [➜ Support](https://discord.gg/Y6BjupHH5b)")
.setFooter(message.author.username, message.author.displayAvatarURL({dynamic : true}))
.setThumbnail(client.user.avatarURL())
.setColor("#FDDB00")
console.log("Comando Ayuda Activado")
message.channel.send(embed);
  }
});

///MONUITOR
const keepAlive = require('./server');
const Monitor = require('ping-monitor');
 
keepAlive();
const monitor = new Monitor({
    website: 'TU MONITOR LINK',
    title: 'Principal',
    interval: 15 // minutes
});
 
monitor.on('up', (res) => console.log(`${res.website} está encedido.`));
monitor.on('down', (res) => console.log(`${res.website} se ha caído - ${res.statusMessage}`));
monitor.on('stop', (website) => console.log(`${website} se ha parado.`) );
monitor.on('error', (error) => console.log(error));

client.login(TOKEN);
