<?php
/**
 * Plugin Name:       Cover Responsive Focal
 * Description:       Adds responsive focal point capability to WordPress Cover blocks for enhanced mobile experience.
 * Version:           0.1.0
 * Requires at least: 6.1
 * Requires PHP:      7.4
 * Author:            mel_cha
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       cover-responsive-focal
 *
 * @package CoverResponsiveFocal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// Define plugin constants
define( 'CRF_VERSION', '0.1.0' );
define( 'CRF_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'CRF_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'CRF_TEXT_DOMAIN', 'cover-responsive-focal' );

/**
 * Initialize the plugin
 */
function crf_init() {
	// Load plugin text domain for internationalization
	load_plugin_textdomain(
		CRF_TEXT_DOMAIN,
		false,
		dirname( plugin_basename( __FILE__ ) ) . '/languages'
	);
	
	// Register hooks
	add_action( 'enqueue_block_editor_assets', 'crf_enqueue_block_editor_assets' );
	add_filter( 'render_block', 'crf_render_block', 10, 2 );
}
add_action( 'init', 'crf_init' );
/**
 * Enqueue the block editor assets for extending the Cover block.
 */
function crf_enqueue_block_editor_assets() {
	$script_path = CRF_PLUGIN_DIR . 'build/index.js';
	$style_path = CRF_PLUGIN_DIR . 'build/index.css';
	
	// Check if build files exist
	if ( ! file_exists( $script_path ) ) {
		return;
	}
	
	// Enqueue the block editor script
	wp_enqueue_script(
		'cover-responsive-focal-editor',
		CRF_PLUGIN_URL . 'build/index.js',
		array( 'wp-blocks', 'wp-i18n', 'wp-element', 'wp-components', 'wp-compose', 'wp-block-editor', 'wp-hooks' ),
		filemtime( $script_path ),
		true
	);
	
	// Set up internationalization for JavaScript
	wp_set_script_translations(
		'cover-responsive-focal-editor',
		CRF_TEXT_DOMAIN,
		CRF_PLUGIN_DIR . 'languages'
	);

	// Enqueue the block editor styles if they exist
	if ( file_exists( $style_path ) ) {
		wp_enqueue_style(
			'cover-responsive-focal-editor',
			CRF_PLUGIN_URL . 'build/index.css',
			array( 'wp-edit-blocks' ),
			filemtime( $style_path )
		);
	}
}

/**
 * Generate CSS rules for responsive focal points
 *
 * @param array  $responsive_focal Array of responsive focal points
 * @param string $fp_id Unique ID for CSS targeting
 * @return string Generated CSS rules
 */
function crf_generate_css_rules( $responsive_focal, $fp_id ) {
	if ( empty( $responsive_focal ) ) {
		return '';
	}

	$rules = '';

	foreach ( $responsive_focal as $focal_point ) {
		// Validation - skip invalid values
		if ( ! crf_validate_media_type( $focal_point['mediaType'] ) ||
			 ! crf_validate_breakpoint( $focal_point['breakpoint'] ) ||
			 ! crf_validate_focal_point_value( $focal_point['x'] ) ||
			 ! crf_validate_focal_point_value( $focal_point['y'] ) ) {
			continue;
		}

		$media_type = sanitize_text_field( $focal_point['mediaType'] );
		$breakpoint = intval( $focal_point['breakpoint'] );
		$x = floatval( $focal_point['x'] ) * 100;
		$y = floatval( $focal_point['y'] ) * 100;

		// Generate media query
		$media_query = sprintf( '(%s: %dpx)', $media_type, $breakpoint );

		$rules .= sprintf(
			'@media %s { [data-fp-id="%s"] .wp-block-cover__image-background, [data-fp-id="%s"] .wp-block-cover__video-background { object-position: %s%% %s%%; } }',
			$media_query,
			esc_attr( $fp_id ),
			esc_attr( $fp_id ),
			$x,
			$y
		);
	}

	return $rules;
}

/**
 * Validate media type
 *
 * @param string $media_type Media type to validate
 * @return bool Whether the media type is valid
 */
function crf_validate_media_type( $media_type ) {
	return in_array( $media_type, array( 'min-width', 'max-width' ), true );
}

/**
 * Validate breakpoint value
 *
 * @param mixed $breakpoint Breakpoint value to validate
 * @return bool Whether the breakpoint is valid
 */
function crf_validate_breakpoint( $breakpoint ) {
	return is_numeric( $breakpoint ) && $breakpoint > 0 && $breakpoint <= 9999;
}

/**
 * Validate focal point value
 *
 * @param mixed $value Focal point value to validate
 * @return bool Whether the value is valid
 */
