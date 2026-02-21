# Sediment

Multi-layered generative art system inspired by Harvey Rayner, Matt Kane, and Eric de Giuli.

## System Architecture

Sediment combines eleven algorithmic layers that interact to produce emergent visual complexity:

### 1. Substrate Layer
Multi-octave Perlin noise terrain with Voronoi cell influence. Creates base texture resembling geological stratification. Implements Rayner's concept of algorithmic distress—surfaces that appear aged and abraded through mathematical weathering.

### 2. Crystalline Structures
Voronoi diagram with edge detection. Mineral-like deposits form at cell boundaries. Uses 40-80 random seed points with variable influence radii. Renders with overlay blending for optical color mixing.

### 3. Flow Networks
Three separate flow fields at different scales (20px, 10px, 5px resolution). Each field generates 800-1500 particle traces following vector angles derived from multi-octave noise. Creates erosion-like patterns. Renders with soft-light blending, inspired by Kane's layered approach.

### 4. Optical Meshes
3-7 layers of rotated triangular grids with noise-based density variation. Each layer has independent rotation, offset, and scale. Uses screen blending mode for additive light effects, creating mesh-like networks similar to Kane's work.

### 5. Atmospheric Dust
2000-8000 particles with position, size, and drift properties. Local flow field influence creates gravitational clustering. Renders with lighten blend mode for luminous quality.

### 6. Surface Aberrations
Fine-detail texture overlay at 3px resolution. Multi-octave noise creates visual artifacts resembling surface imperfections. Multiply blend mode darkens regions, adding depth.

### 7. Color Modulation
Large-scale radial gradients in overlay mode. Provides global color harmony across all layers, inspired by Rayner's color modulation techniques in Covehithe.

### 8. Interference Patterns
Wave-based optical effects using 3-6 interference sources. Circular wave emanations combine through mathematical superposition, creating constructive/destructive interference zones. Inspired by Kane's optical color interaction systems where layer transparency creates emergent visual effects.

### 9. Granular Texture
Fine-grain surface noise representing 0.03-0.07% pixel coverage. Noise-influenced grain placement creates non-uniform distributions resembling Rayner's abraded surfaces. Darken blend mode adds subtle surface imperfections.

### 10. Recursive Subdivision
Emergent spatial complexity from simple subdivision rules. Regions split based on noise thresholds, creating irregular grid structures. Recursion depth 3-6 levels. Inspired by De Giuli's exploration of how simple rules generate complex emergent patterns.

### 11. Color Field Distortion
Localized hue shifting through radial gradients. 2-4 zones apply regional color transformations using hue blend mode. Creates chromatic aberration effects and unexpected color transitions across the composition, enhancing the sense of visual depth and optical complexity.

## Color System

Four palette generation schemes selected randomly per piece:
- Analogous (5 colors within 75° hue range)
- Complementary (opposing hues with harmonics)
- Triadic (120° hue spacing)
- Monochrome (single hue, varying saturation/lightness)

Base hue randomized 0-360°. All colors generated algorithmically rather than using preset palettes, following Rayner's Fontana approach.

## Technical Details

**Determinism**: SeededRandom class ensures complete reproducibility from seed value. Same seed always generates identical output.

**Rendering**: HTML5 Canvas 2D. Composite operations (overlay, soft-light, screen, multiply, lighten) create optical color mixing without manual blending calculations.

**Performance**: Renders 1200x1200px in 2-5 seconds depending on configuration. Larger particle counts and mesh densities increase render time.

**Configuration variants**: Each seed produces unique values for substrate style, flow intensity, mesh density, dust particle count, and distress level.

## Influences

**Harvey Rayner**: Multiple texture algorithms, algorithmic aging/distress, grid-based layering, generative color systems. Particularly influenced by Covehithe's approach to combining texture algorithms for weathered surfaces.

**Matt Kane**: 24+ separate layers in pieces like "Right Place Right Time", optical color interactions through layer transparency, pulsing patterns, mesh-like geometric networks. Gazers' complex multi-layer structure informed the mesh system.

**Eric De Giuli**: Emergence from underlying complexity, deceptive coherence masking complex systems, ambient motion concepts. Glass project's exploration of how simple rules create complex emergent patterns influenced the flow field implementation.

## Files

- `sediment.js` - Core generative system
- `index.html` - Single piece viewer with generate/save controls
- `gallery.html` - Multi-piece viewer (6 or 12 pieces)
- `README.md` - Technical documentation

## Usage

Open `index.html` in a web browser. Click GENERATE for new pieces. Each piece is deterministic from its displayed seed value. Click SAVE IMAGE to download as PNG.

For comparative viewing, open `gallery.html` to generate multiple pieces simultaneously.

## Implementation Notes

Perlin noise implementation uses permutation table shuffling for noise variation per seed. Voronoi field uses euclidean distance with influence modifiers. Flow fields use vector angles from noise, not direct noise values.

Composite blend modes approximate traditional paint mixing: overlay for color tinting, soft-light for gentle contrast, screen for additive light, multiply for shadows, lighten for luminous particles.

The system prioritizes visual density over sparse minimalism. Multiple interacting subsystems create emergence—patterns that aren't explicitly programmed but arise from system interactions.
