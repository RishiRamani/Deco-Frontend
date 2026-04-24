# Round Customization Guide - FULL CUSTOMIZATION ✅

## Overview
✅ **EVERYTHING IS NOW CUSTOMIZABLE!** Each round can have complete control over:
- **Body element** (main background overlay) 
- **Frame and stage** backgrounds
- **Dialogue bubbles** (background, custom images, all styling)
- **Question and answer** boxes (all styling and colors)
- **Stage characters** (names, images, styling, positioning)
- **All text** classes and appearance

---

## 1. Body Element Customization ⭐ NEW

The **body element** is the main page background. Customize it with gradients, colors, and grid patterns.

### Properties:

```json
"bodyElement": {
  "background": "radial-gradient(...)",
  "gridPattern": "linear-gradient(...),linear-gradient(...)",
  "gridPatternSize": "36px 36px",
  "gridPatternOpacity": 0.2
}
```

**Example - Round 1 (Dark Blue with Pink accents):**
```json
"bodyElement": {
  "background": "radial-gradient(circle at top right, rgba(236, 72, 153, 0.22), transparent 25%), radial-gradient(circle at left center, rgba(59, 130, 246, 0.18), transparent 35%), linear-gradient(180deg, #090b12 0%, #111827 45%, #020617 100%)",
  "gridPattern": "linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)",
  "gridPatternSize": "36px 36px",
  "gridPatternOpacity": 0.2
}
```

---

## 2. Dialogue Box Customization ⭐ NEW - FULL CONTROL

The dialogue bubble can now have **custom images, complete styling, and all text customization**.

### Properties:

```json
"dialogueBox": {
  "background": "linear-gradient(...)",
  "border": "1px solid rgba(...)",
  "color": "#e2e8f0",
  
  // NEW: Custom bubble image
  "bubbleImage": null,  // Set to image URL
  "bubbleImageOpacity": 1,
  "bubbleContainerClass": "rounded-[2rem]",
  "boxShadow": "shadow-[0_25px_80px_...]",
  
  // NEW: All text customization
  "customStyles": {
    "speakerClass": "text-xs uppercase tracking-[0.3em] text-slate-500",
    "textClass": "mt-4 text-base leading-8",
    "transcriptClass": "mt-5 rounded-[1.5rem] border...",
    "continueClass": "mt-5 text-right text-xs...",
    "voicePlayerBgClass": "mt-5 flex items-center...",
    "playButtonClass": "flex-shrink-0 rounded-full...",
    "voiceTextClass": "text-xs text-slate-400"
  }
}
```

**Example with custom styling:**
```json
"dialogueBox": {
  "background": "linear-gradient(135deg, rgba(14, 116, 144, 0.95), rgba(15, 23, 42, 0.95))",
  "border": "1px solid rgba(59, 130, 246, 0.30)",
  "color": "#e2e8f0",
  "bubbleImage": "https://example.com/bubble.png",
  "bubbleImageOpacity": 0.9,
  "customStyles": {
    "speakerClass": "text-xs uppercase tracking-[0.3em] text-cyan-200/80",
    "textClass": "mt-4 text-base leading-8 text-slate-100",
    "transcriptClass": "mt-5 rounded-[1.5rem] border border-white/10 bg-blue-950/20 px-4 py-3 text-sm leading-7 text-blue-100",
    "continueClass": "mt-5 text-right text-xs uppercase tracking-[0.25em] text-cyan-300"
  }
}
```

---

## 3. Question Box Customization

```json
"questionBox": {
  "background": "linear-gradient(...)",
  "border": "1px solid rgba(...)",
  "borderRadiusClass": "rounded-[2rem]",
  "boxShadow": "shadow-[0_35px_100px_...]",
  "numberClass": "text-xs uppercase tracking-[0.3em] text-cyan-200/80",
  "titleClass": "mt-3 max-w-2xl text-2xl font-medium text-white",
  "optionClass": "rounded-[1.5rem] border px-4 py-4 text-left text-sm transition"
}
```

**Example - Round 2 (Bold Emerald):**
```json
"questionBox": {
  "background": "linear-gradient(135deg, rgba(15, 23, 42, 0.94), rgba(34, 197, 94, 0.20))",
  "border": "1px solid rgba(34, 197, 94, 0.15)",
  "borderRadiusClass": "rounded-[2rem]",
  "boxShadow": "shadow-[0_35px_100px_rgba(34,197,94,0.15)]",
  "numberClass": "text-xs uppercase tracking-[0.35em] text-emerald-200/90 font-bold",
  "titleClass": "mt-3 max-w-2xl text-3xl font-bold text-emerald-100",
  "optionClass": "rounded-2xl border px-5 py-5 text-left text-base transition font-semibold"
}
```

---

## 4. Answer Reveal Box Customization

