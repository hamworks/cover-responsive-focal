/**
 * Safe Media Type Control Component
 * Provides a safe wrapper for media type control with fallback to SelectControl
 */

/* eslint-disable @wordpress/no-unsafe-wp-apis */
import {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	SelectControl,
} from '@wordpress/components';
import { DEFAULTS, MEDIA_QUERY_TYPES, type MediaQueryType } from '../constants';
import { isDevelopment } from '../utils/environment';

/**
 * Props for SafeMediaTypeControl
 */
interface SafeMediaTypeControlProps {
	label: string;
	value: MediaQueryType;
	onChange: ( value: MediaQueryType ) => void;
}

/**
 * Safe wrapper for media type control with fallback to SelectControl
 * @param props Component props
 */
export const SafeMediaTypeControl = ( props: SafeMediaTypeControlProps ) => {
	const { label, value, onChange } = props;
	// MediaType validation and safe fallback
	const safeValue =
		value && typeof value === 'string' ? value : DEFAULTS.MEDIA_TYPE;

	// Try ToggleGroupControl first, fallback to SelectControl
	try {
		if ( ToggleGroupControl && ToggleGroupControlOption ) {
			return (
				<ToggleGroupControl
					label={ label }
					value={ safeValue }
					onChange={ ( newValue: string | number | undefined ) => {
						if ( newValue !== undefined ) {
							const stringValue = newValue.toString();
							const validatedValue =
								stringValue === 'min-width' ||
								stringValue === 'max-width'
									? ( stringValue as MediaQueryType )
									: DEFAULTS.MEDIA_TYPE;
							onChange( validatedValue );
						}
					} }
					isBlock
				>
					<ToggleGroupControlOption
						value="min-width"
						label="Min Width"
					/>
					<ToggleGroupControlOption
						value="max-width"
						label="Max Width"
					/>
				</ToggleGroupControl>
			);
		}
	} catch ( error ) {
		// Fallback to SelectControl if ToggleGroupControl fails
		if ( isDevelopment() ) {
			// eslint-disable-next-line no-console
			console.warn(
				'ToggleGroupControl failed, falling back to SelectControl:',
				error
			);
		}
	}

	// Fallback implementation
	return (
		<SelectControl
			label={ label }
			value={ safeValue }
			options={
				MEDIA_QUERY_TYPES as ReadonlyArray< {
					label: string;
					value: string;
				} >
			}
			onChange={ ( newValue: string ) => {
				const validatedValue =
					newValue === 'min-width' || newValue === 'max-width'
						? ( newValue as MediaQueryType )
						: DEFAULTS.MEDIA_TYPE;
				onChange( validatedValue );
			} }
		/>
	);
};
