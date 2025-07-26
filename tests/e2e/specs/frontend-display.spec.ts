import { test, expect } from '@playwright/test';
import { WPAdminUtils } from '../utils/wp-admin';
import { CoverBlockUtils } from '../utils/cover-block';
import {
	TEST_FOCAL_POINTS,
	TEST_IMAGES,
	TEST_VIEWPORTS,
	SELECTORS,
	EXPECTED_VALUES,
} from '../fixtures/test-data';

/**
 * E2E tests for responsive focal point display on frontend
 */
test.describe( 'Frontend Display - Responsive Focal Points', () => {
	let wpAdmin: WPAdminUtils;
	let coverBlock: CoverBlockUtils;

	test.beforeEach( async ( { page } ) => {
		wpAdmin = new WPAdminUtils( page );
		coverBlock = new CoverBlockUtils( page );

		await wpAdmin.login();
		await wpAdmin.createNewPost();
		await wpAdmin.insertCoverBlock();
		await coverBlock.addMediaToCover( TEST_IMAGES.LANDSCAPE );
	} );

	test( 'data-fp-id attribute is correctly set', async () => {
		await coverBlock.openResponsiveFocalSettings();
		await coverBlock.addNewBreakpoint();

		const testFocalPoint = TEST_FOCAL_POINTS.BASIC_RESPONSIVE[ 0 ];
		await coverBlock.setResponsiveFocalPoint( 0, testFocalPoint );

		// Save post
		await wpAdmin.savePost();

		// Open preview page
		const previewPost = await wpAdmin.previewPost();

		try {
			// Verify data-fp-id attribute is set on cover block
			const coverElement = previewPost.locator(
				SELECTORS.COVER_WITH_FP_ID
			);
			await expect( coverElement ).toBeVisible();

			// Verify data-fp-id attribute value matches expected format
			const fpId = await coverElement.getAttribute( 'data-fp-id' );
			expect( fpId ).toMatch( EXPECTED_VALUES.FP_ID_PATTERN );
		} finally {
			await previewPost.close();
		}
	} );

	test( 'Inline CSS is generated correctly', async () => {
		await coverBlock.openResponsiveFocalSettings();

		// Configure multiple breakpoints
		const testFocalPoints = TEST_FOCAL_POINTS.BASIC_RESPONSIVE;

		for ( let i = 0; i < testFocalPoints.length; i++ ) {
			await coverBlock.addNewBreakpoint();
			await coverBlock.setResponsiveFocalPoint( i, testFocalPoints[ i ] );
		}

		await wpAdmin.savePost();
		const previewPost = await wpAdmin.previewPost();

		try {
			// Get cover block
			const coverElement = previewPost.locator(
				SELECTORS.COVER_WITH_FP_ID
			);
			await expect( coverElement ).toBeVisible();

			// Get data-fp-id attribute
			const fpId = await coverElement.getAttribute( 'data-fp-id' );

			// Verify corresponding style tag exists
			const styleElement = previewPost.locator(
				`style:has-text("${ fpId }")`
			);
			await expect( styleElement ).toBeVisible();

			// Check CSS content
			const cssContent = await styleElement.textContent();

			// Verify media queries for each breakpoint are included
			for ( const focalPoint of testFocalPoints ) {
				const mediaQuery = `@media (${ focalPoint.mediaType }: ${ focalPoint.breakpoint }px)`;
				expect( cssContent ).toContain( mediaQuery );

				// Verify object-position values are included
				const objectPosition = `${ focalPoint.x }% ${ focalPoint.y }%`;
				expect( cssContent ).toContain( objectPosition );
			}
		} finally {
			await previewPost.close();
		}
	} );

	test( 'Responsive display works correctly', async () => {
		await coverBlock.openResponsiveFocalSettings();

		const testFocalPoints = TEST_FOCAL_POINTS.BASIC_RESPONSIVE;

		for ( let i = 0; i < testFocalPoints.length; i++ ) {
			await coverBlock.addNewBreakpoint();
			await coverBlock.setResponsiveFocalPoint( i, testFocalPoints[ i ] );
		}

		await wpAdmin.savePost();
		const previewPost = await wpAdmin.previewPost();

		try {
			const coverElement = previewPost.locator(
				SELECTORS.COVER_WITH_FP_ID
			);
			await expect( coverElement ).toBeVisible();

			// Check display at each breakpoint
			for ( const focalPoint of testFocalPoints ) {
				// Set viewport size
				const viewportWidth =
					focalPoint.mediaType === 'min-width'
						? focalPoint.breakpoint + 100
						: focalPoint.breakpoint - 100;

				await previewPost.setViewportSize( {
					width: viewportWidth,
					height: 800,
				} );
				await previewPost.waitForTimeout( 500 ); // Wait for CSS to apply

				// Verify object-position is applied
				// (Check background-position or other properties based on actual implementation)
				const backgroundPosition = await coverElement.evaluate(
					( el ) => {
						return window.getComputedStyle( el ).backgroundPosition;
					}
				);

				// Calculate expected position (simplified version)
				const expectedX = `${ focalPoint.x }%`;
				const expectedY = `${ focalPoint.y }%`;

				expect( backgroundPosition ).toContain( expectedX );
				expect( backgroundPosition ).toContain( expectedY );
			}
		} finally {
			await previewPost.close();
		}
	} );

	test( 'Visual regression test - Desktop display', async () => {
		await coverBlock.openResponsiveFocalSettings();
		await coverBlock.addNewBreakpoint();

		const testFocalPoint = TEST_FOCAL_POINTS.BASIC_RESPONSIVE[ 0 ];
		await coverBlock.setResponsiveFocalPoint( 0, testFocalPoint );

		await wpAdmin.savePost();
		const previewPost = await wpAdmin.previewPost();

		try {
			// Take screenshot at desktop size
			await previewPost.setViewportSize( TEST_VIEWPORTS.DESKTOP );
			await previewPost.waitForTimeout( 1000 );

			const coverElement = previewPost.locator(
				SELECTORS.COVER_WITH_FP_ID
			);
			await expect( coverElement ).toHaveScreenshot(
				'cover-desktop.png'
			);
		} finally {
			await previewPost.close();
		}
	} );

	test( 'Visual regression test - Mobile display', async () => {
		await coverBlock.openResponsiveFocalSettings();
		await coverBlock.addNewBreakpoint();

		const testFocalPoint = TEST_FOCAL_POINTS.BASIC_RESPONSIVE[ 1 ];
		await coverBlock.setResponsiveFocalPoint( 0, testFocalPoint );

		await wpAdmin.savePost();
		const previewPost = await wpAdmin.previewPost();

		try {
			// Take screenshot at mobile size
			await previewPost.setViewportSize( TEST_VIEWPORTS.MOBILE );
			await previewPost.waitForTimeout( 1000 );

			const coverElement = previewPost.locator(
				SELECTORS.COVER_WITH_FP_ID
			);
			await expect( coverElement ).toHaveScreenshot( 'cover-mobile.png' );
		} finally {
			await previewPost.close();
		}
	} );

	test( 'Standard behavior verification without settings', async () => {
		// Save without configuring responsive focal points
		await wpAdmin.savePost();
		const previewPost = await wpAdmin.previewPost();

		try {
			// Cover block is displayed
			const coverElement = previewPost.locator(
				SELECTORS.COVER_FRONTEND
			);
			await expect( coverElement ).toBeVisible();

			// Verify data-fp-id attribute is not set
			const fpIdAttribute =
				await coverElement.getAttribute( 'data-fp-id' );
			expect( fpIdAttribute ).toBeNull();

			// Verify no additional CSS is generated
			const styleElements = previewPost.locator(
				'style[data-responsive-focal]'
			);
			expect( await styleElements.count() ).toBe( 0 );
		} finally {
			await previewPost.close();
		}
	} );

	test.afterEach( async ( { page } ) => {
		await page.close();
	} );
} );
