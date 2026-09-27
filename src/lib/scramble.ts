
import { useCallback, useEffect, useRef } from "react";

// "Hacker scramble" text effect shared by the navbar MENU button and the page
// transition. Random printable ASCII (33-126) flickers in place of letters
// until each one locks into its real character.
// - "sequential": left to right, each letter flickers `cycles` times before
//   locking (the original MENU <-> CLOSE behaviour).
// - "converge": every letter scrambles from the first frame, and letters lock
//   in pairs from both ends toward the centre. Lock-ins are spread over
//   `duration`, so long and short words take the same total time.
// Returns a cancel function; onUpdate receives the full string each tick.

export type ScrambleMode = "sequential" | "converge";

export interface ScrambleOptions {
  to: string;
  mode: ScrambleMode;
  onUpdate: (text: string) => void;
  onComplete?: () => void;
  /** Starting text (sequential mode pads between old and new lengths). */
  from?: string;
  /** Flicker rate in ms. */
  tick?: number;
  /** Sequential: random frames per letter before it locks. */
  cycles?: number;
  /** Converge: total time until the last letter locks, in ms. */
  duration?: number;
}

export const randomChar = () =>
  String.fromCharCode(Math.floor(Math.random() * (126 - 33 + 1)) + 33);

const replaceAt = (text: string, index: number, char: string) =>
  `${text.slice(0, index)}${char}${text.slice(index + 1)}`;

const sequential = (
  { from = "", to, onUpdate, onComplete, tick = 50, cycles = 3 }: ScrambleOptions,
  timeouts: number[],
) => {
  const maxLength = Math.max(from.length, to.length);
  let text = from.padEnd(maxLength, " ");
  onUpdate(text);

  const changeLetter = (index: number) => {
    if (index >= maxLength) {
      onUpdate(to);
      onComplete?.();
      return;
    }

    const targetChar = to.charAt(index) || " ";

    const animateCycle = (currentCycle: number) => {
      if (currentCycle >= cycles) {
        text = replaceAt(text, index, targetChar);
        onUpdate(text);
        changeLetter(index + 1);
        return;
      }

      text = replaceAt(text, index, randomChar());
      onUpdate(text);
      timeouts.push(window.setTimeout(() => animateCycle(currentCycle + 1), tick));
    };

    animateCycle(0);
  };

  changeLetter(0);
};

const converge = (
  { to, onUpdate, onComplete, tick = 50, duration = 800 }: ScrambleOptions,
  intervals: number[],
) => {
  const chars = to.split("");
  const locked = chars.map((c) => c === " ");

  // Lock order: [first, last], [second, second-last], ... middle alone.
  // Spaces count as already locked, so they never take up a step.
  const steps: number[][] = [];
  for (let i = 0, j = chars.length - 1; i <= j; i++, j--) {
    const step = (i === j ? [i] : [i, j]).filter((k) => !locked[k]);
    if (step.length) steps.push(step);
  }

  const render = () =>
    chars.map((c, i) => (locked[i] ? c : randomChar())).join("");

  if (!steps.length) {
    onUpdate(to);
    onComplete?.();
    return;
  }

  const stepMs = duration / steps.length;
  const start = performance.now();
  let done = 0;
  onUpdate(render());

  const id = window.setInterval(() => {
    const due = Math.min(steps.length, Math.floor((performance.now() - start) / stepMs));
    for (; done < due; done++) steps[done].forEach((k) => (locked[k] = true));
    if (done >= steps.length) {
      window.clearInterval(id);
      onUpdate(to);
      onComplete?.();
      return;
    }
    onUpdate(render());
  }, tick);
  intervals.push(id);
};

export const scramble = (options: ScrambleOptions) => {
  const timers: number[] = [];
  if (options.mode === "sequential") sequential(options, timers);
  else converge(options, timers);
  return () => {
    // Timeout and interval ids share one pool, so clearing both is safe.
    timers.forEach((id) => {
      window.clearTimeout(id);
      window.clearInterval(id);
    });
    timers.length = 0;
  };
};

/** One scramble at a time per component; starting a new one cancels the last. */
export const useScrambleText = () => {
  const cancelRef = useRef<() => void>(() => {});

  useEffect(() => () => cancelRef.current(), []);

  return useCallback((options: ScrambleOptions) => {
    cancelRef.current();
    cancelRef.current = scramble(options);
  }, []);
};
