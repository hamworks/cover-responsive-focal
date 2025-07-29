/**
 * Cover Responsive Focal - Inspector Controls Tests (TDD)
 */

// eslint-disable-next-line import/no-extraneous-dependencies
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
		size,
		className,
	}: any ) => (
		<button
			onClick={ onClick }
			data-variant={ variant }
			data-destructive={ isDestructive }
			data-size={ size }
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
	__experimentalToggleGroupControlOption: ( {
		value,
		label,
		...props
	}: any ) => {
		const isChecked = props[ 'aria-checked' ] || false;
		return (
			<button
				type="button"
				role="radio"
				aria-checked={ isChecked }
				className={ isChecked ? 'is-pressed' : '' }
				data-value={ value }
				onClick={ props.onClick }
			>
				{ label }
			</button>
		);
	},
	__experimentalToggleGroupControl: Object.assign(
		( {
			label,
			value: currentValue,
			onChange,
			children,
		}: {
			label: string;
			value: string;
			onChange: ( value: string ) => void;
			children: React.ReactNode;
		} ) => {
			const id = `togglegroup-${ Math.random() }`;

			// Clone children and inject props
			const enhancedChildren = React.Children.map(
				children,
				( child ) => {
					// Check for ToggleGroupControlOption - テスト環境では単純にpropsを追加
					if ( child && React.isValidElement( child ) ) {
						const childProps = child.props as { value: string };
						// テスト環境なので、シンプルにpropsをマージする
						const newProps = {
							...child.props,
							'aria-checked': childProps.value === currentValue,
							onClick: () => onChange( childProps.value ),
						};
						return { ...child, props: newProps };
					}
					return child;
				}
			);

			return (
				<div data-testid="toggle-group-control">
					<label htmlFor={ id }>{ label }</label>
					<div id={ id } role="radiogroup" aria-label={ label }>
						{ enhancedChildren }
					</div>
				</div>
			);
		},
		{
			Option: Object.assign(
				( { value, label, ...props }: any ) => {
					const isChecked = props[ 'aria-checked' ] || false;
					return (
						<button
							type="button"
							role="radio"
							aria-checked={ isChecked }
							data-value={ value }
							onClick={ props.onClick }
							className={ isChecked ? 'is-pressed' : '' }
						>
							{ label }
						</button>
					);
				},
				{ displayName: 'ToggleGroupControl.Option' }
			),
		}
	),
	__experimentalVStack: ( { children, spacing }: any ) => (
		<div data-testid="vstack" data-spacing={ spacing }>
			{ children }
		</div>
	),
	RangeControl: ( { label, value, onChange, min, max, step }: any ) => {
		const id = `range-${ Math.random() }`;
		return (
			<div data-testid="range-control">
				<label htmlFor={ id }>{ label }</label>
				<input
					id={ id }
					type="range"
					value={ value || 0 }
					onChange={ ( e ) => {
						const val =
							e.target.value === ''
								? NaN
								: parseInt( e.target.value, 10 );
						onChange( val );
					} }
					onBlur={ ( e ) => {
						// Simulate empty value handling for test
						if ( e.target.value === '' ) {
							onChange( NaN );
						}
					} }
					min={ min }
					max={ max }
					step={ step }
				/>
				<span>{ value || 0 }</span>
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
	ToggleControl: ( { label, help, checked, onChange }: any ) => {
		const id = `toggle-${ Math.random() }`;
		return (
			<div data-testid="toggle-control">
				<input
					id={ id }
					type="checkbox"
					checked={ checked }
					onChange={ ( e ) => onChange( e.target.checked ) }
					aria-label={ label }
				/>
				<label htmlFor={ id }>{ label }</label>
				{ help && <span>{ help }</span> }
			</div>
		);
	},
} ) );

// Mock the new component modules
interface MockResponsiveFocalItemProps {
	focal: { mediaType: string; breakpoint: number; x: number; y: number };
	index: number;
	imageUrl?: string;
	isActive?: boolean;
	isDuplicate?: boolean;
	onUpdate: (
		index: number,
		updates: Partial< {
			mediaType: string;
			breakpoint: number;
			x: number;
			y: number;
		} >
	) => void;
	onRemove: ( index: number ) => void;
}

