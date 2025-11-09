import type { GameState, Vec2 } from "./types";
import { dash, movePlayer, waitTurn, reveal, updateMonsterFOV } from "./actions";
import { openInventory } from "../ui/inventory";
import { enterAim, exitAim, moveReticle, cycleTarget, confirmAim } from "../ui/aim";
import { useQuickbar } from "./items";

const moveBindings: Record<string, Vec2> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 }
};

const aimBindings: Record<string, Vec2> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }
};

export function attachInput(state: GameState): void {
  window.addEventListener("keydown", (event) => {
    if (state.overlays.aim?.active) {
      handleAimInput(state, event);
      return;
    }
    if (event.key in moveBindings) {
      event.preventDefault();
      movePlayer(state, moveBindings[event.key]);
    } else if (event.key === " ") {
      event.preventDefault();
      waitTurn(state);
    } else if (event.key === ".") {
      event.preventDefault();
      waitTurn(state);
    } else if (event.key === "f") {
      event.preventDefault();
      enterAim(state, "manual");
    } else if (event.key === "F") {
      event.preventDefault();
      enterAim(state, "auto");
    } else if (event.key === "i" || event.key === "I") {
      event.preventDefault();
      openInventory(state);
    } else if (event.key === "Shift") {
      // hold shift for dash? we use 'g' maybe; for now use 'g'.
    } else if (event.key === "g") {
      event.preventDefault();
      dash(state, { x: 1, y: 0 });
    } else if (["1", "2", "3", "4"].includes(event.key)) {
      event.preventDefault();
      useQuickbar(state, Number(event.key) - 1);
    }
  });

  reveal(state);
  updateMonsterFOV(state);
}

function handleAimInput(state: GameState, event: KeyboardEvent): void {
  if (!state.overlays.aim) return;
  if (event.key in aimBindings) {
    event.preventDefault();
    moveReticle(state, aimBindings[event.key]);
  } else if (event.key === "Tab") {
    event.preventDefault();
    cycleTarget(state);
  } else if (event.key === "Enter") {
    event.preventDefault();
    confirmAim(state);
  } else if (event.key === "Escape") {
    event.preventDefault();
    exitAim(state);
  } else if (event.key === "f") {
    event.preventDefault();
    state.overlays.aim.mode = state.overlays.aim.mode === "manual" ? "auto" : "manual";
    if (state.overlays.aim.mode === "auto") {
      cycleTarget(state);
    }
  }
}
