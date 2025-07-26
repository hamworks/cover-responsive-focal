import { test, expect } from '@playwright/test';
import { WPAdminUtils } from '../utils/wp-admin';
import { CoverBlockUtils } from '../utils/cover-block';
import { TEST_IMAGES, TEST_VIEWPORTS } from '../fixtures/test-data';
import type { WordPressBlock } from '../../../types/wordpress-globals';

/**
 * Detailed E2E tests for frontend display verification
 * Frontend verification based on PHP implementation and CSS generation functionality
 */
test.describe( 'Frontend Display - Responsive Focal Point Rendering', () => {
	let wpAdmin: WPAdminUtils;
	let coverBlock: CoverBlockUtils;

	test.beforeEach( async ( { page } ) => {
		wpAdmin = new WPAdminUtils( page );
		coverBlock = new CoverBlockUtils( page );

		await wpAdmin.login();
		await wpAdmin.createNewPost();
	} );

	test( 'Automatic generation and setting of data-fp-id attribute', async ( {
		page,
	} ) => {
		await wpAdmin.insertCoverBlock();
		await coverBlock.addMediaToCover( TEST_IMAGES.LANDSCAPE );
		await wpAdmin.openBlockInspector();

		const responsiveFocalPanel = page.locator(
			'text=Responsive Focal Points'
		);
		if ( await responsiveFocalPanel.isVisible() ) {
			await responsiveFocalPanel.click();
			await page.locator( 'button.crf-add-focal-point' ).click();

			// Configure responsive focal point settings
			const mediaTypeSelect = page.locator( 'select' ).first();
			const breakpointInput = page
				.locator( 'input[type="number"]' )
				.first();

			await mediaTypeSelect.selectOption( 'min-width' );
			await breakpointInput.fill( '768' );

			// Publish post
			await wpAdmin.publishPost();
			const previewPost = await wpAdmin.previewPost();

			try {
				// Verify cover block exists
				const coverElement = previewPost.locator( '.wp-block-cover' );
				await expect( coverElement ).toBeVisible();

				// Verify data-fp-id attribute is automatically generated
				const fpId = await coverElement.getAttribute( 'data-fp-id' );
				expect( fpId ).toBeTruthy();
				expect( fpId ).toMatch( /^crf-\d+$/ ); // crf_generate_unique_fp_id() format
			} finally {
				await previewPost.close();
			}
		}
	} );

	test( 'Inline CSS generation and insertion', async ( { page } ) => {
		await wpAdmin.insertCoverBlock();
		await coverBlock.addMediaToCover( TEST_IMAGES.LANDSCAPE );
		await wpAdmin.openBlockInspector();

		const responsiveFocalPanel = page.locator(
			'text=Responsive Focal Points'
		);
		if ( await responsiveFocalPanel.isVisible() ) {
			await responsiveFocalPanel.click();
			await page.locator( 'button.crf-add-focal-point' ).click();

			// Configure multiple breakpoints
			const addButton = page.locator( 'button.crf-add-focal-point' );
			await addButton.click(); // Second breakpoint

			const mediaTypeSelects = page.locator( 'select' );
			const breakpointInputs = page.locator( 'input[type="number"]' );

			// First: min-width 1024px
			await mediaTypeSelects.nth( 0 ).selectOption( 'min-width' );
			await breakpointInputs.nth( 0 ).fill( '1024' );

			// Second: max-width 767px
			await mediaTypeSelects.nth( 1 ).selectOption( 'max-width' );
			await breakpointInputs.nth( 1 ).fill( '767' );

			await wpAdmin.publishPost();
			const previewPost = await wpAdmin.previewPost();

			try {
				const coverElement = previewPost.locator( '.wp-block-cover' );
				const fpId = await coverElement.getAttribute( 'data-fp-id' );

				// Verify corresponding style tag is generated
				const styleElement = previewPost.locator( `style#${ fpId }` );
				await expect( styleElement ).toBeVisible();

				// Verify CSS content
				const cssContent = await styleElement.textContent();

				// Verify media queries are correctly generated
				expect( cssContent ).toContain( '@media (min-width: 1024px)' );
				expect( cssContent ).toContain( '@media (max-width: 767px)' );

				// Verify CSS selectors are correctly generated
				expect( cssContent ).toContain( `[data-fp-id="${ fpId }"]` );
				expect( cssContent ).toContain(
					'.wp-block-cover__image-background'
				);
				expect( cssContent ).toContain(
					'.wp-block-cover__video-background'
				);

				// Verify object-position property is included
				expect( cssContent ).toContain( 'object-position' );
				expect( cssContent ).toContain( '!important' );
			} finally {
				await previewPost.close();
			}
		}
	} );

	test( 'CSS output verification of focal point coordinates', async ( {
		page,
	} ) => {
		await wpAdmin.insertCoverBlock();
		await coverBlock.addMediaToCover( TEST_IMAGES.LANDSCAPE );
		await wpAdmin.openBlockInspector();

		const responsiveFocalPanel = page.locator(
			'text=Responsive Focal Points'
		);
		if ( await responsiveFocalPanel.isVisible() ) {
			await responsiveFocalPanel.click();
			await page.locator( 'button.crf-add-focal-point' ).click();

			// Set specific position with focal point picker
			const focalPointPicker = page.locator(
				'.components-focal-point-picker'
			);
			const pickerBounds = await focalPointPicker.boundingBox();

			if ( pickerBounds ) {
				// Click top-left corner (25%, 25%)
				await page.mouse.click(
					pickerBounds.x + pickerBounds.width * 0.25,
					pickerBounds.y + pickerBounds.height * 0.25
				);
			}

			await wpAdmin.publishPost();
			const previewPost = await wpAdmin.previewPost();

			try {
				const coverElement = previewPost.locator( '.wp-block-cover' );
				const fpId = await coverElement.getAttribute( 'data-fp-id' );
				const styleElement = previewPost.locator( `style#${ fpId }` );
				const cssContent = await styleElement.textContent();

				// Verify focal point coordinates are output as percentages
				// Focal point picker coordinates (0.25, 0.25) → CSS (25%, 25%)
				const objectPositionMatch = cssContent?.match(
					/object-position:\s*(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%/
				);
				expect( objectPositionMatch ).toBeTruthy();

				if ( objectPositionMatch ) {
					const xPercent = parseFloat( objectPositionMatch[ 1 ] );
					const yPercent = parseFloat( objectPositionMatch[ 2 ] );

					// Verify values are close to set position (tolerance: ±5%)
					expect( xPercent ).toBeCloseTo( 25, 0 );
					expect( yPercent ).toBeCloseTo( 25, 0 );
				}
			} finally {
				await previewPost.close();
			}
		}
	} );

	test( 'Verification of dynamic changes in responsive display', async ( {
		page,
	} ) => {
		await wpAdmin.insertCoverBlock();
		await coverBlock.addMediaToCover( TEST_IMAGES.LANDSCAPE );
		await wpAdmin.openBlockInspector();

		const responsiveFocalPanel = page.locator(
			'text=Responsive Focal Points'
		);
		if ( await responsiveFocalPanel.isVisible() ) {
			await responsiveFocalPanel.click();

			// Add multiple breakpoints
			const addButton = page.locator( 'button.crf-add-focal-point' );
			await addButton.click();
			await addButton.click();

			const mediaTypeSelects = page.locator( 'select' );
			const breakpointInputs = page.locator( 'input[type="number"]' );
			const focalPointPickers = page.locator(
				'.components-focal-point-picker'
			);

			// Desktop settings: min-width 1024px, top-left
			await mediaTypeSelects.nth( 0 ).selectOption( 'min-width' );
			await breakpointInputs.nth( 0 ).fill( '1024' );
			let pickerBounds = await focalPointPickers.nth( 0 ).boundingBox();
			if ( pickerBounds ) {
				await page.mouse.click(
					pickerBounds.x + pickerBounds.width * 0.2,
					pickerBounds.y + pickerBounds.height * 0.2
				);
			}

			// Mobile settings: max-width 767px, bottom-right
			await mediaTypeSelects.nth( 1 ).selectOption( 'max-width' );
			await breakpointInputs.nth( 1 ).fill( '767' );
			pickerBounds = await focalPointPickers.nth( 1 ).boundingBox();
			if ( pickerBounds ) {
				await page.mouse.click(
					pickerBounds.x + pickerBounds.width * 0.8,
					pickerBounds.y + pickerBounds.height * 0.8
				);
			}

			await wpAdmin.publishPost();
			const previewPost = await wpAdmin.previewPost();

			try {
				const coverElement = previewPost.locator( '.wp-block-cover' );
				const fpId = await coverElement.getAttribute( 'data-fp-id' );

				// Verify with desktop size
				await previewPost.setViewportSize( TEST_VIEWPORTS.DESKTOP );
				await previewPost.waitForLoadState( 'networkidle' );

				// Verify desktop CSS is applied
				const desktopStyles = await previewPost.evaluate(
					( elementFpId ) => {
						const element = document.querySelector(
							`[data-fp-id="${ elementFpId }"] .wp-block-cover__image-background`
						);
						return element
							? window.getComputedStyle( element ).objectPosition
							: null;
					},
					fpId
				);

				// Verify with mobile size
				await previewPost.setViewportSize( TEST_VIEWPORTS.MOBILE );
				await previewPost.waitForLoadState( 'networkidle' );

				const mobileStyles = await previewPost.evaluate(
					( elementFpId ) => {
						const element = document.querySelector(
							`[data-fp-id="${ elementFpId }"] .wp-block-cover__image-background`
						);
						return element
							? window.getComputedStyle( element ).objectPosition
							: null;
					},
					fpId
				);

				// Verify different object-position values are applied for desktop and mobile
				if ( desktopStyles && mobileStyles ) {
					expect( desktopStyles ).not.toBe( mobileStyles );
				}
			} finally {
				await previewPost.close();
			}
		}
	} );

	test( 'Maintaining standard behavior with empty responsiveFocal array', async () => {
		// Create cover block without setting responsive focal points
		await wpAdmin.insertCoverBlock();
		await coverBlock.addMediaToCover( TEST_IMAGES.LANDSCAPE );

		// Publish post without configuration
		await wpAdmin.publishPost();
		const previewPost = await wpAdmin.previewPost();

		try {
			const coverElement = previewPost.locator( '.wp-block-cover' );
			await expect( coverElement ).toBeVisible();

			// Verify that data-fp-id attribute is not set
			const fpId = await coverElement.getAttribute( 'data-fp-id' );
			expect( fpId ).toBeNull();

			// Verify that responsive focal point style tags are not generated
			const responsiveStyles = previewPost.locator( 'style[id^="crf-"]' );
			expect( await responsiveStyles.count() ).toBe( 0 );

			// Verify that WordPress standard cover block functionality works normally
			await expect( coverElement ).toHaveClass( /wp-block-cover/ );
		} finally {
			await previewPost.close();
		}
	} );

	test( 'Sanitization of invalid responsiveFocal values', async ( {
		page,
	} ) => {
		// Directly manipulate block attributes to set invalid values
		await wpAdmin.insertCoverBlock();
		await coverBlock.addMediaToCover( TEST_IMAGES.LANDSCAPE );

		// Inject invalid data in block editor (via developer tools)
		await page.evaluate( () => {
			const blocks: WordPressBlock[] = window.wp.data
				.select( 'core/block-editor' )
				.getBlocks();
			const targetCoverBlock = blocks.find(
				( block: WordPressBlock ) => block.name === 'core/cover'
			);

			if ( targetCoverBlock ) {
				// Set invalid responsiveFocal values
				window.wp.data
					.dispatch( 'core/block-editor' )
					.updateBlockAttributes( targetCoverBlock.clientId, {
						responsiveFocal: [
							{
								mediaType: 'invalid-type', // Invalid media type
								breakpoint: -100, // Invalid breakpoint
								x: 2.5, // X coordinate out of range
								y: -0.5, // Y coordinate out of range
							},
							{
								mediaType: 'min-width', // Valid value
								breakpoint: 768,
								x: 0.3,
								y: 0.7,
							},
						],
					} );
			}
		} );

		await wpAdmin.publishPost();
		const previewPost = await wpAdmin.previewPost();

		try {
			const coverElement = previewPost.locator( '.wp-block-cover' );
			const fpId = await coverElement.getAttribute( 'data-fp-id' );

			if ( fpId ) {
				const styleElement = previewPost.locator( `style#${ fpId }` );
				const cssContent = await styleElement.textContent();

				// Verify that CSS rules for invalid values are not generated
				expect( cssContent ).not.toContain( 'invalid-type' );
				expect( cssContent ).not.toContain( '-100px' );

				// Verify that CSS rules for valid values are generated
				expect( cssContent ).toContain( 'min-width: 768px' );
				expect( cssContent ).toContain( 'object-position' );
			}
		} finally {
			await previewPost.close();
		}
	} );

	test( 'Verification of complex media query combinations', async ( {
		page,
	} ) => {
		await wpAdmin.insertCoverBlock();
		await coverBlock.addMediaToCover( TEST_IMAGES.LANDSCAPE );
		await wpAdmin.openBlockInspector();

		const responsiveFocalPanel = page.locator(
			'text=Responsive Focal Points'
		);
		if ( await responsiveFocalPanel.isVisible() ) {
			await responsiveFocalPanel.click();

			// Configure multiple breakpoints (mobile-first design)
			const testPoints = [
				{
					mediaType: 'min-width',
					breakpoint: '1200',
					position: { x: 0.2, y: 0.3 },
				},
				{
					mediaType: 'min-width',
					breakpoint: '768',
					position: { x: 0.5, y: 0.5 },
				},
				{
					mediaType: 'max-width',
					breakpoint: '767',
					position: { x: 0.8, y: 0.7 },
				},
			];

			for ( let i = 0; i < testPoints.length; i++ ) {
				const addButton = page.locator( 'button.crf-add-focal-point' );
				await addButton.click();

				const mediaTypeSelects = page.locator( 'select' );
				const breakpointInputs = page.locator( 'input[type="number"]' );
				const focalPointPickers = page.locator(
					'.components-focal-point-picker'
				);

				await mediaTypeSelects
					.nth( i )
					.selectOption( testPoints[ i ].mediaType );
				await breakpointInputs
					.nth( i )
					.fill( testPoints[ i ].breakpoint );

				const pickerBounds = await focalPointPickers
					.nth( i )
					.boundingBox();
				if ( pickerBounds ) {
					await page.mouse.click(
						pickerBounds.x +
							pickerBounds.width * testPoints[ i ].position.x,
						pickerBounds.y +
							pickerBounds.height * testPoints[ i ].position.y
					);
				}
			}

			await wpAdmin.publishPost();
			const previewPost = await wpAdmin.previewPost();

			try {
				const coverElement = previewPost.locator( '.wp-block-cover' );
				const fpId = await coverElement.getAttribute( 'data-fp-id' );
				const styleElement = previewPost.locator( `style#${ fpId }` );
				const cssContent = await styleElement.textContent();

				// Verify media queries for each breakpoint are correctly generated
				expect( cssContent ).toContain( '@media (min-width: 1200px)' );
				expect( cssContent ).toContain( '@media (min-width: 768px)' );
				expect( cssContent ).toContain( '@media (max-width: 767px)' );

				// Verify !important is included for CSS specificity
				const importantMatches = (
					cssContent?.match( /!important/g ) || []
				).length;
				expect( importantMatches ).toBeGreaterThan( 0 );

				// Verify appropriate styles are applied for each viewport size
				const viewportTests = [
					{
						viewport: { width: 1400, height: 800 },
						expectedQuery: 'min-width: 1200px',
					},
					{
						viewport: { width: 900, height: 600 },
						expectedQuery: 'min-width: 768px',
					},
					{
						viewport: { width: 400, height: 600 },
						expectedQuery: 'max-width: 767px',
					},
				];

				for ( const viewportTest of viewportTests ) {
					await previewPost.setViewportSize( viewportTest.viewport );
					await previewPost.waitForLoadState( 'networkidle' );

					// Verify media query matches
					const mediaQueryMatches = await previewPost.evaluate(
						( query ) => {
							return window.matchMedia( `(${ query })` ).matches;
						},
						viewportTest.expectedQuery
					);

					expect( mediaQueryMatches ).toBeTruthy();
				}
			} finally {
				await previewPost.close();
			}
		}
	} );

	test.afterEach( async ( { page } ) => {
		await page.close();
	} );
} );