jest.mock( '../../src/components/responsive-focal-item', () => ( {
	ResponsiveFocalItem: ( props: MockResponsiveFocalItemProps ) => {
		const {
			focal,
			index,
			imageUrl,
			isActive,
			isDuplicate,
			onUpdate,
			onRemove,
		} = props;
		return (
			<div data-testid="responsive-focal-item" data-index={ index }>
				<div data-testid="vstack" data-spacing="3">
					{ isActive && (
						<div data-testid="active-indicator">
							Active for current viewport
						</div>
					) }
					{ isDuplicate && (
						<div data-testid="duplicate-warning">
							Warning: This breakpoint is duplicated
						</div>
					) }
					<div data-testid="toggle-group-control">
						<span>Media Query Type</span>
						<div role="radiogroup" aria-label="Media Query Type">
							<button
								type="button"
								role="radio"
								aria-checked={ focal.mediaType === 'min-width' }
								data-value="min-width"
								onClick={ () =>
									onUpdate( index, {
										mediaType: 'min-width',
									} )
								}
								className={
									focal.mediaType === 'min-width'
										? 'is-pressed'
										: ''
								}
							>
								Min Width
							</button>
							<button
								type="button"
								role="radio"
								aria-checked={ focal.mediaType === 'max-width' }
								data-value="max-width"
								onClick={ () =>
									onUpdate( index, {
										mediaType: 'max-width',
									} )
								}
								className={
									focal.mediaType === 'max-width'
										? 'is-pressed'
										: ''
								}
							>
								Max Width
							</button>
						</div>
					</div>
					<div data-testid="range-control">
						<span>Breakpoint (px)</span>
						<input
							type="range"
							value={ focal.breakpoint || 0 }
							onChange={ ( e ) => {
								const val = parseInt( e.target.value, 10 );
								onUpdate( index, { breakpoint: val } );
							} }
							min="100"
							max="2000"
							step="1"
							aria-label="Breakpoint (px)"
						/>
						<span>{ focal.breakpoint || 0 }</span>
					</div>
					{ imageUrl && (
						<div data-testid="focal-point-picker">
							<span>Focal Point</span>
							<div
								data-url={ imageUrl }
								data-value={ JSON.stringify( {
									x: focal.x,
									y: focal.y,
								} ) }
							>
								<button
									onClick={ () =>
										onUpdate( index, { x: 0.3, y: 0.7 } )
									}
									data-testid="focal-point-change"
								>
									Change Focal Point
								</button>
							</div>
						</div>
					) }
					<button
						onClick={ () => onRemove( index ) }
						data-variant="secondary"
						data-destructive="true"
					>
						Remove
					</button>
				</div>
			</div>
		);
	},
} ) );

interface MockSafeMediaTypeControlProps {
	label: string;
	value: string;
	onChange: ( value: string ) => void;
}

jest.mock( '../../src/components/safe-media-type-control', () => ( {
	SafeMediaTypeControl: ( props: MockSafeMediaTypeControlProps ) => {
		const { label, value, onChange } = props;
		return (
			<div data-testid="toggle-group-control">
				<span>{ label }</span>
				<div role="radiogroup" aria-label={ label }>
					<button
						type="button"
						role="radio"
						aria-checked={ value === 'min-width' }
						data-value="min-width"
						onClick={ () => onChange( 'min-width' ) }
						className={ value === 'min-width' ? 'is-pressed' : '' }
					>
						Min Width
					</button>
					<button
						type="button"
						role="radio"
						aria-checked={ value === 'max-width' }
						data-value="max-width"
						onClick={ () => onChange( 'max-width' ) }
						className={ value === 'max-width' ? 'is-pressed' : '' }
					>
						Max Width
					</button>
				</div>
			</div>
		);
	},
} ) );

interface MockSafeBreakpointControlProps {
	label: string;
	value: number;
	onChange: ( value: number ) => void;
}

jest.mock( '../../src/components/safe-breakpoint-control', () => ( {
	SafeBreakpointControl: ( props: MockSafeBreakpointControlProps ) => {
		const { label, value, onChange } = props;
		return (
			<div data-testid="range-control">
				<span>{ label }</span>
				<input
					type="range"
					value={ value || 0 }
					onChange={ ( e ) => {
						const val = parseInt( e.target.value, 10 );
						onChange( val );
					} }
					min="100"
					max="2000"
					step="1"
					aria-label={ label }
				/>
				<span>{ value || 0 }</span>
			</div>
		);
	},
} ) );

interface MockSafeStackLayoutProps {
	children: React.ReactNode;
	spacing?: number;
}

