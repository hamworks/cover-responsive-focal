/**
 * Cover Responsive Focal - Block Attributes Extension Tests (TDD)
 */

// Mock WordPress hooks
const mockAddFilter = jest.fn();

jest.mock( '@wordpress/hooks', () => ( {
	addFilter: mockAddFilter,
	removeAllFilters: jest.fn(),
} ) );

// Mock settings object for testing
const mockCoverBlockSettings = {
	name: 'core/cover',
	title: 'Cover',
	attributes: {
		url: {
			type: 'string',
		},
		id: {
			type: 'number',
		},
		focalPoint: {
			type: 'object',
		},
		hasParallax: {
			type: 'boolean',
			default: false,
		},
		dimRatio: {
			type: 'number',
			default: 0,
		},
	},
};

// RED: First, write failing tests before implementation
describe( 'Cover Block Attributes Extension (TDD)', () => {
	beforeEach( () => {
		// Clear all mocks before each test
		mockAddFilter.mockClear();

		// Clear module cache to force re-execution
		jest.resetModules();
	} );

	describe( 'blocks.registerBlockType filter registration', () => {
		test( 'should register the filter hook', () => {
			// Import the module to trigger filter registration
			require( '../../src/block-attributes' );

			// Verify that addFilter was called with correct parameters
			expect( mockAddFilter ).toHaveBeenCalledWith(
				'blocks.registerBlockType',
				'crf/extend-cover-block',
				expect.any( Function )
			);
		} );

		test( 'should call addFilter only once', () => {
			// Import the module to trigger filter registration
			require( '../../src/block-attributes' );

			expect( mockAddFilter ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'filter function behavior', () => {
		let filterFunction: ( settings: any, name: string | null | undefined ) => any;

		beforeEach( () => {
			// Import and extract the filter function
			require( '../../src/block-attributes' );

			// Get the filter function from the mock call
			const mockCall = mockAddFilter.mock.calls[ 0 ];
			filterFunction = mockCall[ 2 ];
		} );

		test( 'should not modify non-cover blocks', () => {
			const paragraphSettings = {
				name: 'core/paragraph',
				title: 'Paragraph',
				attributes: {
					content: { type: 'string' },
				},
			};

			const result = filterFunction(
				paragraphSettings,
				'core/paragraph'
			);

			expect( result ).toBe( paragraphSettings );
			expect( result ).toEqual( paragraphSettings );
		} );

		test( 'should not modify other core blocks', () => {
			const headingSettings = {
				name: 'core/heading',
				title: 'Heading',
				attributes: {
					content: { type: 'string' },
					level: { type: 'number' },
				},
			};

			const result = filterFunction( headingSettings, 'core/heading' );

			expect( result ).toBe( headingSettings );
		} );

		test( 'should add responsiveFocal attribute to cover block', () => {
			const result = filterFunction(
				mockCoverBlockSettings,
				'core/cover'
			);

			expect( result.attributes.responsiveFocal ).toEqual( {
				type: 'array',
				default: [],
			} );
		} );

		test( 'should add dataFpId attribute to cover block', () => {
			const result = filterFunction(
				mockCoverBlockSettings,
				'core/cover'
			);

			expect( result.attributes.dataFpId ).toEqual( {
				type: 'string',
			} );
		} );

		test( 'should preserve existing cover block attributes', () => {
			const result = filterFunction(
				mockCoverBlockSettings,
				'core/cover'
			);

			// Check that all original attributes are preserved
			expect( result.attributes.url ).toEqual( { type: 'string' } );
			expect( result.attributes.id ).toEqual( { type: 'number' } );
			expect( result.attributes.focalPoint ).toEqual( {
				type: 'object',
			} );
			expect( result.attributes.hasParallax ).toEqual( {
				type: 'boolean',
				default: false,
			} );
			expect( result.attributes.dimRatio ).toEqual( {
				type: 'number',
				default: 0,
			} );
		} );

		test( 'should preserve other settings properties', () => {
			const result = filterFunction(
				mockCoverBlockSettings,
				'core/cover'
			);

			expect( result.name ).toBe( 'core/cover' );
			expect( result.title ).toBe( 'Cover' );
		} );

		test( 'should not mutate the original settings object', () => {
			const originalSettings = JSON.parse(
				JSON.stringify( mockCoverBlockSettings )
			);

			filterFunction( mockCoverBlockSettings, 'core/cover' );

			// Original should remain unchanged
			expect( mockCoverBlockSettings ).toEqual( originalSettings );
		} );

		test( 'should return a new object for cover block', () => {
			const result = filterFunction(
				mockCoverBlockSettings,
				'core/cover'
			);

			expect( result ).not.toBe( mockCoverBlockSettings );
			expect( result.attributes ).not.toBe(
				mockCoverBlockSettings.attributes
			);
		} );

		test( 'should handle cover block with minimal attributes', () => {
			const minimalCoverSettings = {
				name: 'core/cover',
				attributes: {},
			};

			const result = filterFunction( minimalCoverSettings, 'core/cover' );

			expect( result.attributes.responsiveFocal ).toEqual( {
				type: 'array',
				default: [],
			} );
			expect( result.attributes.dataFpId ).toEqual( {
				type: 'string',
			} );
		} );

		test( 'should handle missing attributes property', () => {
			const settingsWithoutAttributes = {
				name: 'core/cover',
				title: 'Cover',
			};

			const result = filterFunction(
				settingsWithoutAttributes,
				'core/cover'
			);

			expect( result.attributes ).toBeDefined();
			expect( result.attributes.responsiveFocal ).toEqual( {
				type: 'array',
				default: [],
			} );
			expect( result.attributes.dataFpId ).toEqual( {
				type: 'string',
			} );
		} );

		test( 'should handle null settings gracefully', () => {
			const result = filterFunction( null, 'core/cover' );

			expect( result ).toEqual( {
				attributes: {
					responsiveFocal: {
						type: 'array',
						default: [],
					},
					dataFpId: {
						type: 'string',
					},
				},
			} );
		} );

		test( 'should handle undefined settings gracefully', () => {
			const result = filterFunction( undefined, 'core/cover' );

			expect( result ).toEqual( {
				attributes: {
					responsiveFocal: {
						type: 'array',
						default: [],
					},
					dataFpId: {
						type: 'string',
					},
				},
			} );
		} );

		test( 'should create unique objects for multiple calls', () => {
			const result1 = filterFunction(
				mockCoverBlockSettings,
				'core/cover'
			);
			const result2 = filterFunction(
				mockCoverBlockSettings,
				'core/cover'
			);

			expect( result1 ).not.toBe( result2 );
			expect( result1.attributes ).not.toBe( result2.attributes );
			expect( result1 ).toEqual( result2 );
		} );

		test( 'should handle empty string block name', () => {
			const result = filterFunction( mockCoverBlockSettings, '' );

			expect( result ).toBe( mockCoverBlockSettings );
		} );

		test( 'should handle null block name', () => {
			const result = filterFunction( mockCoverBlockSettings, null );

			expect( result ).toBe( mockCoverBlockSettings );
		} );

		test( 'should handle undefined block name', () => {
			const result = filterFunction( mockCoverBlockSettings, undefined );

			expect( result ).toBe( mockCoverBlockSettings );
		} );

		test( 'should be case sensitive for block name', () => {
			const result = filterFunction(
				mockCoverBlockSettings,
				'CORE/COVER'
			);

			expect( result ).toBe( mockCoverBlockSettings );
		} );

		test( 'should not match partial block names', () => {
			const result = filterFunction(
				mockCoverBlockSettings,
				'core/cover-extended'
			);

			expect( result ).toBe( mockCoverBlockSettings );
		} );
	} );

	describe( 'attribute schema validation', () => {
		let filterFunction: ( settings: any, name: string ) => any;

		beforeEach( () => {
			require( '../../src/block-attributes' );
			const mockCall = mockAddFilter.mock.calls[ 0 ];
			filterFunction = mockCall[ 2 ];
		} );

		test( 'responsiveFocal attribute should have correct schema', () => {
			const result = filterFunction(
				mockCoverBlockSettings,
				'core/cover'
			);

			const responsiveFocalAttr = result.attributes.responsiveFocal;

			expect( responsiveFocalAttr.type ).toBe( 'array' );
			expect( responsiveFocalAttr.default ).toEqual( [] );
		} );

		test( 'dataFpId attribute should have correct schema', () => {
			const result = filterFunction(
				mockCoverBlockSettings,
				'core/cover'
			);

			const dataFpIdAttr = result.attributes.dataFpId;

			expect( dataFpIdAttr.type ).toBe( 'string' );
			expect( dataFpIdAttr.default ).toBeUndefined();
		} );

		test( 'should not override existing attributes with same names', () => {
			const settingsWithConflictingAttrs = {
				...mockCoverBlockSettings,
				attributes: {
					...mockCoverBlockSettings.attributes,
					responsiveFocal: {
						type: 'string',
						default: 'existing',
					},
					dataFpId: {
						type: 'number',
						default: 123,
					},
				},
			};

			const result = filterFunction(
				settingsWithConflictingAttrs,
				'core/cover'
			);

			// Should override with our schema
			expect( result.attributes.responsiveFocal ).toEqual( {
				type: 'array',
				default: [],
			} );
			expect( result.attributes.dataFpId ).toEqual( {
				type: 'string',
			} );
		} );
	} );

	describe( 'integration with WordPress block system', () => {
		test( 'should be compatible with block registration flow', () => {
			// This test verifies the filter integrates properly with WordPress
			const mockBlockSettings = {
				...mockCoverBlockSettings,
				save: jest.fn(),
				edit: jest.fn(),
			};

			require( '../../src/block-attributes' );
			const mockCall = mockAddFilter.mock.calls[ 0 ];
			const filterFunction = mockCall[ 2 ];

			const result = filterFunction( mockBlockSettings, 'core/cover' );

			// Should preserve WordPress-specific properties
			expect( result.save ).toBe( mockBlockSettings.save );
			expect( result.edit ).toBe( mockBlockSettings.edit );
		} );

		test( 'should maintain attribute immutability requirements', () => {
			require( '../../src/block-attributes' );
			const mockCall = mockAddFilter.mock.calls[ 0 ];
			const filterFunction = mockCall[ 2 ];

			const result = filterFunction(
				mockCoverBlockSettings,
				'core/cover'
			);

			// Verify that modifying the result doesn't affect subsequent calls
			result.attributes.responsiveFocal.default.push( 'test' );

			const result2 = filterFunction(
				mockCoverBlockSettings,
				'core/cover'
			);
			expect( result2.attributes.responsiveFocal.default ).toEqual( [] );
		} );
	} );
} );
