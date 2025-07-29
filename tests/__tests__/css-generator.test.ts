/**
 * CSS Generator Tests
 */

import { generateObjectPosition } from '../../src/utils/css-generator';

describe( 'CSS Generator', () => {
	describe( 'generateObjectPosition', () => {
		test( 'generates correct percentage values', () => {
			expect( generateObjectPosition( 0.5, 0.5 ) ).toBe( '50% 50%' );
			expect( generateObjectPosition( 0, 0 ) ).toBe( '0% 0%' );
			expect( generateObjectPosition( 1, 1 ) ).toBe( '100% 100%' );
			expect( generateObjectPosition( 0.33, 0.67 ) ).toBe( '33% 67%' );
		} );

		test( 'rounds decimal values correctly', () => {
			expect( generateObjectPosition( 0.335, 0.666 ) ).toBe( '34% 67%' );
			expect( generateObjectPosition( 0.334, 0.665 ) ).toBe( '33% 67%' );
		} );
	} );
} );
