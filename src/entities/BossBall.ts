import type { Draw } from '../render/Draw';
import type { Vec2 } from '../types';

export class BossBall {
  private flashTime = 0;
  private flashDuration = 0.15;
  public currentHp: number;
  public maxHp: number;
  private breakAnimTime = 0;
  private breakAnimDuration = 1.2; // Longer for epic death
  public x: number;
  public y: number;
  private attackTimer = 0;
  private attackCooldown = 2;
  private phase = 1;
  private pulseTime = 0;
  private chargeTime = 0;
  private tentacleAngles: number[] = [];
  private tentacleLengths: number[] = [];
  private tentacleWaves: number[] = [];
  private eyeBlink = 0;
  private shieldPulse = 0;
  private entranceTime = 0;
  private phaseTransitionTime = 0;
  private innerOrgansRotation = 0;
  private particleEmitTimer = 0;

  constructor(
    x: number,
    y: number,
    public radius: number,
    hp: number,
  ) {
    this.x = x;
    this.y = y;
    this.maxHp = hp;
    this.currentHp = this.maxHp;
    this.entranceTime = 1; // Start with entrance animation

    // Initialize tentacles - more organized
    const tentacleCount = 8;
    for (let i = 0; i < tentacleCount; i++) {
      this.tentacleAngles.push((i / tentacleCount) * Math.PI * 2);
      this.tentacleLengths.push(this.radius * (1.3 + Math.random() * 0.2));
      this.tentacleWaves.push(Math.random() * Math.PI * 2);
    }
  }

  isPointInside(point: Vec2): boolean {
    const dx = point.x - this.x;
    const dy = point.y - this.y;
    return Math.sqrt(dx * dx + dy * dy) <= this.radius;
  }

  takeDamage(amount: number): boolean {
    const wasAlive = this.currentHp > 0;
    const oldPhase = this.phase;
    this.currentHp = Math.max(0, this.currentHp - amount);

    // Check for phase transition
    const hpPercent = this.currentHp / this.maxHp;
    if (hpPercent < 0.33) {
      this.phase = 3;
    } else if (hpPercent < 0.66) {
      this.phase = 2;
    }

    // Trigger phase transition animation
    if (oldPhase !== this.phase) {
      this.phaseTransitionTime = 1;
    }

    // Only flash on significant damage (>2% of max HP) or if not already flashing
    if (this.flashTime <= 0 || amount > this.maxHp * 0.02) {
      this.triggerFlash();
    }
    if (this.currentHp <= 0 && wasAlive) {
      this.breakAnimTime = this.breakAnimDuration;
      return true;
    }
    return false;
  }

  triggerFlash(): void {
    this.flashTime = this.flashDuration;
  }

  isBreaking(): boolean {
    return this.breakAnimTime > 0;
  }

