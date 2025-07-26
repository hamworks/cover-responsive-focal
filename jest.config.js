module.exports = {
	preset: '@wordpress/jest-preset-default',
	testEnvironment: 'jsdom',
	setupFilesAfterEnv: [ '<rootDir>/tests/setup.ts' ],
	roots: [ '<rootDir>/src', '<rootDir>/tests' ],
	testMatch: [
		'**/__tests__/**/*.(ts|tsx|js)',
		'**/?(*.)+(spec|test).(ts|tsx|js)',
	],
	testPathIgnorePatterns: [
		'<rootDir>/tests/e2e/',
		'<rootDir>/node_modules/',
	],
	transform: {
		'^.+\\.(ts|tsx)$': [
			'ts-jest',
			{
				useESM: false,
				tsconfig: {
					jsx: 'react-jsx',
					esModuleInterop: true,
					allowSyntheticDefaultImports: true,
				},
			},
		],
	},
	moduleFileExtensions: [ 'ts', 'tsx', 'js', 'jsx', 'json', 'node' ],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
		'\\.(css|less|scss|sass)$': 'identity-obj-proxy',
	},
	collectCoverage: true,
	coverageDirectory: 'coverage',
	coverageReporters: [ 'text', 'lcov', 'html' ],
	coverageThreshold: {
		global: {
			branches: 80,
			functions: 80,
			lines: 80,
			statements: 80,
		},
	},
};
