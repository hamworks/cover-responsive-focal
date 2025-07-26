import { test, expect } from '@playwright/test';
import { WPAdminUtils } from '../utils/wp-admin';
import { CoverBlockUtils } from '../utils/cover-block';
import {
	TEST_FOCAL_POINTS,
	TEST_IMAGES,
	SELECTORS,
} from '../fixtures/test-data';

/**
 * E2E tests for basic responsive focal point functionality in cover blocks
 */
test.describe( 'Cover Block - Basic Responsive Focal Point Functionality', () => {
	let wpAdmin: WPAdminUtils;
	let coverBlock: CoverBlockUtils;

	test.beforeEach( async ( { page } ) => {
		wpAdmin = new WPAdminUtils( page );
		coverBlock = new CoverBlockUtils( page );

		// Login to WordPress admin
		await wpAdmin.login();

		// Create new post
		await wpAdmin.createNewPost();
	} );

	test( 'Verify plugin loads correctly', async ( { page } ) => {
		// Insert cover block
		await coverBlock.selectCoverBlock();

		// Verify plugin JavaScript is loaded
		const pluginScript = await page.evaluate( () => {
			return Array.from( document.scripts ).some( ( script ) =>
				script.src.includes( 'cover-responsive-focal' )
			);
		} );

		expect( pluginScript ).toBeTruthy();
	} );

	test( 'Responsive focal point settings are displayed in cover block', async ( {
		page,
	} ) => {
		// Insert cover block
		await wpAdmin.insertCoverBlock();

		// Add media
		await coverBlock.addMediaToCover( TEST_IMAGES.LANDSCAPE );

		// Open responsive focal point settings
		await coverBlock.openResponsiveFocalSettings();

		// Verify settings panel is displayed
		await expect(
			page.locator( SELECTORS.RESPONSIVE_FOCAL_CONTROLS )
		).toBeVisible();

		// Verify 'Add New Breakpoint' button is displayed
		await expect(
			page.locator( 'button:has-text("Add New Breakpoint")' )
		).toBeVisible();
	} );

	test( 'Can add new breakpoint', async ( { page } ) => {
		await wpAdmin.insertCoverBlock();
		await coverBlock.addMediaToCover( TEST_IMAGES.LANDSCAPE );
		await coverBlock.openResponsiveFocalSettings();

		// Verify initial state has 0 setting rows
		const initialRowCount = await coverBlock.getBreakpointRowCount();
		expect( initialRowCount ).toBe( 0 );

		// Add new breakpoint
		await coverBlock.addNewBreakpoint();

		// Verify 1 setting row is added
		const newRowCount = await coverBlock.getBreakpointRowCount();
		expect( newRowCount ).toBe( 1 );

		// Verify setting row elements are displayed correctly
		const firstRow = page.locator( SELECTORS.RESPONSIVE_FOCAL_ROW ).first();

		// Media query type selection
		await expect( firstRow.locator( 'select' ) ).toBeVisible();

		// Breakpoint input
		await expect(
			firstRow.locator( 'input[type="number"]' )
		).toBeVisible();

		// Focal point picker
		await expect(
			firstRow.locator( SELECTORS.FOCAL_POINT_PICKER )
		).toBeVisible();

		// Remove button
		await expect(
			firstRow.locator( 'button[aria-label="Remove"]' )
		).toBeVisible();
	} );

	test( 'Can configure responsive focal point', async ( { page } ) => {
		await wpAdmin.insertCoverBlock();
		await coverBlock.addMediaToCover( TEST_IMAGES.LANDSCAPE );
		await coverBlock.openResponsiveFocalSettings();

		// Add new breakpoint
		await coverBlock.addNewBreakpoint();

		// Configure focal point
		const testFocalPoint = TEST_FOCAL_POINTS.BASIC_RESPONSIVE[ 0 ];
		await coverBlock.setResponsiveFocalPoint( 0, testFocalPoint );

		// Verify settings are correctly reflected
		const firstRow = page.locator( SELECTORS.RESPONSIVE_FOCAL_ROW ).first();

		// Media query type
		const mediaTypeSelect = firstRow.locator( 'select' );
		await expect( mediaTypeSelect ).toHaveValue( testFocalPoint.mediaType );

		// Breakpoint
		const breakpointInput = firstRow.locator( 'input[type="number"]' );
		await expect( breakpointInput ).toHaveValue(
			testFocalPoint.breakpoint.toString()
		);
	} );

	test( 'Can remove breakpoint row', async () => {
		await wpAdmin.insertCoverBlock();
		await coverBlock.addMediaToCover( TEST_IMAGES.LANDSCAPE );
		await coverBlock.openResponsiveFocalSettings();

		// Add two breakpoints
		await coverBlock.addNewBreakpoint();
		await coverBlock.addNewBreakpoint();

		// Verify there are 2 rows
		expect( await coverBlock.getBreakpointRowCount() ).toBe( 2 );

		// Remove first row
		await coverBlock.removeBreakpointRow( 0 );

		// Verify it becomes 1 row
		expect( await coverBlock.getBreakpointRowCount() ).toBe( 1 );
	} );

	test( 'Can configure multiple breakpoints', async ( { page } ) => {
		await wpAdmin.insertCoverBlock();
		await coverBlock.addMediaToCover( TEST_IMAGES.LANDSCAPE );
		await coverBlock.openResponsiveFocalSettings();

		// Add multiple breakpoints
		const testFocalPoints = TEST_FOCAL_POINTS.MULTI_BREAKPOINT;

		for ( let i = 0; i < testFocalPoints.length; i++ ) {
			await coverBlock.addNewBreakpoint();
			await coverBlock.setResponsiveFocalPoint( i, testFocalPoints[ i ] );
		}

		// Verify configured row count
		expect( await coverBlock.getBreakpointRowCount() ).toBe(
			testFocalPoints.length
		);

		// Verify settings for each row
		for ( let i = 0; i < testFocalPoints.length; i++ ) {
			const row = page.locator( SELECTORS.RESPONSIVE_FOCAL_ROW ).nth( i );
			const mediaTypeSelect = row.locator( 'select' );
			const breakpointInput = row.locator( 'input[type="number"]' );

			await expect( mediaTypeSelect ).toHaveValue(
				testFocalPoints[ i ].mediaType
			);
			await expect( breakpointInput ).toHaveValue(
				testFocalPoints[ i ].breakpoint.toString()
			);
		}
	} );

	test.afterEach( async ( { page } ) => {
		// Post-test cleanup (if needed)
		await page.close();
	} );
} );
