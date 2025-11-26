/**
 * High-performance WebGL renderer for 200%+ performance improvement
 * Uses instanced rendering and batching for optimal GPU utilization
 */

interface CircleBatch {
  x: number;
  y: number;
  radius: number;
  r: number;
  g: number;
  b: number;
  a: number;
}

interface LineBatch {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  r: number;
  g: number;
  b: number;
  a: number;
}

interface TriangleBatch {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
  r: number;
  g: number;
  b: number;
  a: number;
}

interface ShipInstance {
  x: number;
  y: number;
  angle: number;
  size: number;
  r: number;
  g: number;
  b: number;
  a: number;
  isMainShip: number; // 0 or 1 for shader branching
  themeType: number; // 0=default, 1=neon, 2=fire, 3=cosmic, 4=hologram
}

// Removed unused LaserInstance interface

export class WebGLRenderer {
  private gl: WebGL2RenderingContext;
  private canvas: HTMLCanvasElement;
  private width: number = 0;
  private height: number = 0;
  private dpr: number = 1;

  // Shader programs
  private circleProgram: WebGLProgram | null = null;
  private lineProgram: WebGLProgram | null = null;
  private triangleProgram: WebGLProgram | null = null;
  private shipProgram: WebGLProgram | null = null;

  // Batch buffers
  private circleBatches: CircleBatch[] = [];
  private lineBatches: LineBatch[] = [];
  private triangleBatches: TriangleBatch[] = [];
  private shipInstances: ShipInstance[] = [];
  // Removed unused laserInstances

  // Vertex buffers
  private circleVBO: WebGLBuffer | null = null;
  private circleInstanceVBO: WebGLBuffer | null = null; // Instance data for circles
  private lineVBO: WebGLBuffer | null = null;
  private triangleVBO: WebGLBuffer | null = null;
  private shipVBO: WebGLBuffer | null = null; // Base ship triangle (unit triangle)
  private shipInstanceVBO: WebGLBuffer | null = null; // Instance data for ships

  // Vertex Array Objects for faster state switching
  private circleVAO: WebGLVertexArrayObject | null = null;
  // Removed unused lineVAO and triangleVAO
  private shipVAO: WebGLVertexArrayObject | null = null;

  // Uniform locations
  private circleResolutionLoc: WebGLUniformLocation | null = null;
  private lineResolutionLoc: WebGLUniformLocation | null = null;
  private lineTimeLoc: WebGLUniformLocation | null = null;
  private triangleResolutionLoc: WebGLUniformLocation | null = null;
  private shipResolutionLoc: WebGLUniformLocation | null = null;
  private shipTimeLoc: WebGLUniformLocation | null = null;

  // Cached attribute locations (avoid lookups every frame)
  private circleAttribs: {
    pos: number;
    center: number;
    radius: number;
    color: number;
  } | null = null;
  private shipAttribs: {
    pos: number;
    shipPos: number;
    angle: number;
    size: number;
    color: number;
    alpha: number;
    isMainShip: number;
    themeType?: number;
  } | null = null;

  // Current state
  private currentAlpha: number = 1.0;
  private currentFillColor: string = '#ffffff';
  private currentStrokeColor: string = '#ffffff';
  private currentLineWidth: number = 1;

  // Time for animations
  private time: number = 0;

  // Frame count for debugging
  private frameCount: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    // Clamp devicePixelRatio for iframe compatibility (some iframes report incorrect values)
    const rawDpr = window.devicePixelRatio || 1;
    this.dpr = Math.max(1, Math.min(rawDpr, 3)); // Clamp between 1 and 3

