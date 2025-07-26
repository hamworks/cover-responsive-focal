<?php
/**
 * WordPress function mocks
 */

if (!function_exists('esc_attr')) {
    function esc_attr($text) {
        return htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
    }
}

if (!function_exists('sanitize_text_field')) {
    function sanitize_text_field($str) {
        return strip_tags($str);
    }
}

if (!function_exists('plugin_dir_url')) {
    function plugin_dir_url($file) {
        return 'http://localhost/wp-content/plugins/cover-responsive-focal/';
    }
}

if (!function_exists('plugin_dir_path')) {
    function plugin_dir_path($file) {
        return dirname($file) . '/';
    }
}

if (!function_exists('wp_enqueue_script')) {
    function wp_enqueue_script($handle, $src = '', $deps = array(), $ver = false, $in_footer = false) {
        // Mock function - does nothing
    }
}

if (!function_exists('wp_enqueue_style')) {
    function wp_enqueue_style($handle, $src = '', $deps = array(), $ver = false, $media = 'all') {
        // Mock function - does nothing
    }
}

if (!function_exists('add_action')) {
    function add_action($hook, $function_to_add, $priority = 10, $accepted_args = 1) {
        // Mock function - does nothing
    }
}

if (!function_exists('add_filter')) {
    function add_filter($hook, $function_to_add, $priority = 10, $accepted_args = 1) {
        // Mock function - does nothing
    }
}

// filemtime is a PHP standard function, so no mock needed (defined by PHP standard)

// Define WordPress constants
if (!defined('ABSPATH')) {
    define('ABSPATH', '/tmp/wp/');
}

// WordPress unique ID generation function mock
if (!function_exists('wp_unique_id')) {
    function wp_unique_id($prefix = '') {
        static $id_counter = 0;
        $id_counter++;
        return $prefix . time() . '-' . $id_counter;
    }
}

// Cache function mocks for CSS optimization testing
if (!function_exists('get_transient')) {
    function get_transient($transient) {
        global $_wp_transients;
        return isset($_wp_transients[$transient]) ? $_wp_transients[$transient] : false;
    }
}

if (!function_exists('set_transient')) {
    function set_transient($transient, $value, $expiration = 0) {
        global $_wp_transients;
        $_wp_transients[$transient] = $value;
        return true;
    }
}

if (!defined('HOUR_IN_SECONDS')) {
    define('HOUR_IN_SECONDS', 3600);
}