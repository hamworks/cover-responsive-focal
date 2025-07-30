# Cover Responsive Focal

A WordPress plugin that extends the standard Gutenberg Cover block with device-specific responsive focal points. Set optimal background image positions for mobile, tablet, and desktop devices.

## Overview

Cover Responsive Focal provides responsive focal point functionality while maintaining complete backward compatibility with existing Cover blocks. When no responsive settings are configured, blocks behave exactly like standard Cover blocks.

### Key Features

- **Device-Specific Focal Points**: Set different focal points for Mobile (≤600px) and Tablet (601px-782px)
- **Gutenberg Standards Compliant**: Follows official WordPress breakpoint specifications
- **100% Backward Compatible**: Existing Cover blocks work exactly as before
- **Real-Time Preview**: See changes instantly with editor device preview buttons
- **Lightweight Design**: Minimal markup with performance-focused implementation
- **CSS Optimization**: CSS minification, duplicate media query merging, caching

## Requirements

- **WordPress**: 6.8 or higher
- **PHP**: 7.4 or higher
- **Browser**: CSS `object-position` property support

## Installation

### Development Installation

```bash
# Navigate to plugins directory
cd /path/to/wordpress/wp-content/plugins/

# Clone repository
git clone git@github.com:hamworks/cover-responsive-focal.git

# Install dependencies
cd cover-responsive-focal
npm install

# Build assets
npm run build
```

## Usage

### Basic Usage

1. **Add Cover Block**: Add a Cover block and set background image as usual
2. **Open Responsive Settings**: Find "Responsive Focal Point" in the block inspector sidebar
3. **Configure Device Settings**: Toggle mobile or tablet focal points on/off
4. **Set Focal Points**: Use the visual picker to set optimal positions
5. **Preview Results**: Use editor preview buttons to see changes instantly

### Detailed Instructions

#### Setting Mobile Focal Points

1. Select the Cover block
2. Expand "Responsive Focal Point" in the settings sidebar
3. Enable "Mobile (600px and below)" toggle
4. Click optimal position on the focal point picker
5. Verify results using "Mobile" preview in editor toolbar

#### Setting Tablet Focal Points

1. Follow similar steps to enable "Tablet (601px-782px)" toggle
2. Set tablet-specific focal point
3. Verify with "Tablet" preview

#### Desktop Display

Desktop (783px and above) uses the standard Cover block focal point setting. Responsive focal points are not applied.

### Breakpoint Specifications

