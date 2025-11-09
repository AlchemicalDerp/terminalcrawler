import type { GameState, Monster } from "../core/types";
import { addLog } from "../core/state";

export function playerAttack(state: GameState, monster: Monster): void {
  const weapon = state.player.equipped.weapon;
  const baseDamage = (weapon?.damage ?? 1) + (state.player.stats.STR - 5) / 2;
  const damage = Math.max(1, Math.floor(baseDamage) - monster.dr);
  monster.hp -= damage;
  addLog(state, { text: `You hit ${monster.name} for ${damage}!`, color: "#fff" });
  if (monster.hp <= 0) {
    state.entities.delete(monster.id);
    state.monsters.delete(monster.id);
    addLog(state, { text: `${monster.name} is defeated.`, color: "#0f0" });
  }
}

export function monsterAttack(state: GameState, monster: Monster): void {
  const dr = state.player.equipped.chest?.dr ?? 0;
  const damage = Math.max(1, monster.baseDamage - dr);
  state.player.hp.cur = Math.max(0, state.player.hp.cur - damage);
  addLog(state, { text: `${monster.name} hits you for ${damage}.`, color: "#f55" });
}
