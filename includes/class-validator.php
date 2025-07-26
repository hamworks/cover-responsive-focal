<?php
/**
 * Validator Class
 *
 * Handles validation and sanitization for responsive focal point data.
 *
 * @package CoverResponsiveFocal
 * @since 0.1.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Validator Class
 */
class CRF_Validator {

	/**
	 * Default values for focal point data
	 *
	 * @var array
	 */
	private $defaults = array(
		'mediaType' => 'max-width',
		'breakpoint' => 768,
		'x' => 0.5,
		'y' => 0.5
	);

	/**
	 * Validate media type
	 *
	 * @param string $media_type Media type to validate
	 * @return bool Whether the media type is valid
	 */
	public function validate_media_type( $media_type ) {
		return in_array( $media_type, array( 'min-width', 'max-width' ), true );
	}

	/**
	 * Validate breakpoint value
	 *
	 * @param mixed $breakpoint Breakpoint value to validate
	 * @return bool Whether the breakpoint is valid
	 */
	public function validate_breakpoint( $breakpoint ) {
		return is_numeric( $breakpoint ) && $breakpoint > 0 && $breakpoint <= 9999;
	}

	/**
	 * Validate focal point value
	 *
	 * @param mixed $value Focal point value to validate
	 * @return bool Whether the value is valid
	 */
	public function validate_focal_point_value( $value ) {
		return is_numeric( $value ) && $value >= 0 && $value <= 1;
	}

	/**
	 * Sanitize focal point data
	 *
	 * @param array $input Focal point data to sanitize
	 * @return array Sanitized focal point data
	 */
	public function sanitize_focal_point( $input ) {
		// Get input values with defaults
		$media_type = isset( $input['mediaType'] ) ? $input['mediaType'] : $this->defaults['mediaType'];
		$breakpoint = isset( $input['breakpoint'] ) ? $input['breakpoint'] : $this->defaults['breakpoint'];
		$x = isset( $input['x'] ) ? $input['x'] : $this->defaults['x'];
		$y = isset( $input['y'] ) ? $input['y'] : $this->defaults['y'];

		// Sanitize media type
		$media_type = sanitize_text_field( $media_type );
		if ( ! $this->validate_media_type( $media_type ) ) {
			$media_type = $this->defaults['mediaType'];
		}

		// Sanitize breakpoint
		$breakpoint = intval( $breakpoint );
		if ( ! $this->validate_breakpoint( $breakpoint ) ) {
			$breakpoint = $this->defaults['breakpoint'];
		}

		// Sanitize focal point values
		$x = floatval( $x );
		$y = floatval( $y );

		// Use default if not numeric
		if ( ! is_numeric( $input['x'] ?? '' ) ) {
			$x = $this->defaults['x'];
		}
		if ( ! is_numeric( $input['y'] ?? '' ) ) {
			$y = $this->defaults['y'];
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
	public function sanitize_responsive_focal_array( $input ) {
		if ( ! is_array( $input ) ) {
			return array();
		}

		$sanitized = array();

		foreach ( $input as $focal_point ) {
			if ( is_array( $focal_point ) ) {
				$sanitized[] = $this->sanitize_focal_point( $focal_point );
			}
		}

		return $sanitized;
	}
}