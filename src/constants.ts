/**
 * Cover Responsive Focal - Constants
 */

/**
 * Device configurations (simplified to fixed breakpoints)
 */
export const DEVICE_BREAKPOINTS = {
	mobile: {
		mediaQuery: '(max-width: 600px)',
		label: 'Mobile (600px and below)',
	},
	tablet: {
		mediaQuery: '(min-width: 601px) and (max-width: 1024px)',
		label: 'Tablet (601px-1024px)',
	},
} as const;

/**
 * Device type union
 */
export type DeviceType = keyof typeof DEVICE_BREAKPOINTS;

/**
 * Default values (simplified)
 */
export const DEFAULTS = {
	/** Default device type */
	DEVICE: 'mobile' as const,
	/** Default focal point X coordinate */
	FOCAL_X: 0.5,
	/** Default focal point Y coordinate */
	FOCAL_Y: 0.5,
} as const;

/**
 * Validation constraints (simplified)
 */
export const VALIDATION = {
	/** Minimum focal point value */
	MIN_FOCAL_POINT: 0,
	/** Maximum focal point value */
	MAX_FOCAL_POINT: 1,
	/** Valid device types */
	DEVICE_TYPES: [ 'mobile', 'tablet' ] as const,
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
