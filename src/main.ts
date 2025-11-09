import { createInitialState } from "./core/state";
import { Renderer } from "./ui/renderer";
import { attachInput } from "./core/input";
import { processMonsters } from "./ai/behavior";
import { refreshPlayerAP } from "./core/ap";
import { updateMonsterFOV } from "./core/actions";
import { addLog } from "./core/state";

const app = document.getElementById("app");
if (!app) throw new Error("Missing app container");

const state = createInitialState();
const renderer = new Renderer({ container: app });
attachInput(state);
refreshPlayerAP(state);

let lastRender = 0;

function loop(timestamp: number) {
  const dt = timestamp - lastRender;
  if (dt > 300) {
    processMonsters(state);
    updateMonsterFOV(state);
    lastRender = timestamp;
  }
  renderer.render(state);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

(window as any).state = state;
addLog(state, { text: "Press I for inventory, F for aim, G to dash east.", color: "#8ff" });
