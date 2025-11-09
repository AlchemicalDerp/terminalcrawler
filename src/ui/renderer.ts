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
    container.style.gridTemplateColumns = "240px 1fr 280px";
    container.style.flex = "1";
    container.style.gap = "12px";
    container.style.padding = "12px";

    this.leftPanel = document.createElement("div");
    this.leftPanel.style.padding = "8px";
    this.leftPanel.style.background = "#141824";
    this.leftPanel.style.border = "1px solid #1f2535";
    this.leftPanel.style.borderRadius = "8px";
    container.appendChild(this.leftPanel);

    this.mapEl = document.createElement("pre");
    this.mapEl.style.margin = "0";
    this.mapEl.style.padding = "16px";
    this.mapEl.style.fontSize = "16px";
    this.mapEl.style.lineHeight = "16px";
    this.mapEl.style.overflow = "auto";
    this.mapEl.style.background = "#0d1018";
    this.mapEl.style.border = "1px solid #1f2535";
    this.mapEl.style.borderRadius = "8px";
    container.appendChild(this.mapEl);

    const rightWrapper = document.createElement("div");
    rightWrapper.style.display = "flex";
    rightWrapper.style.flexDirection = "column";
    rightWrapper.style.background = "#141824";
    rightWrapper.style.padding = "8px";
    rightWrapper.style.border = "1px solid #1f2535";
    rightWrapper.style.borderRadius = "8px";

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
    const ap = state.playerTurn.ap;
    const mana = p.mana ? makeBar("Mana", p.mana.cur, p.mana.max, "#8b7bff") : "";
    const statusLines = [
      `<div style="color:#9fb3ff; font-weight:600; margin-bottom:8px;">Status</div>`,
      makeBar("HP", p.hp.cur, p.hp.max, "#ff5d73"),
      makeBar("AP", ap, p.apBase, "#54b9ff"),
      makeBar("Stamina", p.stamina.cur, p.stamina.max, "#58d68d"),
      mana,
      `<div style="margin-top:8px; font-size:13px; color:#c4cad9;">Class: ${p.cls}<br/>Floor: ${state.floor}</div>`
    ]
      .filter(Boolean)
      .join("");
    const statsLine = `<div style="margin-top:12px; font-size:12px; color:#8a92a6;">STR ${p.stats.STR} • DEX ${p.stats.DEX} • INT ${p.stats.INT}<br/>VIT ${p.stats.VIT} • WIS ${p.stats.WIS} • LCK ${p.stats.LCK}</div>`;
    this.leftPanel.innerHTML = statusLines + statsLine;
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
    const entries = log
      .slice(-15)
      .map((entry) => `<div style="color:${entry.color ?? "#ccc"}; padding:2px 0;">${entry.text}</div>`)
      .join("");
    this.logEl.innerHTML = `<div style="color:#9fb3ff; font-weight:600; margin-bottom:4px;">Log</div>${entries}`;
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }

  private renderQuickbar(state: GameState): void {
    const slots = Array.from({ length: 4 }, (_, idx) => {
      const itemId = state.player.quickbar[idx];
      const item = state.player.inventory.find((i) => i.id === itemId);
      const label = item ? item.name : "(empty)";
      return `<div style="display:flex; align-items:center; gap:6px; margin-bottom:4px; font-size:13px; color:#c4cad9;"><span style="display:inline-flex; width:18px; height:18px; align-items:center; justify-content:center; background:#1f2535; border-radius:4px; color:#9fb3ff; font-size:12px;">${idx + 1}</span>${label}</div>`;
    }).join("");
    this.quickbarEl.innerHTML = `<div style="color:#9fb3ff; font-weight:600; margin-bottom:6px;">Quickbar</div>${slots}`;
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

function makeBar(label: string, cur: number, max: number, color: string): string {
  const pct = max > 0 ? Math.max(0, Math.min(100, Math.round((cur / max) * 100))) : 0;
  return `<div style="margin-bottom:6px;">
    <div style="font-size:12px; color:#c4cad9; margin-bottom:2px; display:flex; justify-content:space-between;">
      <span>${label}</span><span>${cur}/${max}</span>
    </div>
    <div style="height:10px; background:#1f2535; border-radius:4px; overflow:hidden;">
      <div style="width:${pct}%; height:100%; background:${color};"></div>
    </div>
  </div>`;
}
