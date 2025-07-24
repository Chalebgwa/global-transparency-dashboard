# Federica Fragapane-Style Chart Components

This directory contains React components that implement data visualizations inspired by Federica Fragapane's distinctive organic design aesthetic.

## Components Overview

### 🌸 RadialTimeChart.js
**Purpose:** Displays time-series data in a spiral/radial layout
**Inspired by:** Fragapane's circular timeline designs and organic spirals

**Features:**
- Spiral layout with data points flowing outward over time
- Organic color palette with soft pastels
- Smooth Catmull-Rom curves connecting data points
- Animated entrance with staggered timing
- Flower-like center decoration
- Hand-drawn aesthetic with organic shapes

**Props:**
- `data` - Array of {year, value} objects
- `title` - Chart title
- `color` - Primary color (default: '#8E7CC3')
- `formatValue` - Function to format displayed values

### 🌿 OrganicBubbleChart.js
**Purpose:** Visualizes categorical data as connected organic bubbles
**Inspired by:** Fragapane's force-directed layouts and natural clustering

**Features:**
- Force simulation for natural bubble positioning
- Organic color palette with nature-inspired hues
- Connected bubbles with curved paths
- Size-based encoding for data values
- Organic texture overlays and drop shadows
- Animated entrance with physics

**Props:**
- `data` - Object with sectors and total properties
- `title` - Chart title
- `formatValue` - Function to format displayed values

### 🌊 FlowingMultiChart.js
**Purpose:** Compares multiple data series with flowing lines
**Inspired by:** Fragapane's organic line charts and gradient fills

**Features:**
- Smooth flowing curves using Catmull-Rom interpolation
- Organic gradient fills beneath curves
- Floating decorative elements around data points
- Animated line drawing with elastic easing
- Nature-inspired color schemes
- Organic axis styling with dashed grid lines

**Props:**
- `healthData` - Array of {year, value} objects for health data
- `educationData` - Array of {year, value} objects for education data
- `title` - Chart title
- `formatValue` - Function to format displayed values

### 🌺 CircularProgress.js
**Purpose:** Shows progress/scores in a circular format
**Inspired by:** Fragapane's circular indicators and flower motifs

**Features:**
- Organic circular progress ring with rounded ends
- Flower-like center decoration with petals
- Floating organic elements around the ring
- Elastic animation with natural easing
- Gradient fills and organic textures
- Decorative background elements

**Props:**
- `value` - Current value (0-maxValue)
- `maxValue` - Maximum value (default: 100)
- `title` - Chart title
- `color` - Primary color (default: '#8E7CC3')

## Design Principles

### 🎨 Color Palette
All components use Fragapane-inspired organic color palettes:
```javascript
const organicColors = [
  '#E8A598', '#D4B5A5', '#F2D7B3', '#C8E6C9', '#B3D9E3',
  '#E1BEE7', '#FFE0B2', '#FFCCBC', '#DCEDC1', '#F8BBD9'
];
```

### 🌿 Organic Shapes
- Smooth curves using `d3.curveCatmullRom.alpha(0.5)`
- Rounded corners and organic edges
- Hand-drawn aesthetic with natural variations
- Flower and petal motifs as decorative elements

### ✨ Animations
- Staggered entrance animations for organic feel
- Elastic easing (`d3.easeElastic`) for natural movement
- Physics-based simulations for bubble positioning
- Smooth transitions between states

### 📱 Responsive Design
- Adaptive sizing based on container dimensions
- Scalable SVG graphics
- Flexible typography sizing
- Touch-friendly interactive elements

## Technical Implementation

### Dependencies
- **D3.js v7.8.5** - For SVG manipulation, scales, and animations
- **React 18** - Component framework
- **Force Simulation** - For natural bubble positioning
- **SVG Patterns** - For organic textures and gradients

### Performance Considerations
- Efficient D3 selection patterns
- Minimal DOM manipulations
- Optimized animation timing
- Memory cleanup in useEffect

### Browser Compatibility
- Modern browsers with SVG support
- CSS3 gradients and transforms
- ES6+ JavaScript features

## Usage Example

```jsx
import RadialTimeChart from './components/RadialTimeChart';
import OrganicBubbleChart from './components/OrganicBubbleChart';

function Dashboard() {
  const timeData = [
    { year: 2020, value: 1000000 },
    { year: 2021, value: 1200000 },
    // ...
  ];

  const budgetData = {
    year: 2024,
    sectors: {
      health: 1200000,
      education: 800000,
      defense: 600000
    }
  };

  return (
    <div>
      <RadialTimeChart 
        data={timeData}
        title="Budget Over Time"
        color="#8E7CC3"
        formatValue={(v) => `$${v/1000000}M`}
      />
      
      <OrganicBubbleChart 
        data={budgetData}
        title="Budget Breakdown"
        formatValue={(v) => `$${v/1000}K`}
      />
    </div>
  );
}
```

## Customization

### Colors
Modify the organic color arrays in each component to match your brand:
```javascript
const customColors = ['#your-color-1', '#your-color-2', ...];
```

### Animations
Adjust timing and easing in the D3 transition chains:
```javascript
.transition()
.duration(1200)  // Adjust duration
.delay((d, i) => i * 150)  // Adjust stagger
.ease(d3.easeElastic.period(0.3))  // Change easing
```

### Shapes
Modify the curve algorithms for different organic feels:
```javascript
.curve(d3.curveCatmullRom.alpha(0.5))  // More/less organic
.curve(d3.curveCardinal.tension(0.5))  // Alternative organic curve
```

---

**Note:** These components are designed to reflect Federica Fragapane's distinctive data visualization aesthetic, emphasizing organic forms, natural colors, and intuitive data storytelling through nature-inspired designs.