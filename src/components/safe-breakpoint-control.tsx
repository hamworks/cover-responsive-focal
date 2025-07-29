/**
 * Safe Breakpoint Control Component
 * Provides a safe wrapper for breakpoint control with fallback to NumberControl
 */

/* eslint-disable @wordpress/no-unsafe-wp-apis */
import {
	RangeControl,
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';
import { DEFAULTS, VALIDATION } from '../constants';
import { isDevelopment } from '../utils/environment';

/**
 * Props for SafeBreakpointControl
 */
interface SafeBreakpointControlProps {
	label: string;
	value: number;
	onChange: ( value: number ) => void;
}

/**
 * Safe wrapper for breakpoint control with fallback to NumberControl
 * @param props Component props
 */
export const SafeBreakpointControl = ( props: SafeBreakpointControlProps ) => {
	const { label, value, onChange } = props;
	// Breakpoint validation and safe fallback
	const safeValue =
		typeof value === 'number' && ! isNaN( value )
			? value
			: DEFAULTS.BREAKPOINT;

	// Try RangeControl first, fallback to NumberControl
	try {
		if ( RangeControl ) {
			return (
				<RangeControl
					label={ label }
					value={ safeValue }
					onChange={ ( newValue: number | undefined ) => {
						const numValue =
							typeof newValue === 'number' && ! isNaN( newValue )
								? newValue
								: DEFAULTS.BREAKPOINT;
						onChange( numValue );
					} }
					min={ VALIDATION.MIN_BREAKPOINT }
					max={ VALIDATION.MAX_BREAKPOINT }
					step={ 1 }
					allowReset
				/>
			);
		}
	} catch ( error ) {
		// Fallback to NumberControl if RangeControl fails
		if ( isDevelopment() ) {
			// eslint-disable-next-line no-console
			console.warn(
				'RangeControl failed, falling back to NumberControl:',
				error
			);
		}
	}

	// Fallback implementation
	return (
		<NumberControl
			label={ label }
			value={ safeValue }
			onChange={ ( newValue: string | number | undefined ) => {
				let numValue: number;
				if ( typeof newValue === 'number' && ! isNaN( newValue ) ) {
					numValue = newValue;
				} else if ( typeof newValue === 'string' ) {
					numValue = parseInt( newValue, 10 );
				} else {
					numValue = DEFAULTS.BREAKPOINT;
				}
				const validNumValue = isNaN( numValue )
					? DEFAULTS.BREAKPOINT
					: numValue;
				onChange( validNumValue );
			} }
			min={ VALIDATION.MIN_BREAKPOINT }
			max={ VALIDATION.MAX_BREAKPOINT }
			step={ 1 }
		/>
	);
};
