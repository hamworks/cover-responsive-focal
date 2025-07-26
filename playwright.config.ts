import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E test configuration
 * Test cover block operations in WordPress block editor
 */
export default defineConfig( {
	// Test directory specification
	testDir: './tests/e2e',

	// Parallel execution settings (limited to 1 in CI, 2 locally)
	fullyParallel: true,

	// Test failure behavior (stop immediately on failure in CI)
	forbidOnly: !! process.env.CI,

	// Retry count on failure (2 times in CI, 0 times locally)
	retries: process.env.CI ? 2 : 0,

	// Worker count settings (1 in CI, half of CPU locally)
	workers: process.env.CI ? 1 : undefined,

	// Reporter settings
	reporter: [
		[ 'html' ],
		[ 'json', { outputFile: 'test-results/results.json' } ],
		process.env.CI ? [ 'github' ] : [ 'list' ],
	],

	// Global settings
	use: {
		// Base URL (wp-env default)
		baseURL: 'http://localhost:8888',

		// Browser settings
		headless: !! process.env.CI,
		viewport: { width: 1280, height: 720 },

		// Screenshot settings
		screenshot: 'only-on-failure',
		video: 'retain-on-failure',

		// Trace settings (used for debugging on failure)
		trace: 'on-first-retry',

		// WordPress-specific settings
		locale: 'ja-JP',
		timezoneId: 'Asia/Tokyo',
	},

	// Project settings (testing with different browsers)
	projects: [
		{
			name: 'chromium',
			use: { ...devices[ 'Desktop Chrome' ] },
		},
		{
			name: 'firefox',
			use: { ...devices[ 'Desktop Firefox' ] },
		},
		{
			name: 'webkit',
			use: { ...devices[ 'Desktop Safari' ] },
		},

		// Mobile environment testing
		{
			name: 'Mobile Chrome',
			use: { ...devices[ 'Pixel 5' ] },
		},
		{
			name: 'Mobile Safari',
			use: { ...devices[ 'iPhone 12' ] },
		},
	],

	// WordPress environment setup
	webServer: {
		command: 'npm run env start',
		port: 8888,
		reuseExistingServer: ! process.env.CI,
		timeout: 120 * 1000, // 2 minute timeout
	},

	// Test expectation settings
	expect: {
		// Assertion timeout
		timeout: 10 * 1000, // 10 seconds

		// Screenshot comparison settings
		toHaveScreenshot: {
			animations: 'disabled',
		},
		toMatchSnapshot: {
			threshold: 0.2, // 20% tolerance
		},
	},

	// Global timeout settings
	globalTimeout: 60 * 60 * 1000, // 1 hour total
	timeout: 30 * 1000, // Individual tests 30 seconds
} );
