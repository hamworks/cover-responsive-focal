/**
 * Cover Responsive Focal - Inspector Controls
 */

/* eslint-disable @wordpress/no-unsafe-wp-apis */
import { __ } from '@wordpress/i18n';
import {
	PanelBody,
	Button,
	SelectControl,
	__experimentalNumberControl as NumberControl,
	FocalPointPicker,
	ButtonGroup,
} from '@wordpress/components';
import { dragHandle, chevronUp, chevronDown } from '@wordpress/icons';
import { useState, useCallback } from '@wordpress/element';
import type {
	ResponsiveFocalControlsProps,
	ResponsiveFocalPoint,
} from './types';
import {
	MEDIA_QUERY_TYPES,
	DEFAULTS,
	BREAKPOINT_PRESETS,
	VALIDATION,
	type MediaQueryType,
} from './constants';

/**
 * Responsive focal point settings UI
 * @param root0
 * @param root0.attributes
 * @param root0.setAttributes
 */
export const ResponsiveFocalControls: React.FC<
	ResponsiveFocalControlsProps
> = ( { attributes, setAttributes } ) => {
	const { responsiveFocal = [] } = attributes;
	const [ draggedItem, setDraggedItem ] = useState< number | null >( null );

	/**
	 * Add new focal point row
	 */
	const addNewFocalPoint = () => {
		const newFocalPoint: ResponsiveFocalPoint = {
			mediaType: DEFAULTS.MEDIA_TYPE,
			breakpoint: DEFAULTS.BREAKPOINT,
			x: DEFAULTS.FOCAL_X,
			y: DEFAULTS.FOCAL_Y,
		};

		setAttributes( {
			responsiveFocal: [ ...responsiveFocal, newFocalPoint ],
		} );
	};

	/**
	 * Remove focal point row
	 * @param index
	 */
	const removeFocalPoint = ( index: number ) => {
		const updatedFocals = responsiveFocal.filter( ( _, i ) => i !== index );
		setAttributes( { responsiveFocal: updatedFocals } );
	};

	/**
	 * Update focal point row
	 * @param index
	 * @param updates
	 */
	const updateFocalPoint = (
		index: number,
		updates: Partial< ResponsiveFocalPoint >
	) => {
		const updatedFocals = [ ...responsiveFocal ];
		updatedFocals[ index ] = { ...updatedFocals[ index ], ...updates };
		setAttributes( { responsiveFocal: updatedFocals } );
	};

	/**
	 * Move focal point up in the list
	 * @param index
	 */
	const moveFocalPointUp = useCallback(
		( index: number ) => {
			if ( index <= 0 ) {
				return;
			}

			const updatedFocals = [ ...responsiveFocal ];
			const temp = updatedFocals[ index ];
			updatedFocals[ index ] = updatedFocals[ index - 1 ];
			updatedFocals[ index - 1 ] = temp;

			setAttributes( { responsiveFocal: updatedFocals } );
		},
		[ responsiveFocal, setAttributes ]
	);

	/**
	 * Move focal point down in the list
	 * @param index
	 */
	const moveFocalPointDown = useCallback(
		( index: number ) => {
			if ( index >= responsiveFocal.length - 1 ) {
				return;
			}

			const updatedFocals = [ ...responsiveFocal ];
			const temp = updatedFocals[ index ];
			updatedFocals[ index ] = updatedFocals[ index + 1 ];
			updatedFocals[ index + 1 ] = temp;

			setAttributes( { responsiveFocal: updatedFocals } );
		},
		[ responsiveFocal, setAttributes ]
	);

	/**
	 * Handle drag start
	 * @param event
	 * @param index
	 */
	const handleDragStart = useCallback(
		( event: React.DragEvent, index: number ) => {
			setDraggedItem( index );
			// Add dragging class to the item
			const item = ( event.target as HTMLElement ).closest(
				'.crf-focal-point-item'
			);
			if ( item ) {
				item.classList.add( 'is-dragging' );
			}
		},
		[]
	);

	/**
	 * Handle drag end
	 */
	const handleDragEnd = useCallback( ( event: React.DragEvent ) => {
		setDraggedItem( null );
		// Remove dragging class from the item
		const item = ( event.target as HTMLElement ).closest(
			'.crf-focal-point-item'
		);
		if ( item ) {
			item.classList.remove( 'is-dragging' );
		}
	}, [] );

	/**
	 * Handle keyboard navigation for drag handles
	 * @param event
	 * @param index
	 */
	const handleDragHandleKeyDown = useCallback(
		( event: React.KeyboardEvent, index: number ) => {
			if ( event.key === 'Enter' ) {
				event.preventDefault();
				setDraggedItem( index );
				( event.target as HTMLElement ).classList.add( 'is-dragging' );
			} else if ( event.key === 'Escape' ) {
				event.preventDefault();
				setDraggedItem( null );
				( event.target as HTMLElement ).classList.remove(
					'is-dragging'
				);
			}
		},
		[]
	);

	return (
		<PanelBody
			title={ __( 'Responsive Focal Points', 'cover-responsive-focal' ) }
			initialOpen={ false }
		>
			{ responsiveFocal.length === 0 ? (
				<p>
					{ __(
						'No responsive focal points set.',
						'cover-responsive-focal'
					) }
				</p>
			) : (
				<div className="crf-focal-points-list">
					{ responsiveFocal.map( ( focal, index ) => (
						<div
							key={ index }
							className={ `crf-focal-point-item${
								draggedItem === index ? ' is-dragging' : ''
							}` }
						>
							<div className="crf-focal-point-header">
								<div className="crf-focal-point-controls">
									{ responsiveFocal.length > 1 && (
										<>
											<div
												className="crf-drag-handle"
												draggable
												onDragStart={ ( e ) =>
													handleDragStart( e, index )
												}
												onDragEnd={ handleDragEnd }
												onKeyDown={ ( e ) =>
													handleDragHandleKeyDown(
														e,
														index
													)
												}
												role="button"
												tabIndex={ 0 }
												aria-label={ __(
													'Drag to reorder focal point',
													'cover-responsive-focal'
												) }
											>
												{ dragHandle }
											</div>
											<div className="crf-move-buttons">
												{ index > 0 && (
													<Button
														className="crf-move-up"
														isSmall
														onClick={ () =>
															moveFocalPointUp(
																index
															)
														}
														aria-label={ __(
															'Move focal point up',
															'cover-responsive-focal'
														) }
													>
														{ chevronUp }
													</Button>
												) }
												{ index <
													responsiveFocal.length -
														1 && (
													<Button
														className="crf-move-down"
														isSmall
														onClick={ () =>
															moveFocalPointDown(
																index
															)
														}
														aria-label={ __(
															'Move focal point down',
															'cover-responsive-focal'
														) }
													>
														{ chevronDown }
													</Button>
												) }
											</div>
										</>
									) }
								</div>
								<span>{ `${ focal.mediaType }: ${ focal.breakpoint }px` }</span>
								<Button
									isDestructive
									isSmall
									onClick={ () => removeFocalPoint( index ) }
								>
									{ __( 'Remove', 'cover-responsive-focal' ) }
								</Button>
							</div>

							<SelectControl
								label={ __(
									'Media Query Type',
									'cover-responsive-focal'
								) }
								value={ focal.mediaType }
								options={ [ ...MEDIA_QUERY_TYPES ] }
								onChange={ ( mediaType ) =>
									updateFocalPoint( index, {
										mediaType: mediaType as MediaQueryType,
									} )
								}
							/>

							<div className="crf-breakpoint-settings">
								<NumberControl
									label={ __(
										'Breakpoint (px)',
										'cover-responsive-focal'
									) }
									value={ focal.breakpoint }
									onChange={ ( value ) => {
										const numValue =
											typeof value === 'string'
												? parseInt( value, 10 )
												: value;
										const clampedValue = Math.max(
											VALIDATION.MIN_BREAKPOINT,
											Math.min(
												VALIDATION.MAX_BREAKPOINT,
												numValue || DEFAULTS.BREAKPOINT
											)
										);
										updateFocalPoint( index, {
											breakpoint: clampedValue,
										} );
									} }
									min={ VALIDATION.MIN_BREAKPOINT }
									max={ VALIDATION.MAX_BREAKPOINT }
									step={ 1 }
								/>

								<div className="crf-breakpoint-presets">
									<div className="crf-presets-label">
										{ __(
											'Presets:',
											'cover-responsive-focal'
										) }
									</div>
									<ButtonGroup>
										{ BREAKPOINT_PRESETS.map(
											( preset ) => (
												<Button
													key={ preset.value }
													variant={
														focal.breakpoint ===
														preset.value
															? 'primary'
															: 'secondary'
													}
													size="small"
													onClick={ () =>
														updateFocalPoint(
															index,
															{
																breakpoint:
																	preset.value,
															}
														)
													}
												>
													{ preset.label }
												</Button>
											)
										) }
									</ButtonGroup>
								</div>
							</div>

							{ attributes.url && (
								<div className="crf-focal-point-picker">
									<FocalPointPicker
										label={ __(
											'Focal Point',
											'cover-responsive-focal'
										) }
										url={ attributes.url }
										value={ { x: focal.x, y: focal.y } }
										onChange={ ( focalPoint ) =>
											updateFocalPoint( index, {
												x: focalPoint.x,
												y: focalPoint.y,
											} )
										}
									/>
								</div>
							) }
						</div>
					) ) }
				</div>
			) }

			<Button
				variant="secondary"
				onClick={ addNewFocalPoint }
				className="crf-add-focal-point"
			>
				{ __( 'Add New Breakpoint', 'cover-responsive-focal' ) }
			</Button>
		</PanelBody>
	);
};
