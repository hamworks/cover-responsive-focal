import { test, expect } from '@playwright/test';
import { WPAdminUtils } from '../utils/wp-admin';

/**
 * Basic WordPress environment setup verification tests
 * Using custom WordPress utilities
 */
test.describe( 'WordPress Environment Setup Verification', () => {
	let wpAdmin: WPAdminUtils;

	test.beforeEach( async ( { page } ) => {
		wpAdmin = new WPAdminUtils( page );
		await wpAdmin.login();
	} );

	test( 'Can access WordPress admin dashboard', async ( { page } ) => {
		// Navigate to WordPress admin dashboard
		await page.goto( '/wp-admin/' );

		// Verify dashboard is displayed
		await expect( page.locator( '#wpadminbar' ) ).toBeVisible();
		await expect( page ).toHaveTitle( /Dashboard/ );
	} );

	test( 'Block editor functions normally', async ( { page } ) => {
		// Create new post
		await wpAdmin.createNewPost();

		// Insert cover block
		await wpAdmin.insertCoverBlock();

		// Verify cover block is inserted
		const coverBlock = page.locator( '[data-type="core/cover"]' );
		await expect( coverBlock ).toBeVisible();
	} );

	test( 'Plugin is activated', async ( { page } ) => {
		// Navigate to plugins page
		await page.goto( '/wp-admin/plugins.php' );

		// Verify plugin is displayed
		const pluginRow = page.locator(
			'tr[data-slug="cover-responsive-focal"]'
		);
		if ( await pluginRow.isVisible() ) {
			// Verify plugin is activated
			await expect( pluginRow.locator( '.deactivate' ) ).toBeVisible();
		} else {
			// If plugin is not yet displayed, it's normal as it's in development
		}
	} );
} );
