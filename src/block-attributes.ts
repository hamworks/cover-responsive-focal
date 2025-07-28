/**
 * Cover Responsive Focal - Block Attributes Extension
 * Extends the core/cover block with responsive focal point attributes
 */

import { addFilter } from '@wordpress/hooks';

// Interface for block settings
interface BlockSettings {
	name?: string;
	title?: string;
	attributes?: Record< string, any >;
	[ key: string ]: any;
}

/**
 * Filter function to extend cover block attributes
 * Adds responsiveFocal and dataFpId attributes to core/cover block
 *
 * @param settings - Block settings object
 * @param name     - Block name
 * @return Modified settings object
 */
const extendCoverBlockAttributes = (
	settings: BlockSettings | null | undefined,
	name: string | null | undefined
): BlockSettings => {
	// Only modify core/cover block
	if ( name !== 'core/cover' ) {
		return settings || {};
	}

	// Handle null/undefined settings
	const baseSettings = settings || {};
	const baseAttributes = baseSettings.attributes || {};

	// Create new settings object with extended attributes
	return {
		...baseSettings,
		attributes: {
			...baseAttributes,
			responsiveFocal: {
				type: 'array',
				default: [],
			},
			dataFpId: {
				type: 'string',
			},
		},
	};
};

// Register the filter hook
addFilter(
	'blocks.registerBlockType',
	'crf/extend-cover-block',
	extendCoverBlockAttributes
);