  update(dt: number, _canvasWidth: number, _canvasHeight: number): void {
    if (this.flashTime > 0) {
      this.flashTime = Math.max(0, this.flashTime - dt);
    }
    if (this.breakAnimTime > 0) {
      this.breakAnimTime = Math.max(0, this.breakAnimTime - dt);
      return;
    }

    // Entrance animation
    if (this.entranceTime > 0) {
      this.entranceTime = Math.max(0, this.entranceTime - dt * 2);
    }

    // Phase transition animation
    if (this.phaseTransitionTime > 0) {
      this.phaseTransitionTime = Math.max(0, this.phaseTransitionTime - dt * 3);
    }

    // Update phase based on HP
    const hpPercent = this.currentHp / this.maxHp;
    if (hpPercent < 0.33) {
      this.phase = 3;
      this.attackCooldown = 0.8;
    } else if (hpPercent < 0.66) {
      this.phase = 2;
      this.attackCooldown = 1.2;
    }

    // Update attack timer
    this.attackTimer += dt;

    // Update visual effects - phase affects speed
    const phaseSpeedMultiplier = 1 + (this.phase - 1) * 0.3;
    this.pulseTime += dt * 2 * phaseSpeedMultiplier;
    this.shieldPulse += dt * 3 * phaseSpeedMultiplier;
    this.innerOrgansRotation += dt * 0.5 * phaseSpeedMultiplier;
    this.particleEmitTimer += dt;

    // Tentacle animation - more organic and fluid
    for (let i = 0; i < this.tentacleAngles.length; i++) {
      const currentAngle = this.tentacleAngles[i];
      const wave = this.tentacleWaves[i];
      if (currentAngle !== undefined && wave !== undefined) {
        // Rotate tentacles
        this.tentacleAngles[i] =
          currentAngle +
          dt * 0.4 * (i % 2 === 0 ? 1 : -1) * phaseSpeedMultiplier;
        // Update wave offset
        this.tentacleWaves[i] = wave + dt * 2 * phaseSpeedMultiplier;
      }
    }

    // Eye blink - more frequent when damaged
    this.eyeBlink = Math.max(0, this.eyeBlink - dt * 5);
    const blinkChance = this.phase === 3 ? 0.02 : 0.01;
    if (Math.random() < blinkChance) {
      this.eyeBlink = 1;
    }

    // Charge effect before attacking
    if (this.attackTimer >= this.attackCooldown - 0.5) {
      this.chargeTime += dt * 5;
    } else {
      this.chargeTime = 0;
    }
  }

  shouldAttack(): boolean {
    if (this.attackTimer >= this.attackCooldown) {
      this.attackTimer = 0;
      return true;
    }
    return false;
  }

  getPhase(): number {
    return this.phase;
  }

  getAttackPattern(): 'single' | 'spread' | 'spiral' {
    if (this.phase === 3) return 'spiral';
    if (this.phase === 2) return 'spread';
    return 'single';
  }

