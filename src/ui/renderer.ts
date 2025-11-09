import type { GameLogEntry, GameState, Vec2 } from "../core/types";
import { tileAt } from "../core/grid";

export interface RendererOptions {
  container: HTMLElement;
}

export class Renderer {
  private mapEl: HTMLElement;
  private leftPanel: HTMLElement;
  private logEl: HTMLElement;
  private quickbarEl: HTMLElement;

  constructor(opts: RendererOptions) {
    const { container } = opts;
    container.innerHTML = "";
    container.style.display = "grid";
    container.style.gridTemplateColumns = "220px 1fr 260px";
    container.style.flex = "1";

    this.leftPanel = document.createElement("div");
    this.leftPanel.style.padding = "8px";
    this.leftPanel.style.background = "rgba(10, 10, 20, 0.85)";
    container.appendChild(this.leftPanel);

    this.mapEl = document.createElement("pre");
    this.mapEl.style.margin = "0";
    this.mapEl.style.padding = "12px";
    this.mapEl.style.fontSize = "16px";
    this.mapEl.style.lineHeight = "16px";
    this.mapEl.style.overflow = "auto";
    container.appendChild(this.mapEl);

    const rightWrapper = document.createElement("div");
    rightWrapper.style.display = "flex";
    rightWrapper.style.flexDirection = "column";
    rightWrapper.style.background = "rgba(10, 10, 20, 0.85)";
    rightWrapper.style.padding = "8px";

    this.quickbarEl = document.createElement("div");
    this.quickbarEl.style.marginBottom = "8px";
    rightWrapper.appendChild(this.quickbarEl);

    this.logEl = document.createElement("div");
    this.logEl.style.flex = "1";
    this.logEl.style.overflowY = "auto";
    this.logEl.style.fontSize = "13px";
    rightWrapper.appendChild(this.logEl);

    container.appendChild(rightWrapper);
  }

  render(state: GameState): void {
    this.renderStats(state);
    this.renderMap(state);
    this.renderLog(state.log);
    this.renderQuickbar(state);
  }

  private renderStats(state: GameState): void {
    const p = state.player;
    const mana = p.mana ? `\nMana: ${p.mana.cur}/${p.mana.max}` : "";
    const staminaLine = `\nStamina: ${p.stamina.cur}/${p.stamina.max}`;
    const ap = state.playerTurn.ap;
    this.leftPanel.innerText = `Class: ${p.cls}\nHP: ${p.hp.cur}/${p.hp.max}\nAP: ${ap}/${p.apBase}${staminaLine}${mana}\nFloor: ${state.floor}`;
  }

  private renderMap(state: GameState): void {
    const rows: string[] = [];
    for (let y = 0; y < state.dungeon.height; y++) {
      let row = "";
      for (let x = 0; x < state.dungeon.width; x++) {
        row += this.computeGlyph(state, { x, y });
      }
      rows.push(row);
    }
    this.mapEl.innerHTML = rows.join("\n");
  }

  private computeGlyph(state: GameState, pos: Vec2): string {
    const { dungeon } = state;
    if (!dungeon.visible[pos.y][pos.x] && !dungeon.seen[pos.y][pos.x]) {
      return " ";
    }
    const baseTile = tileAt(dungeon, pos);
    let glyph = baseTile?.glyph ?? "#";
    let color = dungeon.visible[pos.y][pos.x] ? "#e0e0e0" : "#444";

    const entity = [...state.entities.values()].find((e) => e.position.x === pos.x && e.position.y === pos.y);
    if (entity) {
      glyph = entity.glyph;
      color = entity.fg;
    }

    if (!dungeon.visible[pos.y][pos.x]) {
      return `<span style="color:${color};opacity:0.45">${glyph}</span>`;
    }

    for (const [, fov] of Object.entries(state.overlays.monsterFOV)) {
      if (fov[pos.y]?.[pos.x]) {
        color = blend(color, "#ff5555", 0.35);
      }
    }

    if (state.overlays.aim?.active) {
      const { reticle, path } = state.overlays.aim;
      if (reticle.x === pos.x && reticle.y === pos.y) {
        glyph = state.overlays.aim.mode === "auto" ? "∀" : "*";
        color = "#ff0";
      } else if (path.some((p) => p.x === pos.x && p.y === pos.y)) {
        color = "#ffa500";
      }
    }

    return `<span style="color:${color}">${glyph}</span>`;
  }

  private renderLog(log: GameLogEntry[]): void {
    this.logEl.innerHTML = log
      .slice(-15)
      .map((entry) => `<div style="color:${entry.color ?? "#ccc"}">${entry.text}</div>`)
      .join("");
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }

  private renderQuickbar(state: GameState): void {
    const slots = Array.from({ length: 4 }, (_, idx) => {
      const itemId = state.player.quickbar[idx];
      const item = state.player.inventory.find((i) => i.id === itemId);
      if (!item) {
        return `<div>${idx + 1}: (empty)</div>`;
      }
      return `<div>${idx + 1}: ${item.name}</div>`;
    });
    this.quickbarEl.innerHTML = `<strong>Quickbar</strong>${slots.join("")}`;
  }
}

function blend(a: string, b: string, t: number): string {
  const ah = parseInt(a.replace("#", ""), 16);
  const bh = parseInt(b.replace("#", ""), 16);
  const ar = (ah >> 16) & 0xff;
  const ag = (ah >> 8) & 0xff;
  const ab = ah & 0xff;
  const br = (bh >> 16) & 0xff;
  const bg = (bh >> 8) & 0xff;
  const bb = bh & 0xff;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bch = Math.round(ab + (bb - ab) * t);
  return `#${((1 << 24) + (r << 16) + (g << 8) + bch).toString(16).slice(1)}`;
}
