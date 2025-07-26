<?php
/**
 * Asset Manager Class
 *
 * Handles script and style enqueuing for the Cover Responsive Focal plugin.
 *
 * @package CoverResponsiveFocal
 * @since 0.1.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Asset Manager Class
 */
class CRF_Asset_Manager {

	/**
	 * Plugin directory path
	 *
	 * @var string
	 */
	private $plugin_dir;

	/**
	 * Plugin URL
	 *
	 * @var string
	 */
	private $plugin_url;

	/**
	 * Text domain
	 *
	 * @var string
	 */
	private $text_domain;

	/**
	 * Constructor
	 *
	 * @param string $plugin_dir Plugin directory path
	 * @param string $plugin_url Plugin URL
	 * @param string $text_domain Text domain
	 */
	public function __construct( $plugin_dir, $plugin_url, $text_domain ) {
		$this->plugin_dir = $plugin_dir;
		$this->plugin_url = $plugin_url;
		$this->text_domain = $text_domain;
	}

	/**
	 * Initialize asset management
	 */
	public function init() {
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_block_editor_assets' ) );
	}

	/**
	 * Enqueue the block editor assets for extending the Cover block.
	 */
	public function enqueue_block_editor_assets() {
		$script_path = $this->plugin_dir . 'build/index.js';
		$style_path = $this->plugin_dir . 'build/index.css';
		
		// Check if build files exist
		if ( ! file_exists( $script_path ) ) {
			return;
		}
		
		// Enqueue the block editor script
		wp_enqueue_script(
			'cover-responsive-focal-editor',
			$this->plugin_url . 'build/index.js',
			array( 'wp-blocks', 'wp-i18n', 'wp-element', 'wp-components', 'wp-compose', 'wp-block-editor', 'wp-hooks' ),
			filemtime( $script_path ),
			true
		);
		
		// Set up internationalization for JavaScript
		wp_set_script_translations(
			'cover-responsive-focal-editor',
			$this->text_domain,
			$this->plugin_dir . 'languages'
		);

		// Enqueue the block editor styles if they exist
		if ( file_exists( $style_path ) ) {
			wp_enqueue_style(
				'cover-responsive-focal-editor',
				$this->plugin_url . 'build/index.css',
				array( 'wp-edit-blocks' ),
				filemtime( $style_path )
			);
		}
	}
}