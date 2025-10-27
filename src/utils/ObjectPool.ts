export class ObjectPool<T> {
  private available: T[] = [];
  private active: T[] = [];
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
      obj = this.available.pop()!;
    } else if (this.active.length < this.maxSize) {
      obj = this.factory();
    } else {
      obj = this.active.shift()!;
      this.reset(obj);
    }

    this.active.push(obj);
    return obj;
  }

  release(obj: T): void {
    const index = this.active.indexOf(obj);
    if (index !== -1) {
      this.active.splice(index, 1);
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
  }

  getStats(): { active: number; available: number; total: number } {
    return {
      active: this.active.length,
      available: this.available.length,
      total: this.active.length + this.available.length,
    };
  }
}

