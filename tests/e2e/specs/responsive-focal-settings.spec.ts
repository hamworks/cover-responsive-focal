import { test, expect } from '@playwright/test';
import { WPAdminUtils } from '../utils/wp-admin';
import { CoverBlockUtils } from '../utils/cover-block';
import { TEST_IMAGES } from '../fixtures/test-data';

/**
 * Detailed E2E tests for responsive focal point settings
 * Tests based on actual validation implementation and UI behavior
 */
test.describe( 'Responsive Focal Point Settings - Detailed Feature Tests', () => {
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

	test( 'Default values are correctly set', async ( { page } ) => {
		await wpAdmin.openBlockInspector();

		const responsiveFocalPanel = page.locator(
			'text=Responsive Focal Points'
		);
		if ( await responsiveFocalPanel.isVisible() ) {
			await responsiveFocalPanel.click();
			await page.locator( 'button.crf-add-focal-point' ).click();

			// Verify default values (based on constants.ts)
			const mediaTypeSelect = page.locator( 'select' ).first();
			await expect( mediaTypeSelect ).toHaveValue( 'max-width' ); // DEFAULTS.MEDIA_TYPE

			const breakpointInput = page
				.locator( 'input[type="number"]' )
				.first();
			await expect( breakpointInput ).toHaveValue( '768' ); // DEFAULTS.BREAKPOINT

			// Default focal point values (center: 0.5, 0.5)
			const focalPointPicker = page.locator(
				'.components-focal-point-picker'
			);
			const focalMarker = focalPointPicker.locator(
				'.components-focal-point-picker__icon_container'
			);
			await expect( focalMarker ).toBeVisible();

			// Verify that marker is positioned near center
			const markerPosition = await focalMarker.boundingBox();
			const pickerBounds = await focalPointPicker.boundingBox();

			if ( markerPosition && pickerBounds ) {
				const centerX = pickerBounds.x + pickerBounds.width / 2;
				const centerY = pickerBounds.y + pickerBounds.height / 2;

				// Verify marker is within ±20px range from center
				expect(
					Math.abs(
						markerPosition.x + markerPosition.width / 2 - centerX
					)
				).toBeLessThan( 20 );
				expect(
					Math.abs(
						markerPosition.y + markerPosition.height / 2 - centerY
					)
				).toBeLessThan( 20 );
			}
		}
	} );

	test( 'Breakpoint value validation - range limits', async ( { page } ) => {
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

			// Test value smaller than minimum
			await breakpointInput.fill( '50' );
			await breakpointInput.blur();
			await expect( breakpointInput ).toHaveValue( '100' ); // VALIDATION.MIN_BREAKPOINT

			// Test value larger than maximum
			await breakpointInput.fill( '3000' );
			await breakpointInput.blur();
			await expect( breakpointInput ).toHaveValue( '2000' ); // VALIDATION.MAX_BREAKPOINT

			// Test valid value
			await breakpointInput.fill( '1024' );
			await breakpointInput.blur();
			await expect( breakpointInput ).toHaveValue( '1024' );

			// Test negative value
			await breakpointInput.fill( '-100' );
			await breakpointInput.blur();
			await expect( breakpointInput ).toHaveValue( '100' ); // Clamped to minimum
		}
	} );

	test( 'Breakpoint value validation - invalid input', async ( { page } ) => {
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

			// Test string input
			await breakpointInput.fill( 'invalid' );
			await breakpointInput.blur();
			await expect( breakpointInput ).toHaveValue( '768' ); // Reset to default value

			// Test empty string
			await breakpointInput.fill( '' );
			await breakpointInput.blur();
			await expect( breakpointInput ).toHaveValue( '768' ); // Reset to default value

			// Test decimal point
			await breakpointInput.fill( '768.5' );
			await breakpointInput.blur();
			await expect( breakpointInput ).toHaveValue( '768' ); // Rounded to integer
		}
	} );

	test( 'Changing and validating media query type', async ( { page } ) => {
		await wpAdmin.openBlockInspector();

		const responsiveFocalPanel = page.locator(
			'text=Responsive Focal Points'
		);
		if ( await responsiveFocalPanel.isVisible() ) {
			await responsiveFocalPanel.click();
			await page.locator( 'button.crf-add-focal-point' ).click();

			const mediaTypeSelect = page.locator( 'select' ).first();
			const breakpointInput = page
				.locator( 'input[type="number"]' )
				.first();

			// Verify available options
			const options = await mediaTypeSelect
				.locator( 'option' )
				.allTextContents();
			expect( options ).toContain( 'Min Width' );
			expect( options ).toContain( 'Max Width' );

			// Change to min-width
			await mediaTypeSelect.selectOption( 'min-width' );
			await expect( mediaTypeSelect ).toHaveValue( 'min-width' );

			// Change to max-width
			await mediaTypeSelect.selectOption( 'max-width' );
			await expect( mediaTypeSelect ).toHaveValue( 'max-width' );

			// Verify value is properly preserved
			await breakpointInput.fill( '1200' );
			await mediaTypeSelect.selectOption( 'min-width' );
			await expect( breakpointInput ).toHaveValue( '1200' ); // Breakpoint value is preserved
		}
	} );

	test( 'Detailed focal point picker operations', async ( { page } ) => {
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
			const pickerBounds = await focalPointPicker.boundingBox();

			if ( pickerBounds ) {
				// Click top-left corner (equivalent to 0%, 0%)
				await page.mouse.click(
					pickerBounds.x + 5,
					pickerBounds.y + 5
				);

				// Verify marker moves to top-left
				const focalMarker = focalPointPicker.locator(
					'.components-focal-point-picker__icon_container'
				);
				const markerBounds = await focalMarker.boundingBox();
				expect( markerBounds!.x ).toBeLessThan(
					pickerBounds.x + pickerBounds.width * 0.2
				);
				expect( markerBounds!.y ).toBeLessThan(
					pickerBounds.y + pickerBounds.height * 0.2
				);

				// Click bottom-right corner (equivalent to 100%, 100%)
				await page.mouse.click(
					pickerBounds.x + pickerBounds.width - 5,
					pickerBounds.y + pickerBounds.height - 5
				);

				// Verify marker moves to bottom-right
				const newMarkerBounds = await focalMarker.boundingBox();
				expect( newMarkerBounds!.x ).toBeGreaterThan(
					pickerBounds.x + pickerBounds.width * 0.8
				);
				expect( newMarkerBounds!.y ).toBeGreaterThan(
					pickerBounds.y + pickerBounds.height * 0.8
				);

				// Click center (equivalent to 50%, 50%)
				await page.mouse.click(
					pickerBounds.x + pickerBounds.width / 2,
					pickerBounds.y + pickerBounds.height / 2
				);

				// Verify marker returns to center
				const centerMarkerBounds = await focalMarker.boundingBox();
				const centerX = pickerBounds.x + pickerBounds.width / 2;
				const centerY = pickerBounds.y + pickerBounds.height / 2;

				expect(
					Math.abs(
						centerMarkerBounds!.x +
							centerMarkerBounds!.width / 2 -
							centerX
					)
				).toBeLessThan( 20 );
				expect(
					Math.abs(
						centerMarkerBounds!.y +
							centerMarkerBounds!.height / 2 -
							centerY
					)
				).toBeLessThan( 20 );
			}
		}
	} );

	test( 'Interaction and validation with multiple breakpoints', async ( {
		page,
	} ) => {
		await wpAdmin.openBlockInspector();

		const responsiveFocalPanel = page.locator(
			'text=Responsive Focal Points'
		);
		if ( await responsiveFocalPanel.isVisible() ) {
			await responsiveFocalPanel.click();

			// Add 3 breakpoints
			const addButton = page.locator( 'button.crf-add-focal-point' );
			await addButton.click();
			await addButton.click();
			await addButton.click();

			const mediaTypeSelects = page.locator( 'select' );
			const breakpointInputs = page.locator( 'input[type="number"]' );

			// Apply different settings to each breakpoint
			const testConfigs = [
				{ mediaType: 'min-width', breakpoint: '1200' },
				{ mediaType: 'min-width', breakpoint: '768' },
				{ mediaType: 'max-width', breakpoint: '767' },
			];

			for ( let i = 0; i < testConfigs.length; i++ ) {
				await mediaTypeSelects
					.nth( i )
					.selectOption( testConfigs[ i ].mediaType );
				await breakpointInputs
					.nth( i )
					.fill( testConfigs[ i ].breakpoint );
			}

			// Verify settings are applied correctly
			for ( let i = 0; i < testConfigs.length; i++ ) {
				await expect( mediaTypeSelects.nth( i ) ).toHaveValue(
					testConfigs[ i ].mediaType
				);
				await expect( breakpointInputs.nth( i ) ).toHaveValue(
					testConfigs[ i ].breakpoint
				);
			}

			// Verify each focal point picker operates independently
			const focalPointPickers = page.locator(
				'.components-focal-point-picker'
			);
			expect( await focalPointPickers.count() ).toBe( 3 );

			// Click each picker to verify independence
			for ( let i = 0; i < 3; i++ ) {
				const picker = focalPointPickers.nth( i );
				const pickerBounds = await picker.boundingBox();

				if ( pickerBounds ) {
					// Click different positions on each picker
					const clickX =
						pickerBounds.x + ( pickerBounds.width * ( i + 1 ) ) / 4;
					const clickY =
						pickerBounds.y +
						( pickerBounds.height * ( i + 1 ) ) / 4;

					await page.mouse.click( clickX, clickY );

					// Verify marker is positioned correctly
					const marker = picker.locator(
						'.components-focal-point-picker__icon_container'
					);
					await expect( marker ).toBeVisible();
				}
			}
		}
	} );

	test( 'State management when deleting breakpoints', async ( { page } ) => {
		await wpAdmin.openBlockInspector();

		const responsiveFocalPanel = page.locator(
			'text=Responsive Focal Points'
		);
		if ( await responsiveFocalPanel.isVisible() ) {
			await responsiveFocalPanel.click();

			// Add and configure 3 breakpoints
			const addButton = page.locator( 'button.crf-add-focal-point' );
			await addButton.click();
			await addButton.click();
			await addButton.click();

			const breakpointInputs = page.locator( 'input[type="number"]' );
			await breakpointInputs.nth( 0 ).fill( '1200' );
			await breakpointInputs.nth( 1 ).fill( '768' );
			await breakpointInputs.nth( 2 ).fill( '400' );

			// Delete middle breakpoint (768px)
			const removeButtons = page.locator( 'button:has-text("Remove")' );
			await removeButtons.nth( 1 ).click();

			// Verify remaining 2 breakpoints retain correct values
			const remainingInputs = page.locator( 'input[type="number"]' );
			await expect( remainingInputs ).toHaveCount( 2 );
			await expect( remainingInputs.nth( 0 ) ).toHaveValue( '1200' );
			await expect( remainingInputs.nth( 1 ) ).toHaveValue( '400' );

			// Delete first breakpoint
			await removeButtons.nth( 0 ).click();

			// Verify one breakpoint remains
			await expect( remainingInputs ).toHaveCount( 1 );
			await expect( remainingInputs.nth( 0 ) ).toHaveValue( '400' );

			// Delete last breakpoint
			await removeButtons.nth( 0 ).click();

			// Verify "No responsive focal points set." is displayed
			await expect(
				page.locator( 'text=No responsive focal points set.' )
			).toBeVisible();
			await expect( page.locator( 'input[type="number"]' ) ).toHaveCount(
				0
			);
		}
	} );

	test( 'Edge cases: boundary value validation', async ( { page } ) => {
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

			// Boundary value tests
			const boundaryTests = [
				{ input: '100', expected: '100' }, // MIN_BREAKPOINT
				{ input: '2000', expected: '2000' }, // MAX_BREAKPOINT
				{ input: '99', expected: '100' }, // MIN_BREAKPOINT - 1
				{ input: '2001', expected: '2000' }, // MAX_BREAKPOINT + 1
				{ input: '0', expected: '100' }, // 0
				{ input: '999999', expected: '2000' }, // Extremely large value
			];

			for ( const boundaryTest of boundaryTests ) {
				await breakpointInput.fill( boundaryTest.input );
				await breakpointInput.blur();
				await expect( breakpointInput ).toHaveValue(
					boundaryTest.expected
				);
			}
		}
	} );

	test.afterEach( async ( { page } ) => {
		await page.close();
	} );
} );