  draw(drawer: Draw): void {
    const ctx = drawer.getContext();
    const hpPercent = this.currentHp / this.maxHp;

    // Epic death animation
    if (this.breakAnimTime > 0) {
      const progress = 1 - this.breakAnimTime / this.breakAnimDuration;
      const alpha = 1 - progress;
      const scale = 1 + progress * 1.2;
      const rotation = progress * Math.PI * 4;

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(rotation);
      ctx.scale(scale, scale);

      // Explosion layers
      for (let layer = 0; layer < 3; layer++) {
        const layerProgress = Math.min(1, progress * 1.5 - layer * 0.3);
        if (layerProgress <= 0) continue;

        const layerAlpha = alpha * (1 - layer * 0.3) * layerProgress;
        const layerRadius = this.radius * (0.8 + layer * 0.3);
        const colors = ['#ff0000', '#ff6600', '#ffff00'];

        drawer.setAlpha(layerAlpha);
        drawer.setGlow(colors[layer] ?? '#ff0000', 30 + layer * 10);
        drawer.setFill(colors[layer] ?? '#ff0000');
        drawer.circle(0, 0, layerRadius);
        drawer.clearGlow();
      }

      drawer.resetAlpha();
      ctx.restore();
      return;
    }

    // Entrance animation scale
    const entranceScale =
      this.entranceTime > 0 ? 1 - this.entranceTime * 0.3 : 1;
    const currentRadius = this.radius * entranceScale;

    // Phase-based colors - Lordakia-inspired gel but more menacing
    let bodyColor = '#1a3a5a';
    let accentColor = '#00d4ff';
    let eyeColor = '#ff0066';
    let innerCoreColor = '#004488';

    if (this.phase === 3) {
      bodyColor = '#5a0000';
      accentColor = '#ff0044';
      eyeColor = '#ffff00';
      innerCoreColor = '#880000';
    } else if (this.phase === 2) {
      bodyColor = '#3a2a00';
      accentColor = '#ff8800';
      eyeColor = '#ff4400';
      innerCoreColor = '#664400';
    }

    // Phase transition flash
    const phaseFlash =
      this.phaseTransitionTime > 0
        ? Math.sin(this.phaseTransitionTime * Math.PI * 10) * 0.5 + 0.5
        : 0;

    // Extract RGB values for gradients
    const parseColor = (hex: string) => {
      const r = parseInt(hex.substring(1, 3), 16);
      const g = parseInt(hex.substring(3, 5), 16);
      const b = parseInt(hex.substring(5, 7), 16);
      return { r, g, b };
    };

    const bodyRgb = parseColor(bodyColor);
    const accentRgb = parseColor(accentColor);

    // Outer energy shield - multi-layered pulsing aura
    const shieldPulse = Math.sin(this.shieldPulse) * 0.5 + 0.5;
    const shieldLayers = 3;
    for (let layer = 0; layer < shieldLayers; layer++) {
      const layerRadius = currentRadius * (1.35 + layer * 0.15);
      const layerAlpha =
        0.15 - layer * 0.04 + shieldPulse * (0.1 - layer * 0.02);
      const layerGlow = ctx.createRadialGradient(
        this.x,
        this.y,
        0,
        this.x,
        this.y,
        layerRadius,
      );
      layerGlow.addColorStop(
        0,
        `rgba(${String(accentRgb.r)}, ${String(accentRgb.g)}, ${String(accentRgb.b)}, ${String(layerAlpha)})`,
      );
      layerGlow.addColorStop(
        0.5,
        `rgba(${String(accentRgb.r)}, ${String(accentRgb.g)}, ${String(accentRgb.b)}, ${String(layerAlpha * 0.5)})`,
      );
      layerGlow.addColorStop(
        1,
        `rgba(${String(accentRgb.r)}, ${String(accentRgb.g)}, ${String(accentRgb.b)}, 0)`,
      );

      ctx.fillStyle = layerGlow;
      ctx.beginPath();
      ctx.arc(this.x, this.y, layerRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw writhing tentacles - Lordakia-style gel tentacles
    ctx.save();
    for (let i = 0; i < this.tentacleAngles.length; i++) {
      const angle = this.tentacleAngles[i];
      const length = this.tentacleLengths[i];
      const wave = this.tentacleWaves[i];
      if (angle === undefined || length === undefined || wave === undefined)
        continue;

      const waveAmount = Math.sin(wave) * 12;
      const waveAmount2 = Math.sin(wave * 1.5) * 8;

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(angle);

      // Tentacle path with smooth curves
      const segments = 8;
      ctx.beginPath();
      ctx.moveTo(currentRadius * 0.85, 0);

      for (let seg = 1; seg <= segments; seg++) {
        const t = seg / segments;
        const segWave =
          Math.sin(wave + t * Math.PI * 2) * waveAmount * (1 - t * 0.5);
        const segWave2 =
          Math.sin(wave * 1.5 + t * Math.PI * 3) * waveAmount2 * (1 - t * 0.7);
        const x = currentRadius * 0.85 + (currentRadius * 0.15 + length * t);
        const y = segWave + segWave2;
        ctx.lineTo(x, y);
      }

      // Tentacle gradient - gel-like
      const tentacleGradient = ctx.createLinearGradient(
        currentRadius * 0.85,
        0,
        currentRadius * 0.85 + length,
        waveAmount,
      );
      const tentacleWidth =
        currentRadius * 0.12 * (1 - 0.5 * (Math.sin(wave) * 0.5 + 0.5));

      tentacleGradient.addColorStop(
        0,
        `rgba(${String(bodyRgb.r)}, ${String(bodyRgb.g)}, ${String(bodyRgb.b)}, 0.8)`,
      );
      tentacleGradient.addColorStop(
        0.5,
        `rgba(${String(accentRgb.r)}, ${String(accentRgb.g)}, ${String(accentRgb.b)}, 0.7)`,
      );
      tentacleGradient.addColorStop(
        1,
        `rgba(${String(accentRgb.r + 40)}, ${String(accentRgb.g + 40)}, ${String(accentRgb.b + 40)}, 0.6)`,
      );

      ctx.strokeStyle = tentacleGradient;
      ctx.lineWidth = tentacleWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowBlur = 8;
      ctx.shadowColor = `rgba(${String(accentRgb.r)}, ${String(accentRgb.g)}, ${String(accentRgb.b)}, 0.6)`;
      ctx.stroke();

      // Tentacle tip glow
      const tipX = currentRadius * 0.85 + length;
      const tipY =
        Math.sin(wave) * waveAmount + Math.sin(wave * 1.5) * waveAmount2;
      const tipGlow = ctx.createRadialGradient(
        tipX,
        tipY,
        0,
        tipX,
        tipY,
        tentacleWidth * 1.5,
      );
      tipGlow.addColorStop(
        0,
        `rgba(${String(accentRgb.r + 60)}, ${String(accentRgb.g + 60)}, ${String(accentRgb.b + 60)}, 0.9)`,
      );
      tipGlow.addColorStop(
        0.5,
        `rgba(${String(accentRgb.r + 30)}, ${String(accentRgb.g + 30)}, ${String(accentRgb.b + 30)}, 0.6)`,
      );
      tipGlow.addColorStop(
        1,
        `rgba(${String(accentRgb.r)}, ${String(accentRgb.g)}, ${String(accentRgb.b)}, 0)`,
      );

      ctx.fillStyle = tipGlow;
      ctx.beginPath();
      ctx.arc(tipX, tipY, tentacleWidth * 1.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.restore();
    }
    ctx.restore();

    // Main gel-like body - Lordakia inspired but more menacing
    const pulse = Math.sin(this.pulseTime) * 0.05 + 0.95;
    const bodyRadius = currentRadius * pulse;

    // Outer gel shell - translucent with depth
    const outerGradient = ctx.createRadialGradient(
      this.x - bodyRadius * 0.25,
      this.y - bodyRadius * 0.25,
      bodyRadius * 0.05,
      this.x,
      this.y,
      bodyRadius,
    );
    outerGradient.addColorStop(
      0,
      `rgba(${String(bodyRgb.r)}, ${String(bodyRgb.g)}, ${String(bodyRgb.b)}, 0.5)`,
    );
    outerGradient.addColorStop(
      0.3,
      `rgba(${String(bodyRgb.r)}, ${String(bodyRgb.g)}, ${String(bodyRgb.b)}, 0.7)`,
    );
    outerGradient.addColorStop(
      0.6,
      `rgba(${String(bodyRgb.r)}, ${String(bodyRgb.g)}, ${String(bodyRgb.b)}, 0.75)`,
    );
    outerGradient.addColorStop(
      0.85,
      `rgba(${String(bodyRgb.r - 20)}, ${String(bodyRgb.g - 20)}, ${String(bodyRgb.b - 20)}, 0.8)`,
    );
    outerGradient.addColorStop(
      1,
      `rgba(${String(bodyRgb.r - 30)}, ${String(bodyRgb.g - 30)}, ${String(bodyRgb.b - 30)}, 0.7)`,
    );

    ctx.fillStyle = outerGradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, bodyRadius, 0, Math.PI * 2);
    ctx.fill();

    // Inner core - visible through gel (pulsing)
    const corePulse = Math.sin(this.pulseTime * 1.5) * 0.1 + 0.9;
    const coreRadius = bodyRadius * 0.4 * corePulse;
    const innerRgb = parseColor(innerCoreColor);

    const innerGradient = ctx.createRadialGradient(
      this.x - coreRadius * 0.3,
      this.y - coreRadius * 0.3,
      coreRadius * 0.1,
      this.x,
      this.y,
      coreRadius,
    );
    innerGradient.addColorStop(0, `rgba(255, 255, 255, 0.8)`);
    innerGradient.addColorStop(
      0.3,
      `rgba(${String(accentRgb.r + 40)}, ${String(accentRgb.g + 40)}, ${String(accentRgb.b + 40)}, 0.6)`,
    );
    innerGradient.addColorStop(
      0.6,
      `rgba(${String(innerRgb.r)}, ${String(innerRgb.g)}, ${String(innerRgb.b)}, 0.5)`,
    );
    innerGradient.addColorStop(
      1,
      `rgba(${String(innerRgb.r)}, ${String(innerRgb.b)}, ${String(innerRgb.b)}, 0.3)`,
    );

    ctx.fillStyle = innerGradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, coreRadius, 0, Math.PI * 2);
    ctx.fill();

    // Rotating organic structures inside - visible through gel
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.innerOrgansRotation);

    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const orgRadius =
        bodyRadius * (0.5 + Math.sin(this.pulseTime * 2 + i) * 0.1);
      const orgX = Math.cos(angle) * orgRadius;
      const orgY = Math.sin(angle) * orgRadius;
      const orgSize =
        bodyRadius * (0.1 + Math.sin(this.pulseTime * 3 + i) * 0.03);
      const orgAlpha = 0.3 + Math.sin(this.pulseTime * 2.5 + i) * 0.2;

      const orgGradient = ctx.createRadialGradient(
        orgX,
        orgY,
        0,
        orgX,
        orgY,
        orgSize,
      );
      orgGradient.addColorStop(
        0,
        `rgba(${String(accentRgb.r + 30)}, ${String(accentRgb.g + 30)}, ${String(accentRgb.b + 30)}, ${String(orgAlpha)})`,
      );
      orgGradient.addColorStop(
        0.5,
        `rgba(${String(accentRgb.r)}, ${String(accentRgb.g)}, ${String(accentRgb.b)}, ${String(orgAlpha * 0.6)})`,
      );
      orgGradient.addColorStop(
        1,
        `rgba(${String(accentRgb.r)}, ${String(accentRgb.g)}, ${String(accentRgb.b)}, 0)`,
      );

      ctx.fillStyle = orgGradient;
      ctx.beginPath();
      ctx.arc(orgX, orgY, orgSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Defensive spikes/armor plates - phase affects intensity
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.pulseTime * 0.3);

    const spikeCount = 12;
    const spikeIntensity = 0.15 + (this.phase - 1) * 0.1;

    for (let i = 0; i < spikeCount; i++) {
      const angle = (i / spikeCount) * Math.PI * 2;
      const spikeLength = bodyRadius * spikeIntensity;
      const spikePulse = Math.sin(this.pulseTime * 2 + i) * 0.3 + 0.7;

      const x1 = Math.cos(angle) * bodyRadius;
      const y1 = Math.sin(angle) * bodyRadius;
      const x2 = Math.cos(angle) * (bodyRadius + spikeLength * spikePulse);
      const y2 = Math.sin(angle) * (bodyRadius + spikeLength * spikePulse);
      const x3 = Math.cos(angle + 0.15) * bodyRadius;
      const y3 = Math.sin(angle + 0.15) * bodyRadius;

      // Spike gradient
      const spikeGradient = ctx.createLinearGradient(x1, y1, x2, y2);
      spikeGradient.addColorStop(
        0,
        `rgba(${String(bodyRgb.r)}, ${String(bodyRgb.g)}, ${String(bodyRgb.b)}, 0.9)`,
      );
      spikeGradient.addColorStop(
        0.5,
        `rgba(${String(accentRgb.r)}, ${String(accentRgb.g)}, ${String(accentRgb.b)}, 0.8)`,
      );
      spikeGradient.addColorStop(
        1,
        `rgba(${String(accentRgb.r + 40)}, ${String(accentRgb.g + 40)}, ${String(accentRgb.b + 40)}, 0.9)`,
      );

      ctx.fillStyle = spikeGradient;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.closePath();
      ctx.fill();

      // Spike glow
      ctx.strokeStyle = `rgba(${String(accentRgb.r)}, ${String(accentRgb.g)}, ${String(accentRgb.b)}, 0.6)`;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 4;
      ctx.shadowColor = `rgba(${String(accentRgb.r)}, ${String(accentRgb.g)}, ${String(accentRgb.b)}, 0.5)`;
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.restore();

    // Multiple glowing eyes - menacing and tracking
    const eyePositions = [
      { x: -0.35, y: -0.25 },
      { x: 0.35, y: -0.25 },
      { x: 0, y: -0.45 },
    ];

    const eyeRgb = parseColor(eyeColor);

    for (const pos of eyePositions) {
      const eyeX = this.x + pos.x * bodyRadius;
      const eyeY = this.y + pos.y * bodyRadius;
      const eyeSize = bodyRadius * 0.16;
      const eyePulse = Math.sin(this.pulseTime * 3) * 0.1 + 0.9;

      // Eye socket glow
      const socketGlow = ctx.createRadialGradient(
        eyeX,
        eyeY,
        0,
        eyeX,
        eyeY,
        eyeSize * 1.5,
      );
      socketGlow.addColorStop(0, `rgba(0, 0, 0, 0.8)`);
      socketGlow.addColorStop(0.5, `rgba(0, 0, 0, 0.6)`);
      socketGlow.addColorStop(1, `rgba(0, 0, 0, 0)`);
      ctx.fillStyle = socketGlow;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, eyeSize * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Eye socket
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, eyeSize, 0, Math.PI * 2);
      ctx.fill();

      // Iris with glow
      const irisSize =
        this.eyeBlink > 0
          ? eyeSize * (1 - this.eyeBlink) * 0.65
          : eyeSize * 0.65 * eyePulse;
      const irisGlow = ctx.createRadialGradient(
        eyeX,
        eyeY,
        0,
        eyeX,
        eyeY,
        irisSize * 2,
      );
      irisGlow.addColorStop(
        0,
        `rgba(${String(eyeRgb.r)}, ${String(eyeRgb.g)}, ${String(eyeRgb.b)}, 0.9)`,
      );
      irisGlow.addColorStop(
        0.3,
        `rgba(${String(eyeRgb.r)}, ${String(eyeRgb.g)}, ${String(eyeRgb.b)}, 0.7)`,
      );
      irisGlow.addColorStop(
        1,
        `rgba(${String(eyeRgb.r)}, ${String(eyeRgb.g)}, ${String(eyeRgb.b)}, 0)`,
      );

      ctx.fillStyle = irisGlow;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, irisSize * 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(${String(eyeRgb.r)}, ${String(eyeRgb.g)}, ${String(eyeRgb.b)}, 0.95)`;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, irisSize, 0, Math.PI * 2);
      ctx.fill();

      // Pupil
      ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, irisSize * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Menacing maw/mouth - opens more in later phases
    const mouthY = this.y + bodyRadius * 0.4;
    const mouthWidth = bodyRadius * 0.65;
    const mouthOpen =
      (this.phase * 0.2 + Math.sin(this.pulseTime) * 0.05) * pulse;
    const mouthHeight = bodyRadius * mouthOpen;

    ctx.save();
    ctx.translate(this.x, mouthY);

    // Mouth glow
    const mouthGlow = ctx.createRadialGradient(
      0,
      0,
      0,
      0,
      0,
      Math.max(mouthWidth, mouthHeight),
    );
    mouthGlow.addColorStop(
      0,
      `rgba(${String(eyeRgb.r)}, ${String(eyeRgb.g)}, ${String(eyeRgb.b)}, 0.6)`,
    );
    mouthGlow.addColorStop(
      0.5,
      `rgba(${String(eyeRgb.r)}, ${String(eyeRgb.g)}, ${String(eyeRgb.b)}, 0.3)`,
    );
    mouthGlow.addColorStop(
      1,
      `rgba(${String(eyeRgb.r)}, ${String(eyeRgb.g)}, ${String(eyeRgb.b)}, 0)`,
    );

    ctx.fillStyle = mouthGlow;
    ctx.beginPath();
    ctx.ellipse(0, 0, mouthWidth * 1.2, mouthHeight * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mouth opening
    ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
    ctx.strokeStyle = `rgba(${String(eyeRgb.r)}, ${String(eyeRgb.g)}, ${String(eyeRgb.b)}, 0.8)`;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 6;
    ctx.shadowColor = `rgba(${String(eyeRgb.r)}, ${String(eyeRgb.g)}, ${String(eyeRgb.b)}, 0.6)`;

    ctx.beginPath();
    ctx.ellipse(0, 0, mouthWidth, mouthHeight, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.restore();

    // Phase transition flash effect
    if (phaseFlash > 0) {
      drawer.setAlpha(phaseFlash * 0.4);
      drawer.setGlow(accentColor, 40);
      drawer.setStroke(accentColor, 6);
      drawer.circle(this.x, this.y, bodyRadius * 1.3, false);
      drawer.clearGlow();
      drawer.resetAlpha();
    }

    // Charge attack effect - more intense
    if (this.chargeTime > 0) {
      const chargeAlpha = Math.min(this.chargeTime, 1) * 0.6;
      const chargePulse = Math.sin(this.chargeTime * Math.PI * 10) * 0.2 + 0.8;

      drawer.setAlpha(chargeAlpha);
      drawer.setGlow(accentColor, 40);
      drawer.setStroke(accentColor, 5);

      for (let ring = 0; ring < 3; ring++) {
        const ringRadius =
          bodyRadius * (1.1 + ring * 0.2 + this.chargeTime * 0.3 * chargePulse);
        drawer.circle(this.x, this.y, ringRadius, false);
      }

      drawer.clearGlow();
      drawer.resetAlpha();
    }

    // Enhanced HP bar with phase indicator
    const hpBarWidth = bodyRadius * 2.8;
    const hpBarHeight = 14;
    const hpBarY = this.y - bodyRadius - 55;

    // HP bar background with glow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 8;
    ctx.shadowColor = `rgba(${String(accentRgb.r)}, ${String(accentRgb.g)}, ${String(accentRgb.b)}, 0.6)`;
    ctx.fillRect(this.x - hpBarWidth / 2, hpBarY, hpBarWidth, hpBarHeight);
    ctx.strokeRect(this.x - hpBarWidth / 2, hpBarY, hpBarWidth, hpBarHeight);

    // HP fill with gradient
    const hpFillWidth = (hpBarWidth - 4) * hpPercent;
    if (hpFillWidth > 0) {
      const hpGradient = ctx.createLinearGradient(
        this.x - hpBarWidth / 2 + 2,
        hpBarY + 2,
        this.x - hpBarWidth / 2 + 2 + hpFillWidth,
        hpBarY + 2,
      );
      hpGradient.addColorStop(0, accentColor);
      hpGradient.addColorStop(
        0.5,
        `rgba(${String(accentRgb.r + 40)}, ${String(accentRgb.g + 40)}, ${String(accentRgb.b + 40)}, 1)`,
      );
      hpGradient.addColorStop(1, accentColor);

      ctx.fillStyle = hpGradient;
      ctx.fillRect(
        this.x - hpBarWidth / 2 + 2,
        hpBarY + 2,
        hpFillWidth,
        hpBarHeight - 4,
      );
    }

    // Phase indicator text
    ctx.shadowBlur = 0;
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`PHASE ${String(this.phase)}`, this.x, hpBarY - 8);

    ctx.shadowBlur = 0;

    // Flash effect on hit - enhanced
    if (this.flashTime > 0) {
      const flashAlpha = this.flashTime / this.flashDuration;
      const flashPulse = Math.sin(flashAlpha * Math.PI * 20) * 0.3 + 0.7;

      drawer.setAlpha(flashAlpha * 0.7 * flashPulse);
      drawer.setGlow('#ffffff', 40);
      drawer.setStroke('#ffffff', 10);
      drawer.circle(this.x, this.y, bodyRadius * 1.25, false);

      // Impact shockwaves
      for (let i = 0; i < 4; i++) {
        const waveRadius =
          bodyRadius * (1.25 + i * 0.25 + (1 - flashAlpha) * 0.6);
        const waveAlpha = flashAlpha * (0.5 - i * 0.1);
        drawer.setAlpha(waveAlpha);
        drawer.circle(this.x, this.y, waveRadius, false);
      }

      drawer.clearGlow();
      drawer.resetAlpha();
    }
  }

  getPosition(): Vec2 {
    return { x: this.x, y: this.y };
  }
}
