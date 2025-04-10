import { MultiSet } from 'mnemonist';

export class UniqueRecord<K extends string | number | symbol, V> {
  private _record: Record<K, V>;
  private values: Set<V>;

  constructor() {
    this._record = {} as Record<K, V>;
    this.values = new Set<V>();
  }

  public set(key: K, value: V): boolean {
    if (this.values.has(value)) {
      return false;
    }
    this._record[key] = value;
    this.values.add(value);
    return true;
  }

  public remove(key: K): boolean {
    const value = this._record[key];
    if (value === undefined) {
      return false;
    }
    delete this._record[key];
    this.values.delete(value);
    return true;
  }

  public has(value: V): boolean {
    return this.values.has(value);
  }

  public filter(predicate: (key: K) => boolean): UniqueRecord<K, V> {
    const result = new UniqueRecord<K, V>();
    for (const key of Object.keys(this._record) as K[]) {
      if (predicate(key)) {
        result.set(key, this._record[key]);
      }
    }
    return result;
  }


  get record(): Record<K, V> {
    return this._record;
  }
}

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
 * Subtract two multisets. Please check b is a subset of a.
 */
export function subtractMultiSet<T>(a: MultiSet<T>, b: MultiSet<T>): MultiSet<T> {
  const result = new MultiSet<T>();
  a.forEachMultiplicity((count, key) => {
    result.add(key, Math.max(count - b.multiplicity(key), 0));
  });
  return result;
}