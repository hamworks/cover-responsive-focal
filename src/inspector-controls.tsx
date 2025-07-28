/**
 * Cover Responsive Focal - Inspector Controls
 */

import { __ } from '@wordpress/i18n';
import { PanelBody, Button, ToggleControl } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import type {
	ResponsiveFocalControlsProps,
	ResponsiveFocalPoint,
} from './types';
import { DEFAULTS } from './constants';
import { ResponsiveFocalItem } from './components/responsive-focal-item';
import { isDevelopment } from './utils/environment';
import { clampBreakpoint } from './utils/validation';
import { useApplicableFocalPoint, findApplicableFocalPoint } from './hooks/use-applicable-focal-point';
import { useEffectiveViewportWidth } from './hooks/use-device-type';

/**
 * Responsive focal point settings UI
 * @param props               Component props
 * @param props.attributes    Block attributes
 * @param props.setAttributes Function to update attributes
 */
export const ResponsiveFocalControls = (
	props: ResponsiveFocalControlsProps
) => {
	const { attributes, setAttributes, previewFocalPoint, setPreviewFocalPoint } = props;
	const safeAttributes = attributes || {};
	const { responsiveFocal = [] } = safeAttributes;
	const previewEnabled = !!previewFocalPoint;
	const applicableFocalPoint = useApplicableFocalPoint( responsiveFocal );
	const viewportWidth = useEffectiveViewportWidth();

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
	 * @param index Index to remove
	 */
	const removeFocalPoint = ( index: number ) => {
		const updatedFocals = responsiveFocal.filter(
			( _: ResponsiveFocalPoint, i: number ) => i !== index
		);
		setAttributes( { responsiveFocal: updatedFocals } );
	};

	/**
	 * Update focal point row
	 * @param index   Index to update
	 * @param updates Partial updates to apply
	 */
	const updateFocalPoint = (
		index: number,
		updates: Partial< ResponsiveFocalPoint >
	) => {

		// Safe handling of index and updates
		if (
			typeof index !== 'number' ||
			index < 0 ||
			index >= responsiveFocal.length
		) {
			if ( isDevelopment() ) {
				// eslint-disable-next-line no-console
				console.warn( 'Invalid index for updateFocalPoint:', index );
			}
			return;
		}

		if ( ! updates || typeof updates !== 'object' ) {
			if ( isDevelopment() ) {
				// eslint-disable-next-line no-console
				console.warn(
					'Invalid updates for updateFocalPoint:',
					updates
				);
			}
			return;
		}

		// Safe handling with fallbacks for invalid values
		const safeUpdates: Partial< ResponsiveFocalPoint > = {};

		if ( 'mediaType' in updates ) {
			safeUpdates.mediaType =
				updates.mediaType === 'min-width' ||
				updates.mediaType === 'max-width'
					? updates.mediaType
					: DEFAULTS.MEDIA_TYPE;
		}

		if ( 'breakpoint' in updates ) {
			const numValue =
				typeof updates.breakpoint === 'number' &&
				! isNaN( updates.breakpoint )
					? updates.breakpoint
					: DEFAULTS.BREAKPOINT;
			safeUpdates.breakpoint = clampBreakpoint( numValue );
		}

		if ( 'x' in updates ) {
			safeUpdates.x =
				typeof updates.x === 'number' && ! isNaN( updates.x )
					? Math.max( 0, Math.min( 1, updates.x ) )
					: DEFAULTS.FOCAL_X;
		}

		if ( 'y' in updates ) {
			safeUpdates.y =
				typeof updates.y === 'number' && ! isNaN( updates.y )
					? Math.max( 0, Math.min( 1, updates.y ) )
					: DEFAULTS.FOCAL_Y;
		}

		const updatedFocals = [ ...responsiveFocal ];
		updatedFocals[ index ] = { ...updatedFocals[ index ], ...safeUpdates };
		setAttributes( { responsiveFocal: updatedFocals } );

		// Update preview only if the edited focal point is the applicable one
		if ( previewFocalPoint !== null ) {
			const updatedApplicableFocal = findApplicableFocalPoint( updatedFocals, viewportWidth );
			const editedFocal = updatedFocals[ index ];

			// Only update preview if the edited focal point is the one that applies to current viewport
			if ( updatedApplicableFocal && editedFocal &&
				 updatedApplicableFocal.breakpoint === editedFocal.breakpoint &&
				 updatedApplicableFocal.mediaType === editedFocal.mediaType ) {
				const newX = editedFocal.x || 0.5;
				const newY = editedFocal.y || 0.5;
				const newPoint = JSON.parse( JSON.stringify( { x: newX, y: newY } ) );
				setPreviewFocalPoint( newPoint );
			}
		}
	};

	return (
		<PanelBody
			title={ __( 'Responsive Focal Points', 'cover-responsive-focal' ) }
			initialOpen={ false }
		>
			<ToggleControl
				label={ __( 'Preview in Editor', 'cover-responsive-focal' ) }
				help={
					previewEnabled
						? __(
								'Showing responsive focal point preview',
								'cover-responsive-focal'
						  )
						: __(
								'Preview disabled, showing core focal point',
								'cover-responsive-focal'
						  )
				}
				checked={ previewEnabled }
				onChange={ ( value ) => {
					if ( value && responsiveFocal.length > 0 ) {
						// Set preview with applicable focal point or keep enabled with no changes
						if ( applicableFocalPoint ) {
							setPreviewFocalPoint( {
								x: applicableFocalPoint.x || 0.5,
								y: applicableFocalPoint.y || 0.5,
							} );
						} else {
							// Keep preview enabled but with a placeholder value
							// This allows the toggle to stay on even when no focal point matches
							setPreviewFocalPoint( {
								x: attributes.focalPoint?.x || 0.5,
								y: attributes.focalPoint?.y || 0.5,
							} );
						}
					} else {
						// Disable preview
						setPreviewFocalPoint( null );
					}
				} }
			/>
			{ responsiveFocal.length === 0 ? (
				<p>
					{ __(
						'No responsive focal points set.',
						'cover-responsive-focal'
					) }
				</p>
			) : (
				<div>
					{ responsiveFocal.map(
						( focal: ResponsiveFocalPoint, index: number ) => {
							// Check if this focal point is active without using hooks in map
							const isActive = applicableFocalPoint ?
								applicableFocalPoint.breakpoint === focal.breakpoint &&
								applicableFocalPoint.mediaType === focal.mediaType : false;

							// Check for duplicate breakpoints
							const duplicates = responsiveFocal.filter( ( f, i ) =>
								i !== index &&
								f.mediaType === focal.mediaType &&
								f.breakpoint === focal.breakpoint
							);
							const isDuplicate = duplicates.length > 0;

							return (
								<Fragment key={ index }>
									<ResponsiveFocalItem
										focal={ focal }
										index={ index }
										imageUrl={ safeAttributes.url }
										isActive={ isActive }
										isDuplicate={ isDuplicate }
										onUpdate={ updateFocalPoint }
										onRemove={ removeFocalPoint }
									/>
									<hr />
								</Fragment>
							);
						}
					) }
				</div>
			) }

			<Button
				variant="primary"
				onClick={ addNewFocalPoint }
				className="crf-add-focal-point"
			>
				{ __( 'Add New Breakpoint', 'cover-responsive-focal' ) }
			</Button>
		</PanelBody>
	);
};
