import type { GameState } from "./types";
import { addLog } from "./state";
import { DEFAULT_ACTION_COSTS, spendAP, recoverStamina } from "./ap";
import { endPlayerAction } from "./actions";

export function useQuickbar(state: GameState, index: number): void {
  const id = state.player.quickbar[index];
  if (!id) {
    addLog(state, { text: "Nothing in that slot.", color: "#888" });
    return;
  }
  const item = state.player.inventory.find((i) => i.id === id);
  if (!item || item.kind !== "consumable") {
    addLog(state, { text: "Cannot use that item.", color: "#f55" });
    return;
  }
  const cost = Math.max(1, (item.apUse ?? DEFAULT_ACTION_COSTS.interact) - 2);
  if (!spendAP(state, cost)) {
    addLog(state, { text: "Not enough AP!", color: "#f55" });
    return;
  }
  if (item.effectId === "heal_minor") {
    state.player.hp.cur = Math.min(state.player.hp.max, state.player.hp.cur + 3);
    addLog(state, { text: "You feel refreshed.", color: "#0f0" });
  } else if (item.effectId === "heal_major") {
    state.player.hp.cur = Math.min(state.player.hp.max, state.player.hp.cur + 7);
    addLog(state, { text: "A surge of vitality!", color: "#0f0" });
  }
  recoverStamina(state);
  endPlayerAction(state);
}
