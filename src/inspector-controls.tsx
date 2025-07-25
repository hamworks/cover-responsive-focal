/**
 * Cover Responsive Focal - Inspector Controls
 */

import { __ } from '@wordpress/i18n';
import { PanelBody, Button } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import type {
	ResponsiveFocalControlsProps,
	ResponsiveFocalPoint,
} from './types';
import { DEFAULTS } from './constants';
import { ResponsiveFocalItem } from './components/responsive-focal-item';
import { isDevelopment } from './utils/environment';
import { clampBreakpoint } from './utils/validation';

/**
 * Responsive focal point settings UI
 * @param props               Component props
 * @param props.attributes    Block attributes
 * @param props.setAttributes Function to update attributes
 */
export const ResponsiveFocalControls = (
	props: ResponsiveFocalControlsProps
) => {
	const { attributes, setAttributes } = props;
	const safeAttributes = attributes || {};
	const { responsiveFocal = [] } = safeAttributes;

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
				<div>
					{ responsiveFocal.map(
						( focal: ResponsiveFocalPoint, index: number ) => (
							<Fragment key={ index }>
								<ResponsiveFocalItem
									focal={ focal }
									index={ index }
									imageUrl={ safeAttributes.url }
									onUpdate={ updateFocalPoint }
									onRemove={ removeFocalPoint }
								/>
								<hr />
							</Fragment>
						)
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
