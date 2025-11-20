export class ObjectPool<T> {
  private available: T[] = [];
  private active: T[] = [];
  private activeSet: Set<T> = new Set(); // Fast O(1) lookup for active objects
  private factory: () => T;
  private reset: (obj: T) => void;
  private maxSize: number;

  constructor(
    factory: () => T,
    reset: (obj: T) => void,
    initialSize: number = 10,
    maxSize: number = 1000,
  ) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;

    for (let i = 0; i < initialSize; i++) {
      this.available.push(this.factory());
    }
  }

  acquire(): T {
    let obj: T;

    if (this.available.length > 0) {
      const popped = this.available.pop();
      if (popped === undefined) {
        obj = this.factory();
      } else {
        obj = popped;
      }
    } else if (this.active.length < this.maxSize) {
      obj = this.factory();
    } else {
      // Reuse oldest object (FIFO)
      const shifted = this.active.shift();
      if (shifted === undefined) {
        obj = this.factory();
      } else {
        obj = shifted;
        this.activeSet.delete(obj);
        this.reset(obj);
      }
    }

    this.active.push(obj);
    this.activeSet.add(obj);
    return obj;
  }

  release(obj: T): void {
    // Use Set for O(1) lookup instead of O(n) indexOf
    if (!this.activeSet.has(obj)) {
      return;
    }

    // Find and remove from array using swap-and-pop (O(1))
    // Order doesn't matter for object pool
    const index = this.active.indexOf(obj);
    if (index !== -1) {
      // Swap with the last element if it's not already the last
      const lastIndex = this.active.length - 1;
      if (index !== lastIndex) {
        const lastObj = this.active[lastIndex];
        if (lastObj !== undefined) {
          this.active[index] = lastObj;
        }
      }
      // Remove the last element
      this.active.pop();

      this.activeSet.delete(obj);
      this.reset(obj);

      if (this.available.length < this.maxSize / 2) {
        this.available.push(obj);
      }
    }
  }

  releaseAll(objects: T[]): void {
    for (const obj of objects) {
      this.release(obj);
    }
  }

  getActive(): T[] {
    return this.active;
  }

  clear(): void {
    this.active = [];
    this.available = [];
    this.activeSet.clear();
  }

  getStats(): { active: number; available: number; total: number } {
    return {
      active: this.active.length,
      available: this.available.length,
      total: this.active.length + this.available.length,
    };
  }
}
