module.exports = {
	preset: '@wordpress/jest-preset-default',
	testEnvironment: 'jsdom',
	setupFilesAfterEnv: [ '<rootDir>/tests/setup.ts' ],
	roots: [ '<rootDir>/src', '<rootDir>/tests' ],
	testMatch: [
		'**/__tests__/**/*.(ts|tsx|js)',
		'**/?(*.)+(spec|test).(ts|tsx|js)',
	],
	transform: {
		'^.+\\.(ts|tsx)$': [
			'ts-jest',
			{
				useESM: false,
				isolatedModules: true,
				tsconfig: {
					jsx: 'react',
					esModuleInterop: true,
					allowSyntheticDefaultImports: true,
				},
			},
		],
		'^.+\\.(js|jsx)$': 'babel-jest',
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
