/**
 * Cover Responsive Focal - Inspector Controls
 */

import { __ } from '@wordpress/i18n';
import {
	PanelBody,
	Button,
	SelectControl,
	TextControl,
	FocalPointPicker,
} from '@wordpress/components';
import type {
	ResponsiveFocalControlsProps,
	ResponsiveFocalPoint,
} from './types';
import { MEDIA_QUERY_TYPES, DEFAULTS } from './constants';

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
						<div key={ index } className="crf-focal-point-item">
							<div className="crf-focal-point-header">
								<span>
									{ `${ focal.mediaType }: ${ focal.breakpoint }px` }
								</span>
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
										mediaType: mediaType as
											| 'min-width'
											| 'max-width',
									} )
								}
							/>

							<TextControl
								label={ __(
									'Breakpoint (px)',
									'cover-responsive-focal'
								) }
								type="number"
								value={ focal.breakpoint.toString() }
								onChange={ ( value ) => {
									const numValue = parseInt(
										value || '0',
										10
									);
									if (
										! isNaN( numValue ) &&
										numValue >= 1 &&
										numValue <= 9999
									) {
										updateFocalPoint( index, {
											breakpoint: numValue,
										} );
									}
								} }
								min="1"
								max="9999"
							/>

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
