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
// Note: ResponsiveFocalItem will be replaced with new device-based UI components
import { isDevelopment } from './utils/environment';
import {
	useApplicableFocalPoint,
	findApplicableFocalPoint,
} from './hooks/use-applicable-focal-point';
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
	const {
		attributes,
		setAttributes,
		previewFocalPoint,
		setPreviewFocalPoint,
	} = props;
	const safeAttributes = attributes || {};
	const { responsiveFocal = [] } = safeAttributes;
	const previewEnabled = !! previewFocalPoint;
	const applicableFocalPoint = useApplicableFocalPoint( responsiveFocal );
	const viewportWidth = useEffectiveViewportWidth();

	/**
	 * Add new focal point row
	 */
	const addNewFocalPoint = () => {
		const newFocalPoint: ResponsiveFocalPoint = {
			device: DEFAULTS.DEVICE,
			x: DEFAULTS.FOCAL_X,
			y: DEFAULTS.FOCAL_Y,
		};

		setAttributes( {
			responsiveFocal: [ ...responsiveFocal, newFocalPoint ],
		} );
	};

	/**
	 * Remove focal point row (temporarily unused)
	 * @param index Index to remove
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const removeFocalPoint = ( index: number ) => {
		const updatedFocals = responsiveFocal.filter(
			( _: ResponsiveFocalPoint, i: number ) => i !== index
		);
		setAttributes( { responsiveFocal: updatedFocals } );
	};

	/**
	 * Update focal point row (temporarily unused)
	 * @param index   Index to update
	 * @param updates Partial updates to apply
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

		if ( 'device' in updates ) {
			safeUpdates.device =
				updates.device === 'mobile' || updates.device === 'tablet'
					? updates.device
					: DEFAULTS.DEVICE;
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
			const updatedApplicableFocal = findApplicableFocalPoint(
				updatedFocals,
				viewportWidth
			);
			const editedFocal = updatedFocals[ index ];

			// Only update preview if the edited focal point is the one that applies to current viewport
			if (
				updatedApplicableFocal &&
				editedFocal &&
				updatedApplicableFocal.device === editedFocal.device
			) {
				const newX = editedFocal.x || 0.5;
				const newY = editedFocal.y || 0.5;
				const newPoint = JSON.parse(
					JSON.stringify( { x: newX, y: newY } )
				);
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
							// eslint-disable-next-line @typescript-eslint/no-unused-vars
							const isActive = applicableFocalPoint
								? applicableFocalPoint.device === focal.device
								: false;

							// Check for duplicate devices
							// eslint-disable-next-line @typescript-eslint/no-unused-vars
							const duplicates = responsiveFocal.filter(
								( f, i ) =>
									i !== index && f.device === focal.device
							);
							// eslint-disable-next-line @typescript-eslint/no-unused-vars
							const isDuplicate = duplicates.length > 0;

							return (
								<Fragment key={ index }>
									{ /* TODO: Replace with new device-based UI component */ }
									<div>
										Device: { focal.device }, X: { focal.x }
										, Y: { focal.y }
									</div>
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
				{ __( 'Add New Device', 'cover-responsive-focal' ) }
			</Button>
		</PanelBody>
	);
};
