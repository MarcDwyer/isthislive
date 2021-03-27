import { TwitchChat, TwitchAPI } from "https://deno.land/x/tmi/mod.ts";
import { blue, green } from "https://deno.land/std@0.88.0/fmt/colors.ts";
import { delay } from "https://deno.land/std@0.88.0/async/delay.ts";
import { DataJSON } from "./type_defs.ts";

export class Roy {
  private api: TwitchAPI;
  private tc: TwitchChat;

  private past: Map<number, number> = new Map();

  constructor(public msg: string, { username, cid, oauth }: DataJSON) {
    this.api = new TwitchAPI(cid, oauth);
    this.tc = new TwitchChat(cid, username);
  }
  private async say(channel: string) {
    const { msg } = this;
    const chan = this.tc.joinChannel(channel);
    console.log(blue(`Joined ${channel}`));
    chan.send(msg);

    (async () => {
      for await (const msg of chan) {
        if (msg.command === "PRIVMSG" && msg.directMsg) {
          console.log(
            green(
              `Channel: ${msg.channel}. User: ${msg.username}. Said: ${msg.message}`
            )
          );
        }
      }
    })();
    await delay(60000 * 3);
    chan.part();
  }
  private async getFollowers() {
    const { api, past } = this;
    const { streams } = await api.getFollowers();
    if (!streams || !streams.length) throw "No streams provided";
    for (const { channel } of streams) {
      const check = past.get(channel._id);
      const currDate = new Date();

      if (!check || (check && check < currDate.getTime())) {
        this.say(channel.name);
        currDate.setHours(currDate.getHours() + 12);
        past.set(channel._id, currDate.getTime());
      }
    }
  }
  async initRoy() {
    try {
      await this.tc.connect();
      await this.getFollowers();
      setInterval(() => {
        this.getFollowers();
      }, 60000 * 10);
    } catch (e) {
      throw new Error(e);
    }
  }
}
