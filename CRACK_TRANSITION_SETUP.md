# Cinematic Crack Transition System

A premium, production-ready screen crack transition effect for React with smooth shard animations, chromatic aberration, and particle dust effects.

## Features

✨ **Premium Quality**
- Voronoi-style asymmetric fracture shards
- Chromatic aberration effect (red/green/blue shift)
- Dust particle system with staggered animation
- Smooth 60fps animations with proper easing

🎯 **Fast & Impactful**
- Total animation duration: ~500ms
- Shard movement: 8-40px (subtle, not explosive)
- Staggered shard animations for depth
- White flash + subtle blur for impact

🎮 **Integration**
- Works seamlessly with React Router
- Easy hook-based API
- No external dependencies beyond Framer Motion
- Responsive and mobile-friendly

## Installation

The components are already created:
- `src/components/CrackTransitionOverlay.jsx` - Main transition overlay
- `src/components/PageTransitionWrapper.jsx` - Router integration wrapper
- `src/hooks/useCrackNavigate.js` - Navigation hook
- `src/hooks/usePageTransition.js` - Transition state hook

## Usage

### Setup in App.jsx

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PageTransitionWrapper from './components/PageTransitionWrapper'
import HomePage from './pages/HomePage'
import GamePage from './pages/GamePage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <BrowserRouter>
      <PageTransitionWrapper>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </PageTransitionWrapper>
    </BrowserRouter>
  )
}
```

### Trigger Transition in Components

```jsx
import { useCrackNavigate } from '../hooks/useCrackNavigate'

export default function HomePage() {
  const { navigateWithCrack } = useCrackNavigate()

  return (
    <div>
      <h1>Welcome</h1>
      <button onClick={() => navigateWithCrack('/game')}>
        Start Game
      </button>
      <button onClick={() => navigateWithCrack('/admin')}>
        Admin Panel
      </button>
    </div>
  )
}
```

## Animation Sequence

1. **Darkening** (0-100ms) - Screen briefly darkens to 15% opacity
2. **Crack Spread** (100-350ms) - Voronoi shards spread outward
3. **White Flash** (150-250ms) - Bright white flash appears
4. **Chromatic Shift** (150-350ms) - Red/green/blue aberration effect
5. **Shard Movement** (100-500ms) - Shards move outward with stagger
6. **Dust Particles** (250-800ms) - Tiny particles fade out
7. **Page Reveal** (350ms) - New page navigated to and revealed

## Customization

### Adjust Shard Count

Edit `CrackTransitionOverlay.jsx`, function `generateVoronoiFractures()`:

```jsx
const gridSize = 4 // Change to 5 or 6 for more shards
```

- Grid 3x3 = 9 shards (faster)
- Grid 4x4 = 16 shards (default, balanced)
- Grid 5x5 = 25 shards (more detail)

### Adjust Animation Duration

Edit the animation durations in `CrackTransitionOverlay.jsx`:

```jsx
// Change total animation time
const timer = setTimeout(onComplete, 550) // Increase for slower motion

// Change shard movement distance
moveDistance: 12 + Math.random() * 20, // Increase for more spread
```

### Adjust Colors & Effects

```jsx
// In ChromaticAberration component
background: `
  linear-gradient(45deg, 
    rgba(255, 0, 0, 0.15) 0%,      // Red intensity
    transparent 33%, 
    rgba(0, 255, 0, 0.15) 66%,     // Green intensity
    rgba(0, 0, 255, 0.15) 100%)    // Blue intensity
`,
```

### Disable Dust Particles

In `CrackTransitionOverlay.jsx`, comment out:
```jsx
{/* <DustParticles isAnimating={isActive} /> */}
```

### Disable Chromatic Aberration

In `CrackTransitionOverlay.jsx`, comment out:
```jsx
{/* <ChromaticAberration /> */}
```

## Performance Tips

- The effect uses GPU-accelerated transforms (`translateX`, `translateY`, `rotateZ`)
- All animations are staggered to prevent simultaneous renders
- `will-change` is implicit through Framer Motion
- Renders at solid 60fps on modern devices
- Mobile-optimized with reduced particle count by default

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 13+)
- Requires GPU acceleration for best performance

## Files Structure

```
src/
├── components/
│   ├── CrackTransitionOverlay.jsx      # Main overlay component
│   └── PageTransitionWrapper.jsx       # Router wrapper
├── hooks/
│   ├── usePageTransition.js            # State management hook
│   └── useCrackNavigate.js             # Navigation hook
└── pages/
    ├── HomePage.jsx
    ├── GamePage.jsx
    └── AdminPage.jsx
```

## Integration with Existing Pages

Replace navigation calls:

**Before:**
```jsx
navigate('/game')
```

**After:**
```jsx
const { navigateWithCrack } = useCrackNavigate()
navigateWithCrack('/game')
```

Then ensure your App component is wrapped with `PageTransitionWrapper`.

## Advanced: Conditional Transitions

Skip the crack effect for certain routes:

```jsx
const { navigateWithCrack } = useCrackNavigate()

const handleNavigate = (path, useCrack = true) => {
  if (useCrack) {
    navigateWithCrack(path)
  } else {
    navigate(path)
  }
}
```

## Troubleshooting

**Effect not showing?**
- Ensure `PageTransitionWrapper` wraps your Routes
- Check z-index (set to 9999, shouldn't conflict)
- Verify Framer Motion is installed

**Shards appearing frozen?**
- Check that transitions state is being updated
- Verify `crack-navigate` event is being dispatched
- Check browser console for errors

**Performance issues?**
- Reduce `gridSize` from 4 to 3
- Reduce particle count in `DustParticles` (currently 20)
- Disable `DustParticles` or `ChromaticAberration`

## Inspired By

- Persona 5 UI transitions
- Cyberpunk 2077 glitch effects
- Honkai: Star Rail screen shatters

Enjoy your premium transition! 🎬
