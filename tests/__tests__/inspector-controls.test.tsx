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
	}: any ) => (
		<button
			onClick={ onClick }
			data-variant={ variant }
			data-destructive={ isDestructive }
			data-small={ isSmall }
			className={ className }
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
	TextControl: ( { label, value, onChange, type, min, max }: any ) => {
		const id = `input-${ Math.random() }`;
		return (
			<div>
				<label htmlFor={ id }>{ label }</label>
				<input
					id={ id }
					type={ type }
					value={ value }
					onChange={ ( e ) => onChange( e.target.value ) }
					min={ min }
					max={ max }
				/>
			</div>
		);
	},
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

		test( 'should update breakpoint when changed', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoint } /> );

			const breakpointInput = screen.getByDisplayValue( '767' );
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

			const breakpointInput = screen.getByDisplayValue( '767' );
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

			const breakpointInput = screen.getByDisplayValue( '767' );
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

			const breakpointInput = screen.getByDisplayValue( '767' );
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
			const breakpointInput = screen.getByDisplayValue( '767' );
			expect( breakpointInput ).toHaveAttribute( 'type', 'number' );
			expect( breakpointInput ).toHaveAttribute( 'min', '1' );
			expect( breakpointInput ).toHaveAttribute( 'max', '9999' );
		} );
	} );
} );
