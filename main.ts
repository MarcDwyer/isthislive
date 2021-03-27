import { Roy } from "./roy.ts";
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { DataJSON } from "./type_defs.ts";

const bytes = await Deno.readFile("./data.json");
const decoder = new TextDecoder();

const data: DataJSON = JSON.parse(decoder.decode(bytes));
if (!data) throw new Error("No username provided");

const roy = new Roy("is this live", data);

// await roy.initRoy();

const router = new Router();

router.post("/msg", async (ctx) => {
  const reader = ctx.request.body({ type: "reader" });
  const b = await Deno.readAll(reader.value);
  const body = JSON.parse(decoder.decode(b));
  if (body.msg && body.key === data.key) {
    roy.msg = body.msg;
  }
  ctx.response.body = roy.msg;
});
const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 1990 });
