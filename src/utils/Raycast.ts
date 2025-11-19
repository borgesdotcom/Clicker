import { ALIEN_SPRITE_NORMAL, PixelGrid } from '../render/AlienSprites';
import type { Vec2 } from '../types';

/**
 * Ray casts against a pixel grid to find the first solid pixel.
 * 
 * @param origin - The starting point of the ray (world space)
 * @param center - The center of the sprite (world space)
 * @param radius - The visual radius of the sprite
 * @param sprite - The pixel grid (defaults to normal if not provided)
 * @returns The point where the ray hits the sprite surface
 */
export function getPixelHitPoint(
  origin: Vec2,
  center: Vec2,
  radius: number,
  sprite: PixelGrid = ALIEN_SPRITE_NORMAL
): Vec2 {
  const dx = center.x - origin.x;
  const dy = center.y - origin.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist === 0) return center;

  // Normalize direction
  const nx = dx / dist;
  const ny = dy / dist;

  // Grid dimensions
  const rows = sprite.length;
  if (rows === 0) return center;
  const firstRow = sprite[0];
  if (!firstRow) return center;
  const cols = firstRow.length;
  if (cols === 0) return center;

  // The sprite is drawn centered.
  // We need to map world coordinates to grid coordinates.
  // The sprite covers a box of width = radius*2, height = radius*2 (roughly, assuming square scaling)
  // Let's assume the sprite is drawn in a square box of size 2*radius.
  
  // We march from the outside towards the center.
  // Start at radius distance (edge of bounding box)
  const startDist = radius;
  
  // Step size for marching (smaller is more precise)
  // Grid is usually 11x11.
  // 2*radius corresponds to 11 pixels.
  // 1 pixel is approx 2*radius/11.
  // Let's step by 1/2 pixel size for good precision.
  const stepSize = (radius * 2) / Math.max(rows, cols) / 2;
  
  // March from the edge inwards
  for (let d = startDist; d >= 0; d -= stepSize) {
    // Point in world space relative to center
    // Note: ray comes from origin towards center.
    // So we are looking at points P = center - direction * d
    const px = -nx * d;
    const py = -ny * d;

    // Map to grid coordinates
    // Grid coords: [0..cols-1], [0..rows-1]
    // Center of grid is roughly (cols-1)/2, (rows-1)/2
    // x mapped from [-radius, radius] to [0, cols]
    // y mapped from [-radius, radius] to [0, rows]
    
    const u = (px + radius) / (radius * 2);
    const v = (py + radius) / (radius * 2);

    const col = Math.floor(u * cols);
    const row = Math.floor(v * rows);

    if (col >= 0 && col < cols && row >= 0 && row < rows) {
      const spriteRow = sprite[row];
      if (!spriteRow) continue;
      const pixel = spriteRow[col];
      if (pixel !== 0) {
        // Hit a solid pixel!
        // Return world position
        return {
          x: center.x + px,
          y: center.y + py
        };
      }
    }
  }

  // Fallback if no pixel hit (e.g. laser went through a gap or diagonal miss)
  // Return a point on the visual radius (85% rule as fallback)
  return {
    x: center.x - nx * (radius * 0.85),
    y: center.y - ny * (radius * 0.85)
  };
}