This plugin follows [Gutenberg's standard breakpoints](https://github.com/WordPress/gutenberg/blob/trunk/packages/base-styles/_breakpoints.scss):

- **Mobile**: 600px and below
- **Tablet**: 601px to 782px
- **Desktop**: 783px and above (uses standard focalPoint attribute)

## Technical Specifications

### Architecture

- **Frontend**: TypeScript + React (WordPress Gutenberg components)
- **Backend**: PHP 7.4+ (WordPress Plugin API)
- **Build Tools**: @wordpress/scripts (webpack + Babel)
- **CSS Implementation**: CSS object-position property + media queries

### Generated CSS Example

```css
@media (max-width: 600px) {
  [data-fp-id="crf-123"] .wp-block-cover__image-background,
  [data-fp-id="crf-123"] .wp-block-cover__video-background {
    object-position: 60% 40% !important;
  }
}

@media (min-width: 601px) and (max-width: 782px) {
  [data-fp-id="crf-123"] .wp-block-cover__image-background,
  [data-fp-id="crf-123"] .wp-block-cover__video-background {
    object-position: 30% 70% !important;
  }
}
```

### File Structure

```
cover-responsive-focal/
├── build/                     # Compiled assets
├── src/                       # TypeScript/React source code
│   ├── index.tsx              # Main entry point
│   ├── inspector-controls.tsx # Responsive focal point settings UI
│   ├── types.ts               # TypeScript type definitions
│   └── utils/                 # Utility functions
├── includes/                  # PHP classes
│   ├── class-validator.php    # Validation class
│   ├── class-css-optimizer.php # CSS optimization class
│   ├── class-block-renderer.php # Block rendering
│   └── class-asset-manager.php # Asset management
├── tests/                     # Test files
├── cover-responsive-focal.php # Main plugin file
├── package.json               # npm configuration
└── README.md                  # This file
```

## Developer Information

### Development Environment Setup

#### Quick Start

```bash
# Clone repository
git clone git@github.com:hamworks/cover-responsive-focal.git
cd cover-responsive-focal

# Install dependencies
npm install
composer install

# Start development server
npm run start

# Setup WordPress environment (using wp-env)
npm run env start
```

### Available Scripts

```bash
# Development build (watch mode)
npm run start

# Production build
npm run build

# Code formatting
npm run format

# Run linter
npm run lint

# Run tests
npm run test           # Jest unit tests
npm run test:php       # PHPUnit
npm run test:e2e       # Playwright E2E tests

# Type checking
npm run type-check

# Create plugin ZIP
npm run plugin-zip
```

### Testing

This plugin provides comprehensive test coverage:

- **Unit Tests**: Jest (JavaScript/TypeScript) + PHPUnit (PHP)
- **Integration Tests**: WordPress environment block integration tests
- **E2E Tests**: Playwright browser tests
- **Security Tests**: XSS prevention, CSS injection protection
- **Performance Tests**: CSS generation time, memory usage

### Contributing

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

#### Coding Standards

- **JavaScript/TypeScript**: @wordpress/eslint-plugin/recommended
- **PHP**: WordPress Coding Standards (PHPCS)
- **CSS**: @wordpress/stylelint-config
- **Commit Messages**: Conventional Commits specification

## Extensibility

### Current Implementation

The plugin currently uses WordPress core hooks and filters:

- **Block Registration**: Extends the core Cover block via `blocks.registerBlockType` filter
- **Frontend Rendering**: Uses `render_block` filter to inject responsive CSS
- **Asset Management**: Leverages WordPress standard asset enqueuing

### Future Extension Points

The plugin architecture is designed to support future extensibility through filter hooks. Potential extension points for future versions may include:

- CSS generation customization
- Custom breakpoint definitions
- UI component customization
- Performance optimization settings

### Current JavaScript Hooks

The plugin uses WordPress Gutenberg's standard hook system:

```javascript
// Block extension (implemented)
wp.hooks.addFilter(
    'blocks.registerBlockType',
    'crf/extend-cover-block',
    (settings, name) => {
        // Extends Cover block with responsive focal attributes
    }
);
```

## FAQ

### Q: Will this affect my existing Cover blocks?

A: No. Existing Cover blocks without responsive focal points work exactly as before. The plugin only adds functionality when specifically configured.

### Q: What happens if I deactivate the plugin?

A: Responsive focal point settings will stop working, but your standard focal point settings remain intact. No data is lost.

### Q: Does this work with video backgrounds?

A: Yes! The plugin works with both image and video Cover blocks.

### Q: What's the performance impact?

A: Minimal. CSS optimization features ensure generated CSS is minified and cached for optimal performance.

## Changelog

### 0.1.0 (2024-12-XX)

- Initial release
- Mobile and tablet responsive focal point functionality
- Gutenberg standard breakpoint compliance
- CSS optimization features (minification, duplicate merging, caching)
- Comprehensive test suite
- WordPress 6.1+ support

## License

This plugin is released under the GPL v2 or later license.

## Support

- **Issue Tracker**: [GitHub Issues](https://github.com/hamworks/cover-responsive-focal/issues)
- **Documentation**: [Project Wiki](https://github.com/hamworks/cover-responsive-focal/wiki)
- **WordPress.org Support**: [Support Forum](https://wordpress.org/support/plugin/cover-responsive-focal)

## Author

- **Developer**: mel_cha
- **GitHub Profile**: [@chiilog](https://github.com/chiilog)

## Acknowledgments

- WordPress Development Team
- Gutenberg Project
- Community Contributors

---
