/**
 * SEDIMENT - Multi-layered generative system
 * Inspired by Harvey Rayner, Matt Kane, and Eric De Giuli
 *
 * Core systems:
 * 1. Substrate layer - Perlin noise terrain with aging/distress
 * 2. Mineral deposits - Voronoi-based crystalline structures
 * 3. Flow networks - Multi-scale flow fields for erosion patterns
 * 4. Optical meshes - Overlapping transparent geometric networks
 * 5. Atmospheric dust - Particle systems with gravitational drift
 * 6. Surface aberrations - Fine detail texture overlays
 * 7. Color modulation - Large-scale gradient washes
 * 8. Interference patterns - Wave-based optical effects
 * 9. Granular texture - Fine-grain surface noise
 * 10. Recursive subdivision - Emergent spatial complexity
 * 11. Color field distortion - Localized hue shifting zones
 */

class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }

  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  range(min, max) {
    return min + this.next() * (max - min);
  }

  int(min, max) {
    return Math.floor(this.range(min, max));
  }

  choice(arr) {
    if (arr.length === 0) return undefined;
    return arr[Math.floor(this.next() * arr.length)];
  }
}

class PerlinNoise {
  constructor(rng) {
    this.rng = rng;
    this.permutation = [];
    for (let i = 0; i < 256; i++) {
      this.permutation[i] = i;
    }
    // Shuffle
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(rng.next() * (i + 1));
      [this.permutation[i], this.permutation[j]] = [this.permutation[j], this.permutation[i]];
    }
    this.p = [...this.permutation, ...this.permutation];
  }

  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  lerp(t, a, b) {
    return a + t * (b - a);
  }

  grad(hash, x, y) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = this.fade(x);
    const v = this.fade(y);
    const a = this.p[X] + Y;
    const aa = this.p[a];
    const ab = this.p[a + 1];
    const b = this.p[X + 1] + Y;
    const ba = this.p[b];
    const bb = this.p[b + 1];

    return this.lerp(v,
      this.lerp(u, this.grad(this.p[aa], x, y), this.grad(this.p[ba], x - 1, y)),
      this.lerp(u, this.grad(this.p[ab], x, y - 1), this.grad(this.p[bb], x - 1, y - 1))
    );
  }

  octaveNoise(x, y, octaves, persistence) {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      total += this.noise(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }

    return total / maxValue;
  }
}

class VoronoiField {
  constructor(rng, width, height, numPoints) {
    this.points = [];
    this.colors = [];

    for (let i = 0; i < numPoints; i++) {
      this.points.push({
        x: rng.range(0, width),
        y: rng.range(0, height),
        influence: rng.range(0.5, 2.0)
      });

      this.colors.push({
        h: rng.range(0, 360),
        s: rng.range(20, 80),
        l: rng.range(30, 70)
      });
    }
  }

  getCell(x, y) {
    let minDist = Infinity;
    let minIndex = 0;

    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i];
      const dist = Math.sqrt((x - p.x) ** 2 + (y - p.y) ** 2) / p.influence;
      if (dist < minDist) {
        minDist = dist;
        minIndex = i;
      }
    }

    return { index: minIndex, distance: minDist, color: this.colors[minIndex] };
  }

  getEdgeWeight(x, y, threshold = 1.05) {
    const distances = this.points.map(p =>
      Math.sqrt((x - p.x) ** 2 + (y - p.y) ** 2) / p.influence
    ).sort((a, b) => a - b);

    return distances[1] / distances[0] < threshold ? 1 : 0;
  }
}

class FlowField {
  constructor(rng, width, height, resolution, scale, octaves) {
    this.resolution = resolution;
    this.cols = Math.ceil(width / resolution);
    this.rows = Math.ceil(height / resolution);
    this.field = [];

    const noise = new PerlinNoise(rng);

    for (let y = 0; y < this.rows; y++) {
      this.field[y] = [];
      for (let x = 0; x < this.cols; x++) {
        const angle = noise.octaveNoise(x * scale, y * scale, octaves, 0.5) * Math.PI * 4;
        this.field[y][x] = { angle, magnitude: noise.octaveNoise(x * scale * 1.7, y * scale * 1.7, 3, 0.5) };
      }
    }
  }

