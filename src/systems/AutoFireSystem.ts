export class AutoFireSystem {
  private shipTimers: number[] = [];

  setShipCount(count: number): void {
    while (this.shipTimers.length < count) {
      // Completely random initial delays to prevent any synchronization
      // Random delay between 0 and 2 seconds
      const randomDelay = Math.random() * 2.0;
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
    onFire: (shipIndex: number) => boolean,
  ): void {
    if (!autoFireUnlocked) return;

    const cooldownSec = cooldownMs / 1000;

    for (let i = 0; i < this.shipTimers.length; i++) {
      const timer = this.shipTimers[i];
      if (timer === undefined) continue;

      const newTimer = timer + dt;
      this.shipTimers[i] = newTimer;

      if (newTimer >= cooldownSec) {
        // Only reset timer if the shot was actually fired
        const didFire = onFire(i);
        if (didFire) {
          // Add random offset when resetting to keep shots desynchronized
          // Random offset between -80% and +80% of cooldown to prevent synchronization
          // This ensures lasers stay visually separate even after many cycles
          const randomOffset = (Math.random() - 0.5) * 1.6 * cooldownSec;
          this.shipTimers[i] = Math.max(0, randomOffset);
        }
        // If didn't fire (no target), keep timer at cooldown so it tries again next frame
        // This prevents all timers from syncing up when targets disappear
      }
    }
  }

  reset(): void {
    // Reset with completely random delays to prevent synchronized firing
    this.shipTimers = this.shipTimers.map(() => {
      return Math.random() * 2.0; // Random delay between 0 and 2 seconds
    });
  }

  staggerExistingShips(): void {
    // Add completely random delays to all existing ships to prevent synchronized firing
    this.shipTimers = this.shipTimers.map(() => {
      return Math.random() * 2.0; // Random delay between 0 and 2 seconds
    });
  }
}
