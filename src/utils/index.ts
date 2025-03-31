import { MultiSet } from 'mnemonist';

/**
 * A wrapper around setTimeout with a method to get the time left.
 * 
 * Example usage:
 * 
 * ```typescript
 * const timer = new Timer(() => {
 *  console.log('Timer done!');
 * }, 1000);
 * timer.getTimeLeft();
 * ```
 */
export class Timer {
  // https://stackoverflow.com/questions/3144711/find-the-time-left-in-a-settimeout
  private id: ReturnType<typeof setTimeout> | null = null;
  private started: Date | null = null;
  private remaining: number;
  private running: boolean = false;
  private callback: (() => void) | null;

  constructor(callback: () => void, delay: number) {
    this.callback = callback;
    this.remaining = delay;
    this.start();
  }

  public start(): void {
    if (this.running || this.remaining <= 0 || !this.callback) return;
    this.running = true;
    this.started = new Date();
    this.id = setTimeout(this.callback, this.remaining);
  }

  public pause(): void {
    if (!this.running || !this.started) return;
    this.running = false;
    clearTimeout(this.id!);
    this.remaining -= new Date().getTime() - this.started.getTime();
  }

  public getTimeLeft(): number {
    if (this.running) {
      this.pause();
      this.start();
    }
    return this.remaining;
  }

  public isRunning(): boolean {
    return this.running;
  }
}

/**
 * In-place shuffle of an array.
 */
export function shuffle<T>(array: T[]): T[] {
  // https://stackoverflow.com/questions/48083353/i-want-to-know-how-to-shuffle-an-array-in-typescript
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
};

/**
 * Subtract two multisets. Assumes b is a subset of a.
 */
export function subtractMultiSet<T>(a: MultiSet<T>, b: MultiSet<T>): MultiSet<T> {
  const result = new MultiSet<T>();
  a.forEachMultiplicity((count, key) => {
    result.add(key, count - b.multiplicity(key));
  });
  return result;
}