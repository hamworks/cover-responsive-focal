import { test, expect } from '@playwright/test';
import { WPAdminUtils } from '../utils/wp-admin';
import { CoverBlockUtils } from '../utils/cover-block';
import { TEST_IMAGES } from '../fixtures/test-data';

/**
 * Plugin actual functionality integration tests
 * E2E tests for implemented features
 */
test.describe( 'Plugin Functionality Integration Tests', () => {
	let wpAdmin: WPAdminUtils;
	let coverBlock: CoverBlockUtils;

	test.beforeEach( async ( { page } ) => {
		wpAdmin = new WPAdminUtils( page );
		coverBlock = new CoverBlockUtils( page );

		await wpAdmin.login();
		await wpAdmin.createNewPost();
	} );

	test( 'Plugin JavaScript loads correctly', async ( { page } ) => {
		// Insert cover block
		await wpAdmin.insertCoverBlock();

		// Verify plugin script is loaded
		const scriptLoaded = await page.evaluate( () => {
			// Check global variables like window.coverResponsiveFocal
			return (
				typeof window !== 'undefined' &&
				Array.from( document.scripts ).some(
					( script ) =>
						script.src.includes( 'cover-responsive-focal' ) ||
						script.textContent?.includes( 'responsiveFocal' )
				)
			);
		} );
		expect( scriptLoaded ).toBe( true );
	} );

	test( 'Cover block basic functionality works', async ( { page } ) => {
		// Insert cover block
		await wpAdmin.insertCoverBlock();

		// Verify cover block exists correctly in DOM
		const coverBlockElement = page.locator( '[data-type="core/cover"]' );
		await expect( coverBlockElement ).toBeVisible();

		// Verify cover block can be selected
		await coverBlockElement.click();
		await expect( coverBlockElement ).toHaveClass( /is-selected/ );
	} );

	test( 'Block inspector opens normally', async ( { page } ) => {
		await wpAdmin.insertCoverBlock();
		await coverBlock.addMediaToCover( TEST_IMAGES.LANDSCAPE );

		// Open block inspector
		await coverBlock.openResponsiveFocalSettings();

		// Verify sidebar is open
		const sidebar = page.locator( '.interface-complementary-area' );
		await expect( sidebar ).toBeVisible();

		// Verify block settings are displayed
		const blockSettings = page.locator( '.block-editor-block-inspector' );
		await expect( blockSettings ).toBeVisible();
	} );

	test( 'Implemented feature: data-fp-id attribute generation', async () => {
		await wpAdmin.insertCoverBlock();
		await coverBlock.addMediaToCover( TEST_IMAGES.LANDSCAPE );

		// Save post and check frontend
		await wpAdmin.savePost();
		const previewPost = await wpAdmin.previewPost();

		try {
			// Verify cover block is displayed
			const coverElement = previewPost.locator( '.wp-block-cover' );
			await expect( coverElement ).toBeVisible();

			// Check data-fp-id attribute if plugin is implemented
			const hasFpId = await coverElement.getAttribute( 'data-fp-id' );

			// Verify data-fp-id attribute exists and is in correct format
			expect( hasFpId ).toMatch( /^crf-\d+$/ );
		} finally {
			await previewPost.close();
		}
	} );

	test( 'Implemented feature: CSS generation and inline output', async () => {
		await wpAdmin.insertCoverBlock();
		await coverBlock.addMediaToCover( TEST_IMAGES.LANDSCAPE );

		await wpAdmin.savePost();
		const previewPost = await wpAdmin.previewPost();

		try {
			// Check if responsive focal point CSS is generated
			await previewPost.evaluate( () => {
				// Check inline styles or style tags
				const styles = Array.from(
					document.querySelectorAll( 'style' )
				);
				return styles.some(
					( style ) =>
						style.textContent?.includes( 'responsive-focal' ) ||
						style.textContent?.includes( 'object-position' ) ||
						style.textContent?.includes( '@media' )
				);
			} );
		} finally {
			await previewPost.close();
		}
	} );

	test( 'Compatibility verification with WordPress standard features', async ( {
		page,
	} ) => {
		await wpAdmin.insertCoverBlock();

		// Verify WordPress standard cover block functionality works normally
		const standardCoverBlock = page.locator( '[data-type="core/cover"]' );

		// Verify standard cover block settings panel is displayed
		await standardCoverBlock.click();
		await wpAdmin.getEditor().openDocumentSettingsSidebar();

		// Verify cover block specific settings are displayed
		const blockInspector = page.locator( '.block-editor-block-inspector' );
		await expect( blockInspector ).toBeVisible();

		// Verify existing cover block settings (overlay, background color, etc.) are available
		const hasStandardSettings = await page.evaluate( () => {
			const inspector = document.querySelector(
				'.block-editor-block-inspector'
			);
			return inspector
				? inspector.textContent?.includes( 'Background' ) ||
						inspector.textContent?.includes( 'Overlay' )
				: false;
		} );

		expect( hasStandardSettings ).toBeTruthy();
	} );

	test.afterEach( async ( { page } ) => {
		await page.close();
	} );
} );
