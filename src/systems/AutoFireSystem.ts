export class AutoFireSystem {
  private shipTimers: number[] = [];

  setShipCount(count: number): void {
    while (this.shipTimers.length < count) {
      // Add random initial delay to prevent synchronized firing
      // Use a reasonable delay that works for most cooldown times
      const randomDelay = Math.random() * 0.3; // 0-0.3 seconds random delay
      this.shipTimers.push(randomDelay);
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
    // Reset with random delays to prevent synchronized firing
    this.shipTimers = this.shipTimers.map(() => Math.random() * 0.5);
  }

  staggerExistingShips(): void {
    // Add random delays to all existing ships to prevent synchronized firing
    this.shipTimers = this.shipTimers.map(() => Math.random() * 0.5);
  }
}

