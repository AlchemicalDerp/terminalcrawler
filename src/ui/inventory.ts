import type { GameState, ItemBase } from "../core/types";
import { addLog } from "../core/state";
import { calculateScrap } from "../core/scrap";

export function openInventory(state: GameState): void {
  const overlay = document.createElement("div");
  overlay.style.position = "absolute";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.right = "0";
  overlay.style.bottom = "0";
  overlay.style.background = "rgba(0, 0, 0, 0.75)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";

  const list = document.createElement("div");
  list.style.background = "#111";
  list.style.padding = "16px";
  list.style.border = "1px solid #555";
  list.style.maxHeight = "80vh";
  list.style.overflowY = "auto";
  list.style.minWidth = "320px";

  state.player.inventory.forEach((item) => {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.justifyContent = "space-between";
    row.style.marginBottom = "4px";
    row.innerHTML = `<span>${item.name}</span>`;

    const ctx = document.createElement("div");
    ctx.style.display = "flex";
    ctx.style.gap = "6px";

    const equip = document.createElement("button");
    equip.textContent = "Equip";
    equip.onclick = () => {
      equipItem(state, item);
    };

    const inspect = document.createElement("button");
    inspect.textContent = "Inspect";
    inspect.onclick = () => {
      alert(`${item.name}\nKind: ${item.kind}\nRarity: ${item.rarity}`);
    };

    const scrap = document.createElement("button");
    scrap.textContent = "Scrap";
    scrap.onclick = () => {
      const scrapGain = calculateScrap(state, item);
      addLog(state, { text: `Scrapped ${item.name} for ${scrapGain} scrap.`, color: "#9ff" });
    };

    const quick = document.createElement("button");
    quick.textContent = "Quickbar";
    quick.onclick = () => {
      addToQuickbar(state, item);
    };

    ctx.append(equip, inspect, scrap, quick);
    row.appendChild(ctx);
    list.appendChild(row);
  });

  overlay.appendChild(list);
  overlay.onclick = () => overlay.remove();
  document.body.appendChild(overlay);
}

function equipItem(state: GameState, item: ItemBase): void {
  if (item.kind === "weapon") {
    state.player.equipped.weapon = item;
    addLog(state, { text: `You equip ${item.name}.`, color: "#ccc" });
  }
}

function addToQuickbar(state: GameState, item: ItemBase): void {
  if (item.kind !== "consumable") {
    addLog(state, { text: "Only consumables can go to quickbar.", color: "#f55" });
    return;
  }
  const idx = state.player.quickbar.indexOf(item.id);
  if (idx !== -1) {
    addLog(state, { text: `${item.name} already in quickbar.`, color: "#888" });
    return;
  }
  for (let i = 0; i < 4; i++) {
    if (!state.player.quickbar[i]) {
      state.player.quickbar[i] = item.id;
      addLog(state, { text: `${item.name} added to slot ${i + 1}.`, color: "#9ff" });
      return;
    }
  }
  addLog(state, { text: "Quickbar full!", color: "#f55" });
}