function crf_validate_focal_point_value( $value ) {
	return is_numeric( $value ) && $value >= 0 && $value <= 1;
}

/**
 * Sanitize focal point data
 *
 * @param array $input Focal point data to sanitize
 * @return array Sanitized focal point data
 */
function crf_sanitize_focal_point( $input ) {
	$defaults = array(
		'mediaType' => 'max-width',
		'breakpoint' => 768,
		'x' => 0.5,
		'y' => 0.5
	);

	// Get input values with defaults
	$media_type = isset( $input['mediaType'] ) ? $input['mediaType'] : $defaults['mediaType'];
	$breakpoint = isset( $input['breakpoint'] ) ? $input['breakpoint'] : $defaults['breakpoint'];
	$x = isset( $input['x'] ) ? $input['x'] : $defaults['x'];
	$y = isset( $input['y'] ) ? $input['y'] : $defaults['y'];

	// Sanitize media type
	$media_type = sanitize_text_field( $media_type );
	if ( ! crf_validate_media_type( $media_type ) ) {
		$media_type = $defaults['mediaType'];
	}

	// Sanitize breakpoint
	$breakpoint = intval( $breakpoint );
	if ( ! crf_validate_breakpoint( $breakpoint ) ) {
		$breakpoint = $defaults['breakpoint'];
	}

	// Sanitize focal point values
	$x = floatval( $x );
	$y = floatval( $y );

	// Use default if not numeric
	if ( ! is_numeric( $input['x'] ?? '' ) ) {
		$x = $defaults['x'];
	}
	if ( ! is_numeric( $input['y'] ?? '' ) ) {
		$y = $defaults['y'];
	}

	// Normalize out-of-range values
	$x = max( 0.0, min( 1.0, $x ) );
	$y = max( 0.0, min( 1.0, $y ) );

	return array(
		'mediaType' => $media_type,
		'breakpoint' => $breakpoint,
		'x' => $x,
		'y' => $y
	);
}

/**
 * Sanitize responsive focal point array
 *
 * @param array $input Responsive focal point array to sanitize
 * @return array Sanitized array
 */
function crf_sanitize_responsive_focal_array( $input ) {
	if ( ! is_array( $input ) ) {
		return array();
	}

	$sanitized = array();

	foreach ( $input as $focal_point ) {
		if ( is_array( $focal_point ) ) {
			$sanitized[] = crf_sanitize_focal_point( $focal_point );
		}
	}

	return $sanitized;
}

/**
 * Filter block rendering to add responsive focal point CSS
 *
 * @param string $content Block content
 * @param array  $block Block information
 * @return string Processed content
 */
function crf_render_block( $content, $block ) {
	// Skip non-cover blocks
	if ( 'core/cover' !== $block['blockName'] ) {
		return $content;
	}

	$attrs = $block['attrs'] ?? array();
	$responsive_focal = $attrs['responsiveFocal'] ?? array();

	// Skip empty array (maintain standard behavior)
	if ( empty( $responsive_focal ) ) {
		return $content;
	}

	// Get or generate data-fp-id
	$fp_id = $attrs['dataFpId'] ?? crf_generate_unique_fp_id();

	// Add data-fp-id attribute to cover block
	$content = crf_add_fp_id_to_content( $content, $fp_id );

	// Sanitize responsive focal points
	$sanitized_focal = crf_sanitize_responsive_focal_array( $responsive_focal );

	// Generate CSS
	$css_rules = crf_generate_css_rules( $sanitized_focal, $fp_id );

	// Add inline style
	if ( ! empty( $css_rules ) ) {
		$content .= sprintf( '<style id="%s">%s</style>', esc_attr( $fp_id ), $css_rules );
	}

	return $content;
}

/**
 * Add data-fp-id attribute to content
 *
 * @param string $content Content to process
 * @param string $fp_id Focal point ID
 * @return string Processed content
 */
function crf_add_fp_id_to_content( $content, $fp_id ) {
	// Add data-fp-id attribute to elements with wp-block-cover class
	return preg_replace_callback(
		// Only target wp-block-cover elements without existing data-fp-id
		'/<[^>]*class="[^"]*wp-block-cover[^"]*"(?:(?!data-fp-id)[^>])*?>/i',
		function( $matches ) use ( $fp_id ) {
			$tag = $matches[0];
			return rtrim( $tag, '>' ) . ' data-fp-id="' . esc_attr( $fp_id ) . '">';
		},
		$content
	);
}

/**
 * Generate unique focal point ID
 *
 * @return string Unique ID
 */
function crf_generate_unique_fp_id() {
	return wp_unique_id( 'crf-' );
}

