/**
 * Cover Responsive Focal - Inspector Controls Tests (TDD)
 */

// eslint-disable-next-line import/no-extraneous-dependencies
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResponsiveFocalControls } from '../../src/inspector-controls';
import type { CoverBlockAttributes } from '../../src/types';

// Mock WordPress components
jest.mock( '@wordpress/components', () => ( {
	PanelBody: ( { title, children, initialOpen }: any ) => (
		<div data-testid="panel-body" data-initial-open={ initialOpen }>
			<h3>{ title }</h3>
			{ children }
		</div>
	),
	Button: ( {
		children,
		onClick,
		variant,
		isDestructive,
		isSmall,
		className,
		disabled,
		'aria-label': ariaLabel,
	}: any ) => (
		<button
			onClick={ onClick }
			data-variant={ variant }
			data-destructive={ isDestructive }
			data-small={ isSmall }
			className={ className }
			disabled={ disabled }
			aria-label={ ariaLabel }
		>
			{ children }
		</button>
	),
	SelectControl: ( { label, value, options, onChange }: any ) => {
		const id = `select-${ Math.random() }`;
		return (
			<div>
				<label htmlFor={ id }>{ label }</label>
				<select
					id={ id }
					role="combobox"
					aria-label={ label }
					value={ value }
					onChange={ ( e ) => onChange( e.target.value ) }
				>
					{ options.map( ( option: any ) => (
						<option key={ option.value } value={ option.value }>
							{ option.label }
						</option>
					) ) }
				</select>
			</div>
		);
	},
	__experimentalNumberControl: ( {
		label,
		value,
		onChange,
		min,
		max,
		step,
	}: any ) => {
		const id = `numbercontrol-${ Math.random() }`;
		return (
			<div>
				<label htmlFor={ id }>{ label }</label>
				<input
					id={ id }
					type="number"
					value={ value }
					onChange={ ( e ) =>
						onChange( parseInt( e.target.value, 10 ) )
					}
					min={ min }
					max={ max }
					step={ step }
				/>
			</div>
		);
	},
	ButtonGroup: ( { children }: any ) => (
		<div className="components-button-group">{ children }</div>
	),
	FocalPointPicker: ( { label, url, value, onChange }: any ) => {
		const id = `focal-${ Math.random() }`;
		return (
			<div data-testid="focal-point-picker">
				<label htmlFor={ id }>{ label }</label>
				<div
					id={ id }
					data-url={ url }
					data-value={ JSON.stringify( value ) }
				>
					<button
						onClick={ () => onChange( { x: 0.3, y: 0.7 } ) }
						data-testid="focal-point-change"
					>
						Change Focal Point
					</button>
				</div>
			</div>
		);
	},
} ) );

// Mock WordPress icons
jest.mock( '@wordpress/icons', () => ( {
	dragHandle: (
		<svg className="drag-handle-icon">
			<title>Drag Handle</title>
		</svg>
	),
	chevronUp: (
		<svg className="chevron-up-icon">
			<title>Move Up</title>
		</svg>
	),
	chevronDown: (
		<svg className="chevron-down-icon">
			<title>Move Down</title>
		</svg>
	),
} ) );

// Mock WordPress element
jest.mock( '@wordpress/element', () => ( {
	useState: ( initialValue: any ) => {
		let value = initialValue;
		const setValue = ( newValue: any ) => {
			value =
				typeof newValue === 'function' ? newValue( value ) : newValue;
		};
		return [ value, setValue ];
	},
	useCallback: ( fn: any ) => fn,
} ) );

// Mock WordPress i18n
jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
} ) );

