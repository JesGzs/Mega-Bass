const ytdl = require("erit-ytdl");
const scdl = require("soundcloud-downloader").default;
const { canModifyQueue, STAY_TIME } = require("../util/EvobotUtil");
const Discord = require("discord.js")
module.exports = {
  async play(song, message) {
    const { SOUNDCLOUD_CLIENT_ID } = require("../util/EvobotUtil");

    let config;

    try {
      config = require("../config.json");
    } catch (error) {
      config = null;
    }

    const PRUNING = config ? config.PRUNING : process.env.PRUNING;

    const queue = message.client.queue.get(message.guild.id);

    if (!song) {
      setTimeout(function () {
        if (queue.connection.dispatcher && message.guild.me.voice.channel) return;
        queue.channel.leave();
      }, STAY_TIME * 1000);
      return message.client.queue.delete(message.guild.id);
    }

    let stream = null;
    let streamType = song.url.includes("youtube.com") ? "opus" : "ogg/opus";

    try {
      if (song.url.includes("youtube.com")) {
        stream = await ytdl(song.url, { highWaterMark: 1 << 25 });
      } else if (song.url.includes("soundcloud.com")) {
        try {
          stream = await scdl.downloadFormat(song.url, scdl.FORMATS.OPUS, SOUNDCLOUD_CLIENT_ID);
        } catch (error) {
          stream = await scdl.downloadFormat(song.url, scdl.FORMATS.MP3, SOUNDCLOUD_CLIENT_ID);
          streamType = "unknown";
        }
      }
    } catch (error) {
      if (queue) {
        queue.songs.shift();
        module.exports.play(queue.songs[0], message);
      }

      console.error(error);
      return message.channel.send(`Error: ${error.message ? error.message : error}`);
    }

    queue.connection.on("disconnect", () => message.client.queue.delete(message.guild.id));

    const dispatcher = queue.connection
      .play(stream, { type: streamType })
      .on("finish", () => {
        if (collector && !collector.ended) collector.stop();

        if (queue.loop) {
          // if loop is on, push the song back at the end of the queue
          // so it can repeat endlessly
          let lastSong = queue.songs.shift();
          queue.songs.push(lastSong);
          module.exports.play(queue.songs[0], message);
        } else {
          // Recursively play the next song
          queue.songs.shift();
          module.exports.play(queue.songs[0], message);
        }
      })
      .on("error", (err) => {
        console.error(err);
        queue.songs.shift();
        module.exports.play(queue.songs[0], message);
      });
    dispatcher.setVolumeLogarithmic(queue.volume / 100);

    try {
      const embedp = new Discord.MessageEmbed()
      .setTitle("<a:warrensong:774496826044579871>  **|** Now Playing")
      .setDescription(`[${song.title}](${song.url}) [${message.author}]`)
      .setColor("#FDDB00")
      var playingMessage = await queue.textChannel.send(embedp);
      await playingMessage.react("⏭");
      await playingMessage.react("⏯");
      await playingMessage.react("🔇");
      await playingMessage.react("🔉");
      await playingMessage.react("🔊");
      await playingMessage.react("🔁");
      await playingMessage.react("⏹");
    } catch (error) {
      console.error(error);
    }

    const filter = (reaction, user) => user.id !== message.client.user.id;
    var collector = playingMessage.createReactionCollector(filter, {
      time: song.duration > 0 ? song.duration * 1000 : 600000
    });

    collector.on("collect", (reaction, user) => {
      if (!queue) return;
      const member = message.guild.member(user);

      switch (reaction.emoji.name) {
        case "⏭":
          queue.playing = true;
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return;
          queue.connection.dispatcher.end();
          const embedskip = new Discord.MessageEmbed()
          .setDescription(`⏩ skipped the song [${user}]`)
          .setColor(0x008FFF)
          queue.textChannel.send(embedskip).catch(console.error);
          collector.stop();
          break;

        case "⏯":
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return;
          if (queue.playing) {
            queue.playing = !queue.playing;
            queue.connection.dispatcher.pause(true);
            const embedpause = new Discord.MessageEmbed()
            .setDescription(`⏸ paused the music [${user}]`)
            .setColor(0x008FFF)
            queue.textChannel.send(embedpause).catch(console.error);
          } else {
            queue.playing = !queue.playing;
            queue.connection.dispatcher.resume();
            const embedresume = new Discord.MessageEmbed()
            .setDescription(`▶ resumed the music [${user}]`)
            .setColor(0x008FFF)
            queue.textChannel.send(embedresume).catch(console.error);
          }
          break;

        case "🔇":
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return;
          if (queue.volume <= 0) {
            queue.volume = 100;
            queue.connection.dispatcher.setVolumeLogarithmic(100 / 100);
            const embedunmute = new Discord.MessageEmbed()
            .setDescription(`🔊 unmuted the music [${user}]`)
            .setColor(0x008FFF)
            queue.textChannel.send(embedunmute).catch(console.error);
          } else {
            queue.volume = 0;
            queue.connection.dispatcher.setVolumeLogarithmic(0);
            const embedmute = new Discord.MessageEmbed()
            .setDescription(`🔇 muted the music [${user}]`)
            .setColor(0x008FFF)
            queue.textChannel.send(embedmute).catch(console.error);
          }
          break;

        case "🔉":
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member) || queue.volume == 0) return;
          if (queue.volume - 10 <= 0) queue.volume = 0;
          else queue.volume = queue.volume - 10;
          queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100);
          const embedvolume= new Discord.MessageEmbed()
          .setDescription(`🔉 decreased the volume, the volume is now ${queue.volume}% [${user}]`)
          .setColor(0x008FFF)
          queue.textChannel.send(embedvolume).catch(console.error);
          break;

        case "🔊":
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member) || queue.volume == 100) return;
          if (queue.volume + 10 >= 100) queue.volume = 100;
          else queue.volume = queue.volume + 10;
          queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100);
          const embedxd = new Discord.MessageEmbed()
          .setDescription(`🔊 increased the volume, the volume is now ${queue.volume}% [${user}]`)
          .setColor(0x008FFF)
          queue.textChannel.send(embedxd).catch(console.error);
          break;

        case "🔁":
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return;
          queue.loop = !queue.loop;
          const embedxddd = new Discord.MessageEmbed()
          .setDescription(`Loop is now ${queue.loop ? "**on**" : "**off**"}`)
          .setColor(0x008FFF)
          queue.textChannel.send(embedxddd).catch(console.error);
          break;

        case "⏹":
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return;
          queue.songs = [];
          const embedqueue = new Discord.MessageEmbed()
          .setDescription(`⏹ stopped the music [${user}]`)
          .setColor(0x008FFF)
          queue.textChannel.send(embedqueue).catch(console.error);
          try {
            queue.connection.dispatcher.end();
          } catch (error) {
            console.error(error);
            queue.connection.disconnect();
          }
          collector.stop();
          break;

        default:
          reaction.users.remove(user).catch(console.error);
          break;
      }
    });

    collector.on("end", () => {
      playingMessage.reactions.removeAll().catch(console.error);
      if (PRUNING && playingMessage && !playingMessage.deleted) {
        playingMessage.delete({ timeout: 3000 }).catch(console.error);
      }
    });
  }
};
