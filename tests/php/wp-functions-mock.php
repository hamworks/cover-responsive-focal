<?php
/**
 * WordPress関数のモック
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
        // モック関数 - 何もしない
    }
}

if (!function_exists('wp_enqueue_style')) {
    function wp_enqueue_style($handle, $src = '', $deps = array(), $ver = false, $media = 'all') {
        // モック関数 - 何もしない
    }
}

if (!function_exists('add_action')) {
    function add_action($hook, $function_to_add, $priority = 10, $accepted_args = 1) {
        // モック関数 - 何もしない
    }
}

if (!function_exists('add_filter')) {
    function add_filter($hook, $function_to_add, $priority = 10, $accepted_args = 1) {
        // モック関数 - 何もしない
    }
}

// filemtime は PHP標準関数なので、モック不要（PHP標準で定義されている）

// WordPress定数を定義
if (!defined('ABSPATH')) {
    define('ABSPATH', '/tmp/wp/');
}

// WordPress一意ID生成関数のモック
if (!function_exists('wp_unique_id')) {
    function wp_unique_id($prefix = '') {
        static $id_counter = 0;
        $id_counter++;
        return $prefix . time() . '-' . $id_counter;
    }
}