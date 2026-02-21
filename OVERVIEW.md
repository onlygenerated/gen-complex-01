# Sediment - Technical Overview

## Artist Research Summary

### Harvey Rayner
British generative artist focused on "imperfect geometric shapes and abstract imagination." Key techniques studied:
- Multiple texture algorithms combined in single pieces (Covehithe series)
- Algorithmic distress/aging - surfaces appearing abraded by natural forces
- Grid-based layering with color modulation
- Generative color palettes (not preset schemes)
- Philosophy: "The key to expression is limitation"

### Matt Kane
Pioneering crypto artist working with code and data. Key techniques studied:
- 24+ separate synchronized layers (Right Place & Right Time)
- Optical color interactions through layer transparency
- Temporal dynamics and hidden algorithmic triggers (Gazers)
- Mesh-like geometric networks
- Dense multi-layered compositions creating visual complexity

### Eric De Giuli
Theoretical physicist and generative artist. Key techniques studied:
- Emergence of complexity from simple systems
- "Deceptive coherence masking complex reality" (Glass project)
- Self-organization and pattern emergence
- Ambient motion and subtle evolution
- Scientific approach to algorithmic art

## System Design

Sediment synthesizes these approaches into 11 interacting layers:

1. **Substrate** - Multi-octave Perlin noise + Voronoi influence (Rayner's textural base)
2. **Crystalline Structures** - Voronoi edge detection with color mapping (mineral deposits)
3. **Flow Networks** - 3 separate flow fields at different scales (erosion patterns)
4. **Optical Meshes** - 3-7 rotated triangular grids (Kane's layered geometry)
5. **Atmospheric Dust** - 2000-8000 particles with flow influence (luminous effects)
6. **Surface Aberrations** - Fine-detail texture overlay (Rayner's distress technique)
7. **Color Modulation** - Radial gradient washes (global harmony)
8. **Interference Patterns** - Wave superposition (Kane's optical effects)
9. **Granular Texture** - Fine-grain noise (Rayner's abraded surfaces)
10. **Recursive Subdivision** - Space-filling emergence (De Giuli's complexity)
11. **Color Field Distortion** - Localized hue shifts (chromatic depth)

## Blend Modes Strategy

Canvas composite operations create optical mixing:
- **Overlay**: Color tinting (substrate, color modulation, interference)
- **Soft-light**: Gentle contrast (flow networks, subdivision)
- **Screen**: Additive light (optical meshes)
- **Multiply**: Shadows (surface aberrations)
- **Darken**: Surface imperfections (granular texture)
- **Lighten**: Luminous particles (dust)
- **Hue**: Color transformation (field distortion)

## Visual Complexity Metrics

- 11 rendering passes with different blend modes
- 40-80 Voronoi cells
- 2400-4500 flow field particles across 3 fields
- 2000-8000 atmospheric particles
- 3-7 mesh layers with triangular grids
- Thousands of granular texture points
- 3-6 wave interference sources
- 2-5 recursive subdivision regions (3-6 depth)
- 2-4 color distortion zones

Total pixel operations: millions per piece.

## Determinism

SeededRandom class ensures reproducibility:
- Linear congruential generator: `seed = (seed * 9301 + 49297) % 233280`
- All randomness derived from single seed value
- Identical seed = identical output (pixel-perfect)
- Perlin noise permutation table seeded from RNG

## Performance

1200x1200px canvas:
- Substrate layer: ~500ms (1.44M pixels processed)
- Crystalline structures: ~300ms (Voronoi distance calculations)
- Flow networks: ~800ms (3 fields × 800-1500 particles)
- Optical meshes: ~400ms (3-7 layers × grid cells)
- Atmospheric dust: ~300ms (2000-8000 particles)
- Surface aberrations: ~200ms (fine-detail pass)
- Other layers: ~500ms combined

Total render time: 2-4 seconds (browser/hardware dependent)

## Output Characteristics

Each piece exhibits:
- High visual information density
- Multiple focal regions (no single center)
- Layered depth through transparency
- Emergent patterns from system interactions
- Fine details rewarding close inspection
- Cohesive color palette with localized variation
- Balance between order (grids, flow) and chaos (noise, particles)

## Artistic Lineage

Sediment sits at the intersection of:
- **Rayner's textural sophistication** - Abraded surfaces, algorithmic aging
- **Kane's optical complexity** - Multi-layer transparency, interference effects
- **De Giuli's emergent systems** - Simple rules generating complex outcomes

The system produces work that is computationally intensive, visually dense, and rewards extended viewing—characteristics shared by all three artists.
