=== Cover Responsive Focal ===
Contributors:      mel_cha
Tags:              block, responsive, focal-point, cover, gutenberg, mobile, tablet, editor
Requires at least: 6.8
Tested up to:      6.8
Requires PHP:      7.4
Stable tag:        0.1.0
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

Extend WordPress Cover blocks with device-specific focal points for mobile, tablet, and desktop responsiveness. Gutenberg-standard compliant.

== Description ==

Cover Responsive Focal extends the standard WordPress Cover block to support device-specific focal points, allowing you to set different background image positions for mobile, tablet, and desktop devices. This ensures optimal image display across all screen sizes without compromising backward compatibility.

**Key Features:**

* **Device-Specific Settings**: Set different focal points for Mobile (≤600px) and Tablet (601px-782px)
* **Gutenberg Standards Compliant**: Follows official WordPress breakpoint specifications
* **100% Backward Compatible**: Existing Cover blocks work exactly as before
* **Real-Time Preview**: See changes instantly with editor device preview buttons
* **Lightweight & Optimized**: Minimal markup, CSS optimization with caching
* **Zero Configuration**: Works out-of-the-box with intuitive interface

**Supported Breakpoints:**

Following [Gutenberg's official breakpoint standards](https://github.com/WordPress/gutenberg/blob/trunk/packages/base-styles/_breakpoints.scss):

* **Mobile**: 600px and below
* **Tablet**: 601px to 782px
* **Desktop**: 783px and above (uses standard focal point)

**Perfect For:**

* **Content Creators**: Optimize hero images for mobile without technical knowledge
* **Web Designers**: Precise responsive control without custom CSS
* **Theme Developers**: Enhanced responsive capabilities for client projects
* **Marketing Teams**: Ensure brand messages remain visible on all devices

**Technical Highlights:**

* Built with TypeScript + React using WordPress Gutenberg components
* Test-driven development with comprehensive test coverage
* CSS optimization: minification, duplicate media query merging, caching
* Security-first: XSS prevention, input validation, sanitization
* Performance optimized: Sub-200ms CSS generation, minimal memory footprint

== How It Works ==

1. **Add Cover Block**: Create a Cover block and add your background image as usual
2. **Open Responsive Settings**: Find "Responsive Focal Point" in the block inspector
3. **Enable Device Settings**: Toggle mobile or tablet focal points on/off
4. **Set Focal Points**: Use the visual picker to set optimal positions
5. **Preview Results**: Use editor preview buttons to see changes instantly

The plugin generates optimized CSS media queries that override the default focal point only for specified devices, ensuring perfect fallback behavior.

**Requirements:**

* WordPress 6.8 or higher
* PHP 7.4 or higher
* Modern browser with CSS `object-position` support

== Frequently Asked Questions ==

= Will this affect my existing Cover blocks? =

No. Existing Cover blocks without responsive focal points work exactly as before. The plugin only adds functionality when specifically configured.

= What happens if I deactivate the plugin? =

Responsive focal point settings will stop working, but your standard focal point settings remain intact. No data is lost.

= Does this work with video backgrounds? =

Yes! The plugin works with both image and video Cover blocks.

= How does this impact site performance? =

Minimal impact. The plugin includes CSS optimization features (minification, caching, duplicate removal) to ensure optimal performance.

= Is this compatible with my theme? =

Yes. The plugin works with any theme that supports WordPress Cover blocks, including block themes and classic themes.

= Can I use this with page builders? =

The plugin specifically enhances WordPress's native Cover block in the Gutenberg editor. Compatibility with third-party page builders varies.

= How do I report bugs or request features? =

Please use the [GitHub Issues](https://github.com/chiilog/cover-responsive-focal/issues) for bug reports and feature requests.

== Usage Examples ==

**Hero Image Optimization:**
Perfect for ensuring faces or important elements remain visible on mobile devices when desktop crops might cut them off.

**Product Photography:**
E-commerce sites can ensure product details are prominently displayed across all device sizes.

**Landscape Photography:**
Travel and photography sites can showcase different aspects of images for different viewing contexts.

**Marketing Banners:**
Ensure call-to-action text or brand elements remain visible regardless of screen size.

== Technical Details ==

**Generated CSS Example:**

```css
@media (max-width: 600px) {
  [data-fp-id="crf-123"] .wp-block-cover__image-background {
    object-position: 60% 40% !important;
  }
}
```

**Extensibility:**

* Built on WordPress standard hooks and filters
* Uses `blocks.registerBlockType` for block extension
* Uses `render_block` for frontend CSS injection
* Architecture designed for future extensibility

== Changelog ==

= 0.1.0 =
* Initial release
* Mobile and tablet responsive focal point support
* Gutenberg standard breakpoint compliance
* CSS optimization features (minification, caching, duplicate removal)
* Comprehensive test suite
* WordPress 6.1+ compatibility
* PHP 7.4+ support
* Real-time editor preview integration
* Complete backward compatibility with existing Cover blocks

== Upgrade Notice ==

= 0.1.0 =
Initial release of Cover Responsive Focal. Adds device-specific focal point capabilities to WordPress Cover blocks with full backward compatibility.
