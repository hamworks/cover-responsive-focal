<?php
/**
 * CSS Optimizer Class
 *
 * Handles CSS generation, optimization, and caching for responsive focal points.
 *
 * @package CoverResponsiveFocal
 * @since 0.1.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * CSS Optimizer Class
 */
class CRF_CSS_Optimizer {

	/**
	 * Validator instance
	 *
	 * @var CRF_Validator
	 */
	private $validator;

	/**
	 * Constructor
	 *
	 * @param CRF_Validator $validator Validator instance
	 */
	public function __construct( $validator ) {
		$this->validator = $validator;
	}

	/**
	 * Generate CSS rules for responsive focal points
	 *
	 * @param array  $responsive_focal Array of responsive focal points
	 * @param string $fp_id Unique ID for CSS targeting
	 * @return string Generated CSS rules
	 */
	public function generate_css_rules( $responsive_focal, $fp_id ) {
		if ( empty( $responsive_focal ) ) {
			return '';
		}

		// Fixed breakpoint constants (Gutenberg standard compliant)
		$device_breakpoints = array(
			'mobile' => '(max-width: 600px)',
			'tablet' => '(min-width: 601px) and (max-width: 782px)'
		);

		$rules = '';

		foreach ( $responsive_focal as $focal_point ) {
			// Validation - skip invalid values
			if ( ! $this->validator->validate_device_type( $focal_point['device'] ) ||
				 ! $this->validator->validate_focal_point_value( $focal_point['x'] ) ||
				 ! $this->validator->validate_focal_point_value( $focal_point['y'] ) ) {
				continue;
			}

			$device = sanitize_text_field( $focal_point['device'] );
			$x = floatval( $focal_point['x'] ) * 100;
			$y = floatval( $focal_point['y'] ) * 100;

			// Get fixed media query for device
			if ( ! isset( $device_breakpoints[ $device ] ) ) {
				continue; // Skip invalid device type
			}

			$media_query = $device_breakpoints[ $device ];

			$rules .= sprintf(
				'@media %s { [data-fp-id="%s"] .wp-block-cover__image-background, [data-fp-id="%s"] .wp-block-cover__video-background { object-position: %s%% %s%% !important; } }',
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
	 * CSS minification processing
	 *
	 * @param string $css CSS string
	 * @return string Minified CSS
	 */
	public function minify_css( $css ) {
		// Remove unnecessary whitespace
		$css = preg_replace('/\s+/', ' ', $css);
		
		// Remove newlines and tabs
		$css = str_replace(["\n", "\r", "\t"], '', $css);
		
		// Remove spaces around braces
		$css = preg_replace('/\s*{\s*/', '{', $css);
		$css = preg_replace('/\s*}\s*/', '}', $css);
		
		// Remove spaces around colons and semicolons
		$css = preg_replace('/\s*:\s*/', ':', $css);
		$css = preg_replace('/\s*;\s*/', ';', $css);
		
		// Remove duplicate semicolons
		$css = preg_replace('/;+/', ';', $css);
		
		// Remove trailing semicolons before closing brace
		$css = preg_replace('/;\s*}/', '}', $css);
		
		// Trim overall whitespace
		$css = trim($css);
		
		return $css;
	}

	/**
	 * Duplicate media query merge processing
	 *
	 * @param string $css CSS string
	 * @return string Merged CSS
	 */
	public function merge_duplicate_media_queries( $css ) {
		$media_queries_seen = [];
		$media_blocks = [];
		
		// Split CSS into @media blocks and non-media content
		preg_match_all('/@media\s*([^{]+)\s*\{([^{}]*\{[^}]*\}[^{}]*)\}/i', $css, $matches, PREG_SET_ORDER);
		
		foreach ($matches as $match) {
			$media_query = trim($match[1]);
			$media_content = $match[2];
			
			// Only keep first occurrence of each media query
			if (!isset($media_queries_seen[$media_query])) {
				$media_queries_seen[$media_query] = true;
				$media_blocks[] = sprintf('@media %s{%s}', $media_query, $media_content);
			}
		}
		
		// Return merged media blocks
		return implode('', $media_blocks);
	}

	/**
	 * Optimized CSS generation
	 *
	 * @param array  $responsive_focal Responsive focal point array
	 * @param string $fp_id Focal point ID
	 * @return string Optimized CSS
	 */
	public function generate_optimized_css_rules( $responsive_focal, $fp_id ) {
		// Check cache
		$cached_css = $this->get_cached_css( $responsive_focal, $fp_id );
		if ( $cached_css !== false ) {
			return $cached_css;
		}
		
		// Generate basic CSS
		$css = $this->generate_css_rules( $responsive_focal, $fp_id );
		
		if ( empty( $css ) ) {
			return '';
		}
		
		// Merge duplicate media queries
		$css = $this->merge_duplicate_media_queries( $css );
		
		// Minify CSS
		$css = $this->minify_css( $css );
		
		// Save to cache
		$this->cache_css( $responsive_focal, $fp_id, $css );
		
		return $css;
	}

	/**
	 * Get CSS cache
	 *
	 * @param array  $responsive_focal Responsive focal point array
	 * @param string $fp_id Focal point ID
	 * @return string|false Cached CSS, false if not found
	 */
	private function get_cached_css( $responsive_focal, $fp_id ) {
		$cache_key = $this->generate_cache_hash( $responsive_focal, $fp_id );
		return get_transient( 'crf_css_' . $cache_key );
	}

	/**
	 * Save CSS cache
	 *
	 * @param array  $responsive_focal Responsive focal point array
	 * @param string $fp_id Focal point ID
	 * @param string $css CSS string
	 */
	private function cache_css( $responsive_focal, $fp_id, $css ) {
		$cache_key = $this->generate_cache_hash( $responsive_focal, $fp_id );
		set_transient( 'crf_css_' . $cache_key, $css, HOUR_IN_SECONDS );
	}

	/**
	 * Generate cache hash
	 *
	 * @param array  $responsive_focal Responsive focal point array
	 * @param string $fp_id Focal point ID
	 * @return string Hash value
	 */
	private function generate_cache_hash( $responsive_focal, $fp_id ) {
		$data = json_encode( $responsive_focal ) . $fp_id;
		return md5( $data );
	}
}