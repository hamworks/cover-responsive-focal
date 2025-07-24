<?php
/**
 * Plugin Name:       Cover Responsive Focal
 * Description:       Example block scaffolded with Create Block tool.
 * Version:           0.1.0
 * Requires at least: 6.7
 * Requires PHP:      7.4
 * Author:            The WordPress Contributors
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       cover-responsive-focal
 *
 * @package CreateBlock
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
/**
 * Enqueue the block editor assets for extending the Cover block.
 */
function create_block_cover_responsive_focal_block_init() {
	// Enqueue the block editor script
	wp_enqueue_script(
		'cover-responsive-focal-editor',
		plugin_dir_url( __FILE__ ) . 'build/index.js',
		array( 'wp-blocks', 'wp-i18n', 'wp-element', 'wp-components', 'wp-compose', 'wp-block-editor', 'wp-hooks' ),
		filemtime( plugin_dir_path( __FILE__ ) . 'build/index.js' ),
		true
	);

	// Enqueue the block editor styles
	wp_enqueue_style(
		'cover-responsive-focal-editor',
		plugin_dir_url( __FILE__ ) . 'build/index.css',
		array( 'wp-edit-blocks' ),
		filemtime( plugin_dir_path( __FILE__ ) . 'build/index.css' )
	);
}
add_action( 'enqueue_block_editor_assets', 'create_block_cover_responsive_focal_block_init' );