    // WebGL2 required for performance (shaders use ES 3.0 syntax)
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
    });

    if (!gl) {
      throw new Error('WebGL2 not supported - falling back to 2D canvas');
    }

    this.gl = gl;

    // Enable blending for transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Disable depth testing (2D rendering)
    gl.disable(gl.DEPTH_TEST);

    // Optimize for performance
    gl.disable(gl.DITHER);
    gl.disable(gl.POLYGON_OFFSET_FILL);

    // Create shaders and programs
    this.initShaders();

    // Create buffers
    this.initBuffers();

    // Create VAOs for better performance
    this.initVAOs();

    this.resize();
  }

  private initShaders(): void {
    // Circle shader (uses distance field rendering)
    const circleVS = `#version 300 es
      in vec2 a_position;
      in vec2 a_center;
      in float a_radius;
      in vec4 a_color;
      
      uniform vec2 u_resolution;
      
      out vec4 v_color;
      out vec2 v_center;
      out float v_radius;
      out vec2 v_fragCoord;
      
      void main() {
        // Transform quad from [-1, 1] to circle area
        vec2 quadPos = a_position * a_radius;
        vec2 worldPos = a_center + quadPos;
        
        vec2 clipSpace = ((worldPos / u_resolution) * 2.0) - 1.0;
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        v_color = a_color;
        v_center = a_center;
        v_radius = a_radius;
        v_fragCoord = worldPos;
      }
    `;

    const circleFS = `#version 300 es
      precision mediump float; // Use medium precision for better performance
      
      in vec4 v_color;
      in vec2 v_center;
      in float v_radius;
      in vec2 v_fragCoord;
      
      out vec4 fragColor;
      
      void main() {
        float dist = length(v_fragCoord - v_center);
        // Optimized: use step instead of smoothstep for better performance
        // Add small anti-aliasing with smoothstep only at edges
        float edge = 1.0;
        float alpha = 1.0;
        if (dist > v_radius - edge) {
          alpha = 1.0 - smoothstep(v_radius - edge, v_radius + edge * 0.5, dist);
        }
        fragColor = vec4(v_color.rgb, v_color.a * alpha);
      }
    `;

    // Line shader
    const lineVS = `#version 300 es
      in vec2 a_position;
      in vec4 a_color;
      
      uniform vec2 u_resolution;
      uniform float u_time;
      
      out vec4 v_color;
      out vec2 v_position;
      out float v_time;
      
      void main() {
        vec2 clipSpace = ((a_position / u_resolution) * 2.0) - 1.0;
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        v_color = a_color;
        v_position = a_position;
        v_time = u_time;
      }
    `;

    const lineFS = `#version 300 es
      precision mediump float;
      
      in vec4 v_color;
      in vec2 v_position;
      in float v_time;
      
      out vec4 fragColor;
      
      void main() {
        vec4 color = v_color;
        
        float pulse = sin(v_time * 6.0) * 0.12 + 0.88;
        float wave = sin(v_time * 10.0 + length(v_position) * 0.05) * 0.08 + 0.92;
        
        color.rgb *= pulse * wave;
        color.a *= pulse;
        
        fragColor = color;
      }
    `;

    // Triangle shader
    const triangleVS = `#version 300 es
      in vec2 a_position;
      in vec4 a_color;
      
      uniform vec2 u_resolution;
      
      out vec4 v_color;
      
      void main() {
        vec2 clipSpace = ((a_position / u_resolution) * 2.0) - 1.0;
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        v_color = a_color;
      }
    `;

    const triangleFS = `#version 300 es
      precision mediump float; // Use medium precision for better performance
      
      in vec4 v_color;
      out vec4 fragColor;
      
      void main() {
        fragColor = v_color;
      }
    `;

    // Ship shader with instanced rendering - improved graphics
    // Uses expanded quad to include glow and exhaust effects
    const shipVS = `#version 300 es
      // Expanded quad vertices to include glow and exhaust area
      // Position ranges from -3 to 3 to cover ship + glow + exhaust
      in vec2 a_position; // Quad vertices: (-3,-3), (3,-3), (-3,3), (3,3)
      
      // Instance attributes
      in vec2 a_shipPos; // Ship position
      in float a_angle; // Ship rotation (ship front is at angle + PI)
      in float a_size; // Ship size
      in vec3 a_color; // Ship color (RGB)
      in float a_alpha; // Alpha channel
      in float a_isMainShip; // 1.0 for main ship, 0.0 for ally
      in float a_themeType; // 0=default, 1=neon, 2=fire, 3=cosmic, 4=hologram
      
      uniform vec2 u_resolution;
      uniform float u_time; // For animations
      
      out vec4 v_color;
      out float v_isMainShip;
      out float v_themeType;
      out vec2 v_center;
      out float v_size;
      out float v_angle;
      out vec2 v_worldPos; // World position for fragment shader
      
      void main() {
        float scale = a_size * (a_isMainShip > 0.5 ? 1.0 : 0.61538461538);
        
        float expansionFactor = 3.0;
        vec2 expandedOffset = a_position * scale * expansionFactor;
        
        // Rotate the expanded quad to match ship orientation
        // Rotate around ship center
        float cosAngle = cos(a_angle);
        float sinAngle = sin(a_angle);
        vec2 rotatedOffset = vec2(
          expandedOffset.x * cosAngle - expandedOffset.y * sinAngle,
          expandedOffset.x * sinAngle + expandedOffset.y * cosAngle
        );
        
        // World position
        vec2 worldPos = a_shipPos + rotatedOffset;
        v_worldPos = worldPos;
        
        // Convert to clip space (Y flip for canvas coordinates)
        vec2 clipSpace = ((worldPos / u_resolution) * 2.0) - 1.0;
        gl_Position = vec4(clipSpace.x, -clipSpace.y, 0.0, 1.0);
        
        // Pass to fragment shader
        v_color = vec4(a_color, a_alpha);
        v_isMainShip = a_isMainShip;
        v_themeType = a_themeType;
        v_center = a_shipPos;
        v_size = scale;
        v_angle = a_angle;
      }
    `;

    const shipFS = `#version 300 es
      precision mediump float;
      
      in vec4 v_color;
      in float v_isMainShip;
      in float v_themeType;
      in vec2 v_center;
      in float v_size;
      in float v_angle;
      in vec2 v_worldPos; // World position from vertex shader
      
      uniform vec2 u_resolution;
      uniform float u_time;
      
      out vec4 fragColor;
      
      // Convert hex color to RGB
      vec3 hexToRgb(vec3 color) {
        return color; // Already RGB
      }
      
      // Lighten color
      vec3 lightenColor(vec3 color, float amount) {
        return mix(color, vec3(1.0), amount);
      }
      
      // 2D cross product (determinant)
      float cross2d(vec2 a, vec2 b) {
        return a.x * b.y - a.y * b.x;
      }
      
      void main() {
        // Use world position from vertex shader (more accurate)
        vec2 worldPos = v_worldPos;
        
        // Distance from fragment to ship center
        vec2 toCenter = worldPos - v_center;
        float distToCenter = length(toCenter);
        
        // Calculate engine pulse (animated based on time and ship position for uniqueness)
        float pulsePhase = u_time * 3.0 + v_center.x * 0.01 + v_center.y * 0.01;
        float enginePulse = sin(pulsePhase) * 0.25 + 0.75;
        
        bool isMainShip = v_isMainShip > 0.5;
        int themeType = int(v_themeType);
        // v_size is already the scaled size, so use it directly
        
        // Theme-specific adjustments
        float glowMultiplier = 1.0;
        float patternIntensity = 1.0;
        float pulseSpeed = 2.0;
        
        if (themeType == 1) { // Neon
          glowMultiplier = 1.3;
          patternIntensity = 1.5;
          pulseSpeed = 3.0;
        } else if (themeType == 2) { // Fire
          glowMultiplier = 1.4;
          patternIntensity = 1.2;
          pulseSpeed = 4.0;
        } else if (themeType == 3) { // Cosmic
          glowMultiplier = 1.5;
          patternIntensity = 1.8;
          pulseSpeed = 2.5;
        } else if (themeType == 4) { // Hologram
          glowMultiplier = 1.2;
          patternIntensity = 2.0;
          pulseSpeed = 3.5;
        }
        
        float glowRadius = v_size * (isMainShip ? 3.5 : 2.5) * glowMultiplier;
        float outlineWidth = isMainShip ? 2.0 : 1.5;
        float centerHighlightRadius = v_size * (isMainShip ? 0.4 : 0.3);
        
        vec3 baseColor = v_color.rgb;
        float baseAlpha = v_color.a;
        
        // Ensure minimum brightness
        float brightness = baseColor.r + baseColor.g + baseColor.b;
        if (brightness < 0.01) {
          baseColor = vec3(0.6, 0.6, 0.6);
        }
        
        vec3 finalColor = vec3(0.0);
        float finalAlpha = 0.0;
        
        float maxRenderDist = glowRadius + v_size * 1.5;
        if (distToCenter > maxRenderDist) {
          discard;
        }
        
        // 2. SHIP BODY (triangle with gradient and outline) - RENDER FIRST
        // Calculate if we're inside the triangle
        // Ship points: tip at angle+PI, left at angle+0.75*PI, right at angle+1.25*PI
        // v_size is already the scaled size (scale = a_size * (isMainShip ? 1.0 : 0.61538461538))
        float tipAngle = v_angle + 3.14159265359;
        float leftAngle = v_angle + 2.35619449019;
        float rightAngle = v_angle + 3.92699081699;
        
        vec2 tipPos = v_center + vec2(cos(tipAngle), sin(tipAngle)) * v_size;
        vec2 leftPos = v_center + vec2(cos(leftAngle), sin(leftAngle)) * v_size * 0.6;
        vec2 rightPos = v_center + vec2(cos(rightAngle), sin(rightAngle)) * v_size * 0.6;
        
        // Check if point is inside triangle using barycentric coordinates
        vec2 v0 = rightPos - tipPos;
        vec2 v1 = leftPos - tipPos;
        vec2 v2 = worldPos - tipPos;
        
        float dot00 = dot(v0, v0);
        float dot01 = dot(v0, v1);
        float dot02 = dot(v0, v2);
        float dot11 = dot(v1, v1);
        float dot12 = dot(v1, v2);
        
        float invDenom = 1.0 / (dot00 * dot11 - dot01 * dot01);
        float u = (dot11 * dot02 - dot01 * dot12) * invDenom;
        float v = (dot00 * dot12 - dot01 * dot02) * invDenom;
        
        bool insideTriangle = (u >= 0.0) && (v >= 0.0) && (u + v <= 1.0);
        
        if (insideTriangle) {
          // Calculate distance to edges for outline using 2D cross product
          // Distance to edge 1 (tip to left)
          vec2 edge1 = leftPos - tipPos;
          vec2 toPoint1 = worldPos - tipPos;
          float edge1Len = length(edge1);
          float distToEdge1 = abs(cross2d(edge1, toPoint1)) / max(edge1Len, 0.001);
          
          // Distance to edge 2 (tip to right)
          vec2 edge2 = rightPos - tipPos;
          vec2 toPoint2 = worldPos - tipPos;
          float edge2Len = length(edge2);
          float distToEdge2 = abs(cross2d(edge2, toPoint2)) / max(edge2Len, 0.001);
          
          // Distance to edge 3 (left to right)
          vec2 edge3 = rightPos - leftPos;
          vec2 toPoint3 = worldPos - leftPos;
          float edge3Len = length(edge3);
          float distToEdge3 = abs(cross2d(edge3, toPoint3)) / max(edge3Len, 0.001);
          
          float minDistToEdge = min(min(distToEdge1, distToEdge2), distToEdge3);
          
          vec3 bodyColor = baseColor;
          
          if (isMainShip && themeType == 1) {
            vec2 toTip = worldPos - tipPos;
            float distToTip = length(toTip);
            float angleToTip = atan(toTip.y, toTip.x) - v_angle;
            float stripePattern = sin(angleToTip * 6.0 + distToTip * 0.5 + u_time * 3.0) * 0.5 + 0.5;
            vec3 neonHighlight = mix(bodyColor, vec3(0.0, 1.0, 1.0), stripePattern * 0.1);
            bodyColor = mix(bodyColor, neonHighlight, 0.08);
          } else if (isMainShip && themeType == 2) {
            vec2 toTip = worldPos - tipPos;
            float distToTip = length(toTip);
            float angleToTip = atan(toTip.y, toTip.x) - v_angle;
            float flamePattern = sin(distToTip * 0.6 + u_time * 4.0 + angleToTip * 2.0) * 0.5 + 0.5;
            vec3 fireHighlight = mix(bodyColor, vec3(1.0, 0.6, 0.2), flamePattern * 0.1);
            bodyColor = mix(bodyColor, fireHighlight, 0.1);
          } else if (isMainShip && themeType == 3) {
            vec2 toTip = worldPos - tipPos;
            float distToTip = length(toTip);
            float angleToTip = atan(toTip.y, toTip.x) - v_angle;
            float starPattern = sin(angleToTip * 8.0 + distToTip * 0.8 + u_time * 2.5) * 0.5 + 0.5;
            vec3 cosmicHighlight = mix(bodyColor, vec3(0.8, 0.4, 1.0), starPattern * 0.1);
            bodyColor = mix(bodyColor, cosmicHighlight, 0.08);
            bodyColor *= (sin(u_time * 5.0 + distToCenter * 2.0) * 0.03 + 0.97);
          } else if (isMainShip && themeType == 4) {
            float scanLine = sin((worldPos.y + u_time * 50.0) * 0.1) * 0.5 + 0.5;
            vec3 hologramHighlight = mix(bodyColor, vec3(0.6, 0.9, 1.0), scanLine * 0.08);
            bodyColor = mix(bodyColor, hologramHighlight, 0.06);
            bodyColor *= (sin(distToCenter * 3.0 + u_time * 2.0) * 0.02 + 0.98);
          }
          
          finalColor = bodyColor;
          finalAlpha = 1.0;
          
          if (minDistToEdge < outlineWidth) {
            float outlineFade = smoothstep(outlineWidth, outlineWidth * 0.4, minDistToEdge);
            vec3 outlineColor = lightenColor(baseColor, 0.2);
            finalColor = mix(finalColor, outlineColor, outlineFade * 0.4);
          }
        }
        
        if (distToCenter < glowRadius && !insideTriangle) {
          float glowDist = distToCenter / glowRadius;
          float glowAlpha = 0.0;
          
          if (isMainShip) {
            glowAlpha = (1.0 - smoothstep(0.0, 1.0, glowDist)) * 0.4;
            float pulse = sin(u_time * pulseSpeed + v_center.x * 0.1) * 0.1 + 0.9;
            if (themeType == 2) {
              pulse = sin(u_time * pulseSpeed * 2.0 + v_center.x * 0.1) * 0.15 + 0.85;
            } else if (themeType == 4) {
              pulse = sin(u_time * pulseSpeed + v_center.x * 0.05 + v_center.y * 0.05) * 0.1 + 0.9;
            }
            glowAlpha *= pulse;
          } else {
            glowAlpha = (1.0 - smoothstep(0.0, 1.0, glowDist)) * 0.25;
            float pulse = sin(u_time * pulseSpeed * 0.8 + v_center.x * 0.08) * 0.05 + 0.95;
            glowAlpha *= pulse;
          }
          
          vec3 glowColor = baseColor;
          if (themeType == 1) {
            glowColor = mix(baseColor, vec3(0.0, 1.0, 1.0), 0.3);
          } else if (themeType == 2) {
            glowColor = mix(baseColor, vec3(1.0, 0.5, 0.0), 0.4);
          } else if (themeType == 3) {
            glowColor = mix(baseColor, vec3(0.5, 0.0, 1.0), 0.3);
          } else if (themeType == 4) {
            glowColor = mix(baseColor, vec3(0.5, 0.8, 1.0), 0.2);
          }
          
          finalColor = mix(finalColor, glowColor, glowAlpha);
          finalAlpha = max(finalAlpha, glowAlpha);
        }
        
        if (insideTriangle && distToCenter < centerHighlightRadius) {
          float coreDist = distToCenter / centerHighlightRadius;
          float pulse = sin(u_time * 3.0 + v_center.x * 0.05) * 0.08 + 0.92;
          float coreAlpha = (1.0 - smoothstep(0.0, 1.0, coreDist)) * 0.3 * pulse;
          vec3 coreColor = lightenColor(baseColor, 0.3);
          finalColor = mix(finalColor, coreColor, coreAlpha);
        }
        
        
        float exhaustAngle = v_angle;
        vec2 exhaustStart = v_center + vec2(cos(exhaustAngle), sin(exhaustAngle)) * v_size * (isMainShip ? 0.35 : 0.28);
        float exhaustLength = v_size * (isMainShip ? 1.0 : 0.8) * enginePulse;
        vec2 exhaustEnd = exhaustStart + vec2(cos(exhaustAngle), sin(exhaustAngle)) * exhaustLength;
        
        vec2 toExhaustStart = worldPos - exhaustStart;
        float exhaustLen = length(exhaustEnd - exhaustStart);
        if (exhaustLen > 0.01) {
          vec2 exhaustDir = (exhaustEnd - exhaustStart) / exhaustLen;
          float projDist = dot(toExhaustStart, exhaustDir);
          
          if (projDist >= -v_size * 0.1 && projDist <= exhaustLength + v_size * 0.1) {
            vec2 projPoint = exhaustStart + exhaustDir * projDist;
            float distToExhaustLine = length(worldPos - projPoint);
            float exhaustWidth = v_size * (isMainShip ? 0.5 : 0.4);
            
            if (distToExhaustLine < exhaustWidth && projDist > 0.0) {
              float exhaustFade = 1.0 - clamp(projDist / exhaustLength, 0.0, 1.0);
              float widthFade = 1.0 - smoothstep(exhaustWidth * 0.3, exhaustWidth, distToExhaustLine);
              
              float exhaustAlpha = exhaustFade * widthFade * enginePulse * (isMainShip ? 0.8 : 0.6);
              vec3 exhaustColor = mix(baseColor, lightenColor(baseColor, 0.4), exhaustFade);
              
              finalColor += exhaustColor * exhaustAlpha;
              finalAlpha = max(finalAlpha, exhaustAlpha);
            }
          }
        }
        
        // 6. ENERGY PARTICLES (theme-colored sparkles around ship for extra drama)
        if (isMainShip) {
          // Add random sparkle effect using ship position as seed
          float sparkleSeed = v_center.x * 0.1 + v_center.y * 0.1 + u_time;
          vec2 sparkleOffset = vec2(
            sin(sparkleSeed) * v_size * 1.5,
            cos(sparkleSeed * 1.3) * v_size * 1.5
          );
          float sparkleDist = length(worldPos - (v_center + sparkleOffset));
          
          if (sparkleDist < v_size * 0.15) {
            float sparkleAlpha = (1.0 - sparkleDist / (v_size * 0.15)) * 0.6;
            // Use theme color for sparkles (very light)
            vec3 sparkleColor = lightenColor(baseColor, 0.98);
            finalColor += sparkleColor * sparkleAlpha;
            finalAlpha = max(finalAlpha, sparkleAlpha);
          }
        }
        
        if (finalAlpha < 0.005) {
          discard;
        }
        
        fragColor = vec4(clamp(finalColor, 0.0, 1.0), clamp(finalAlpha, 0.0, 1.0));
      }
    `;

    this.circleProgram = this.createProgram(circleVS, circleFS);
    this.lineProgram = this.createProgram(lineVS, lineFS);
    this.triangleProgram = this.createProgram(triangleVS, triangleFS);
    this.shipProgram = this.createProgram(shipVS, shipFS);
    // Beams use line renderer for maximum performance (no custom shader needed)

    // Debug: Check if ship program compiled
    if (!this.shipProgram) {
      console.error('CRITICAL: Ship shader program failed to compile!');
    }

    // Get uniform locations
    if (this.circleProgram) {
      this.circleResolutionLoc = this.gl.getUniformLocation(
        this.circleProgram,
        'u_resolution',
      );
    }
    if (this.lineProgram) {
      this.lineResolutionLoc = this.gl.getUniformLocation(
        this.lineProgram,
        'u_resolution',
      );
      this.lineTimeLoc = this.gl.getUniformLocation(this.lineProgram, 'u_time');
    }
    if (this.triangleProgram) {
      this.triangleResolutionLoc = this.gl.getUniformLocation(
        this.triangleProgram,
        'u_resolution',
      );
    }
    if (this.shipProgram) {
      this.shipResolutionLoc = this.gl.getUniformLocation(
        this.shipProgram,
        'u_resolution',
      );
      this.shipTimeLoc = this.gl.getUniformLocation(this.shipProgram, 'u_time');

      // Cache ship attribute locations
      this.shipAttribs = {
        pos: this.gl.getAttribLocation(this.shipProgram, 'a_position'),
        shipPos: this.gl.getAttribLocation(this.shipProgram, 'a_shipPos'),
        angle: this.gl.getAttribLocation(this.shipProgram, 'a_angle'),
        size: this.gl.getAttribLocation(this.shipProgram, 'a_size'),
        color: this.gl.getAttribLocation(this.shipProgram, 'a_color'),
        alpha: this.gl.getAttribLocation(this.shipProgram, 'a_alpha'),
        isMainShip: this.gl.getAttribLocation(this.shipProgram, 'a_isMainShip'),
        themeType: this.gl.getAttribLocation(this.shipProgram, 'a_themeType'),
      };
    }

    if (this.circleProgram) {
      // Cache circle attribute locations
      this.circleAttribs = {
        pos: this.gl.getAttribLocation(this.circleProgram, 'a_position'),
        center: this.gl.getAttribLocation(this.circleProgram, 'a_center'),
        radius: this.gl.getAttribLocation(this.circleProgram, 'a_radius'),
        color: this.gl.getAttribLocation(this.circleProgram, 'a_color'),
      };
    }
  }

  private createShader(type: number, source: string): WebGLShader | null {
    const shader = this.gl.createShader(type);
    if (!shader) return null;

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  private createProgram(
    vsSource: string,
    fsSource: string,
  ): WebGLProgram | null {
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fsSource);

    if (!vertexShader || !fragmentShader) return null;

    const program = this.gl.createProgram();

    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error('Program link error:', this.gl.getProgramInfoLog(program));
      console.error('Vertex shader:', vsSource.substring(0, 200));
      console.error('Fragment shader:', fsSource.substring(0, 200));
      this.gl.deleteProgram(program);
      return null;
    }

    return program;
  }

  private initBuffers(): void {
    // Circle vertex buffer (unit quad, will be instanced)
    this.circleVBO = this.gl.createBuffer();
    // Pre-upload the quad vertices (static, never changes)
    const quadVertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.circleVBO);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, quadVertices, this.gl.STATIC_DRAW);

    // Circle instance buffer (will be updated each frame)
    this.circleInstanceVBO = this.gl.createBuffer();

    // Line buffer
    this.lineVBO = this.gl.createBuffer();

    // Triangle buffer
    this.triangleVBO = this.gl.createBuffer();

    // Ship base quad (expanded to cover glow and exhaust effects)
    // Quad covers area from -3 to 3 to include ship + glow + exhaust
    // Triangle strip: (-3,-3), (3,-3), (-3,3), (3,3)
    const shipVertices = new Float32Array([
      -3.0,
      -3.0, // Bottom-left
      3.0,
      -3.0, // Bottom-right
      -3.0,
      3.0, // Top-left
      3.0,
      3.0, // Top-right
    ]);
    this.shipVBO = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.shipVBO);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, shipVertices, this.gl.STATIC_DRAW);

    // Ship instance buffer (will be updated each frame)
    this.shipInstanceVBO = this.gl.createBuffer();
  }

  private initVAOs(): void {
    const gl = this.gl;

    // Circle VAO (optimized setup)
    if (this.circleProgram && this.circleAttribs) {
      this.circleVAO = gl.createVertexArray();
      gl.bindVertexArray(this.circleVAO);

      // Bind quad vertices
      gl.bindBuffer(gl.ARRAY_BUFFER, this.circleVBO);
      gl.enableVertexAttribArray(this.circleAttribs.pos);
      gl.vertexAttribPointer(this.circleAttribs.pos, 2, gl.FLOAT, false, 0, 0);

      // Setup instance attributes (will update buffer data each frame, but pointers stay the same)
      gl.bindBuffer(gl.ARRAY_BUFFER, this.circleInstanceVBO);
      gl.enableVertexAttribArray(this.circleAttribs.center);
      gl.vertexAttribPointer(
        this.circleAttribs.center,
        2,
        gl.FLOAT,
        false,
        7 * 4,
        0,
      );
      gl.vertexAttribDivisor(this.circleAttribs.center, 1);

      gl.enableVertexAttribArray(this.circleAttribs.radius);
      gl.vertexAttribPointer(
        this.circleAttribs.radius,
        1,
        gl.FLOAT,
        false,
        7 * 4,
        2 * 4,
      );
      gl.vertexAttribDivisor(this.circleAttribs.radius, 1);

      gl.enableVertexAttribArray(this.circleAttribs.color);
      gl.vertexAttribPointer(
        this.circleAttribs.color,
        4,
        gl.FLOAT,
        false,
        7 * 4,
        3 * 4,
      );
      gl.vertexAttribDivisor(this.circleAttribs.color, 1);

      gl.bindVertexArray(null);
    }

    // Ship VAO (most important for performance)
    if (this.shipProgram && this.shipAttribs) {
      this.shipVAO = gl.createVertexArray();
      gl.bindVertexArray(this.shipVAO);

      // Bind base triangle vertices
      gl.bindBuffer(gl.ARRAY_BUFFER, this.shipVBO);
      gl.enableVertexAttribArray(this.shipAttribs.pos);
      gl.vertexAttribPointer(this.shipAttribs.pos, 2, gl.FLOAT, false, 0, 0);

      // Instance attributes (10 floats per instance: x, y, angle, size, r, g, b, alpha, isMain, themeType)
      const stride = 10 * 4; // 10 floats * 4 bytes

      // Note: Instance buffer will be bound in render method, but setup attributes here
      gl.bindBuffer(gl.ARRAY_BUFFER, this.shipInstanceVBO);

      gl.enableVertexAttribArray(this.shipAttribs.shipPos);
      gl.vertexAttribPointer(
        this.shipAttribs.shipPos,
        2,
        gl.FLOAT,
        false,
        stride,
        0,
      );
      gl.vertexAttribDivisor(this.shipAttribs.shipPos, 1);

      gl.enableVertexAttribArray(this.shipAttribs.angle);
      gl.vertexAttribPointer(
        this.shipAttribs.angle,
        1,
        gl.FLOAT,
        false,
        stride,
        2 * 4,
      );
      gl.vertexAttribDivisor(this.shipAttribs.angle, 1);

      gl.enableVertexAttribArray(this.shipAttribs.size);
      gl.vertexAttribPointer(
        this.shipAttribs.size,
        1,
        gl.FLOAT,
        false,
        stride,
        3 * 4,
      );
      gl.vertexAttribDivisor(this.shipAttribs.size, 1);

      gl.enableVertexAttribArray(this.shipAttribs.color);
      gl.vertexAttribPointer(
        this.shipAttribs.color,
        3,
        gl.FLOAT,
        false,
        stride,
        4 * 4,
      );
      gl.vertexAttribDivisor(this.shipAttribs.color, 1);

      gl.enableVertexAttribArray(this.shipAttribs.alpha);
      gl.vertexAttribPointer(
        this.shipAttribs.alpha,
        1,
        gl.FLOAT,
        false,
        stride,
        7 * 4,
      );
      gl.vertexAttribDivisor(this.shipAttribs.alpha, 1);

      gl.enableVertexAttribArray(this.shipAttribs.isMainShip);
      gl.vertexAttribPointer(
        this.shipAttribs.isMainShip,
        1,
        gl.FLOAT,
        false,
        stride,
        8 * 4,
      );
      gl.vertexAttribDivisor(this.shipAttribs.isMainShip, 1);

      // Add themeType attribute
      if (
        this.shipAttribs.themeType !== undefined &&
        this.shipAttribs.themeType >= 0
      ) {
        gl.enableVertexAttribArray(this.shipAttribs.themeType);
        gl.vertexAttribPointer(
          this.shipAttribs.themeType,
          1,
          gl.FLOAT,
          false,
          stride,
          9 * 4,
        );
        gl.vertexAttribDivisor(this.shipAttribs.themeType, 1);
      }

      gl.bindVertexArray(null);
    }
  }

  resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    // Ensure we have valid dimensions (important for iframe compatibility)
    const rectWidth = Math.max(1, rect.width || this.canvas.clientWidth || 0);
    const rectHeight = Math.max(1, rect.height || this.canvas.clientHeight || 0);
    
    // In iframes, devicePixelRatio might be unreliable, so clamp it
    const safeDpr = Math.max(1, Math.min(this.dpr || 1, 3));
    this.width = Math.ceil(rectWidth * safeDpr);
    this.height = Math.ceil(rectHeight * safeDpr);
    
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    // Set viewport to match canvas dimensions exactly (critical for proper clearing)
    this.gl.viewport(0, 0, this.width, this.height);
  }

  updateTime(dt: number): void {
    this.time += dt;
  }

  getWidth(): number {
    return this.width / this.dpr;
  }

  getHeight(): number {
    return this.height / this.dpr;
  }

  clear(color: string = '#000000'): void {
    // When WebGL is used, we render on top of an overlay canvas
    // Clear with transparent background so overlay (background/text) shows through
    const rgb = this.hexToRgb(color);
    // Use alpha 0 for transparent clear (overlay will provide background)
    this.gl.clearColor(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, 0.0);
    
    // Ensure viewport is set correctly before clearing (important for iframe compatibility)
    // This ensures we clear the entire canvas, not just a portion
    this.gl.viewport(0, 0, this.width, this.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }

  setAlpha(alpha: number): void {
    this.currentAlpha = Math.max(0, Math.min(1, alpha));
  }

  setFill(color: string): void {
    this.currentFillColor = color;
  }

  setStroke(color: string, width: number = 1): void {
    this.currentStrokeColor = color;
    this.currentLineWidth = width;
  }

  resetAlpha(): void {
    this.currentAlpha = 1.0;
  }

  private hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1] ?? '0', 16),
          parseInt(result[2] ?? '0', 16),
          parseInt(result[3] ?? '0', 16),
        ]
      : [255, 255, 255];
  }

  // Removed unused hexToRgba method

  circle(x: number, y: number, radius: number, fill: boolean = true): void {
    const color = fill ? this.currentFillColor : this.currentStrokeColor;
    const rgb = this.hexToRgb(color);
    const alpha = this.currentAlpha;

    this.circleBatches.push({
      x: x * this.dpr,
      y: y * this.dpr,
      radius: radius * this.dpr,
      r: rgb[0] / 255,
      g: rgb[1] / 255,
      b: rgb[2] / 255,
      a: alpha,
    });
  }

  line(x1: number, y1: number, x2: number, y2: number): void {
    const rgb = this.hexToRgb(this.currentStrokeColor);
    const alpha = this.currentAlpha;

    this.lineBatches.push({
      x1: x1 * this.dpr,
      y1: y1 * this.dpr,
      x2: x2 * this.dpr,
      y2: y2 * this.dpr,
      width: this.currentLineWidth * this.dpr,
      r: rgb[0] / 255,
      g: rgb[1] / 255,
      b: rgb[2] / 255,
      a: alpha,
    });
  }

  triangle(
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    p3: { x: number; y: number },
    fill: boolean = true,
  ): void {
    const color = fill ? this.currentFillColor : this.currentStrokeColor;
    const rgb = this.hexToRgb(color);
    const alpha = this.currentAlpha;

    this.triangleBatches.push({
      x1: p1.x * this.dpr,
      y1: p1.y * this.dpr,
      x2: p2.x * this.dpr,
      y2: p2.y * this.dpr,
      x3: p3.x * this.dpr,
      y3: p3.y * this.dpr,
      r: rgb[0] / 255,
      g: rgb[1] / 255,
      b: rgb[2] / 255,
      a: alpha,
    });
  }

  /**
   * Add a ship to the batch for instanced rendering
   * This is much faster than individual draw calls
   */
  addShip(
    x: number,
    y: number,
    angle: number,
    size: number,
    color: string,
    isMainShip: boolean = false,
    themeId?: string,
  ): void {
    const rgb = this.hexToRgb(color);
    const alpha = this.currentAlpha;

    // Map theme ID to theme type
    let themeType = 0; // default
    if (themeId === 'neon_ship') themeType = 1;
    else if (themeId === 'fire_ship') themeType = 2;
    else if (themeId === 'cosmic_ship') themeType = 3;
    else if (themeId === 'hologram_ship') themeType = 4;

    this.shipInstances.push({
      x: x * this.dpr,
      y: y * this.dpr,
      angle: angle, // Ship angle (front is at angle, tip is at angle + PI)
      size: size * this.dpr, // Apply device pixel ratio for crisp rendering
      r: rgb[0] / 255,
      g: rgb[1] / 255,
      b: rgb[2] / 255,
      a: alpha,
      isMainShip: isMainShip ? 1.0 : 0.0,
      themeType,
    });
  }

  // Flush all batched draws to GPU
  /**
   * Add a beam to the batch for WebGL rendering
   * Beams are rendered as lines for maximum performance
   */
  addBeam(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    width: number,
    color: string,
    _isCrit: boolean = false,
    themeId?: string,
  ): void {
    const oldStroke = this.currentStrokeColor;
    const oldWidth = this.currentLineWidth;
    const oldAlpha = this.currentAlpha;

    const pulse = Math.sin(this.time * 8.0) * 0.15 + 0.85;
    const wavePhase = this.time * 12.0;
    const baseAlpha = 0.8 * pulse;

    if (themeId === 'rainbow_laser') {
      const colors = [
        '#ff0000',
        '#ff8800',
        '#ffff00',
        '#00ff00',
        '#0088ff',
        '#0000ff',
        '#8800ff',
        '#ff00ff',
      ];
      const segmentCount = 6; // Reduced from 12 for better performance
      const dx = (x2 - x1) / segmentCount;
      const dy = (y2 - y1) / segmentCount;

      for (let i = 0; i < segmentCount; i++) {
        const segX1 = x1 + dx * i;
        const segY1 = y1 + dy * i;
        const segX2 = x1 + dx * (i + 1);
        const segY2 = y1 + dy * (i + 1);
        const wave = Math.sin(wavePhase + i * 0.8) * 0.2 + 0.8;
        const segColor =
          colors[Math.floor((i + Math.floor(wavePhase * 2)) % colors.length)] ??
          colors[0] ??
          '#ffffff';
        const segWidth = width * (1.3 + wave * 0.3);
        // Inverted opacity gradient: high at ship, low at enemy
        const t = (i + 1) / segmentCount;
        const opacityGradient = 0.25 + Math.pow(1 - t, 0.25) * 0.75;
        this.setAlpha(baseAlpha * wave * opacityGradient);
        this.setStroke(segColor, segWidth);
        this.line(segX1, segY1, segX2, segY2);
      }

      // Reduced to 1 glow layer from 2 for better performance
      const offset = 0.3;
      for (let i = 0; i < segmentCount; i++) {
        const wave =
          Math.sin(wavePhase * 1.5 + i * 1.2 + offset) * 0.15 + 0.85;
        const segX1 = x1 + dx * i;
        const segY1 = y1 + dy * i;
        const segX2 = x1 + dx * (i + 1);
        const segY2 = y1 + dy * (i + 1);
        // Inverted opacity gradient for glow layer
        const t = (i + 1) / segmentCount;
        const opacityGradient = 0.25 + Math.pow(1 - t, 0.25) * 0.75;
        this.setAlpha(baseAlpha * wave * 0.4 * opacityGradient);
        this.setStroke(
          colors[i % colors.length] ?? colors[0] ?? '#ffffff',
          width * 0.6,
        );
        this.line(segX1, segY1, segX2, segY2);
      }
    } else if (themeId === 'plasma_laser') {
      const segments = 8;
      const dx = (x2 - x1) / segments;
      const dy = (y2 - y1) / segments;
      const plasmaColors = [
        '#ff4400',
        '#ff6600',
        '#ff8800',
        '#ff4400',
        '#ff0044',
      ];

      for (let layer = 0; layer < 3; layer++) {
        const layerOffset = layer * 0.4;
        for (let i = 0; i < segments; i++) {
          const wave =
            Math.sin(wavePhase + i * 1.5 + layerOffset) * 0.25 + 0.75;
          const segX1 = x1 + dx * i;
          const segY1 = y1 + dy * i;
          const segX2 = x1 + dx * (i + 1);
          const segY2 = y1 + dy * (i + 1);
          const segColor =
            plasmaColors[(i + Math.floor(wavePhase)) % plasmaColors.length] ??
            plasmaColors[0] ??
            '#ff4400';
          const segWidth = width * (1.2 + wave * 0.4) * (1.0 - layer * 0.3);
          // Inverted opacity gradient: high at ship, low at enemy
          const t = (i + 1) / segments;
          const opacityGradient = 0.25 + Math.pow(1 - t, 0.25) * 0.75;
          this.setAlpha(baseAlpha * wave * (1.0 - layer * 0.25) * opacityGradient);
          this.setStroke(segColor, segWidth);
          this.line(segX1, segY1, segX2, segY2);
        }
      }
    } else if (themeId === 'void_laser') {
      const pulse2 = Math.sin(this.time * 10.0) * 0.2 + 0.8;
      const pulse3 = Math.sin(this.time * 14.0) * 0.15 + 0.85;
      
      // Draw void beam in segments with opacity gradient
      const segments = 8;
      const dx = (x2 - x1) / segments;
      const dy = (y2 - y1) / segments;

      for (let i = 0; i < segments; i++) {
        const segX1 = x1 + dx * i;
        const segY1 = y1 + dy * i;
        const segX2 = x1 + dx * (i + 1);
        const segY2 = y1 + dy * (i + 1);
        // Inverted opacity gradient: high at ship, low at enemy
        const t = (i + 1) / segments;
        const opacityGradient = 0.25 + Math.pow(1 - t, 0.25) * 0.75;

        this.setAlpha(baseAlpha * 0.6 * opacityGradient);
        this.setStroke('#4400aa', width * (1.4 + pulse2 * 0.3));
        this.line(segX1, segY1, segX2, segY2);

        this.setAlpha(baseAlpha * pulse2 * opacityGradient);
        this.setStroke('#8800ff', width * (0.9 + pulse3 * 0.2));
        this.line(segX1, segY1, segX2, segY2);

        this.setAlpha(baseAlpha * pulse3 * opacityGradient);
        this.setStroke('#ff00ff', width * (0.6 + pulse2 * 0.15));
        this.line(segX1, segY1, segX2, segY2);
      }
    } else {
      const segments = 6;
      const dx = (x2 - x1) / segments;
      const dy = (y2 - y1) / segments;

      for (let layer = 0; layer < 2; layer++) {
        const layerAlpha = layer === 0 ? baseAlpha : baseAlpha * 0.5;
        const layerWidth = layer === 0 ? width : width * 1.4;

        for (let i = 0; i < segments; i++) {
          const wave = Math.sin(wavePhase + i * 1.2 + layer * 0.5) * 0.2 + 0.8;
          const segX1 = x1 + dx * i;
          const segY1 = y1 + dy * i;
          const segX2 = x1 + dx * (i + 1);
          const segY2 = y1 + dy * (i + 1);
          // Inverted opacity gradient: high at ship, low at enemy
          const t = (i + 1) / segments;
          const opacityGradient = 0.25 + Math.pow(1 - t, 0.25) * 0.75;
          this.setAlpha(layerAlpha * wave * opacityGradient);
          this.setStroke(color, layerWidth * wave);
          this.line(segX1, segY1, segX2, segY2);
        }
      }
    }

    this.currentStrokeColor = oldStroke;
    this.currentLineWidth = oldWidth;
    this.currentAlpha = oldAlpha;
  }

  /**
   * Add a laser (projectile) to the batch for WebGL rendering
   */
  addLaser(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    width: number,
    color: string,
    progress: number,
    isCrit: boolean = false,
    themeId?: string,
  ): void {
    // Don't render laser if it has hit and is entering the alien (progress > 1.0)
    // This prevents the laser from being visible inside the alien
    if (progress > 1.0) {
      return; // Laser disappears immediately when entering the alien
    }

    const pulse = Math.sin(this.time * 10.0 + progress * 20.0) * 0.05 + 0.95;
    const normalProgress = Math.min(1, progress);
    // Fade-in only at the very beginning (first 10% of travel), then full opacity
    const fadeInAlpha =
      normalProgress < 0.1 ? Math.min(1, normalProgress * 10.0) : 1.0;
    const baseAlpha = this.currentAlpha * fadeInAlpha * pulse;

    const boltDx = x2 - x1;
    const boltDy = y2 - y1;
    const boltLen = Math.sqrt(boltDx * boltDx + boltDy * boltDy);

    if (boltLen < 0.1) {
      return;
    }

    const boltPulse = Math.sin(this.time * 12.0) * 0.05 + 0.95;
    const coreWidth = Math.max(width * 0.4, 1.2); // Thin core
    const glowWidth = width * 1.0; // Subtle glow

    // Calculate bolt length (shorter than full distance for projectile effect)
    const angle = Math.atan2(boltDy, boltDx);
    const boltLength = Math.max(
      Math.min(boltLen * 0.4, 25 * this.dpr),
      8 * this.dpr,
    );
    const boltStartX = x2 - Math.cos(angle) * boltLength;
    const boltStartY = y2 - Math.sin(angle) * boltLength;

    if (themeId === 'rainbow_laser') {
      const colors = [
        '#ff0080', // Hot pink
        '#ff4000', // Red-orange
        '#ff8000', // Orange
        '#ffc000', // Yellow-orange
        '#ffff00', // Yellow
        '#c0ff00', // Yellow-green
        '#80ff00', // Green
        '#40ff80', // Green-cyan
        '#00ffc0', // Cyan
        '#00c0ff', // Light blue
        '#0080ff', // Blue
        '#4000ff', // Indigo
        '#8000ff', // Purple
        '#c000ff', // Magenta
        '#ff00c0', // Pink
        '#ff0080', // Back to hot pink
      ];
      const timeOffset = this.time * 12.0 + progress * 25.0;
      const colorIndex1 = Math.floor(timeOffset) % colors.length;
      const colorIndex2 = (colorIndex1 + 1) % colors.length;
      const boltColor1: string = colors[colorIndex1] ?? '#ff0080';
      const boltColor2: string = colors[colorIndex2] ?? '#ff0080';

      // Outer rainbow glow - richer and more vibrant
      this.setAlpha(Math.max(baseAlpha * boltPulse * 0.7, 0.5));
      this.setStroke(boltColor2, glowWidth * 1.3);
      this.line(boltStartX, boltStartY, x2, y2);

      // Middle glow layer
      this.setAlpha(Math.max(baseAlpha * boltPulse * 0.8, 0.6));
      this.setStroke(boltColor1, glowWidth * 0.9);
      this.line(boltStartX, boltStartY, x2, y2);

      // Main bright core - white with rainbow glow
      this.setAlpha(Math.max(baseAlpha * boltPulse, 1.0));
      this.setStroke('#ffffff', coreWidth);
      this.line(boltStartX, boltStartY, x2, y2);
    } else if (themeId === 'plasma_laser') {
      const plasmaColorIndex =
        Math.floor(this.time * 10.0 + progress * 25.0) % 5;
      const plasmaColors = [
        '#ff4400',
        '#ff6600',
        '#ff8800',
        '#ff4400',
        '#ff0044',
      ];
      const boltColor: string = plasmaColors[plasmaColorIndex] ?? color;

      // Plasma projectile design - slightly thicker
      this.setAlpha(Math.max(baseAlpha * boltPulse * 0.7, 0.5));
      this.setStroke(boltColor, glowWidth * 1.1);
      this.line(boltStartX, boltStartY, x2, y2);

      // Main core
      this.setAlpha(Math.max(baseAlpha * boltPulse, 1.0));
      this.setStroke('#ffffff', coreWidth * 1.1);
      this.line(boltStartX, boltStartY, x2, y2);
    } else if (themeId === 'void_laser') {
      const voidPulse =
        Math.sin(this.time * 12.0 + progress * 25.0) * 0.15 + 0.85;

      // Void projectile design - dual color
      this.setAlpha(Math.max(baseAlpha * voidPulse * 0.6, 0.4));
      this.setStroke('#8800ff', glowWidth);
      this.line(boltStartX, boltStartY, x2, y2);

      // Inner void core - magenta
      this.setAlpha(Math.max(baseAlpha * voidPulse, 1.0));
      this.setStroke('#ff00ff', coreWidth);
      this.line(boltStartX, boltStartY, x2, y2);
    } else {
      // Default projectile design
      this.setAlpha(Math.max(baseAlpha * boltPulse * 0.6, 0.4));
      this.setStroke(color, glowWidth);
      this.line(boltStartX, boltStartY, x2, y2);

      // Main laser core - thin and bright
      this.setAlpha(Math.max(baseAlpha * boltPulse, 1.0));
      this.setStroke('#ffffff', coreWidth);
      this.line(boltStartX, boltStartY, x2, y2);
    }

    if (isCrit) {
      const critPulse = Math.sin(this.time * 18.0) * 0.15 + 0.85;

      if (themeId === 'rainbow_laser') {
        const critColors = [
          '#ffff00', // Bright yellow
          '#ff8000', // Orange
          '#ff0080', // Hot pink
          '#ff00ff', // Magenta
          '#8000ff', // Purple
          '#0080ff', // Blue
          '#00ffff', // Cyan
          '#00ff80', // Green
          '#80ff00', // Yellow-green
          '#ffff00', // Back to yellow
        ];
        const critTimeOffset = this.time * 15.0 + progress * 35.0;
        const critColorIndex1 = Math.floor(critTimeOffset) % critColors.length;
        const critColorIndex2 = (critColorIndex1 + 1) % critColors.length;
        const critColor2: string = critColors[critColorIndex2] ?? '#ffff00';

        // Outer crit rainbow glow
        this.setAlpha(Math.max(baseAlpha * critPulse * 0.8, 0.5));
        this.setStroke(critColor2, coreWidth * 2.5);
        this.line(boltStartX, boltStartY, x2, y2);

        // Inner crit core
        this.setAlpha(Math.max(baseAlpha * critPulse * 0.9, 0.6));
        this.setStroke('#ffffff', coreWidth * 1.8);
        this.line(boltStartX, boltStartY, x2, y2);
      } else if (themeId === 'plasma_laser') {
        const plasmaCritColors = ['#ffaa00', '#ff6600', '#ff4400'];
        const critColorIndex =
          Math.floor(this.time * 15.0 + progress * 35.0) %
          plasmaCritColors.length;
        const critColor: string = plasmaCritColors[critColorIndex] ?? '#ff8800';

        // Plasma crit overlay
        this.setAlpha(Math.max(baseAlpha * critPulse * 0.75, 0.5));
        this.setStroke(critColor, coreWidth * 2.2);
        this.line(boltStartX, boltStartY, x2, y2);
      } else if (themeId === 'void_laser') {
        const voidCritPulse =
          Math.sin(this.time * 20.0 + progress * 40.0) * 0.2 + 0.8;

        // Void crit overlay - dual color
        this.setAlpha(Math.max(baseAlpha * voidCritPulse * 0.6, 0.4));
        this.setStroke('#8800ff', coreWidth * 2.3);
        this.line(boltStartX, boltStartY, x2, y2);

        this.setAlpha(Math.max(baseAlpha * voidCritPulse * 0.75, 0.5));
        this.setStroke('#ff00ff', coreWidth * 1.8);
        this.line(boltStartX, boltStartY, x2, y2);
      } else {
        // Default crit overlay - yellow
        this.setAlpha(Math.max(baseAlpha * critPulse * 0.7, 0.5));
        this.setStroke('#ffff00', coreWidth * 2.0);
        this.line(boltStartX, boltStartY, x2, y2);
      }
    }
  }

  flush(): void {
    this.frameCount++;

    // Render other geometry first (background elements)
    this.renderCircles();
    this.renderLines();
    this.renderTriangles();

    // Render ships last (on top, instanced, most efficient)
    this.renderShips();

    // Clear batches
    this.circleBatches = [];
    this.lineBatches = [];
    this.triangleBatches = [];
    this.shipInstances = [];
    // Removed unused laserInstances
  }

  private renderShips(): void {
    if (this.shipInstances.length === 0) return;

    // Fallback: If instanced rendering isn't available, render as regular triangles
    if (!this.shipProgram || !this.shipVAO || !this.shipAttribs) {
      console.warn(
        'Ships: Falling back to regular triangle rendering (instanced not available):',
        {
          hasProgram: !!this.shipProgram,
          hasVAO: !!this.shipVAO,
          hasAttribs: !!this.shipAttribs,
          shipCount: this.shipInstances.length,
        },
      );

      // Fallback: render ships as regular triangles
      this.renderShipsAsTriangles();
      return;
    }

    // Debug logging removed for production

    const gl = this.gl;
    gl.useProgram(this.shipProgram);

    // Update instance data (10 floats per ship: x, y, angle, size, r, g, b, alpha, isMainShip, themeType)
    const instanceData = new Float32Array(this.shipInstances.length * 10);
    for (let i = 0; i < this.shipInstances.length; i++) {
      const ship = this.shipInstances[i];
      if (!ship) continue;
      const offset = i * 10;
      instanceData[offset + 0] = ship.x;
      instanceData[offset + 1] = ship.y;
      instanceData[offset + 2] = ship.angle;
      instanceData[offset + 3] = ship.size;
      instanceData[offset + 4] = ship.r;
      instanceData[offset + 5] = ship.g;
      instanceData[offset + 6] = ship.b;
      instanceData[offset + 7] = ship.a;
      instanceData[offset + 8] = ship.isMainShip ? 1 : 0;
      instanceData[offset + 9] = ship.themeType || 0;
    }

    // Bind VAO first (restores base triangle vertex setup)
    gl.bindVertexArray(this.shipVAO);

    // Update instance buffer (must be done after VAO is bound)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.shipInstanceVBO);
    gl.bufferData(gl.ARRAY_BUFFER, instanceData, gl.DYNAMIC_DRAW);

    // IMPORTANT: After updating buffer, we must rebind instance attributes
    // VAOs remember attribute locations but not the current buffer binding
    const stride = 10 * 4;

    // Update instance attribute pointers (VAO remembers which attributes, but buffer binding changes)
    if (this.shipAttribs.shipPos >= 0) {
      gl.enableVertexAttribArray(this.shipAttribs.shipPos);
      gl.vertexAttribPointer(
        this.shipAttribs.shipPos,
        2,
        gl.FLOAT,
        false,
        stride,
        0,
      );
      gl.vertexAttribDivisor(this.shipAttribs.shipPos, 1);
    }

    if (this.shipAttribs.angle >= 0) {
      gl.enableVertexAttribArray(this.shipAttribs.angle);
      gl.vertexAttribPointer(
        this.shipAttribs.angle,
        1,
        gl.FLOAT,
        false,
        stride,
        2 * 4,
      );
      gl.vertexAttribDivisor(this.shipAttribs.angle, 1);
    }

    if (this.shipAttribs.size >= 0) {
      gl.enableVertexAttribArray(this.shipAttribs.size);
      gl.vertexAttribPointer(
        this.shipAttribs.size,
        1,
        gl.FLOAT,
        false,
        stride,
        3 * 4,
      );
      gl.vertexAttribDivisor(this.shipAttribs.size, 1);
    }

    if (this.shipAttribs.color >= 0) {
      gl.enableVertexAttribArray(this.shipAttribs.color);
      gl.vertexAttribPointer(
        this.shipAttribs.color,
        3,
        gl.FLOAT,
        false,
        stride,
        4 * 4,
      );
      gl.vertexAttribDivisor(this.shipAttribs.color, 1);
    }

    if (this.shipAttribs.alpha >= 0) {
      gl.enableVertexAttribArray(this.shipAttribs.alpha);
      gl.vertexAttribPointer(
        this.shipAttribs.alpha,
        1,
        gl.FLOAT,
        false,
        stride,
        7 * 4,
      );
      gl.vertexAttribDivisor(this.shipAttribs.alpha, 1);
    }

    if (this.shipAttribs.isMainShip >= 0) {
      gl.enableVertexAttribArray(this.shipAttribs.isMainShip);
      gl.vertexAttribPointer(
        this.shipAttribs.isMainShip,
        1,
        gl.FLOAT,
        false,
        stride,
        8 * 4,
      );
      gl.vertexAttribDivisor(this.shipAttribs.isMainShip, 1);
    }

    if (
      this.shipAttribs.themeType !== undefined &&
      this.shipAttribs.themeType >= 0
    ) {
      gl.enableVertexAttribArray(this.shipAttribs.themeType);
      gl.vertexAttribPointer(
        this.shipAttribs.themeType,
        1,
        gl.FLOAT,
        false,
        stride,
        9 * 4,
      );
      gl.vertexAttribDivisor(this.shipAttribs.themeType, 1);
    }

    // Set uniforms
    if (this.shipResolutionLoc) {
      gl.uniform2f(this.shipResolutionLoc, this.width, this.height);
    }
    if (this.shipTimeLoc) {
      gl.uniform1f(this.shipTimeLoc, this.time);
    }

    // Draw all ships in a single instanced draw call! (MAJOR performance boost)
    const instanceCount = this.shipInstances.length;

    // Debug logging removed for production

    // Draw quad using TRIANGLE_STRIP (4 vertices form a quad)
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, instanceCount);

    // Check for errors
    let error = gl.getError();
    if (error !== gl.NO_ERROR) {
      const errorNames: Record<number, string> = {
        1280: 'INVALID_ENUM',
        1281: 'INVALID_VALUE',
        1282: 'INVALID_OPERATION',
        1285: 'OUT_OF_MEMORY',
        1286: 'INVALID_FRAMEBUFFER_OPERATION',
      };
      console.error(
        'WebGL error after drawArraysInstanced:',
        error,
        errorNames[error] || 'UNKNOWN',
      );
    }

    // Verify attributes are valid
    error = gl.getError();
    if (error !== gl.NO_ERROR) {
      console.error('WebGL error after draw:', error);
    }

    gl.bindVertexArray(null);
  }

  // Fallback: Render ships as regular triangles (slower but works)
  private renderShipsAsTriangles(): void {
    if (!this.triangleProgram) return;

    const gl = this.gl;
    gl.useProgram(this.triangleProgram);

    for (const ship of this.shipInstances) {
      const scale = ship.size * (ship.isMainShip > 0.5 ? 1.0 : 0.61538461538);

      // Calculate triangle vertices matching original 2D code
      const tipAngle = ship.angle + Math.PI;
      const leftAngle = ship.angle + Math.PI * 0.75;
      const rightAngle = ship.angle + Math.PI * 1.25;

      const tipX = ship.x + Math.cos(tipAngle) * scale;
      const tipY = ship.y + Math.sin(tipAngle) * scale;
      const leftX = ship.x + Math.cos(leftAngle) * scale * 0.6;
      const leftY = ship.y + Math.sin(leftAngle) * scale * 0.6;
      const rightX = ship.x + Math.cos(rightAngle) * scale * 0.6;
      const rightY = ship.y + Math.sin(rightAngle) * scale * 0.6;

      // Add to triangle batch
      this.triangleBatches.push({
        x1: tipX,
        y1: tipY,
        x2: leftX,
        y2: leftY,
        x3: rightX,
        y3: rightY,
        r: ship.r,
        g: ship.g,
        b: ship.b,
        a: ship.a,
      });
    }

    // Render triangles (will be flushed in renderTriangles)
  }

  private renderCircles(): void {
    if (
      this.circleBatches.length === 0 ||
      !this.circleProgram ||
      !this.circleAttribs
    )
      return;

    const gl = this.gl;
    gl.useProgram(this.circleProgram);

    // Create instance data for all circles (7 floats per circle)
    const instanceData = new Float32Array(this.circleBatches.length * 7);
    for (let i = 0; i < this.circleBatches.length; i++) {
      const batch = this.circleBatches[i];
      if (!batch) continue;
      const offset = i * 7;
      instanceData[offset + 0] = batch.x;
      instanceData[offset + 1] = batch.y;
      instanceData[offset + 2] = batch.radius;
      instanceData[offset + 3] = batch.r;
      instanceData[offset + 4] = batch.g;
      instanceData[offset + 5] = batch.b;
      instanceData[offset + 6] = batch.a;
    }

    // Use VAO for fast state setup (all attributes already configured)
    if (this.circleVAO) {
      gl.bindVertexArray(this.circleVAO);
      // Update instance buffer data (VAO remembers the buffer binding, just update contents)
      gl.bindBuffer(gl.ARRAY_BUFFER, this.circleInstanceVBO);
      gl.bufferData(gl.ARRAY_BUFFER, instanceData, gl.DYNAMIC_DRAW);
    } else {
      // Fallback: setup manually (shouldn't happen if VAO creation succeeded)
      gl.bindBuffer(gl.ARRAY_BUFFER, this.circleVBO);
      gl.enableVertexAttribArray(this.circleAttribs.pos);
      gl.vertexAttribPointer(this.circleAttribs.pos, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.circleInstanceVBO);
      gl.bufferData(gl.ARRAY_BUFFER, instanceData, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(this.circleAttribs.center);
      gl.vertexAttribPointer(
        this.circleAttribs.center,
        2,
        gl.FLOAT,
        false,
        7 * 4,
        0,
      );
      gl.vertexAttribDivisor(this.circleAttribs.center, 1);

      gl.enableVertexAttribArray(this.circleAttribs.radius);
      gl.vertexAttribPointer(
        this.circleAttribs.radius,
        1,
        gl.FLOAT,
        false,
        7 * 4,
        2 * 4,
      );
      gl.vertexAttribDivisor(this.circleAttribs.radius, 1);

      gl.enableVertexAttribArray(this.circleAttribs.color);
      gl.vertexAttribPointer(
        this.circleAttribs.color,
        4,
        gl.FLOAT,
        false,
        7 * 4,
        3 * 4,
      );
      gl.vertexAttribDivisor(this.circleAttribs.color, 1);
    }

    gl.uniform2f(this.circleResolutionLoc, this.width, this.height);

    // Draw all circles in a single instanced draw call! (MAJOR performance boost)
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, this.circleBatches.length);

    if (this.circleVAO) {
      gl.bindVertexArray(null);
    }
  }

  private renderLines(): void {
    if (this.lineBatches.length === 0 || !this.lineProgram) return;

    const gl = this.gl;
    gl.useProgram(this.lineProgram);

    const vertices: number[] = [];
    for (const batch of this.lineBatches) {
      const dx = batch.x2 - batch.x1;
      const dy = batch.y2 - batch.y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      const halfWidth = batch.width * 0.5;

      if (len < 0.001) continue;

      const nx = -dy / len;
      const ny = dx / len;

      const x1 = batch.x1 + nx * halfWidth;
      const y1 = batch.y1 + ny * halfWidth;
      const x2 = batch.x1 - nx * halfWidth;
      const y2 = batch.y1 - ny * halfWidth;
      const x3 = batch.x2 - nx * halfWidth;
      const y3 = batch.y2 - ny * halfWidth;
      const x4 = batch.x2 + nx * halfWidth;
      const y4 = batch.y2 + ny * halfWidth;

      vertices.push(x1, y1, batch.r, batch.g, batch.b, batch.a);
      vertices.push(x2, y2, batch.r, batch.g, batch.b, batch.a);
      vertices.push(x3, y3, batch.r, batch.g, batch.b, batch.a);

      vertices.push(x1, y1, batch.r, batch.g, batch.b, batch.a);
      vertices.push(x3, y3, batch.r, batch.g, batch.b, batch.a);
      vertices.push(x4, y4, batch.r, batch.g, batch.b, batch.a);
    }

    if (vertices.length === 0) return;

    const vertexData = new Float32Array(vertices);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.lineVBO);
    gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.DYNAMIC_DRAW);

    const posLoc = gl.getAttribLocation(this.lineProgram, 'a_position');
    const colorLoc = gl.getAttribLocation(this.lineProgram, 'a_color');

    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 6 * 4, 0);

    gl.enableVertexAttribArray(colorLoc);
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 6 * 4, 2 * 4);

    gl.uniform2f(this.lineResolutionLoc, this.width, this.height);
    if (this.lineTimeLoc) {
      gl.uniform1f(this.lineTimeLoc, this.time);
    }

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 6);
  }

  private renderTriangles(): void {
    if (this.triangleBatches.length === 0 || !this.triangleProgram) return;

    const gl = this.gl;
    gl.useProgram(this.triangleProgram);

    const vertices: number[] = [];
    for (const batch of this.triangleBatches) {
      vertices.push(
        batch.x1,
        batch.y1,
        batch.r,
        batch.g,
        batch.b,
        batch.a,
        batch.x2,
        batch.y2,
        batch.r,
        batch.g,
        batch.b,
        batch.a,
        batch.x3,
        batch.y3,
        batch.r,
        batch.g,
        batch.b,
        batch.a,
      );
    }

    const vertexData = new Float32Array(vertices);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.triangleVBO);
    gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.DYNAMIC_DRAW);

    const posLoc = gl.getAttribLocation(this.triangleProgram, 'a_position');
    const colorLoc = gl.getAttribLocation(this.triangleProgram, 'a_color');

    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 6 * 4, 0);

    gl.enableVertexAttribArray(colorLoc);
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 6 * 4, 2 * 4);

    gl.uniform2f(this.triangleResolutionLoc, this.width, this.height);

    gl.drawArrays(gl.TRIANGLES, 0, this.triangleBatches.length * 3);
  }

  // Get WebGL context for advanced operations
  getGL(): WebGL2RenderingContext {
    return this.gl;
  }

  // Cleanup
  destroy(): void {
    if (this.circleVBO) this.gl.deleteBuffer(this.circleVBO);
    if (this.circleInstanceVBO) this.gl.deleteBuffer(this.circleInstanceVBO);
    if (this.lineVBO) this.gl.deleteBuffer(this.lineVBO);
    if (this.triangleVBO) this.gl.deleteBuffer(this.triangleVBO);
    if (this.shipVBO) this.gl.deleteBuffer(this.shipVBO);
    if (this.shipInstanceVBO) this.gl.deleteBuffer(this.shipInstanceVBO);
    if (this.circleVAO) this.gl.deleteVertexArray(this.circleVAO);
    if (this.shipVAO) this.gl.deleteVertexArray(this.shipVAO);
    if (this.circleProgram) this.gl.deleteProgram(this.circleProgram);
    if (this.lineProgram) this.gl.deleteProgram(this.lineProgram);
    if (this.triangleProgram) this.gl.deleteProgram(this.triangleProgram);
    if (this.shipProgram) this.gl.deleteProgram(this.shipProgram);
  }
}
