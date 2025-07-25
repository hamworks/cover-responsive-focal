/**
 * Cover Responsive Focal - Constants
 */

/**
 * Media query types
 */
export const MEDIA_QUERY_TYPES = [
	{ label: 'Min Width', value: 'min-width' },
	{ label: 'Max Width', value: 'max-width' },
] as const;

/**
 * Media query type union
 */
export type MediaQueryType = ( typeof MEDIA_QUERY_TYPES )[ number ][ 'value' ];

/**
 * Default values
 */
export const DEFAULTS = {
	/** Default media query type */
	MEDIA_TYPE: 'max-width' as const,
	/** Default breakpoint */
	BREAKPOINT: 768,
	/** Default focal point X coordinate */
	FOCAL_X: 0.5,
	/** Default focal point Y coordinate */
	FOCAL_Y: 0.5,
} as const;

/**
 * Validation constraints
 */
export const VALIDATION = {
	/** Minimum breakpoint value */
	MIN_BREAKPOINT: 100,
	/** Maximum breakpoint value */
	MAX_BREAKPOINT: 2000,
	/** Minimum focal point value */
	MIN_FOCAL_POINT: 0,
	/** Maximum focal point value */
	MAX_FOCAL_POINT: 1,
} as const;

/**
 * CSS-related constants
 */
export const CSS = {
	/** CSS selector prefix */
	ID_PREFIX: 'crf-',
	/** Image background class */
	IMAGE_CLASS: '.wp-block-cover__image-background',
	/** Video background class */
	VIDEO_CLASS: '.wp-block-cover__video-background',
} as const;

/**
 * Plugin metadata
 */
export const PLUGIN = {
	/** Plugin name */
	NAME: 'Cover Responsive Focal',
	/** Text domain */
	TEXT_DOMAIN: 'cover-responsive-focal',
	/** Version */
	VERSION: '0.1.0',
} as const;