```json
"answerRevealBox": {
  "background": "linear-gradient(...)",
  "border": "1px solid rgba(...)",
  "borderRadiusClass": "rounded-[2rem]",
  "boxShadow": "shadow-[0_35px_100px_...]",
  "labelClass": "text-xs uppercase tracking-[0.35em] text-cyan-100/70",
  "answerClass": "mt-6 text-xl leading-8 text-white",
  "questionClass": "mt-3 text-sm text-slate-300"
}
```

---

## 5. Stage Characters Customization ⭐ NEW - COMPLETE CONTROL

Characters now have full customization: names, images, styling, colors, shadows, and more!

```json
"stageCharacters": {
  "curator": {
    "name": "Aurora",
    "accent": "#e11d48",
    "side": "left",
    "size": "18rem",
    "image": "/characters/custom.svg",  // Custom image URL
    "style": { "bottom": "1rem", "left": "2rem" },
    
    // NEW: Full customization
    "customStyles": {
      "borderRadiusClass": "rounded-[3rem]",
      "borderColor": "#e11d4866",
      "shadowClass": "shadow-[0_35px_100px_rgba(225,29,72,0.35)]",
      "containerTransition": "transition duration-500",
      "imageClass": "w-full h-full object-cover",
      "nameClass": "text-lg font-bold text-rose-200",
      "nameBackgroundClass": "bg-transparent",
      "fallbackBackground": "radial-gradient(...)"
    }
  },
  "signal": {
    // Same structure as curator
  }
}
```

**Example with background styling:**
```json
"curator": {
  "name": "Mystic",
  "accent": "#667eea",
  "image": "/characters/mystic.svg",
  "size": "20rem",
  "style": { "bottom": "0rem", "left": "1rem" },
  "customStyles": {
    "borderRadiusClass": "rounded-full",
    "borderColor": "#667eea88",
    "shadowClass": "shadow-[0_0_40px_rgba(102,126,234,0.5)]",
    "nameClass": "text-xl font-bold text-purple-300",
    "nameBackgroundClass": "bg-purple-500/20 rounded-full px-4 py-2"
  }
}
```

---

## 6. Frame & Stage Customization

### Frame (Scene Container)
```json
"frame": {
  "minHeight": "calc(100vh - 9rem)",
  "background": "radial-gradient(...)"
}
```

### Stage (Playing Area Background)
```json
"stage": {
  "backgroundImage": "linear-gradient(...), radial-gradient(...)"
}
```

---

## Complete Example: Full Custom Round

See `/public/rounds/round-1.json` and `/public/rounds/round-2.json` for complete working examples with:
- Custom body element backgrounds
- Custom dialogue box styling with optional images
- Custom character names and styling
- Custom question and answer box appearances

---

## Available Tailwind Utilities

### Text Sizes
- `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`, `text-4xl`

### Font Weights
- `font-thin`, `font-light`, `font-normal`, `font-medium`, `font-semibold`, `font-bold`, `font-black`

### Text Colors
- `text-white`, `text-slate-*`, `text-cyan-*`, `text-emerald-*`, `text-yellow-*`, `text-red-*`, etc.
- With opacity: `text-cyan-200/80`, `text-emerald-100/90`, `text-purple-300/70`

### Border Radius
- `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-3rem`, `rounded-full`
- Bracket syntax: `rounded-[1.5rem]`, `rounded-[2rem]`

### Shadows
- `shadow-lg`, `shadow-xl`
- Custom: `shadow-[0_35px_100px_rgba(2,6,23,0.45)]`

### Letter Spacing
- `tracking-tighter`, `tracking-tight`, `tracking-normal`, `tracking-wide`, `tracking-wider`, `tracking-widest`

### Line Height
- `leading-*` values (4, 5, 6, 7, 8, 9, 10, loose, relaxed)

---

## Tips & Best Practices

1. **Color Consistency**: Use accent colors across dialogue, characters, and UI
2. **Gradient Layering**: Combine gradients: `radial-gradient(...), linear-gradient(...)`
3. **Opacity**: Use RGB with opacity: `rgba(34, 197, 94, 0.24)`
4. **Character Positioning**: Adjust `size` and `style` to avoid overlap
5. **Text Contrast**: Ensure good color contrast against backgrounds
6. **Testing**: Test at different zoom levels
7. **Performance**: Optimize image URLs for load time

---

## Troubleshooting

**Custom bubble image not showing?**
- Verify the image URL is correct
- Check browser console for CORS errors
- Ensure `bubbleImageOpacity` is 0.5-1

**Character names not visible?**
- Set `nameBackgroundClass` to something visible: `bg-black/50 rounded-full px-3 py-1`
- Adjust `nameClass` color for contrast

**Gradients looking wrong?**
- Use underscore `_` instead of space: `rgba(255,255,255,0.05)_1px`
- Test in a CSS gradient generator first

---

## Need Help?

Everything is controlled via JSON in round files. Update values and reload to see changes immediately! 🚀
