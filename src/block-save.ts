/**
 * Cover Responsive Focal - Block Save Extension
 * Extends the core/cover block save functionality to add data-fp-id attribute
 */

import { addFilter } from '@wordpress/hooks';

// Interface for block type
interface BlockType {
	name?: string;
}

// Interface for cover block attributes
interface CoverBlockAttributes {
	responsiveFocal?: Array< any >;
	dataFpId?: string;
	[ key: string ]: any;
}

// Interface for React element
interface ReactElement {
	type?: string;
	props?: Record< string, any >;
	[ key: string ]: any;
}

/**
 * Filter function to extend cover block save processing
 * Adds data-fp-id attribute when responsiveFocal is not empty
 *
 * @param element    - Original save element
 * @param blockType  - Block type object
 * @param attributes - Block attributes
 * @return Modified save element or original element
 */
const extendCoverBlockSave = (
	element: ReactElement | null | undefined,
	blockType: BlockType | null | undefined,
	attributes: CoverBlockAttributes | null | undefined
): ReactElement | null | undefined => {
	// Only process core/cover blocks
	if ( ! blockType || blockType.name !== 'core/cover' ) {
		return element;
	}

	// Handle null/undefined attributes
	if ( ! attributes ) {
		return element;
	}

	const { responsiveFocal, dataFpId } = attributes;

	// Return original element if responsiveFocal is empty or invalid
	if (
		! responsiveFocal ||
		! Array.isArray( responsiveFocal ) ||
		responsiveFocal.length === 0
	) {
		return element;
	}

	// Generate or use existing dataFpId
	const fpId = dataFpId || `crf-${ Date.now() }`;

	// Get existing props from element
	const existingProps = element?.props || {};

	// Create new element with data-fp-id attribute
	// Using React.createElement globally available in WordPress
	return ( global as any ).React.createElement(
		'div',
		{
			...existingProps,
			'data-fp-id': fpId,
		},
		element
	);
};

// Register the filter hook
addFilter( 'blocks.getSaveElement', 'crf/extend-save', extendCoverBlockSave );

// Export for testing
export { extendCoverBlockSave };
