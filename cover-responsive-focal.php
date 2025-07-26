<?php
/**
 * Plugin Name:       Cover Responsive Focal
 * Description:       Adds responsive focal point capability to WordPress Cover blocks for enhanced mobile experience.
 * Version:           0.1.0
 * Requires at least: 6.1
 * Requires PHP:      7.4
 * Author:            mel_cha
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       cover-responsive-focal
 *
 * @package CoverResponsiveFocal
 * @version 0.1.0
 * @author mel_cha
 * @license GPL-2.0-or-later
 * @since 0.1.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// Define plugin constants

/** @var string Plugin version */
define( 'CRF_VERSION', '0.1.0' );
define( 'CRF_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'CRF_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'CRF_TEXT_DOMAIN', 'cover-responsive-focal' );

// Load required classes
require_once CRF_PLUGIN_DIR . 'includes/class-validator.php';
require_once CRF_PLUGIN_DIR . 'includes/class-css-optimizer.php';
require_once CRF_PLUGIN_DIR . 'includes/class-block-renderer.php';
require_once CRF_PLUGIN_DIR . 'includes/class-asset-manager.php';

/**
 * Initialize the plugin
 */
function crf_init() {
	// Load plugin text domain for internationalization
	load_plugin_textdomain(
		CRF_TEXT_DOMAIN,
		false,
		dirname( plugin_basename( __FILE__ ) ) . '/languages'
	);
	
	// Initialize components
	$validator = new CRF_Validator();
	$css_optimizer = new CRF_CSS_Optimizer( $validator );
	$block_renderer = new CRF_Block_Renderer( $validator, $css_optimizer );
	$asset_manager = new CRF_Asset_Manager( CRF_PLUGIN_DIR, CRF_PLUGIN_URL, CRF_TEXT_DOMAIN );

	// Initialize functionality
	$asset_manager->init();
	$block_renderer->init();
}
add_action( 'init', 'crf_init' );

