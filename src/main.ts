import { createInitialState } from "./core/state";
import { Renderer } from "./ui/renderer";
import { attachInput } from "./core/input";
import { refreshPlayerAP } from "./core/ap";
import { addLog } from "./core/state";
import { reveal, updateMonsterFOV } from "./core/actions";

const app = document.getElementById("app");
if (!app) throw new Error("Missing app container");

const state = createInitialState();
const renderer = new Renderer({ container: app });
attachInput(state);
refreshPlayerAP(state);
reveal(state);
updateMonsterFOV(state);

function loop() {
  renderer.render(state);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

(window as any).state = state;
addLog(state, { text: "Walk into monsters to attack. Press I for inventory, F to aim, G to dash east.", color: "#8ff" });
