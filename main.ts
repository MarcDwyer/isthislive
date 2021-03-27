import { Roy } from "./roy.ts";
import { Application, Router } from "https://deno.land/x/oak/mod.ts";

const bytes = await Deno.readFile("./data.json");
const decoder = new TextDecoder();

const data = JSON.parse(decoder.decode(bytes));
if (!data || !data.username) throw new Error("No username provided");

const roy = new Roy("is this live", data.username);

await roy.initRoy();

const router = new Router();

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
