import type { Draw } from '../render/Draw';

export class ComboSystem {
  private combo = 0;
  private comboTimer = 0;
  private comboTimeout = 3; // Seconds before combo resets
  private maxCombo = 0;
  private comboAnimationTime = 0;

  hit(): void {
    this.combo++;
    this.comboTimer = this.comboTimeout;
    this.comboAnimationTime = 0.3;
    
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }
  }

  miss(): void {
    this.combo = 0;
    this.comboTimer = 0;
  }

  update(dt: number): void {
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 0;
      }
    }
    
    if (this.comboAnimationTime > 0) {
      this.comboAnimationTime -= dt;
    }
  }

  getCombo(): number {
    return this.combo;
  }

  getMaxCombo(): number {
    return this.maxCombo;
  }

  getMultiplier(): number {
    if (this.combo < 10) return 1;
    if (this.combo < 25) return 1.1;
    if (this.combo < 50) return 1.25;
    if (this.combo < 100) return 1.5;
    return 2.0;
  }

  draw(drawer: Draw, canvasWidth: number): void {
    if (this.combo < 5) return; // Don't show combo until at least 5

    const ctx = drawer.getContext();
    const x = canvasWidth - 150;
    const y = 100;

    ctx.save();
    
    // Pulse effect on new hit
    const scale = this.comboAnimationTime > 0 
      ? 1 + (this.comboAnimationTime / 0.3) * 0.3 
      : 1;
    
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.translate(-x, -y);
    
    // Combo background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x - 70, y - 35, 140, 70);
    ctx.strokeStyle = this.getComboColor();
    ctx.lineWidth = 3;
    ctx.strokeRect(x - 70, y - 35, 140, 70);
    
    // Combo number
    ctx.font = 'bold 32px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Glow
    ctx.shadowColor = this.getComboColor();
    ctx.shadowBlur = 15;
    
    // Text
    ctx.fillStyle = this.getComboColor();
    ctx.fillText(`${this.combo}x`, x, y - 5);
    
    // "COMBO!" text
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.shadowBlur = 5;
    ctx.fillText('COMBO!', x, y + 20);
    
    // Multiplier indicator
    const mult = this.getMultiplier();
    if (mult > 1) {
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.fillStyle = '#ffaa00';
      ctx.fillText(`${mult.toFixed(1)}x DMG`, x, y - 25);
    }
    
    // Timeout bar
    const timeoutPercent = this.comboTimer / this.comboTimeout;
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x - 65, y + 30, 130, 4);
    ctx.fillStyle = this.getComboColor();
    ctx.fillRect(x - 65, y + 30, 130 * timeoutPercent, 4);
    
    ctx.restore();
  }

  private getComboColor(): string {
    if (this.combo >= 100) return '#ff00ff'; // Magenta
    if (this.combo >= 50) return '#ff0000';  // Red
    if (this.combo >= 25) return '#ffaa00';  // Orange
    if (this.combo >= 10) return '#ffff00';  // Yellow
    return '#ffffff'; // White
  }

  reset(): void {
    this.combo = 0;
    this.comboTimer = 0;
    this.comboAnimationTime = 0;
  }
}

