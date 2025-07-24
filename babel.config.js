module.exports = {
	presets: [
		'@wordpress/babel-preset-default',
		'@babel/preset-react',
		'@babel/preset-typescript',
	],
	plugins: [ '@babel/plugin-transform-runtime' ],
};
