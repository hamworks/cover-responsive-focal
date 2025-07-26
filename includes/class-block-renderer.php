<?php
/**
 * Block Renderer Class
 *
 * Handles Cover block rendering with responsive focal point functionality.
 *
 * @package CoverResponsiveFocal
 * @since 0.1.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Block Renderer Class
 */
class CRF_Block_Renderer {

	/**
	 * Validator instance
	 *
	 * @var CRF_Validator
	 */
	private $validator;

	/**
	 * CSS Optimizer instance
	 *
	 * @var CRF_CSS_Optimizer
	 */
	private $css_optimizer;

	/**
	 * Constructor
	 *
	 * @param CRF_Validator     $validator Validator instance
	 * @param CRF_CSS_Optimizer $css_optimizer CSS Optimizer instance
	 */
	public function __construct( $validator, $css_optimizer ) {
		$this->validator = $validator;
		$this->css_optimizer = $css_optimizer;
	}

	/**
	 * Initialize block rendering
	 */
	public function init() {
		add_filter( 'render_block', array( $this, 'render_block' ), 10, 2 );
	}

	/**
	 * Filter block rendering to add responsive focal point CSS
	 *
	 * @param string $content Block content
	 * @param array  $block Block information
	 * @return string Processed content
	 */
	public function render_block( $content, $block ) {
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
		$fp_id = $attrs['dataFpId'] ?? $this->generate_unique_fp_id();

		// Add data-fp-id attribute to cover block
		$content = $this->add_fp_id_to_content( $content, $fp_id );

		// Sanitize responsive focal points
		$sanitized_focal = $this->validator->sanitize_responsive_focal_array( $responsive_focal );

		// Generate optimized CSS
		$css_rules = $this->css_optimizer->generate_optimized_css_rules( $sanitized_focal, $fp_id );

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
	private function add_fp_id_to_content( $content, $fp_id ) {
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
	private function generate_unique_fp_id() {
		return wp_unique_id( 'crf-' );
	}
}