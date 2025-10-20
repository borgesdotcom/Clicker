export class AutoFireSystem {
  private shipTimers: number[] = [];

  setShipCount(count: number): void {
    while (this.shipTimers.length < count) {
      this.shipTimers.push(0);
    }
    while (this.shipTimers.length > count) {
      this.shipTimers.pop();
    }
  }

  update(
    dt: number,
    autoFireUnlocked: boolean,
    cooldownMs: number,
    onFire: (shipIndex: number) => void,
  ): void {
    if (!autoFireUnlocked) return;

    const cooldownSec = cooldownMs / 1000;

    for (let i = 0; i < this.shipTimers.length; i++) {
      this.shipTimers[i]! += dt;

      if (this.shipTimers[i]! >= cooldownSec) {
        this.shipTimers[i]! = 0;
        onFire(i);
      }
    }
  }

  reset(): void {
    this.shipTimers = this.shipTimers.map(() => 0);
  }
}

