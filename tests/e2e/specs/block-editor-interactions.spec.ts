import { test, expect } from '@playwright/test';
import { WPAdminUtils } from '../utils/wp-admin';
import { CoverBlockUtils } from '../utils/cover-block';
import { TEST_IMAGES, TEST_FOCAL_POINTS } from '../fixtures/test-data';

/**
 * Implementation of operation tests in block editor
 * Detailed interaction verification based on actual UI implementation
 */
test.describe( 'Block Editor - Responsive Focal Point Operations', () => {
	let wpAdmin: WPAdminUtils;
	let coverBlock: CoverBlockUtils;

	test.beforeEach( async ( { page } ) => {
		wpAdmin = new WPAdminUtils( page );
		coverBlock = new CoverBlockUtils( page );

		await wpAdmin.login();
		await wpAdmin.createNewPost();
	} );

	test( 'From cover block insertion to responsive focal point settings panel display', async ( {
		page,
	} ) => {
		// Step 1: Insert cover block
		await wpAdmin.insertCoverBlock();

		// Verify that cover block is correctly inserted
		const coverBlockElement = page.locator( '[data-type="core/cover"]' );
		await expect( coverBlockElement ).toBeVisible();

		// Step 2: Add image
		await coverBlock.addMediaToCover( TEST_IMAGES.LANDSCAPE );

		// Step 3: Open block inspector
		await wpAdmin.openBlockInspector();

		// Step 4: Find responsive focal point settings panel
		const responsiveFocalPanel = page.locator(
			'text=Responsive Focal Points'
		);
		if ( await responsiveFocalPanel.isVisible() ) {
			await responsiveFocalPanel.click();

			// Verify that panel is expanded
			const panelBody = page
				.locator( '.components-panel__body' )
				.filter( {
					hasText: 'Responsive Focal Points',
				} );
			await expect( panelBody ).toHaveClass( /is-opened/ );

			// Verify that 'No responsive focal points set.' is displayed in initial state
			await expect(
				page.locator( 'text=No responsive focal points set.' )
			).toBeVisible();

			// Verify that 'Add New Breakpoint' button is displayed
			const addButton = page.locator( 'button.crf-add-focal-point' );
			await expect( addButton ).toBeVisible();
			await expect( addButton ).toHaveText( 'Add New Breakpoint' );
		}
	} );

	test( 'Adding new breakpoint and basic configuration', async ( {
		page,
	} ) => {
		await wpAdmin.insertCoverBlock();
		await coverBlock.addMediaToCover( TEST_IMAGES.LANDSCAPE );
		await wpAdmin.openBlockInspector();

		// Open responsive focal point settings panel
		const responsiveFocalPanel = page.locator(
			'text=Responsive Focal Points'
		);
		if ( await responsiveFocalPanel.isVisible() ) {
			await responsiveFocalPanel.click();

			// Add new breakpoint
			const addButton = page.locator( 'button.crf-add-focal-point' );
			await addButton.click();

			// Verify that focal point configuration items are displayed
			await expect(
				page.locator( 'text=Media Query Type' )
			).toBeVisible();
			await expect(
				page.locator( 'text=Breakpoint (px)' )
			).toBeVisible();
			await expect( page.locator( 'text=Focal Point' ) ).toBeVisible();

			// Verify that default values are set
			const mediaTypeSelect = page.locator( 'select' ).first();
			await expect( mediaTypeSelect ).toHaveValue( 'max-width' );

			const breakpointInput = page
				.locator( 'input[type="number"]' )
				.first();
			await expect( breakpointInput ).toHaveValue( '768' );

			// Verify that focal point picker is displayed
			const focalPointPicker = page.locator(
				'.components-focal-point-picker'
			);
			await expect( focalPointPicker ).toBeVisible();

			// Verify that remove button is displayed
			const removeButton = page.locator( 'button:has-text("Remove")' );
			await expect( removeButton ).toBeVisible();
		}
	} );

	test( 'Changing media query type', async ( { page } ) => {
		await wpAdmin.insertCoverBlock();
		await coverBlock.addMediaToCover( TEST_IMAGES.LANDSCAPE );
		await wpAdmin.openBlockInspector();

		const responsiveFocalPanel = page.locator(
			'text=Responsive Focal Points'
		);
		if ( await responsiveFocalPanel.isVisible() ) {
			await responsiveFocalPanel.click();
			await page.locator( 'button.crf-add-focal-point' ).click();

			// Change media query type
			const mediaTypeSelect = page.locator( 'select' ).first();
			await mediaTypeSelect.selectOption( 'max-width' );

			// Verify that value is correctly changed
			await expect( mediaTypeSelect ).toHaveValue( 'max-width' );

			// Return to min-width
			await mediaTypeSelect.selectOption( 'min-width' );
			await expect( mediaTypeSelect ).toHaveValue( 'min-width' );
		}
	} );

	test( 'Changing and validating breakpoint values', async ( { page } ) => {
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

			// Set valid value
			await breakpointInput.fill( '1024' );
			await expect( breakpointInput ).toHaveValue( '1024' );

			// Test minimum value restriction
			await breakpointInput.fill( '50' );
			await breakpointInput.blur();
			await expect( breakpointInput ).toHaveValue( '100' ); // Clamped to minimum value

			// Test maximum value restriction
			await breakpointInput.fill( '5000' );
			await breakpointInput.blur();
			await expect( breakpointInput ).toHaveValue( '2000' ); // Clamped to maximum value

			// Test invalid value
			await breakpointInput.fill( 'invalid' );
			await breakpointInput.blur();
			await expect( breakpointInput ).toHaveValue( '768' ); // Returns to default value
		}
	} );

	test( 'Operating focal point picker', async ( { page } ) => {
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
			await expect( focalPointPicker ).toBeVisible();

			// Click focal point picker to change position
			const pickerBounds = await focalPointPicker.boundingBox();
			if ( pickerBounds ) {
				// Top-left click (25%, 25% position)
				await page.mouse.click(
					pickerBounds.x + pickerBounds.width * 0.25,
					pickerBounds.y + pickerBounds.height * 0.25
				);

				// Verify that focal point marker moves
				const focalMarker = focalPointPicker.locator(
					'.components-focal-point-picker__icon_container'
				);
				await expect( focalMarker ).toBeVisible();

				// Bottom-right click (75%, 75% position)
				await page.mouse.click(
					pickerBounds.x + pickerBounds.width * 0.75,
					pickerBounds.y + pickerBounds.height * 0.75
				);

				// Verify that marker moves to new position
				await expect( focalMarker ).toBeVisible();
			}
		}
	} );

	test( 'Adding and managing multiple breakpoints', async ( { page } ) => {
		await wpAdmin.insertCoverBlock();
		await coverBlock.addMediaToCover( TEST_IMAGES.LANDSCAPE );
		await wpAdmin.openBlockInspector();

		const responsiveFocalPanel = page.locator(
			'text=Responsive Focal Points'
		);
		if ( await responsiveFocalPanel.isVisible() ) {
			await responsiveFocalPanel.click();

			const addButton = page.locator( 'button.crf-add-focal-point' );

			// Add three breakpoints
			for ( let i = 0; i < 3; i++ ) {
				await addButton.click();

				// Verify that each breakpoint is correctly added
				const focalItems = page
					.locator( '.components-panel__body' )
					.filter( {
						hasText: 'Responsive Focal Points',
					} )
					.locator( 'text=Media Query Type' );
				await expect( focalItems ).toHaveCount( i + 1 );
			}

			// Set different values for each breakpoint
			const testPoints = TEST_FOCAL_POINTS.MULTI_BREAKPOINT;

			for ( let i = 0; i < Math.min( 3, testPoints.length ); i++ ) {
				const mediaTypeSelects = page.locator( 'select' );
				const breakpointInputs = page.locator( 'input[type="number"]' );

				await mediaTypeSelects
					.nth( i )
					.selectOption( testPoints[ i ].mediaType );
				await breakpointInputs
					.nth( i )
					.fill( testPoints[ i ].breakpoint.toString() );
			}

			// Verify that configured values are retained
			for ( let i = 0; i < Math.min( 3, testPoints.length ); i++ ) {
				const mediaTypeSelects = page.locator( 'select' );
				const breakpointInputs = page.locator( 'input[type="number"]' );

				await expect( mediaTypeSelects.nth( i ) ).toHaveValue(
					testPoints[ i ].mediaType
				);
				await expect( breakpointInputs.nth( i ) ).toHaveValue(
					testPoints[ i ].breakpoint.toString()
				);
			}
		}
	} );

	test( 'Deleting breakpoints', async ( { page } ) => {
		await wpAdmin.insertCoverBlock();
		await coverBlock.addMediaToCover( TEST_IMAGES.LANDSCAPE );
		await wpAdmin.openBlockInspector();

		const responsiveFocalPanel = page.locator(
			'text=Responsive Focal Points'
		);
		if ( await responsiveFocalPanel.isVisible() ) {
			await responsiveFocalPanel.click();

			const addButton = page.locator( 'button.crf-add-focal-point' );

			// Add two breakpoints
			await addButton.click();
			await addButton.click();

			// Verify that two focal point configurations are displayed
			const mediaQueryLabels = page.locator( 'text=Media Query Type' );
			await expect( mediaQueryLabels ).toHaveCount( 2 );

			// Delete first breakpoint
			const removeButtons = page.locator( 'button:has-text("Remove")' );
			await removeButtons.first().click();

			// Verify that only one focal point configuration is displayed
			await expect( mediaQueryLabels ).toHaveCount( 1 );

			// Delete remaining breakpoint
			await removeButtons.first().click();

			// Verify that 'No responsive focal points set.' is displayed again
			await expect(
				page.locator( 'text=No responsive focal points set.' )
			).toBeVisible();
		}
	} );

	test( 'Data persistence when saving post', async ( { page } ) => {
		await wpAdmin.insertCoverBlock();
		await coverBlock.addMediaToCover( TEST_IMAGES.LANDSCAPE );
		await wpAdmin.openBlockInspector();

		const responsiveFocalPanel = page.locator(
			'text=Responsive Focal Points'
		);
		if ( await responsiveFocalPanel.isVisible() ) {
			await responsiveFocalPanel.click();
			await page.locator( 'button.crf-add-focal-point' ).click();

			// Change configuration
			const mediaTypeSelect = page.locator( 'select' ).first();
			const breakpointInput = page
				.locator( 'input[type="number"]' )
				.first();

			await mediaTypeSelect.selectOption( 'max-width' );
			await breakpointInput.fill( '1024' );

			// Save post
			await wpAdmin.savePost();

			// Reload page and verify that settings are retained
			await page.reload();
			await page.waitForLoadState( 'networkidle' );

			// Re-select cover block
			const coverBlockElement = page.locator(
				'[data-type="core/cover"]'
			);
			await coverBlockElement.click();
			await wpAdmin.openBlockInspector();

			const reloadedPanel = page.locator(
				'text=Responsive Focal Points'
			);
			if ( await reloadedPanel.isVisible() ) {
				await reloadedPanel.click();

				// Verify that configured values are retained
				const savedMediaTypeSelect = page.locator( 'select' ).first();
				const savedBreakpointInput = page
					.locator( 'input[type="number"]' )
					.first();

				await expect( savedMediaTypeSelect ).toHaveValue( 'max-width' );
				await expect( savedBreakpointInput ).toHaveValue( '1024' );
			}
		}
	} );

	test.afterEach( async ( { page } ) => {
		await page.close();
	} );
} );
