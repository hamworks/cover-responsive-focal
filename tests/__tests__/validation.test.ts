/**
 * Cover Responsive Focal - Validation Tests (TDD)
 */

import {
	validateFocalPoint,
	validateDeviceType,
} from '../../src/validation/validators';
import { createResponsiveFocalPoint } from '../../src/validation/factory';
import { getMediaQueryForDevice } from '../../src/validation/media-query';

// Test helper to safely test invalid types without using 'as any'
const testCreateResponsiveFocalPoint = (
	device: unknown,
	x: number,
	y: number
) => {
	// This helper allows us to test runtime validation with invalid types
	// without violating TypeScript's type safety at the call site
	return createResponsiveFocalPoint( device as string, x, y );
};

// RED: First, write failing tests before implementation
describe( 'Focal Point Validation (TDD)', () => {
	describe( 'validateFocalPoint function', () => {
		test( '0.5, 0.5 is a valid focal point', () => {
			// Test with function that doesn't exist yet (RED)
			expect( validateFocalPoint( 0.5, 0.5 ) ).toBe( true );
		} );

		test( '0, 0 is a valid focal point (boundary value)', () => {
			expect( validateFocalPoint( 0, 0 ) ).toBe( true );
		} );

		test( '1, 1 is a valid focal point (boundary value)', () => {
			expect( validateFocalPoint( 1, 1 ) ).toBe( true );
		} );

		test( '-0.1, 0.5 is invalid (out of range)', () => {
			expect( validateFocalPoint( -0.1, 0.5 ) ).toBe( false );
		} );

		test( '0.5, 1.1 is invalid (out of range)', () => {
			expect( validateFocalPoint( 0.5, 1.1 ) ).toBe( false );
		} );

		test( 'NaN, 0.5 is invalid (type error)', () => {
			expect( validateFocalPoint( NaN, 0.5 ) ).toBe( false );
		} );

		test( 'undefined, 0.5 is invalid (type error)', () => {
			expect( validateFocalPoint( undefined, 0.5 ) ).toBe( false );
		} );

		test( 'null, 0.5 is invalid (type error)', () => {
			expect( validateFocalPoint( null, 0.5 ) ).toBe( false );
		} );

		test( '"0.5", 0.5 is invalid (string type)', () => {
			expect( validateFocalPoint( '0.5', 0.5 ) ).toBe( false );
		} );

		test( '0.5, "0.5" is invalid (string type)', () => {
			expect( validateFocalPoint( 0.5, '0.5' ) ).toBe( false );
		} );

		test( 'Infinity, 0.5 is invalid (infinite value)', () => {
			expect( validateFocalPoint( Infinity, 0.5 ) ).toBe( false );
		} );

		test( '0.5, -Infinity is invalid (negative infinite value)', () => {
			expect( validateFocalPoint( 0.5, -Infinity ) ).toBe( false );
		} );

		// Additional edge cases
		test( 'empty object as x coordinate is invalid', () => {
			expect( validateFocalPoint( {}, 0.5 ) ).toBe( false );
		} );

		test( 'array as y coordinate is invalid', () => {
			expect( validateFocalPoint( 0.5, [] ) ).toBe( false );
		} );

		test( 'function as x coordinate is invalid', () => {
			expect( validateFocalPoint( () => {}, 0.5 ) ).toBe( false );
		} );

		test( 'boolean true as coordinates is invalid', () => {
			expect( validateFocalPoint( true, true ) ).toBe( false );
		} );

		test( 'boolean false as coordinates is invalid', () => {
			expect( validateFocalPoint( false, false ) ).toBe( false );
		} );

		test( 'very small positive number is valid', () => {
			expect( validateFocalPoint( 0.0001, 0.9999 ) ).toBe( true );
		} );

		test( 'exactly boundary values work correctly', () => {
			expect( validateFocalPoint( 0.0, 1.0 ) ).toBe( true );
		} );

		test( 'slightly outside boundary is invalid', () => {
			expect( validateFocalPoint( -0.0001, 0.5 ) ).toBe( false );
			expect( validateFocalPoint( 1.0001, 0.5 ) ).toBe( false );
		} );
	} );

	// RED Phase: validateDeviceType function tests (simplified for mobile/tablet only)
	describe( 'validateDeviceType function (simplified)', () => {
		test( 'mobile is a valid device type', () => {
			expect( validateDeviceType( 'mobile' ) ).toBe( true );
		} );

		test( 'tablet is a valid device type', () => {
			expect( validateDeviceType( 'tablet' ) ).toBe( true );
		} );

		test( 'desktop is invalid (not supported)', () => {
			expect( validateDeviceType( 'desktop' ) ).toBe( false );
		} );

		test( 'invalid-type is rejected', () => {
			expect( validateDeviceType( 'invalid-type' ) ).toBe( false );
		} );

		test( 'empty string is invalid', () => {
			expect( validateDeviceType( '' ) ).toBe( false );
		} );

		test( 'null is invalid', () => {
			expect( validateDeviceType( null ) ).toBe( false );
		} );

		test( 'undefined is invalid', () => {
			expect( validateDeviceType( undefined ) ).toBe( false );
		} );

		test( 'number is invalid', () => {
			expect( validateDeviceType( 123 ) ).toBe( false );
		} );

		test( 'boolean is invalid', () => {
			expect( validateDeviceType( true ) ).toBe( false );
		} );

		test( 'object is invalid', () => {
			expect( validateDeviceType( {} ) ).toBe( false );
		} );

		test( 'array is invalid', () => {
			expect( validateDeviceType( [] ) ).toBe( false );
		} );

		test( 'case sensitivity check - MOBILE is invalid', () => {
			expect( validateDeviceType( 'MOBILE' ) ).toBe( false );
		} );

		test( 'whitespace around valid type is invalid', () => {
			expect( validateDeviceType( ' mobile ' ) ).toBe( false );
		} );

		test( 'partial match is invalid', () => {
			expect( validateDeviceType( 'mobil' ) ).toBe( false );
		} );

		test( 'tablet with extra characters is invalid', () => {
			expect( validateDeviceType( 'tablets' ) ).toBe( false );
		} );
	} );

	// RED Phase: createResponsiveFocalPoint function tests (simplified for device type only)
	describe( 'createResponsiveFocalPoint function (simplified)', () => {
		test( 'creates valid ResponsiveFocalPoint object with mobile device', () => {
			const result = createResponsiveFocalPoint( 'mobile', 0.6, 0.4 );

			expect( result ).toEqual( {
				device: 'mobile',
				x: 0.6,
				y: 0.4,
			} );
		} );

		test( 'creates ResponsiveFocalPoint with tablet device', () => {
			const result = createResponsiveFocalPoint( 'tablet', 0.3, 0.7 );

			expect( result ).toEqual( {
				device: 'tablet',
				x: 0.3,
				y: 0.7,
			} );
		} );

		test( 'returns null for invalid focal point X coordinate', () => {
			const result = createResponsiveFocalPoint( 'mobile', -0.1, 0.4 );
			expect( result ).toBeNull();
		} );

		test( 'returns null for invalid focal point Y coordinate', () => {
			const result = createResponsiveFocalPoint( 'mobile', 0.6, 1.1 );
			expect( result ).toBeNull();
		} );

		test( 'returns null for invalid device type', () => {
			const result = createResponsiveFocalPoint( 'desktop', 0.6, 0.4 );
			expect( result ).toBeNull();
		} );

		test( 'handles boundary values correctly', () => {
			const result = createResponsiveFocalPoint( 'tablet', 0.0, 1.0 );

			expect( result ).toEqual( {
				device: 'tablet',
				x: 0.0,
				y: 1.0,
			} );
		} );

		test( 'handles maximum boundary values correctly', () => {
			const result = createResponsiveFocalPoint( 'mobile', 1.0, 0.0 );

			expect( result ).toEqual( {
				device: 'mobile',
				x: 1.0,
				y: 0.0,
			} );
		} );

		test( 'returns null for NaN focal point values', () => {
			const result = createResponsiveFocalPoint( 'mobile', NaN, 0.4 );
			expect( result ).toBeNull();
		} );

		test( 'returns null for Infinity focal point values', () => {
			const result = createResponsiveFocalPoint(
				'tablet',
				0.6,
				Infinity
			);
			expect( result ).toBeNull();
		} );

		test( 'handles decimal focal point values correctly', () => {
			const result = createResponsiveFocalPoint( 'mobile', 0.555, 0.333 );

			expect( result ).toEqual( {
				device: 'mobile',
				x: 0.555,
				y: 0.333,
			} );
		} );

		test( 'returns null for null device type', () => {
			const result = testCreateResponsiveFocalPoint( null, 0.6, 0.4 );
			expect( result ).toBeNull();
		} );

		test( 'returns null for undefined device type', () => {
			const result = testCreateResponsiveFocalPoint(
				undefined,
				0.6,
				0.4
			);
			expect( result ).toBeNull();
		} );
	} );

	// RED Phase: getMediaQueryForDevice function tests (simplified for fixed breakpoints)
	describe( 'getMediaQueryForDevice function (simplified)', () => {
		test( 'generates correct mobile media query', () => {
			const result = getMediaQueryForDevice( 'mobile' );
			expect( result ).toBe( '(max-width: 600px)' );
		} );

		test( 'generates correct tablet media query', () => {
			const result = getMediaQueryForDevice( 'tablet' );
			expect( result ).toBe(
				'(min-width: 601px) and (max-width: 782px)'
			);
		} );

		test( 'handles case sensitivity correctly', () => {
			// Should work with exact lowercase match
			expect( getMediaQueryForDevice( 'mobile' ) ).toBe(
				'(max-width: 600px)'
			);
			expect( getMediaQueryForDevice( 'tablet' ) ).toBe(
				'(min-width: 601px) and (max-width: 782px)'
			);
		} );

		test( 'returns consistent results for multiple calls', () => {
			const mobile1 = getMediaQueryForDevice( 'mobile' );
			const mobile2 = getMediaQueryForDevice( 'mobile' );
			const tablet1 = getMediaQueryForDevice( 'tablet' );
			const tablet2 = getMediaQueryForDevice( 'tablet' );

			expect( mobile1 ).toBe( mobile2 );
			expect( tablet1 ).toBe( tablet2 );
		} );

		test( 'generates different queries for different devices', () => {
			const mobileQuery = getMediaQueryForDevice( 'mobile' );
			const tabletQuery = getMediaQueryForDevice( 'tablet' );

			expect( mobileQuery ).not.toBe( tabletQuery );
		} );

		test( 'returns expected string format', () => {
			const mobileQuery = getMediaQueryForDevice( 'mobile' );
			const tabletQuery = getMediaQueryForDevice( 'tablet' );

			expect( typeof mobileQuery ).toBe( 'string' );
			expect( typeof tabletQuery ).toBe( 'string' );
			expect( mobileQuery ).toMatch( /^\(.*\)$/ );
			expect( tabletQuery ).toMatch( /^\(.*\)$/ );
		} );
	} );
} );