describe( 'ResponsiveFocalControls - Basic UI Components (TDD)', () => {
	const mockSetAttributes = jest.fn();

	const defaultProps = {
		attributes: {
			responsiveFocal: [],
		} as CoverBlockAttributes,
		setAttributes: mockSetAttributes,
	};

	beforeEach( () => {
		mockSetAttributes.mockClear();
	} );

	describe( 'PanelBody structure', () => {
		test( 'should render PanelBody with correct title', () => {
			render( <ResponsiveFocalControls { ...defaultProps } /> );

			expect(
				screen.getByText( 'Responsive Focal Points' )
			).toBeInTheDocument();
			expect( screen.getByTestId( 'panel-body' ) ).toHaveAttribute(
				'data-initial-open',
				'false'
			);
		} );
	} );

	describe( 'empty state', () => {
		test( 'should show empty state message when no focal points', () => {
			render( <ResponsiveFocalControls { ...defaultProps } /> );

			expect(
				screen.getByText( 'No responsive focal points set.' )
			).toBeInTheDocument();
		} );

		test( 'should show add button in empty state', () => {
			render( <ResponsiveFocalControls { ...defaultProps } /> );

			const addButton = screen.getByText( 'Add New Breakpoint' );
			expect( addButton ).toBeInTheDocument();
			expect( addButton ).toHaveAttribute( 'data-variant', 'secondary' );
		} );
	} );

	describe( 'add new breakpoint functionality', () => {
		test( 'should call setAttributes when add button clicked', () => {
			render( <ResponsiveFocalControls { ...defaultProps } /> );

			const addButton = screen.getByText( 'Add New Breakpoint' );
			fireEvent.click( addButton );

			expect( mockSetAttributes ).toHaveBeenCalledWith( {
				responsiveFocal: [
					{
						mediaType: 'max-width',
						breakpoint: 768,
						x: 0.5,
						y: 0.5,
					},
				],
			} );
		} );

		test( 'should add new focal point with default values', () => {
			const propsWithExisting = {
				...defaultProps,
				attributes: {
					responsiveFocal: [
						{
							mediaType: 'min-width' as const,
							breakpoint: 1024,
							x: 0.3,
							y: 0.7,
						},
					],
				} as CoverBlockAttributes,
			};

			render( <ResponsiveFocalControls { ...propsWithExisting } /> );

			const addButton = screen.getByText( 'Add New Breakpoint' );
			fireEvent.click( addButton );

			expect( mockSetAttributes ).toHaveBeenCalledWith( {
				responsiveFocal: [
					{
						mediaType: 'min-width',
						breakpoint: 1024,
						x: 0.3,
						y: 0.7,
					},
					{
						mediaType: 'max-width',
						breakpoint: 768,
						x: 0.5,
						y: 0.5,
					},
				],
			} );
		} );
	} );

	describe( 'focal points list rendering', () => {
		const propsWithFocalPoints = {
			...defaultProps,
			attributes: {
				responsiveFocal: [
					{
						mediaType: 'max-width' as const,
						breakpoint: 767,
						x: 0.6,
						y: 0.4,
					},
					{
						mediaType: 'min-width' as const,
						breakpoint: 768,
						x: 0.3,
						y: 0.7,
					},
				],
			} as CoverBlockAttributes,
		};

		test( 'should render focal points list when items exist', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoints } /> );

			expect(
				screen.queryByText( 'No responsive focal points set.' )
			).not.toBeInTheDocument();
			expect(
				screen.getByText( 'max-width: 767px' )
			).toBeInTheDocument();
			expect(
				screen.getByText( 'min-width: 768px' )
			).toBeInTheDocument();
		} );

		test( 'should render remove buttons for each focal point', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoints } /> );

			const removeButtons = screen.getAllByText( 'Remove' );
			expect( removeButtons ).toHaveLength( 2 );

			removeButtons.forEach( ( button ) => {
				expect( button ).toHaveAttribute( 'data-destructive', 'true' );
				expect( button ).toHaveAttribute( 'data-small', 'true' );
			} );
		} );

		test( 'should have correct CSS classes', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoints } /> );

			expect(
				document.querySelector( '.crf-focal-points-list' )
			).toBeInTheDocument();
			expect(
				document.querySelectorAll( '.crf-focal-point-item' )
			).toHaveLength( 2 );
			expect(
				document.querySelectorAll( '.crf-focal-point-header' )
			).toHaveLength( 2 );
		} );
	} );

	describe( 'remove focal point functionality', () => {
		const propsWithFocalPoints = {
			...defaultProps,
			attributes: {
				responsiveFocal: [
					{
						mediaType: 'max-width' as const,
						breakpoint: 767,
						x: 0.6,
						y: 0.4,
					},
					{
						mediaType: 'min-width' as const,
						breakpoint: 768,
						x: 0.3,
						y: 0.7,
					},
				],
			} as CoverBlockAttributes,
		};

		test( 'should remove focal point when remove button clicked', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoints } /> );

			const removeButtons = screen.getAllByText( 'Remove' );
			fireEvent.click( removeButtons[ 0 ] );

			expect( mockSetAttributes ).toHaveBeenCalledWith( {
				responsiveFocal: [
					{
						mediaType: 'min-width',
						breakpoint: 768,
						x: 0.3,
						y: 0.7,
					},
				],
			} );
		} );

		test( 'should remove correct focal point by index', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoints } /> );

			const removeButtons = screen.getAllByText( 'Remove' );
			fireEvent.click( removeButtons[ 1 ] ); // Remove second item

			expect( mockSetAttributes ).toHaveBeenCalledWith( {
				responsiveFocal: [
					{
						mediaType: 'max-width',
						breakpoint: 767,
						x: 0.6,
						y: 0.4,
					},
				],
			} );
		} );
	} );

	describe( 'update focal point functionality', () => {
		const propsWithFocalPoint = {
			...defaultProps,
			attributes: {
				responsiveFocal: [
					{
						mediaType: 'max-width' as const,
						breakpoint: 767,
						x: 0.6,
						y: 0.4,
					},
				],
			} as CoverBlockAttributes,
		};

		test( 'should update media type when changed', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoint } /> );

			const mediaTypeSelect = screen.getByRole( 'combobox', {
				name: /media query type/i,
			} );
			fireEvent.change( mediaTypeSelect, {
				target: { value: 'min-width' },
			} );

			expect( mockSetAttributes ).toHaveBeenCalledWith( {
				responsiveFocal: [
					{
						mediaType: 'min-width',
						breakpoint: 767,
						x: 0.6,
						y: 0.4,
					},
				],
			} );
		} );

		test( 'should update breakpoint when NumberControl changed', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoint } /> );

			const breakpointInput = screen.getByDisplayValue( 767 );
			fireEvent.change( breakpointInput, { target: { value: '1024' } } );

			expect( mockSetAttributes ).toHaveBeenCalledWith( {
				responsiveFocal: [
					{
						mediaType: 'max-width',
						breakpoint: 1024,
						x: 0.6,
						y: 0.4,
					},
				],
			} );
		} );

		test( 'should handle empty breakpoint value', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoint } /> );

			const breakpointInput = screen.getByDisplayValue( 767 );
			mockSetAttributes.mockClear();

			fireEvent.change( breakpointInput, { target: { value: '' } } );
			expect( mockSetAttributes ).toHaveBeenCalledWith( {
				responsiveFocal: [
					{
						mediaType: 'max-width',
						breakpoint: 768, // Default fallback
						x: 0.6,
						y: 0.4,
					},
				],
			} );
		} );

		test( 'should handle breakpoint value too high', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoint } /> );

			const breakpointInput = screen.getByDisplayValue( 767 );
			mockSetAttributes.mockClear();

			fireEvent.change( breakpointInput, { target: { value: '10000' } } );
			expect( mockSetAttributes ).toHaveBeenCalledWith( {
				responsiveFocal: [
					{
						mediaType: 'max-width',
						breakpoint: 9999, // Max value
						x: 0.6,
						y: 0.4,
					},
				],
			} );
		} );

		test( 'should handle breakpoint value too low (0 treated as invalid)', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoint } /> );

			const breakpointInput = screen.getByDisplayValue( 767 );
			mockSetAttributes.mockClear();

			fireEvent.change( breakpointInput, { target: { value: '0' } } );

			expect( mockSetAttributes ).toHaveBeenCalledWith( {
				responsiveFocal: [
					{
						mediaType: 'max-width',
						breakpoint: 768, // 0 is treated as invalid, defaults to 768
						x: 0.6,
						y: 0.4,
					},
				],
			} );
		} );
	} );

	describe( 'preset breakpoints functionality', () => {
		const propsWithFocalPoint = {
			...defaultProps,
			attributes: {
				responsiveFocal: [
					{
						mediaType: 'max-width' as const,
						breakpoint: 767,
						x: 0.6,
						y: 0.4,
					},
				],
			} as CoverBlockAttributes,
		};

		test( 'should render preset buttons with correct labels', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoint } /> );

			expect( screen.getByText( '320px' ) ).toBeInTheDocument();
			expect( screen.getByText( '768px' ) ).toBeInTheDocument();
			expect( screen.getByText( '1024px' ) ).toBeInTheDocument();
			expect( screen.getByText( '1200px' ) ).toBeInTheDocument();
		} );

		test( 'should highlight active preset button', () => {
			const propsWithPreset = {
				...defaultProps,
				attributes: {
					responsiveFocal: [
						{
							mediaType: 'max-width' as const,
							breakpoint: 768,
							x: 0.6,
							y: 0.4,
						},
					],
				} as CoverBlockAttributes,
			};

			render( <ResponsiveFocalControls { ...propsWithPreset } /> );

			const activeButton = screen.getByText( '768px' );
			expect( activeButton ).toHaveAttribute( 'data-variant', 'primary' );

			const inactiveButton = screen.getByText( '320px' );
			expect( inactiveButton ).toHaveAttribute(
				'data-variant',
				'secondary'
			);
		} );

		test( 'should update breakpoint when preset button clicked', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoint } /> );

			const presetButton = screen.getByText( '1024px' );
			fireEvent.click( presetButton );

			expect( mockSetAttributes ).toHaveBeenCalledWith( {
				responsiveFocal: [
					{
						mediaType: 'max-width',
						breakpoint: 1024,
						x: 0.6,
						y: 0.4,
					},
				],
			} );
		} );

		test( 'should render presets label', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoint } /> );

			expect( screen.getByText( 'Presets:' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'focal point picker integration', () => {
		const propsWithUrl = {
			...defaultProps,
			attributes: {
				url: 'https://example.com/image.jpg',
				responsiveFocal: [
					{
						mediaType: 'max-width' as const,
						breakpoint: 767,
						x: 0.6,
						y: 0.4,
					},
				],
			} as CoverBlockAttributes,
		};

		test( 'should show focal point picker when URL exists', () => {
			render( <ResponsiveFocalControls { ...propsWithUrl } /> );

			expect(
				screen.getByTestId( 'focal-point-picker' )
			).toBeInTheDocument();
			expect( screen.getByText( 'Focal Point' ) ).toBeInTheDocument();
		} );

		test( 'should not show focal point picker when URL is missing', () => {
			const propsWithoutUrl = {
				...defaultProps,
				attributes: {
					responsiveFocal: [
						{
							mediaType: 'max-width' as const,
							breakpoint: 767,
							x: 0.6,
							y: 0.4,
						},
					],
				} as CoverBlockAttributes,
			};

			render( <ResponsiveFocalControls { ...propsWithoutUrl } /> );

			expect(
				screen.queryByTestId( 'focal-point-picker' )
			).not.toBeInTheDocument();
		} );

		test( 'should update focal point when picker value changes', () => {
			render( <ResponsiveFocalControls { ...propsWithUrl } /> );

			const changeButton = screen.getByTestId( 'focal-point-change' );
			fireEvent.click( changeButton );

			expect( mockSetAttributes ).toHaveBeenCalledWith( {
				responsiveFocal: [
					{
						mediaType: 'max-width',
						breakpoint: 767,
						x: 0.3,
						y: 0.7,
					},
				],
			} );
		} );
	} );

	describe( 'drag and drop reordering functionality', () => {
		const propsWithMultipleFocalPoints = {
			...defaultProps,
			attributes: {
				responsiveFocal: [
					{
						mediaType: 'max-width' as const,
						breakpoint: 320,
						x: 0.2,
						y: 0.3,
					},
					{
						mediaType: 'max-width' as const,
						breakpoint: 768,
						x: 0.5,
						y: 0.5,
					},
					{
						mediaType: 'min-width' as const,
						breakpoint: 1024,
						x: 0.8,
						y: 0.7,
					},
				],
			} as CoverBlockAttributes,
		};

		test( 'should render drag handles for each focal point', () => {
			render(
				<ResponsiveFocalControls { ...propsWithMultipleFocalPoints } />
			);

			const dragHandles = document.querySelectorAll( '.crf-drag-handle' );
			expect( dragHandles ).toHaveLength( 3 );

			// Each drag handle should have proper accessibility attributes
			dragHandles.forEach( ( handle ) => {
				expect( handle ).toHaveAttribute( 'role', 'button' );
				expect( handle ).toHaveAttribute( 'tabindex', '0' );
				expect( handle ).toHaveAttribute( 'aria-label' );
			} );
		} );

		test( 'should render move up button for items that can move up', () => {
			render(
				<ResponsiveFocalControls { ...propsWithMultipleFocalPoints } />
			);

			// First item should not have move up button
			const firstItem = document.querySelector( '.crf-focal-point-item' );
			expect(
				firstItem?.querySelector( '.crf-move-up' )
			).not.toBeInTheDocument();

			// Second and third items should have move up buttons
			const moveUpButtons = document.querySelectorAll( '.crf-move-up' );
			expect( moveUpButtons ).toHaveLength( 2 );
		} );

		test( 'should render move down button for items that can move down', () => {
			render(
				<ResponsiveFocalControls { ...propsWithMultipleFocalPoints } />
			);

			// First and second items should have move down buttons
			const moveDownButtons =
				document.querySelectorAll( '.crf-move-down' );
			expect( moveDownButtons ).toHaveLength( 2 );

			// Last item should not have move down button
			const allItems = document.querySelectorAll(
				'.crf-focal-point-item'
			);
			const lastItem = allItems[ allItems.length - 1 ];
			expect(
				lastItem?.querySelector( '.crf-move-down' )
			).not.toBeInTheDocument();
		} );

		test( 'should move item up when move up button clicked', () => {
			render(
				<ResponsiveFocalControls { ...propsWithMultipleFocalPoints } />
			);

			// Click move up button on second item (index 1)
			const moveUpButtons = document.querySelectorAll( '.crf-move-up' );
			fireEvent.click( moveUpButtons[ 0 ] );

			expect( mockSetAttributes ).toHaveBeenCalledWith( {
				responsiveFocal: [
					{
						mediaType: 'max-width',
						breakpoint: 768,
						x: 0.5,
						y: 0.5,
					},
					{
						mediaType: 'max-width',
						breakpoint: 320,
						x: 0.2,
						y: 0.3,
					},
					{
						mediaType: 'min-width',
						breakpoint: 1024,
						x: 0.8,
						y: 0.7,
					},
				],
			} );
		} );

		test( 'should move item down when move down button clicked', () => {
			render(
				<ResponsiveFocalControls { ...propsWithMultipleFocalPoints } />
			);

			// Click move down button on first item (index 0)
			const moveDownButtons =
				document.querySelectorAll( '.crf-move-down' );
			fireEvent.click( moveDownButtons[ 0 ] );

			expect( mockSetAttributes ).toHaveBeenCalledWith( {
				responsiveFocal: [
					{
						mediaType: 'max-width',
						breakpoint: 768,
						x: 0.5,
						y: 0.5,
					},
					{
						mediaType: 'max-width',
						breakpoint: 320,
						x: 0.2,
						y: 0.3,
					},
					{
						mediaType: 'min-width',
						breakpoint: 1024,
						x: 0.8,
						y: 0.7,
					},
				],
			} );
		} );

		test( 'should handle keyboard navigation for drag handle', () => {
			render(
				<ResponsiveFocalControls { ...propsWithMultipleFocalPoints } />
			);

			const firstDragHandle =
				document.querySelector( '.crf-drag-handle' );

			// Should handle Enter key
			fireEvent.keyDown( firstDragHandle!, { key: 'Enter' } );
			// Test that focus management or drag mode is activated
			expect( firstDragHandle ).toHaveClass( 'is-dragging' );

			// Should handle Escape key to cancel drag
			fireEvent.keyDown( firstDragHandle!, { key: 'Escape' } );
			expect( firstDragHandle ).not.toHaveClass( 'is-dragging' );
		} );

		test( 'should provide visual feedback during drag operation', () => {
			render(
				<ResponsiveFocalControls { ...propsWithMultipleFocalPoints } />
			);

			const firstItem = document.querySelector( '.crf-focal-point-item' );
			const dragHandle = firstItem?.querySelector( '.crf-drag-handle' );

			// Simulate drag start
			fireEvent.dragStart( dragHandle! );

			expect( firstItem ).toHaveClass( 'is-dragging' );
		} );
	} );

	describe( 'accessibility and structure', () => {
		test( 'should have proper button attributes', () => {
			render( <ResponsiveFocalControls { ...defaultProps } /> );

			const addButton = screen.getByText( 'Add New Breakpoint' );
			expect( addButton.tagName ).toBe( 'BUTTON' );
			expect( addButton ).toHaveClass( 'crf-add-focal-point' );
		} );

		test( 'should have semantic structure', () => {
			const propsWithFocalPoints = {
				...defaultProps,
				attributes: {
					responsiveFocal: [
						{
							mediaType: 'max-width' as const,
							breakpoint: 767,
							x: 0.6,
							y: 0.4,
						},
					],
				} as CoverBlockAttributes,
			};

			render( <ResponsiveFocalControls { ...propsWithFocalPoints } /> );

			// Should have proper heading structure
			expect(
				screen.getByText( 'Responsive Focal Points' ).tagName
			).toBe( 'H3' );

			// Should have proper list structure
			expect(
				document.querySelector( '.crf-focal-points-list' )
			).toBeInTheDocument();
			expect(
				document.querySelector( '.crf-focal-point-item' )
			).toBeInTheDocument();
		} );

		test( 'should have proper form controls with labels', () => {
			const propsWithFocalPoint = {
				...defaultProps,
				attributes: {
					responsiveFocal: [
						{
							mediaType: 'max-width' as const,
							breakpoint: 767,
							x: 0.6,
							y: 0.4,
						},
					],
				} as CoverBlockAttributes,
			};

			render( <ResponsiveFocalControls { ...propsWithFocalPoint } /> );

			// Check form controls have proper labels
			expect(
				screen.getByText( 'Media Query Type' )
			).toBeInTheDocument();
			expect( screen.getByText( 'Breakpoint (px)' ) ).toBeInTheDocument();

			// Check inputs have proper attributes
			const breakpointInput = screen.getByDisplayValue( 767 );
			expect( breakpointInput ).toHaveAttribute( 'type', 'number' );
			expect( breakpointInput ).toHaveAttribute( 'min', '1' );
			expect( breakpointInput ).toHaveAttribute( 'max', '9999' );
		} );
	} );
} );