  getVector(x, y) {
    const col = Math.floor(x / this.resolution);
    const row = Math.floor(y / this.resolution);

    if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
      return this.field[row][col];
    }
    return { angle: 0, magnitude: 0 };
  }
}

class Sediment {
  constructor(canvas, seed) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.rng = new SeededRandom(seed);

    // Color palette generation
    this.palette = this.generatePalette();

    // Initialize layers
    this.perlin = new PerlinNoise(this.rng);
    this.voronoi = new VoronoiField(this.rng, this.width, this.height, this.rng.int(40, 80));
    this.flowFields = [
      new FlowField(this.rng, this.width, this.height, 20, 0.01, 4),
      new FlowField(this.rng, this.width, this.height, 10, 0.02, 3),
      new FlowField(this.rng, this.width, this.height, 5, 0.04, 2)
    ];

    // Configuration variants
    this.config = {
      substrateStyle: this.rng.choice(['abraded', 'crystalline', 'organic', 'geometric']),
      flowIntensity: this.rng.range(0.3, 1.0),
      meshDensity: this.rng.int(3, 7),
      dustParticles: this.rng.int(2000, 8000),
      distressLevel: this.rng.range(0.2, 0.8)
    };
  }

  generatePalette() {
    const baseHue = this.rng.range(0, 360);
    const scheme = this.rng.choice(['analogous', 'complementary', 'triadic', 'monochrome']);
    const palette = [];

    switch (scheme) {
      case 'analogous':
        for (let i = 0; i < 5; i++) {
          palette.push({
            h: (baseHue + i * 15) % 360,
            s: this.rng.range(40, 80),
            l: this.rng.range(25, 75)
          });
        }
        break;
      case 'complementary':
        palette.push({ h: baseHue, s: this.rng.range(50, 80), l: this.rng.range(30, 60) });
        palette.push({ h: (baseHue + 180) % 360, s: this.rng.range(50, 80), l: this.rng.range(30, 60) });
        palette.push({ h: (baseHue + 30) % 360, s: this.rng.range(30, 50), l: this.rng.range(40, 70) });
        palette.push({ h: (baseHue + 210) % 360, s: this.rng.range(30, 50), l: this.rng.range(40, 70) });
        break;
      case 'triadic':
        for (let i = 0; i < 3; i++) {
          palette.push({
            h: (baseHue + i * 120) % 360,
            s: this.rng.range(50, 80),
            l: this.rng.range(30, 70)
          });
        }
        palette.push({ h: (baseHue + 60) % 360, s: this.rng.range(30, 50), l: this.rng.range(40, 70) });
        palette.push({ h: (baseHue + 180) % 360, s: this.rng.range(30, 50), l: this.rng.range(40, 70) });
        break;
      case 'monochrome':
        for (let i = 0; i < 5; i++) {
          palette.push({
            h: baseHue,
            s: this.rng.range(10, 60),
            l: 20 + i * 15
          });
        }
        break;
    }

    return palette;
  }

  hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
  }

  renderSubstrateLayer() {
    const imageData = this.ctx.createImageData(this.width, this.height);
    const data = imageData.data;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = (y * this.width + x) * 4;

        // Multi-octave noise for base terrain
        const baseNoise = this.perlin.octaveNoise(x * 0.003, y * 0.003, 6, 0.5);
        const detailNoise = this.perlin.octaveNoise(x * 0.02, y * 0.02, 4, 0.6);

        // Voronoi cell influence
        const cell = this.voronoi.getCell(x, y);
        const cellInfluence = 1 - Math.min(cell.distance / 200, 1);

        // Combine noise sources
        const combined = baseNoise * 0.6 + detailNoise * 0.3 + cellInfluence * 0.1;

        // Map to palette color
        const paletteIndex = Math.floor(Math.abs(combined) * this.palette.length) % this.palette.length;
        const baseColor = this.palette[paletteIndex] || this.palette[0] || { h: 0, s: 50, l: 50 };

        // Add distress/aging
        const distress = this.perlin.octaveNoise(x * 0.05, y * 0.05, 3, 0.7) * this.config.distressLevel;

        const [r, g, b] = this.hslToRgb(
          baseColor.h,
          baseColor.s * (1 - distress * 0.3),
          baseColor.l + distress * 20
        );

        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  renderCrystallineStructures() {
    this.ctx.globalCompositeOperation = 'overlay';

    // Draw Voronoi cells with edge detection
    const cellSize = 2;
    for (let y = 0; y < this.height; y += cellSize) {
      for (let x = 0; x < this.width; x += cellSize) {
        const cell = this.voronoi.getCell(x, y);
        const edgeWeight = this.voronoi.getEdgeWeight(x, y, 1.08);

        if (edgeWeight > 0) {
          const [r, g, b] = this.hslToRgb(cell.color.h, cell.color.s, cell.color.l);
          this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.6)`;
          this.ctx.fillRect(x, y, cellSize, cellSize);
        } else {
          const [r, g, b] = this.hslToRgb(cell.color.h, cell.color.s * 0.5, cell.color.l + 10);
          this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.15)`;
          this.ctx.fillRect(x, y, cellSize, cellSize);
        }
      }
    }

    this.ctx.globalCompositeOperation = 'source-over';
  }

  renderFlowNetworks() {
    this.ctx.globalCompositeOperation = 'soft-light';

    // Multiple flow field layers with different properties
    this.flowFields.forEach((field, fieldIndex) => {
      const particlesPerField = this.rng.int(800, 1500);
      const strokeWeight = 1.5 - fieldIndex * 0.3;

      for (let i = 0; i < particlesPerField; i++) {
        let x = this.rng.range(0, this.width);
        let y = this.rng.range(0, this.height);

        const paletteColor = this.rng.choice(this.palette) || { h: 0, s: 50, l: 50 };
        const [r, g, b] = this.hslToRgb(paletteColor.h, paletteColor.s, paletteColor.l);

        this.ctx.beginPath();
        this.ctx.moveTo(x, y);

        const steps = this.rng.int(20, 100);
        for (let step = 0; step < steps; step++) {
          const vector = field.getVector(x, y);
          const stepSize = 2 * vector.magnitude * this.config.flowIntensity;

          x += Math.cos(vector.angle) * stepSize;
          y += Math.sin(vector.angle) * stepSize;

          if (x < 0 || x > this.width || y < 0 || y > this.height) break;

          this.ctx.lineTo(x, y);
        }

        const alpha = 0.1 + fieldIndex * 0.05;
        this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        this.ctx.lineWidth = strokeWeight;
        this.ctx.stroke();
      }
    });

    this.ctx.globalCompositeOperation = 'source-over';
  }

  renderOpticalMeshes() {
    this.ctx.globalCompositeOperation = 'screen';

    const meshLayers = this.config.meshDensity;

    for (let layer = 0; layer < meshLayers; layer++) {
      const gridSize = this.rng.range(30, 120);
      const rotation = this.rng.range(0, Math.PI);
      const offsetX = this.rng.range(0, gridSize);
      const offsetY = this.rng.range(0, gridSize);

      this.ctx.save();
      this.ctx.translate(this.width / 2, this.height / 2);
      this.ctx.rotate(rotation);
      this.ctx.translate(-this.width / 2, -this.height / 2);

      const paletteColor = this.rng.choice(this.palette);
      const [r, g, b] = this.hslToRgb(paletteColor.h, paletteColor.s + 20, paletteColor.l + 10);

      // Triangular mesh
      for (let y = -this.height; y < this.height * 2; y += gridSize) {
        for (let x = -this.width; x < this.width * 2; x += gridSize) {
          const noiseVal = this.perlin.noise((x + offsetX) * 0.01, (y + offsetY) * 0.01);

          if (noiseVal > 0.2) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + gridSize, y + gridSize / 2);
            this.ctx.lineTo(x, y + gridSize);
            this.ctx.closePath();

            const alpha = 0.02 + Math.abs(noiseVal) * 0.08;
            this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            this.ctx.fill();
          }
        }
      }

      this.ctx.restore();
    }

    this.ctx.globalCompositeOperation = 'source-over';
  }

  renderAtmosphericDust() {
    this.ctx.globalCompositeOperation = 'lighten';

    const particles = [];
    for (let i = 0; i < this.config.dustParticles; i++) {
      particles.push({
        x: this.rng.range(0, this.width),
        y: this.rng.range(0, this.height),
        size: this.rng.range(0.5, 3),
        drift: this.rng.range(-1, 1)
      });
    }

    particles.forEach(p => {
      const flowVector = this.flowFields[0].getVector(p.x, p.y);
      const localNoise = this.perlin.noise(p.x * 0.01, p.y * 0.01);

      const paletteIdx = Math.floor(Math.abs(localNoise) * this.palette.length) % this.palette.length;
      const paletteColor = this.palette[paletteIdx] || this.palette[0];
      const [r, g, b] = this.hslToRgb(paletteColor.h, paletteColor.s * 0.6, paletteColor.l + 30);

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.15 + Math.abs(localNoise) * 0.3})`;
      this.ctx.fill();
    });

    this.ctx.globalCompositeOperation = 'source-over';
  }

  renderSurfaceAberrations() {
    this.ctx.globalCompositeOperation = 'multiply';

    // Fine detail texture overlay
    const detail = 3;
    for (let y = 0; y < this.height; y += detail) {
      for (let x = 0; x < this.width; x += detail) {
        const noise1 = this.perlin.octaveNoise(x * 0.1, y * 0.1, 3, 0.5);
        const noise2 = this.perlin.octaveNoise(x * 0.05, y * 0.05, 4, 0.6);

        const combined = noise1 * 0.5 + noise2 * 0.5;

        if (Math.abs(combined) > 0.6) {
          const brightness = 255 - Math.floor(Math.abs(combined) * 40);
          this.ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, 0.1)`;
          this.ctx.fillRect(x, y, detail, detail);
        }
      }
    }

    this.ctx.globalCompositeOperation = 'source-over';
  }

  renderColorModulation() {
    this.ctx.globalCompositeOperation = 'overlay';

    // Large-scale color washes
    const gradient = this.ctx.createRadialGradient(
      this.width * this.rng.range(0.3, 0.7),
      this.height * this.rng.range(0.3, 0.7),
      0,
      this.width / 2,
      this.height / 2,
      Math.max(this.width, this.height) * 0.8
    );

    const color1 = this.rng.choice(this.palette) || { h: 0, s: 50, l: 50 };
    const color2 = this.rng.choice(this.palette) || { h: 180, s: 50, l: 50 };

    const [r1, g1, b1] = this.hslToRgb(color1.h, color1.s, color1.l);
    const [r2, g2, b2] = this.hslToRgb(color2.h, color2.s, color2.l);

    gradient.addColorStop(0, `rgba(${r1}, ${g1}, ${b1}, 0.15)`);
    gradient.addColorStop(1, `rgba(${r2}, ${g2}, ${b2}, 0.15)`);

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.globalCompositeOperation = 'source-over';
  }

  renderInterferencePatterns() {
    this.ctx.globalCompositeOperation = 'overlay';

    // Create wave interference patterns (Kane-inspired optical effects)
    const numWaves = this.rng.int(3, 6);
    const waveCenters = [];

    for (let i = 0; i < numWaves; i++) {
      waveCenters.push({
        x: this.rng.range(0, this.width),
        y: this.rng.range(0, this.height),
        frequency: this.rng.range(0.01, 0.03),
        phase: this.rng.range(0, Math.PI * 2)
      });
    }

    const step = 4;
    for (let y = 0; y < this.height; y += step) {
      for (let x = 0; x < this.width; x += step) {
        let interference = 0;

        // Sum all wave contributions
        for (const wave of waveCenters) {
          const dist = Math.sqrt((x - wave.x) ** 2 + (y - wave.y) ** 2);
          interference += Math.sin(dist * wave.frequency + wave.phase);
        }

        interference /= numWaves;

        if (Math.abs(interference) > 0.5) {
          const paletteColor = this.rng.choice(this.palette);
          const [r, g, b] = this.hslToRgb(paletteColor.h, paletteColor.s * 0.7, paletteColor.l);
          const alpha = Math.abs(interference) * 0.1;

          this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          this.ctx.fillRect(x, y, step, step);
        }
      }
    }

    this.ctx.globalCompositeOperation = 'source-over';
  }

  renderGranularTexture() {
    this.ctx.globalCompositeOperation = 'darken';

    // Fine-grain noise similar to Rayner's abraded surfaces
    const grainDensity = this.rng.range(0.3, 0.7);
    const totalGrains = Math.floor(this.width * this.height * grainDensity * 0.001);

    for (let i = 0; i < totalGrains; i++) {
      const x = this.rng.range(0, this.width);
      const y = this.rng.range(0, this.height);
      const size = this.rng.range(0.5, 2);

      // Noise-influenced grain intensity
      const localNoise = this.perlin.noise(x * 0.05, y * 0.05);
      const intensity = Math.floor(200 + localNoise * 55);

      this.ctx.fillStyle = `rgba(${intensity}, ${intensity}, ${intensity}, 0.05)`;
      this.ctx.fillRect(x, y, size, size);
    }

    this.ctx.globalCompositeOperation = 'source-over';
  }

  renderRecursiveSubdivision() {
    this.ctx.globalCompositeOperation = 'soft-light';

    // De Giuli-inspired emergent complexity from simple recursive rules
    const subdivide = (x, y, width, height, depth, maxDepth) => {
      if (depth >= maxDepth) return;

      const splitNoise = this.perlin.noise(x * 0.005, y * 0.005);

      if (Math.abs(splitNoise) > 0.3 && width > 20 && height > 20) {
        const paletteColor = this.rng.choice(this.palette) || { h: 0, s: 50, l: 50 };
        const [r, g, b] = this.hslToRgb(paletteColor.h, paletteColor.s, paletteColor.l);

        this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.1 / (depth + 1)})`;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, width, height);

        // Random subdivision direction
        if (this.rng.next() > 0.5) {
          // Vertical split
          const splitPoint = this.rng.range(0.3, 0.7);
          subdivide(x, y, width * splitPoint, height, depth + 1, maxDepth);
          subdivide(x + width * splitPoint, y, width * (1 - splitPoint), height, depth + 1, maxDepth);
        } else {
          // Horizontal split
          const splitPoint = this.rng.range(0.3, 0.7);
          subdivide(x, y, width, height * splitPoint, depth + 1, maxDepth);
          subdivide(x, y + height * splitPoint, width, height * (1 - splitPoint), depth + 1, maxDepth);
        }
      }
    };

    const numRegions = this.rng.int(2, 5);
    for (let i = 0; i < numRegions; i++) {
      const startX = this.rng.range(0, this.width * 0.5);
      const startY = this.rng.range(0, this.height * 0.5);
      const regionWidth = this.rng.range(this.width * 0.3, this.width * 0.7);
      const regionHeight = this.rng.range(this.height * 0.3, this.height * 0.7);

      subdivide(startX, startY, regionWidth, regionHeight, 0, this.rng.int(3, 6));
    }

    this.ctx.globalCompositeOperation = 'source-over';
  }

  renderColorFieldDistortion() {
    this.ctx.globalCompositeOperation = 'hue';

    // Create zones of color shift using noise fields
    const numZones = this.rng.int(2, 4);

    for (let zone = 0; zone < numZones; zone++) {
      const centerX = this.rng.range(0, this.width);
      const centerY = this.rng.range(0, this.height);
      const radius = this.rng.range(this.width * 0.2, this.width * 0.6);
      const hueShift = this.rng.range(-30, 30);

      const gradient = this.ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius
      );

      const baseColor = this.rng.choice(this.palette) || { h: 0, s: 50, l: 50 };
      const shiftedHue = (baseColor.h + hueShift + 360) % 360;
      const [r, g, b] = this.hslToRgb(shiftedHue, baseColor.s * 0.6, baseColor.l);

      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.3)`);
      gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.15)`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.width, this.height);
    }

    this.ctx.globalCompositeOperation = 'source-over';
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Layer rendering sequence (order matters for optical effects)
    console.log('Rendering substrate layer...');
    this.renderSubstrateLayer();

    console.log('Rendering crystalline structures...');
    this.renderCrystallineStructures();

    console.log('Rendering flow networks...');
    this.renderFlowNetworks();

    console.log('Rendering optical meshes...');
    this.renderOpticalMeshes();

    console.log('Rendering atmospheric dust...');
    this.renderAtmosphericDust();

    console.log('Rendering surface aberrations...');
    this.renderSurfaceAberrations();

    console.log('Rendering color modulation...');
    this.renderColorModulation();

    console.log('Rendering interference patterns...');
    this.renderInterferencePatterns();

    console.log('Rendering granular texture...');
    this.renderGranularTexture();

    console.log('Rendering recursive subdivision...');
    this.renderRecursiveSubdivision();

    console.log('Rendering color field distortion...');
    this.renderColorFieldDistortion();

    console.log('Render complete.');
  }
}

// Export for use in HTML
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Sediment;
}