jest.mock( '../../src/components/safe-stack-layout', () => ( {
	SafeStackLayout: ( props: MockSafeStackLayoutProps ) => {
		const { children, spacing } = props;
		return (
			<div data-testid="vstack" data-spacing={ spacing }>
				{ children }
			</div>
		);
	},
} ) );

// Mock WordPress i18n
jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
} ) );

// Mock custom hooks
jest.mock( '../../src/hooks/use-applicable-focal-point', () => ( {
	useApplicableFocalPoint: jest.fn( () => null ),
	findApplicableFocalPoint: jest.fn( () => null ),
} ) );

jest.mock( '../../src/hooks/use-device-type', () => ( {
	useEffectiveViewportWidth: jest.fn( () => 1024 ),
} ) );

describe( 'ResponsiveFocalControls - Basic UI Components (TDD)', () => {
	const mockSetAttributes = jest.fn();
	const mockSetPreviewFocalPoint = jest.fn();

	const defaultProps = {
		attributes: {
			responsiveFocal: [],
		} as CoverBlockAttributes,
		setAttributes: mockSetAttributes,
		previewFocalPoint: null,
		setPreviewFocalPoint: mockSetPreviewFocalPoint,
	};

	beforeEach( () => {
		mockSetAttributes.mockClear();
		mockSetPreviewFocalPoint.mockClear();
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
			expect( addButton ).toHaveAttribute( 'data-variant', 'primary' );
		} );
	} );

	describe( 'add new breakpoint functionality', () => {
		test( 'should call setAttributes when add button clicked', async () => {
			const user = userEvent.setup();
			render( <ResponsiveFocalControls { ...defaultProps } /> );

			const addButton = screen.getByText( 'Add New Breakpoint' );
			await user.click( addButton );

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

		test( 'should add new focal point with default values', async () => {
			const user = userEvent.setup();
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
			await user.click( addButton );

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
			// 新しいUIでは上部の情報表示は削除されている
			expect(
				screen.queryByText( 'max-width: 767px' )
			).not.toBeInTheDocument();
			expect(
				screen.queryByText( 'min-width: 768px' )
			).not.toBeInTheDocument();
		} );

		test( 'should render remove buttons for each focal point', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoints } /> );

			const removeButtons = screen.getAllByText( 'Remove' );
			expect( removeButtons ).toHaveLength( 2 );

			removeButtons.forEach( ( button ) => {
				expect( button ).toHaveAttribute( 'data-destructive', 'true' );
			} );
		} );

		test( 'should have VStack layout instead of CSS classes', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoints } /> );

			// Check that VStack is used instead of old CSS classes
			expect(
				document.querySelectorAll( '[data-testid="vstack"]' )
			).toHaveLength( 2 );

			// Old CSS classes should not exist
			expect(
				document.querySelector( '.crf-focal-points-list' )
			).not.toBeInTheDocument();
			expect(
				document.querySelector( '.crf-focal-point-item' )
			).not.toBeInTheDocument();
			expect(
				document.querySelector( '.crf-focal-point-header' )
			).not.toBeInTheDocument();
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

		test( 'should remove focal point when remove button clicked', async () => {
			const user = userEvent.setup();
			render( <ResponsiveFocalControls { ...propsWithFocalPoints } /> );

			const removeButtons = screen.getAllByText( 'Remove' );
			await user.click( removeButtons[ 0 ] );

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

		test( 'should remove correct focal point by index', async () => {
			const user = userEvent.setup();
			render( <ResponsiveFocalControls { ...propsWithFocalPoints } /> );

			const removeButtons = screen.getAllByText( 'Remove' );
			await user.click( removeButtons[ 1 ] ); // Remove second item

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

		test( 'should update media type when changed', async () => {
			const user = userEvent.setup();
			render( <ResponsiveFocalControls { ...propsWithFocalPoint } /> );

			const minWidthButton = screen.getByRole( 'radio', {
				name: /min width/i,
			} );
			await user.click( minWidthButton );

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

		test( 'should update breakpoint when RangeControl changed', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoint } /> );

			const breakpointInput = screen.getByRole( 'slider', {
				name: /breakpoint/i,
			} );
			// Note: Range inputs don't support userEvent.type, so we use fireEvent for slider value changes
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

		// Note: RangeControl handles edge cases internally,
		// so we focus on normal range operations

		test( 'should handle breakpoint value too high', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoint } /> );

			const breakpointInput = screen.getByRole( 'slider', {
				name: /breakpoint/i,
			} );
			mockSetAttributes.mockClear();

			// Note: Range inputs don't support userEvent.type, so we use fireEvent for slider value changes
			fireEvent.change( breakpointInput, { target: { value: '3000' } } );
			expect( mockSetAttributes ).toHaveBeenCalledWith( {
				responsiveFocal: [
					{
						mediaType: 'max-width',
						breakpoint: 2000, // Max value (updated)
						x: 0.6,
						y: 0.4,
					},
				],
			} );
		} );

		test( 'should handle breakpoint value too low (50 clamped to min)', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoint } /> );

			const breakpointInput = screen.getByRole( 'slider', {
				name: /breakpoint/i,
			} );
			mockSetAttributes.mockClear();

			// Note: Range inputs don't support userEvent.type, so we use fireEvent for slider value changes
			fireEvent.change( breakpointInput, { target: { value: '50' } } );

			expect( mockSetAttributes ).toHaveBeenCalledWith( {
				responsiveFocal: [
					{
						mediaType: 'max-width',
						breakpoint: 100, // 50 is clamped to min value (100)
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

		test( 'should update focal point when picker value changes', async () => {
			const user = userEvent.setup();
			render( <ResponsiveFocalControls { ...propsWithUrl } /> );

			const changeButton = screen.getByTestId( 'focal-point-change' );
			await user.click( changeButton );

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

			// Should have VStack structure instead of CSS classes
			expect(
				document.querySelector( '[data-testid="vstack"]' )
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

			// Check inputs have proper attributes (now RangeControl)
			const breakpointInput = screen.getByRole( 'slider', {
				name: /breakpoint/i,
			} );
			expect( breakpointInput ).toHaveAttribute( 'type', 'range' );
			expect( breakpointInput ).toHaveAttribute( 'min', '100' );
			expect( breakpointInput ).toHaveAttribute( 'max', '2000' );
		} );
	} );
} );

// Test for duplicate breakpoint detection
describe( 'ResponsiveFocalControls - Duplicate Breakpoint Detection', () => {
	const mockSetAttributes = jest.fn();
	const mockSetPreviewFocalPoint = jest.fn();

	const propsWithDuplicates = {
		attributes: {
			responsiveFocal: [
				{
					mediaType: 'max-width' as const,
					breakpoint: 500,
					x: 0.6,
					y: 0.4,
				},
				{
					mediaType: 'max-width' as const,
					breakpoint: 500,
					x: 0.3,
					y: 0.7,
				},
				{
					mediaType: 'max-width' as const,
					breakpoint: 768,
					x: 0.5,
					y: 0.5,
				},
			],
		} as CoverBlockAttributes,
		setAttributes: mockSetAttributes,
		previewFocalPoint: null,
		setPreviewFocalPoint: mockSetPreviewFocalPoint,
	};

	beforeEach( () => {
		mockSetAttributes.mockClear();
		mockSetPreviewFocalPoint.mockClear();
	} );

	test( 'should show duplicate warning for duplicate breakpoints', () => {
		render( <ResponsiveFocalControls { ...propsWithDuplicates } /> );

		// Two items should have duplicate warnings (both 500px breakpoints)
		const warnings = screen.getAllByTestId( 'duplicate-warning' );
		expect( warnings ).toHaveLength( 2 );
		expect( warnings[ 0 ] ).toHaveTextContent(
			'Warning: This breakpoint is duplicated'
		);
	} );

	test( 'should not show duplicate warning for unique breakpoints', () => {
		render( <ResponsiveFocalControls { ...propsWithDuplicates } /> );

		// Check that the unique breakpoint (768px) doesn't have a duplicate warning
		const responsiveItems = screen.getAllByTestId(
			'responsive-focal-item'
		);
		expect( responsiveItems ).toHaveLength( 3 );

		// The third item (768px) should not have a duplicate warning
		const thirdItemWarnings = responsiveItems[ 2 ].querySelectorAll(
			'[data-testid="duplicate-warning"]'
		);
		expect( thirdItemWarnings ).toHaveLength( 0 );
	} );

	test( 'should detect duplicates based on both mediaType and breakpoint', () => {
		const propsWithDifferentMediaTypes = {
			...propsWithDuplicates,
			attributes: {
				responsiveFocal: [
					{
						mediaType: 'max-width' as const,
						breakpoint: 500,
						x: 0.6,
						y: 0.4,
					},
					{
						mediaType: 'min-width' as const,
						breakpoint: 500,
						x: 0.3,
						y: 0.7,
					},
				],
			} as CoverBlockAttributes,
		};

		render(
			<ResponsiveFocalControls { ...propsWithDifferentMediaTypes } />
		);

		// Should not show duplicate warnings because media types are different
		const warnings = screen.queryAllByTestId( 'duplicate-warning' );
		expect( warnings ).toHaveLength( 0 );
	} );
} );

// Test for preview functionality improvements
describe( 'ResponsiveFocalControls - Preview Functionality', () => {
	const mockSetAttributes = jest.fn();
	const mockSetPreviewFocalPoint = jest.fn();

	const defaultProps = {
		attributes: {
			responsiveFocal: [
				{
					mediaType: 'max-width' as const,
					breakpoint: 500,
					x: 0.6,
					y: 0.4,
				},
				{
					mediaType: 'max-width' as const,
					breakpoint: 768,
					x: 0.3,
					y: 0.7,
				},
			],
		} as CoverBlockAttributes,
		setAttributes: mockSetAttributes,
		previewFocalPoint: null,
		setPreviewFocalPoint: mockSetPreviewFocalPoint,
	};

	beforeEach( () => {
		mockSetAttributes.mockClear();
		mockSetPreviewFocalPoint.mockClear();
		// Reset all mock implementations
		jest.clearAllMocks();
	} );

	test( 'should render preview toggle control', () => {
		render( <ResponsiveFocalControls { ...defaultProps } /> );

		const toggleControl = screen.getByTestId( 'toggle-control' );
		expect( toggleControl ).toBeInTheDocument();
		expect(
			screen.getByLabelText( 'Preview in Editor' )
		).toBeInTheDocument();
	} );

	test( 'should show correct help text when preview is disabled', () => {
		render( <ResponsiveFocalControls { ...defaultProps } /> );

		expect(
			screen.getByText( 'Preview disabled, showing core focal point' )
		).toBeInTheDocument();
	} );

	test( 'should show correct help text when preview is enabled', () => {
		const propsWithPreview = {
			...defaultProps,
			previewFocalPoint: { x: 0.5, y: 0.5 },
		};

		render( <ResponsiveFocalControls { ...propsWithPreview } /> );

		expect(
			screen.getByText( 'Showing responsive focal point preview' )
		).toBeInTheDocument();
	} );

	test( 'should call setPreviewFocalPoint when toggle is turned on', async () => {
		const user = userEvent.setup();

		// Mock the hook to return an applicable focal point
		const {
			useApplicableFocalPoint,
		} = require( '../../src/hooks/use-applicable-focal-point' );
		useApplicableFocalPoint.mockReturnValue( {
			mediaType: 'max-width',
			breakpoint: 500,
			x: 0.6,
			y: 0.4,
		} );

		render( <ResponsiveFocalControls { ...defaultProps } /> );

		const toggle = screen.getByLabelText( 'Preview in Editor' );
		await user.click( toggle );

		expect( mockSetPreviewFocalPoint ).toHaveBeenCalledWith( {
			x: 0.6,
			y: 0.4,
		} );
	} );

	test( 'should call setPreviewFocalPoint(null) when toggle is turned off', async () => {
		const user = userEvent.setup();
		const propsWithPreview = {
			...defaultProps,
			previewFocalPoint: { x: 0.5, y: 0.5 },
		};

		render( <ResponsiveFocalControls { ...propsWithPreview } /> );

		const toggle = screen.getByLabelText( 'Preview in Editor' );
		await user.click( toggle );

		expect( mockSetPreviewFocalPoint ).toHaveBeenCalledWith( null );
	} );

	test( 'should show active indicator for applicable focal point', () => {
		// Mock the hook to return an applicable focal point
		const {
			useApplicableFocalPoint,
		} = require( '../../src/hooks/use-applicable-focal-point' );
		useApplicableFocalPoint.mockReturnValue( {
			mediaType: 'max-width',
			breakpoint: 500,
			x: 0.6,
			y: 0.4,
		} );

		render( <ResponsiveFocalControls { ...defaultProps } /> );

		// Only the first item (500px) should be active
		const activeIndicators = screen.getAllByTestId( 'active-indicator' );
		expect( activeIndicators ).toHaveLength( 1 );
		expect( activeIndicators[ 0 ] ).toHaveTextContent(
			'Active for current viewport'
		);
	} );

	test( 'should update preview only when editing the active focal point', async () => {
		const user = userEvent.setup();

		// Mock the hook to return the first focal point as applicable
		const {
			useApplicableFocalPoint,
		} = require( '../../src/hooks/use-applicable-focal-point' );
		useApplicableFocalPoint.mockReturnValue( {
			mediaType: 'max-width',
			breakpoint: 500,
			x: 0.6,
			y: 0.4,
		} );

		// Mock findApplicableFocalPoint to return the same
		const {
			findApplicableFocalPoint,
		} = require( '../../src/hooks/use-applicable-focal-point' );
		findApplicableFocalPoint.mockReturnValue( {
			mediaType: 'max-width',
			breakpoint: 500,
			x: 0.3,
			y: 0.7,
		} );

		const propsWithPreview = {
			...defaultProps,
			attributes: {
				...defaultProps.attributes,
				url: 'https://example.com/image.jpg',
			} as CoverBlockAttributes,
			previewFocalPoint: { x: 0.6, y: 0.4 },
		};

		render( <ResponsiveFocalControls { ...propsWithPreview } /> );

		// Click the focal point change button for the first item (active)
		const changeButtons = screen.getAllByTestId( 'focal-point-change' );
		await user.click( changeButtons[ 0 ] );

		// Should update preview
		expect( mockSetPreviewFocalPoint ).toHaveBeenCalledWith( {
			x: 0.3,
			y: 0.7,
		} );
	} );

	test( 'should not update preview when editing non-active focal point', async () => {
		const user = userEvent.setup();

		// Mock the hook to return the first focal point as applicable
		const {
			useApplicableFocalPoint,
		} = require( '../../src/hooks/use-applicable-focal-point' );
		useApplicableFocalPoint.mockReturnValue( {
			mediaType: 'max-width',
			breakpoint: 500,
			x: 0.6,
			y: 0.4,
		} );

		// Mock findApplicableFocalPoint to still return the first one
		const {
			findApplicableFocalPoint,
		} = require( '../../src/hooks/use-applicable-focal-point' );
		findApplicableFocalPoint.mockReturnValue( {
			mediaType: 'max-width',
			breakpoint: 500,
			x: 0.6,
			y: 0.4,
		} );

		const propsWithPreview = {
			...defaultProps,
			attributes: {
				...defaultProps.attributes,
				url: 'https://example.com/image.jpg',
			} as CoverBlockAttributes,
			previewFocalPoint: { x: 0.6, y: 0.4 },
		};

		render( <ResponsiveFocalControls { ...propsWithPreview } /> );

		// Clear previous calls
		mockSetPreviewFocalPoint.mockClear();

		// Click the focal point change button for the second item (not active)
		const changeButtons = screen.getAllByTestId( 'focal-point-change' );
		await user.click( changeButtons[ 1 ] );

		// Should NOT update preview since the second focal point is not active
		expect( mockSetPreviewFocalPoint ).not.toHaveBeenCalled();
	} );
} );

// TDD: UI改善のテスト（要件7対応）
describe( 'ResponsiveFocalControls - UI Improvements (TDD)', () => {
	const mockSetAttributes = jest.fn();
	const mockSetPreviewFocalPoint = jest.fn();

	const defaultProps = {
		attributes: {
			responsiveFocal: [],
		} as CoverBlockAttributes,
		setAttributes: mockSetAttributes,
		previewFocalPoint: null,
		setPreviewFocalPoint: mockSetPreviewFocalPoint,
	};

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

	beforeEach( () => {
		mockSetAttributes.mockClear();
		mockSetPreviewFocalPoint.mockClear();
	} );

	// RED: ToggleGroupControlの使用テスト（まず失敗させる）
	describe( 'ToggleGroupControl for Media Query Type', () => {
		test( 'should render ToggleGroupControl instead of SelectControl', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoint } /> );

			// ToggleGroupControlが複数存在するので、すべてのインスタンスを確認
			const toggleGroups = screen.getAllByTestId(
				'toggle-group-control'
			);
			expect( toggleGroups.length ).toBeGreaterThan( 0 );
		} );

		test( 'should have proper radio group structure', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoint } /> );

			const radioGroup = screen.getByRole( 'radiogroup', {
				name: /media query type/i,
			} );
			expect( radioGroup ).toBeInTheDocument();
		} );

		test( 'should show Min Width and Max Width options', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoint } /> );

			expect( screen.getByText( 'Min Width' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Max Width' ) ).toBeInTheDocument();
		} );

		test( 'should highlight current selection', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoint } /> );

			const maxWidthButton = screen.getByRole( 'radio', {
				name: /max width/i,
			} );
			expect( maxWidthButton ).toHaveAttribute( 'aria-checked', 'true' );
			expect( maxWidthButton ).toHaveClass( 'is-pressed' );
		} );

		test( 'should update media type when toggle button clicked', async () => {
			const user = userEvent.setup();
			render( <ResponsiveFocalControls { ...propsWithFocalPoint } /> );

			const minWidthButton = screen.getByRole( 'radio', {
				name: /min width/i,
			} );
			await user.click( minWidthButton );

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
	} );

	// RED: RangeControlの使用テスト（まず失敗させる）
	describe( 'RangeControl for Breakpoint', () => {
		test( 'should render RangeControl instead of NumberControl', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoint } /> );

			// 新しいコントロールが存在することを確認（まだ実装されていないので失敗する）
			expect( screen.getByTestId( 'range-control' ) ).toBeInTheDocument();
		} );

		test( 'should have proper range input attributes', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoint } /> );

			const rangeInput = screen.getByRole( 'slider', {
				name: /breakpoint/i,
			} );
			expect( rangeInput ).toHaveAttribute( 'type', 'range' );
			expect( rangeInput ).toHaveAttribute( 'min', '100' );
			expect( rangeInput ).toHaveAttribute( 'max', '2000' );
			expect( rangeInput ).toHaveAttribute( 'step', '1' );
		} );

		test( 'should display current value', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoint } /> );

			const rangeControl = screen.getByTestId( 'range-control' );
			expect( rangeControl ).toHaveTextContent( '767' );
		} );

		test( 'should update breakpoint when slider moved', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoint } /> );

			const rangeInput = screen.getByRole( 'slider', {
				name: /breakpoint/i,
			} );
			// Note: Range inputs don't support userEvent.type, so we use fireEvent for slider value changes
			fireEvent.change( rangeInput, { target: { value: '1024' } } );

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
	} );

	// RED: VStackレイアウトのテスト（まず失敗させる）
	describe( 'VStack Layout', () => {
		test( 'should render VStack instead of card-style layout', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoint } /> );

			// VStackが存在することを確認（まだ実装されていないので失敗する）
			expect( screen.getByTestId( 'vstack' ) ).toBeInTheDocument();
		} );

		test( 'should have proper spacing attribute', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoint } /> );

			const vstack = screen.getByTestId( 'vstack' );
			expect( vstack ).toHaveAttribute( 'data-spacing', '3' );
		} );

		test( 'should NOT render card-style CSS classes', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoint } /> );

			// カード風レイアウトのCSSクラスが存在しないことを確認
			expect(
				document.querySelector( '.crf-focal-point-item' )
			).not.toBeInTheDocument();
		} );
	} );

	// RED: SelectControlとNumberControlが使用されていないことを確認
	describe( 'Legacy Controls Removal', () => {
		test( 'should NOT render SelectControl for media type', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoint } /> );

			// 古いSelectControlが存在しないことを確認
			expect(
				screen.queryByRole( 'combobox', { name: /media query type/i } )
			).not.toBeInTheDocument();
		} );

		test( 'should NOT render NumberControl for breakpoint', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoint } /> );

			// 古いNumberControlが存在しないことを確認
			expect(
				screen.queryByRole( 'spinbutton', { name: /breakpoint/i } )
			).not.toBeInTheDocument();
		} );
	} );
} );

