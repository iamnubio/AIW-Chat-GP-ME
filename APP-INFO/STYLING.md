# Styling Documentation

## Tailwind CSS Configuration

### Theme Configuration

The application uses a custom Tailwind CSS configuration for consistent styling.

```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Custom theme extensions
    },
  },
  plugins: [],
};
```

### Color Scheme

Primary colors used throughout the application:

- Background gradients: gray-950 to blue-950
- Accent colors: blue-400, blue-900
- Text colors: white, gray-400, zinc-400
- Border colors: blue-900/50

### Common Classes

#### Layout
```css
/* Container */
.min-h-screen
.max-w-4xl
.mx-auto
.px-4

/* Flex layouts */
.flex
.items-center
.justify-between
.gap-{size}
```

#### Cards
```css
/* Card container */
.bg-gray-950/50
.backdrop-blur-sm
.border
.border-blue-900/50
.rounded-lg
.shadow-xl

/* Card sections */
.p-6
.space-y-4
```

#### Forms
```css
/* Input fields */
.bg-gray-900/80
.border
.border-blue-900/50
.rounded-lg
.px-4
.py-2
.text-white

/* Buttons */
.bg-blue-900/20
.hover:bg-blue-900/30
.text-white
.rounded-lg
.transition-colors
```

### Component-Specific Styles

#### Chat Interface
```css
/* Message bubbles */
.max-w-[80%]
.rounded-2xl
.px-4
.py-2

/* User message */
.bg-blue-900/20
.rounded-tr-sm

/* Assistant message */
.bg-gray-900/80
.rounded-tl-sm
```

#### Navigation
```css
/* Menu items */
.flex
.items-center
.gap-2
.px-4
.py-2
.text-gray-400
.hover:text-white
.hover:bg-blue-900/20
.rounded-lg
.transition-colors
```

### Responsive Design

#### Breakpoints
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

#### Examples
```css
/* Responsive grid */
.grid
.gap-4
.md:grid-cols-2

/* Responsive text */
.text-sm
.md:text-base
.lg:text-lg
```

### Animations

#### Transitions
```css
/* Standard transition */
.transition-all
.duration-300
.ease-in-out

/* Transform transitions */
.transform
.hover:scale-105
```

#### Loading States
```css
/* Spinner */
.animate-spin

/* Fade effects */
.opacity-0
.opacity-100
.transition-opacity
```

### Glass Morphism

```css
/* Glass effect */
.bg-gray-950/50
.backdrop-blur-sm
.border
.border-blue-900/50
```

### Best Practices

1. Consistency
   - Use predefined color schemes
   - Maintain spacing rhythm
   - Follow component patterns

2. Performance
   - Use proper class ordering
   - Minimize custom CSS
   - Optimize for production

3. Accessibility
   - Maintain contrast ratios
   - Use semantic markup
   - Support reduced motion

4. Responsive Design
   - Mobile-first approach
   - Consistent breakpoints
   - Fluid typography

5. Dark Mode
   - Proper contrast
   - Color accessibility
   - Consistent theming