/**
 * Test setup file
 */

import '@testing-library/jest-dom';

// Mock React for testing environment
// eslint-disable-next-line import/no-extraneous-dependencies
global.React = require( 'react' );

// Silence console warnings in tests
// eslint-disable-next-line no-console
const originalWarn = console.warn;
// eslint-disable-next-line no-console
console.warn = ( ...args: any[] ) => {
	// Ignore React Testing Library warnings that are expected
	if (
		args[ 0 ]?.includes &&
		( args[ 0 ].includes( 'Warning: ReactDOM.render' ) ||
			args[ 0 ].includes( 'Warning: render' ) )
	) {
		return;
	}
	// eslint-disable-next-line no-console
	originalWarn( ...args );
};