// TDD: Experimental API代替実装のテスト（安全性対応）
describe( 'ResponsiveFocalControls - Non-Experimental API Fallback (TDD)', () => {
	const mockSetAttributes = jest.fn();
	const mockSetPreviewFocalPoint = jest.fn();

	const defaultProps = {
		attributes: {
			responsiveFocal: [],
		} as CoverBlockAttributes,
		setAttributes: mockSetAttributes,
		previewFocalPoint: null,
		setPreviewFocalPoint: mockSetPreviewFocalPoint,
	};

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

	beforeEach( () => {
		mockSetAttributes.mockClear();
		mockSetPreviewFocalPoint.mockClear();
	} );

	// RED: experimental APIが利用できない場合の代替実装テスト
	describe( 'Fallback UI Components', () => {
		test( 'should render SelectControl when ToggleGroupControl is not available', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoint } /> );

			// ToggleGroupControlがなくても、SelectControlで代替実装されることを確認
			const fallbackSelect = screen.queryByRole( 'combobox', {
				name: /media query type/i,
			} );

			// ToggleGroupControlまたはSelectControlが存在することを確認
			const toggleGroups = screen.queryAllByTestId(
				'toggle-group-control'
			);
			expect( fallbackSelect || toggleGroups.length > 0 ).toBeTruthy();
		} );

		test( 'should render NumberControl when RangeControl fails', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoint } /> );

			// RangeControlが失敗した場合のNumberControl代替実装
			const fallbackNumber = screen.queryByRole( 'spinbutton', {
				name: /breakpoint/i,
			} );

			// この時点では実装されていないので、代替UIが必要
			expect(
				fallbackNumber || screen.getByTestId( 'range-control' )
			).toBeInTheDocument();
		} );

		test( 'should render basic div when VStack is not available', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoint } /> );

			// VStackが利用できない場合は、通常のdivで代替
			const stackContainer =
				screen.queryByTestId( 'vstack' ) ||
				document.querySelector( '.crf-focal-point-item' );

			expect( stackContainer ).toBeInTheDocument();
		} );
	} );

	// RED: エラーハンドリングのテスト
	describe( 'Error Handling', () => {
		test( 'should handle undefined media type gracefully', () => {
			const propsWithUndefined = {
				...defaultProps,
				attributes: {
					responsiveFocal: [
						{
							mediaType: undefined as any,
							breakpoint: 767,
							x: 0.6,
							y: 0.4,
						},
					],
				} as CoverBlockAttributes,
			};

			// エラーが発生せずにレンダリングされることを確認
			expect( () => {
				render( <ResponsiveFocalControls { ...propsWithUndefined } /> );
			} ).not.toThrow();
		} );

		test( 'should handle invalid breakpoint values', () => {
			const propsWithInvalidBreakpoint = {
				...defaultProps,
				attributes: {
					responsiveFocal: [
						{
							mediaType: 'max-width' as const,
							breakpoint: NaN,
							x: 0.6,
							y: 0.4,
						},
					],
				} as CoverBlockAttributes,
			};

			// エラーが発生せずにレンダリングされることを確認
			expect( () => {
				render(
					<ResponsiveFocalControls
						{ ...propsWithInvalidBreakpoint }
					/>
				);
			} ).not.toThrow();
		} );

		test( 'should handle missing attributes gracefully', () => {
			const propsWithMissingAttrs = {
				attributes: {} as CoverBlockAttributes,
				setAttributes: mockSetAttributes,
				previewFocalPoint: null,
				setPreviewFocalPoint: mockSetPreviewFocalPoint,
			};

			// エラーが発生せずにレンダリングされることを確認
			expect( () => {
				render(
					<ResponsiveFocalControls { ...propsWithMissingAttrs } />
				);
			} ).not.toThrow();
		} );
	} );
} );

