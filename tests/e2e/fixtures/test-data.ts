import type { ResponsiveFocalPoint } from '../utils/cover-block';

/**
 * Test data definitions for E2E tests
 */

/**
 * Test responsive focal point configuration patterns
 */
export const TEST_FOCAL_POINTS = {
	// Basic desktop and mobile configuration
	BASIC_RESPONSIVE: [
		{
			mediaType: 'min-width' as const,
			breakpoint: 768,
			x: 30,
			y: 40,
		},
		{
			mediaType: 'max-width' as const,
			breakpoint: 767,
			x: 70,
			y: 60,
		},
	] as ResponsiveFocalPoint[],

	// Multiple breakpoint configuration
	MULTI_BREAKPOINT: [
		{
			mediaType: 'min-width' as const,
			breakpoint: 1200,
			x: 25,
			y: 35,
		},
		{
			mediaType: 'min-width' as const,
			breakpoint: 768,
			x: 50,
			y: 50,
		},
		{
			mediaType: 'max-width' as const,
			breakpoint: 767,
			x: 75,
			y: 65,
		},
	] as ResponsiveFocalPoint[],

	// Edge case value testing
	EDGE_CASES: [
		{
			mediaType: 'min-width' as const,
			breakpoint: 320,
			x: 0,
			y: 0,
		},
		{
			mediaType: 'max-width' as const,
			breakpoint: 1920,
			x: 100,
			y: 100,
		},
	] as ResponsiveFocalPoint[],
};

/**
 * Test image URLs
 */
export const TEST_IMAGES = {
	// Landscape image (1200x800)
	LANDSCAPE: './tests/e2e/fixtures/images/1200x800.png',

	// Portrait image (800x1200)
	PORTRAIT: './tests/e2e/fixtures/images/800x1200.png',

	// Square image (800x800)
	SQUARE: './tests/e2e/fixtures/images/800x800.png',

	// High resolution image (2400x1600)
	HIGH_RES: './tests/e2e/fixtures/images/2400x1600.png',
};

/**
 * Test viewport sizes
 */
export const TEST_VIEWPORTS = {
	MOBILE: { width: 375, height: 667 },
	TABLET: { width: 768, height: 1024 },
	DESKTOP: { width: 1200, height: 800 },
	LARGE_DESKTOP: { width: 1920, height: 1080 },
};

/**
 * WordPress standard breakpoints
 */
export const WP_BREAKPOINTS = {
	MOBILE: 600,
	TABLET: 782,
	DESKTOP: 1080,
};

/**
 * Test WordPress user credentials
 */
export const TEST_USER = {
	USERNAME: 'admin',
	PASSWORD: 'password',
	EMAIL: 'admin@example.com',
};

/**
 * CSS selector constants
 */
export const SELECTORS = {
	// WordPress editor
	BLOCK_EDITOR: '.block-editor-writing-flow',
	COVER_BLOCK: '[data-type="core/cover"]',
	BLOCK_INSPECTOR: '.block-editor-block-inspector',

	// Plugin-specific
	RESPONSIVE_FOCAL_CONTROLS: '.responsive-focal-controls',
	RESPONSIVE_FOCAL_ROW: '.responsive-focal-row',
	FOCAL_POINT_PICKER: '.components-focal-point-picker',

	// Frontend
	COVER_FRONTEND: '.wp-block-cover',
	COVER_WITH_FP_ID: '.wp-block-cover[data-fp-id]',
};

/**
 * Test assertion expected values
 */
export const EXPECTED_VALUES = {
	// Default data-fp-id format (timestamp-based)
	FP_ID_PATTERN: /^fp-\d+$/,

	// CSS custom property pattern
	OBJECT_POSITION_PATTERN: /^\d+%\s+\d+%$/,

	// Media query pattern
	MEDIA_QUERY_PATTERN: /^@media\s+\((min|max)-width:\s*\d+px\)/,
};
