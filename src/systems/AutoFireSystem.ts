export class AutoFireSystem {
  private shipTimers: number[] = [];

  setShipCount(count: number): void {
    while (this.shipTimers.length < count) {
      // Spread ships evenly across time to prevent synchronized firing
      const shipIndex = this.shipTimers.length;
      
      // Distribute each ship with a unique offset across a 2-second period
      // Using (shipIndex * phi) mod 1 creates a well-distributed sequence
      const phi = 1.618033988749895; // Golden ratio for better distribution
      const normalizedOffset = (shipIndex * phi) % 1;
      const spreadPeriod = 2.0; // Spread across 2 seconds
      const baseDelay = normalizedOffset * spreadPeriod;
      
      // Add small random jitter to prevent any edge cases
      const jitter = (Math.random() - 0.5) * 0.1; // ±0.05s variation
      const delay = Math.max(0, Math.min(spreadPeriod, baseDelay + jitter));
      
      this.shipTimers.push(delay);
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
      const timer = this.shipTimers[i];
      if (timer === undefined) continue;
      
      const newTimer = timer + dt;
      this.shipTimers[i] = newTimer;

      if (newTimer >= cooldownSec) {
        this.shipTimers[i] = 0;
        onFire(i);
      }
    }
  }

  reset(): void {
    // Reset with distributed delays to prevent synchronized firing
    const phi = 1.618033988749895;
    this.shipTimers = this.shipTimers.map((_, index) => {
      const normalizedOffset = (index * phi) % 1;
      const baseDelay = normalizedOffset * 2.0;
      const jitter = (Math.random() - 0.5) * 0.1;
      return Math.max(0, Math.min(2.0, baseDelay + jitter));
    });
  }

  staggerExistingShips(): void {
    // Add distributed delays to all existing ships to prevent synchronized firing
    const phi = 1.618033988749895;
    this.shipTimers = this.shipTimers.map((_, index) => {
      const normalizedOffset = (index * phi) % 1;
      const baseDelay = normalizedOffset * 2.0;
      const jitter = (Math.random() - 0.5) * 0.1;
      return Math.max(0, Math.min(2.0, baseDelay + jitter));
    });
  }
}