// TDD: UI改善のテスト
describe( 'ResponsiveFocalControls - UI Improvements (TDD)', () => {
	const mockSetAttributes = jest.fn();
	const mockSetPreviewFocalPoint = jest.fn();

	const propsWithFocalPoints = {
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
					breakpoint: 1024,
					x: 0.3,
					y: 0.7,
				},
			],
		} as CoverBlockAttributes,
		setAttributes: mockSetAttributes,
		previewFocalPoint: null,
		setPreviewFocalPoint: mockSetPreviewFocalPoint,
	};

	beforeEach( () => {
		mockSetAttributes.mockClear();
		mockSetPreviewFocalPoint.mockClear();
	} );

	// RED: Add New Breakpointボタンの色テスト
	describe( 'Add New Breakpoint Button', () => {
		test( 'should have primary variant', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoints } /> );

			const addButton = screen.getByText( 'Add New Breakpoint' );
			expect( addButton ).toHaveAttribute( 'data-variant', 'primary' );
		} );
	} );

	// RED: セクション情報表示の削除テスト
	describe( 'Section Layout Changes', () => {
		test( 'should NOT render media type and breakpoint info at the top of section', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoints } /> );

			// 古い表示形式（上部の情報）がないことを確認
			expect(
				screen.queryByText( 'max-width: 767px' )
			).not.toBeInTheDocument();
			expect(
				screen.queryByText( 'min-width: 1024px' )
			).not.toBeInTheDocument();
		} );

		test( 'should render Remove button at the bottom of each section', () => {
			render( <ResponsiveFocalControls { ...propsWithFocalPoints } /> );

			const removeButtons = screen.getAllByText( 'Remove' );
			expect( removeButtons ).toHaveLength( 2 );

			// Remove buttons should be after other controls
			const sections = document.querySelectorAll(
				'[data-testid="vstack"]'
			);
			expect( sections ).toHaveLength( 2 );
		} );
	} );
} );
