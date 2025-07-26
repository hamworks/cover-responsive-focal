import { test, expect } from '@playwright/test';
import { WPAdminUtils } from '../utils/wp-admin';
import { CoverBlockUtils } from '../utils/cover-block';
import { TEST_IMAGES, TEST_VIEWPORTS } from '../fixtures/test-data';

/**
 * Implementation of visual regression tests
 * Verification of visual changes in responsive focal points
 */
test.describe( 'Visual Regression Tests - Responsive Focal Points', () => {
	let wpAdmin: WPAdminUtils;
	let coverBlock: CoverBlockUtils;

	test.beforeEach( async ( { page } ) => {
		wpAdmin = new WPAdminUtils( page );
		coverBlock = new CoverBlockUtils( page );

		await wpAdmin.login();
		await wpAdmin.createNewPost();
	} );

	test( 'Block Editor - Responsive Focal Point Settings UI', async ( {
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

			// Screenshot of initial state
			const inspectorPanel = page.locator(
				'.block-editor-block-inspector'
			);
			await expect( inspectorPanel ).toHaveScreenshot(
				'responsive-focal-panel-empty.png',
				{
					mask: [
						page.locator( '.block-editor-block-card' ), // Mask block name section
						page.locator( '.components-panel__header' ), // Mask panel header
					],
				}
			);

			// Add breakpoint
			await page.locator( 'button.crf-add-focal-point' ).click();

			// Single breakpoint configuration state
			await expect( inspectorPanel ).toHaveScreenshot(
				'responsive-focal-panel-single.png',
				{
					mask: [
						page.locator( '.block-editor-block-card' ),
						page.locator( '.components-panel__header' ),
					],
				}
			);

			// Add multiple breakpoints
			await page.locator( 'button.crf-add-focal-point' ).click();
			await page.locator( 'button.crf-add-focal-point' ).click();

			// Multiple breakpoint configuration state
			await expect( inspectorPanel ).toHaveScreenshot(
				'responsive-focal-panel-multiple.png',
				{
					mask: [
						page.locator( '.block-editor-block-card' ),
						page.locator( '.components-panel__header' ),
					],
				}
			);
		}
	} );

	test( 'Visual state of focal point picker', async ( { page } ) => {
		await wpAdmin.insertCoverBlock();
		await coverBlock.addMediaToCover( TEST_IMAGES.LANDSCAPE );
		await wpAdmin.openBlockInspector();

		const responsiveFocalPanel = page.locator(
			'text=Responsive Focal Points'
		);
		if ( await responsiveFocalPanel.isVisible() ) {
			await responsiveFocalPanel.click();
			await page.locator( 'button.crf-add-focal-point' ).click();

			const focalPointPicker = page.locator(
				'.components-focal-point-picker'
			);

			// Default state (center)
			await expect( focalPointPicker ).toHaveScreenshot(
				'focal-point-picker-default.png'
			);

			const pickerBounds = await focalPointPicker.boundingBox();
			if ( pickerBounds ) {
				// Move to top-left
				await page.mouse.click(
					pickerBounds.x + pickerBounds.width * 0.2,
					pickerBounds.y + pickerBounds.height * 0.2
				);
				await expect(
					focalPointPicker.locator(
						'.components-focal-point-picker__icon_container'
					)
				).toBeVisible();
				await expect( focalPointPicker ).toHaveScreenshot(
					'focal-point-picker-top-left.png'
				);

				// Move to bottom-right
				await page.mouse.click(
					pickerBounds.x + pickerBounds.width * 0.8,
					pickerBounds.y + pickerBounds.height * 0.8
				);
				await expect(
					focalPointPicker.locator(
						'.components-focal-point-picker__icon_container'
					)
				).toBeVisible();
				await expect( focalPointPicker ).toHaveScreenshot(
					'focal-point-picker-bottom-right.png'
				);

				// Return to center
				await page.mouse.click(
					pickerBounds.x + pickerBounds.width * 0.5,
					pickerBounds.y + pickerBounds.height * 0.5
				);
				await expect(
					focalPointPicker.locator(
						'.components-focal-point-picker__icon_container'
					)
				).toBeVisible();
				await expect( focalPointPicker ).toHaveScreenshot(
					'focal-point-picker-center.png'
				);
			}
		}
	} );

	test( 'Frontend - Visual changes in responsive display', async ( {
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

			// Create settings for desktop and mobile
			const addButton = page.locator( 'button.crf-add-focal-point' );
			await addButton.click();
			await addButton.click();

			const mediaTypeSelects = page.locator( 'select' );
			const breakpointInputs = page.locator( 'input[type="number"]' );
			const focalPointPickers = page.locator(
				'.components-focal-point-picker'
			);

			// Desktop: min-width 768px, top-left focus
			await mediaTypeSelects.nth( 0 ).selectOption( 'min-width' );
			await breakpointInputs.nth( 0 ).fill( '768' );
			let pickerBounds = await focalPointPickers.nth( 0 ).boundingBox();
			if ( pickerBounds ) {
				await page.mouse.click(
					pickerBounds.x + pickerBounds.width * 0.2,
					pickerBounds.y + pickerBounds.height * 0.3
				);
			}

			// Mobile: max-width 767px, bottom-right focus
			await mediaTypeSelects.nth( 1 ).selectOption( 'max-width' );
			await breakpointInputs.nth( 1 ).fill( '767' );
			pickerBounds = await focalPointPickers.nth( 1 ).boundingBox();
			if ( pickerBounds ) {
				await page.mouse.click(
					pickerBounds.x + pickerBounds.width * 0.8,
					pickerBounds.y + pickerBounds.height * 0.7
				);
			}

			await wpAdmin.publishPost();
			const previewPost = await wpAdmin.previewPost();

			try {
				const coverElement = previewPost.locator( '.wp-block-cover' );

				// Screenshot in desktop view
				await previewPost.setViewportSize( TEST_VIEWPORTS.DESKTOP );
				await previewPost.waitForLoadState( 'networkidle' );
				await expect( coverElement ).toHaveScreenshot(
					'cover-desktop-responsive.png',
					{
						animations: 'disabled',
					}
				);

				// Screenshot in tablet view
				await previewPost.setViewportSize( TEST_VIEWPORTS.TABLET );
				await previewPost.waitForLoadState( 'networkidle' );
				await expect( coverElement ).toHaveScreenshot(
					'cover-tablet-responsive.png',
					{
						animations: 'disabled',
					}
				);

				// Screenshot in mobile view
				await previewPost.setViewportSize( TEST_VIEWPORTS.MOBILE );
				await previewPost.waitForLoadState( 'networkidle' );
				await expect( coverElement ).toHaveScreenshot(
					'cover-mobile-responsive.png',
					{
						animations: 'disabled',
					}
				);
			} finally {
				await previewPost.close();
			}
		}
	} );

	test( 'Visual consistency with different image sizes', async ( {
		page,
	} ) => {
		const imageTests = [
			{ name: 'landscape', url: TEST_IMAGES.LANDSCAPE },
			{ name: 'portrait', url: TEST_IMAGES.PORTRAIT },
			{ name: 'square', url: TEST_IMAGES.SQUARE },
		];

		for ( const imageTest of imageTests ) {
			// Create new post
			await wpAdmin.createNewPost();
			await wpAdmin.insertCoverBlock();
			await coverBlock.addMediaToCover( imageTest.url );
			await wpAdmin.openBlockInspector();

			const responsiveFocalPanel = page.locator(
				'text=Responsive Focal Points'
			);
			if ( await responsiveFocalPanel.isVisible() ) {
				await responsiveFocalPanel.click();
				await page.locator( 'button.crf-add-focal-point' ).click();

				// Set focal point to top-right
				const focalPointPicker = page.locator(
					'.components-focal-point-picker'
				);
				const pickerBounds = await focalPointPicker.boundingBox();
				if ( pickerBounds ) {
					await page.mouse.click(
						pickerBounds.x + pickerBounds.width * 0.8,
						pickerBounds.y + pickerBounds.height * 0.2
					);
				}

				await wpAdmin.publishPost();
				const previewPost = await wpAdmin.previewPost();

				try {
					const coverElement =
						previewPost.locator( '.wp-block-cover' );
					await previewPost.setViewportSize( TEST_VIEWPORTS.DESKTOP );
					await previewPost.waitForLoadState( 'networkidle' );

					// Screenshot by image size
					await expect( coverElement ).toHaveScreenshot(
						`cover-${ imageTest.name }-image.png`,
						{
							animations: 'disabled',
						}
					);
				} finally {
					await previewPost.close();
				}
			}
		}
	} );

	test( 'Visual verification of complex breakpoint settings', async ( {
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

			// Configure 4 breakpoints (detailed responsive design)
			const breakpointConfigs = [
				{
					mediaType: 'min-width',
					breakpoint: '1200',
					position: { x: 0.1, y: 0.1 },
				}, // Large screen
				{
					mediaType: 'min-width',
					breakpoint: '768',
					position: { x: 0.3, y: 0.3 },
				}, // Tablet
				{
					mediaType: 'min-width',
					breakpoint: '480',
					position: { x: 0.7, y: 0.5 },
				}, // Small tablet
				{
					mediaType: 'max-width',
					breakpoint: '479',
					position: { x: 0.9, y: 0.9 },
				}, // Mobile
			];

			for ( let i = 0; i < breakpointConfigs.length; i++ ) {
				const addButton = page.locator( 'button.crf-add-focal-point' );
				await addButton.click();

				const mediaTypeSelects = page.locator( 'select' );
				const breakpointInputs = page.locator( 'input[type="number"]' );
				const focalPointPickers = page.locator(
					'.components-focal-point-picker'
				);

				await mediaTypeSelects
					.nth( i )
					.selectOption( breakpointConfigs[ i ].mediaType );
				await breakpointInputs
					.nth( i )
					.fill( breakpointConfigs[ i ].breakpoint );

				const pickerBounds = await focalPointPickers
					.nth( i )
					.boundingBox();
				if ( pickerBounds ) {
					await page.mouse.click(
						pickerBounds.x +
							pickerBounds.width *
								breakpointConfigs[ i ].position.x,
						pickerBounds.y +
							pickerBounds.height *
								breakpointConfigs[ i ].position.y
					);
				}
			}

			await wpAdmin.publishPost();
			const previewPost = await wpAdmin.previewPost();

			try {
				const coverElement = previewPost.locator( '.wp-block-cover' );

				// Test with viewport sizes corresponding to each breakpoint
				const viewportTests = [
					{
						name: 'large-desktop',
						size: { width: 1400, height: 800 },
					},
					{ name: 'desktop', size: { width: 1000, height: 600 } },
					{ name: 'tablet', size: { width: 600, height: 800 } },
					{ name: 'mobile', size: { width: 375, height: 667 } },
				];

				for ( const viewportTest of viewportTests ) {
					await previewPost.setViewportSize( viewportTest.size );
					await previewPost.waitForLoadState( 'networkidle' );

					await expect( coverElement ).toHaveScreenshot(
						`cover-complex-${ viewportTest.name }.png`,
						{
							animations: 'disabled',
						}
					);
				}
			} finally {
				await previewPost.close();
			}
		}
	} );

	test( 'Visual feedback for error states and validation', async ( {
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

			const breakpointInput = page
				.locator( 'input[type="number"]' )
				.first();
			const inspectorPanel = page.locator(
				'.block-editor-block-inspector'
			);

			// Normal state
			await expect( inspectorPanel ).toHaveScreenshot(
				'validation-normal-state.png',
				{
					mask: [ page.locator( '.block-editor-block-card' ) ],
				}
			);

			// Input value below minimum
			await breakpointInput.fill( '50' );
			await breakpointInput.blur();
			await expect( breakpointInput ).toHaveValue( '100' );
			await expect( inspectorPanel ).toHaveScreenshot(
				'validation-min-clamped.png',
				{
					mask: [ page.locator( '.block-editor-block-card' ) ],
				}
			);

			// Input value above maximum
			await breakpointInput.fill( '5000' );
			await breakpointInput.blur();
			await expect( breakpointInput ).toHaveValue( '2000' );
			await expect( inspectorPanel ).toHaveScreenshot(
				'validation-max-clamped.png',
				{
					mask: [ page.locator( '.block-editor-block-card' ) ],
				}
			);

			// Input invalid string
			await breakpointInput.fill( 'invalid' );
			await breakpointInput.blur();
			await expect( breakpointInput ).toHaveValue( '768' );
			await expect( inspectorPanel ).toHaveScreenshot(
				'validation-invalid-input.png',
				{
					mask: [ page.locator( '.block-editor-block-card' ) ],
				}
			);
		}
	} );

	test( 'Animation and transition effects', async ( { page } ) => {
		await wpAdmin.insertCoverBlock();
		await coverBlock.addMediaToCover( TEST_IMAGES.LANDSCAPE );
		await wpAdmin.openBlockInspector();

		const responsiveFocalPanel = page.locator(
			'text=Responsive Focal Points'
		);
		if ( await responsiveFocalPanel.isVisible() ) {
			await responsiveFocalPanel.click();
			await page.locator( 'button.crf-add-focal-point' ).click();

			// Focal point picker animation
			const focalPointPicker = page.locator(
				'.components-focal-point-picker'
			);
			const pickerBounds = await focalPointPicker.boundingBox();

			if ( pickerBounds ) {
				// Before animation
				await expect( focalPointPicker ).toHaveScreenshot(
					'animation-before.png'
				);

				// Immediately after click (during animation)
				const clickPromise = page.mouse.click(
					pickerBounds.x + pickerBounds.width * 0.3,
					pickerBounds.y + pickerBounds.height * 0.7
				);

				// Capture during animation
				await expect(
					focalPointPicker.locator(
						'.components-focal-point-picker__icon_container'
					)
				).toBeVisible();
				await expect( focalPointPicker ).toHaveScreenshot(
					'animation-during.png'
				);

				await clickPromise;

				// After animation completion
				await expect(
					focalPointPicker.locator(
						'.components-focal-point-picker__icon_container'
					)
				).toBeVisible();
				await expect( focalPointPicker ).toHaveScreenshot(
					'animation-after.png'
				);
			}
		}
	} );

	test.afterEach( async ( { page } ) => {
		await page.close();
	} );
} );
