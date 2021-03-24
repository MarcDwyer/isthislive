import { TwitchChat, TwitchAPI } from "https://deno.land/x/tmi/mod.ts";
import { blue, green } from "https://deno.land/std@0.88.0/fmt/colors.ts";
import { delay } from "https://deno.land/std@0.88.0/async/delay.ts";

const cid = Deno.env.get("CID"),
  oauth = Deno.env.get("OAUTH");

if (!cid || !oauth) throw new Error("err getting creds");

const tc = new TwitchChat(oauth, "cummunism_");
const api = new TwitchAPI(cid, oauth);

const fmap = new Map<number, number>();

async function getStreams() {
  const { streams } = await api.getFollowers();
  if (!streams || !streams.length) throw "No streams provided";
  for (const stream of streams) {
    const check = fmap.get(stream._id);
    const currDate = new Date();

    if (!check || (check && check < currDate.getTime())) {
      saySomething(stream.channel.name, "is this live");
      currDate.setHours(currDate.getHours() + 24);
      fmap.set(stream._id, currDate.getTime());
    }
  }
}

async function saySomething(channel: string, msg: string) {
  const chan = tc.joinChannel(channel);
  console.log(blue(`Joined ${channel}`));
  chan.send(msg);
  chan.addEventListener("privmsg", (msg) => {
    if (msg.directMsg) {
      console.log(
        green(
          `Channel: ${msg.channel}. User: ${msg.username}. Said: ${msg.message}`
        )
      );
    }
  });
  await delay(60000 * 3);
  chan.part();
}

try {
  await tc.connect();
  await getStreams();
  setInterval(() => {
    getStreams();
  }, 60000 * 10);
} catch (err) {
  console.error(err);
}
