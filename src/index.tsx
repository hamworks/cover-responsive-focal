/**
 * Cover Responsive Focal - Main Entry Point
 */

import { addFilter } from '@wordpress/hooks';
import type { BlockConfiguration } from '@wordpress/blocks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { InspectorControls } from '@wordpress/block-editor';

import { ResponsiveFocalControls } from './inspector-controls';
import type {
	CoverBlockAttributes,
	WPBlockType,
	WPSaveElement,
	WPBlockEditProps,
} from './types';
import './editor.scss';

/**
 * Extend cover block attributes
 */
addFilter(
	'blocks.registerBlockType',
	'crf/extend-cover-block',
	( settings: BlockConfiguration, name: string ) => {
		if ( name !== 'core/cover' ) {
			return settings;
		}

		// Add new attributes
		return {
			...settings,
			attributes: {
				...settings.attributes,
				responsiveFocal: {
					type: 'array',
					default: [],
				},
				dataFpId: {
					type: 'string',
				},
			},
		} as BlockConfiguration;
	}
);

/**
 * Extend cover block editor UI
 */
const withResponsiveFocalControls = createHigherOrderComponent(
	( BlockEdit ) => {
		return ( props: WPBlockEditProps ) => {
			const { name, attributes, setAttributes } = props;

			if ( name !== 'core/cover' ) {
				return <BlockEdit { ...props } />;
			}

			return (
				<>
					<BlockEdit { ...props } />
					<InspectorControls>
						<ResponsiveFocalControls
							attributes={
								attributes as unknown as CoverBlockAttributes
							}
							setAttributes={ setAttributes }
						/>
					</InspectorControls>
				</>
			);
		};
	},
	'withResponsiveFocalControls'
);

addFilter(
	'editor.BlockEdit',
	'crf/with-responsive-focal-controls',
	withResponsiveFocalControls
);

/**
 * Extend cover block save processing
 */
addFilter(
	'blocks.getSaveElement',
	'crf/extend-save',
	(
		element: WPSaveElement,
		blockType: WPBlockType,
		attributes: CoverBlockAttributes
	) => {
		if ( blockType.name !== 'core/cover' ) {
			return element;
		}

		const { responsiveFocal } = attributes;

		// Standard cover block behavior when responsiveFocal is empty
		if ( ! responsiveFocal || responsiveFocal.length === 0 ) {
			return element;
		}

		// Add data-fp-id attribute
		// TODO: Implement save processing (to be implemented in next task)
		// const fpId = dataFpId || `crf-${ Date.now() }`;

		return element;
	}
);
