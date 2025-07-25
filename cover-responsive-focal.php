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

/**
 * CSS生成関数 - TDD GREEN段階（テストを通す最小限の実装）
 *
 * @param array  $responsive_focal レスポンシブフォーカルポイントの配列
 * @param string $fp_id CSS識別用の一意ID
 * @return string 生成されたCSS
 */
function crf_generate_css_rules( $responsive_focal, $fp_id ) {
	if ( empty( $responsive_focal ) ) {
		return '';
	}
	
	$rules = '';
	
	foreach ( $responsive_focal as $focal_point ) {
		// バリデーション - 無効な値はスキップ
		if ( ! crf_validate_media_type( $focal_point['mediaType'] ) ||
			 ! crf_validate_breakpoint( $focal_point['breakpoint'] ) ||
			 ! crf_validate_focal_point_value( $focal_point['x'] ) ||
			 ! crf_validate_focal_point_value( $focal_point['y'] ) ) {
			continue;
		}
		
		$media_type = sanitize_text_field( $focal_point['mediaType'] );
		$breakpoint = intval( $focal_point['breakpoint'] );
		$x = floatval( $focal_point['x'] ) * 100;
		$y = floatval( $focal_point['y'] ) * 100;
		
		// メディアクエリ生成
		$media_query = sprintf( '(%s: %dpx)', $media_type, $breakpoint );
		
		$rules .= sprintf(
			'@media %s { [data-fp-id="%s"] .wp-block-cover__image-background, [data-fp-id="%s"] .wp-block-cover__video-background { object-position: %s%% %s%%; } }',
			$media_query,
			esc_attr( $fp_id ),
			esc_attr( $fp_id ),
			$x,
			$y
		);
	}
	
	return $rules;
}

/**
 * メディアタイプの検証
 *
 * @param string $media_type メディアタイプ
 * @return bool 有効かどうか
 */
function crf_validate_media_type( $media_type ) {
	return in_array( $media_type, array( 'min-width', 'max-width' ), true );
}

/**
 * ブレークポイントの検証
 *
 * @param mixed $breakpoint ブレークポイント
 * @return bool 有効かどうか
 */
function crf_validate_breakpoint( $breakpoint ) {
	return is_numeric( $breakpoint ) && $breakpoint > 0 && $breakpoint <= 9999;
}

/**
 * フォーカルポイント値の検証
 *
 * @param mixed $value フォーカルポイント値
 * @return bool 有効かどうか
 */
function crf_validate_focal_point_value( $value ) {
	return is_numeric( $value ) && $value >= 0 && $value <= 1;
}

/**
 * フォーカルポイントデータのサニタイゼーション - TDD GREEN段階
 *
 * @param array $input フォーカルポイントデータ
 * @return array サニタイズされたデータ
 */
function crf_sanitize_focal_point( $input ) {
	$defaults = array(
		'mediaType' => 'max-width',
		'breakpoint' => 768,
		'x' => 0.5,
		'y' => 0.5
	);
	
	// 入力値を取得（デフォルト値でフォールバック）
	$media_type = isset( $input['mediaType'] ) ? $input['mediaType'] : $defaults['mediaType'];
	$breakpoint = isset( $input['breakpoint'] ) ? $input['breakpoint'] : $defaults['breakpoint'];
	$x = isset( $input['x'] ) ? $input['x'] : $defaults['x'];
	$y = isset( $input['y'] ) ? $input['y'] : $defaults['y'];
	
	// メディアタイプのサニタイゼーション
	$media_type = sanitize_text_field( $media_type );
	if ( ! crf_validate_media_type( $media_type ) ) {
		$media_type = $defaults['mediaType'];
	}
	
	// ブレークポイントのサニタイゼーション
	$breakpoint = intval( $breakpoint );
	if ( ! crf_validate_breakpoint( $breakpoint ) ) {
		$breakpoint = $defaults['breakpoint'];
	}
	
	// フォーカルポイント値のサニタイゼーション
	$x = floatval( $x );
	$y = floatval( $y );
	
	// 数値でない場合はデフォルト値を使用
	if ( ! is_numeric( $input['x'] ?? '' ) ) {
		$x = $defaults['x'];
	}
	if ( ! is_numeric( $input['y'] ?? '' ) ) {
		$y = $defaults['y'];
	}
	
	// 範囲外の値を正規化
	$x = max( 0.0, min( 1.0, $x ) );
	$y = max( 0.0, min( 1.0, $y ) );
	
	return array(
		'mediaType' => $media_type,
		'breakpoint' => $breakpoint,
		'x' => $x,
		'y' => $y
	);
}

/**
 * レスポンシブフォーカルポイント配列のサニタイゼーション
 *
 * @param array $input レスポンシブフォーカルポイント配列
 * @return array サニタイズされた配列
 */
function crf_sanitize_responsive_focal_array( $input ) {
	if ( ! is_array( $input ) ) {
		return array();
	}
	
	$sanitized = array();
	
	foreach ( $input as $focal_point ) {
		if ( is_array( $focal_point ) ) {
			$sanitized[] = crf_sanitize_focal_point( $focal_point );
		}
	}
	
	return $sanitized;
}

/**
 * render_blockフィルター - TDD GREEN段階
 *
 * @param string $content ブロックコンテンツ
 * @param array  $block ブロック情報
 * @return string 処理されたコンテンツ
 */
function crf_render_block( $content, $block ) {
	// カバーブロック以外は何もしない
	if ( 'core/cover' !== $block['blockName'] ) {
		return $content;
	}
	
	$attrs = $block['attrs'] ?? array();
	$responsive_focal = $attrs['responsiveFocal'] ?? array();
	
	// 空の場合は何も処理しない（標準動作を維持）
	if ( empty( $responsive_focal ) ) {
		return $content;
	}
	
	// data-fp-id を取得または生成
	$fp_id = $attrs['dataFpId'] ?? crf_generate_unique_fp_id();
	
	// data-fp-id属性をカバーブロックに追加
	$content = crf_add_fp_id_to_content( $content, $fp_id );
	
	// レスポンシブフォーカルポイントのサニタイゼーション
	$sanitized_focal = crf_sanitize_responsive_focal_array( $responsive_focal );
	
	// CSS生成
	$css_rules = crf_generate_css_rules( $sanitized_focal, $fp_id );
	
	// インラインスタイルを追加
	if ( ! empty( $css_rules ) ) {
		$content .= sprintf( '<style id="%s">%s</style>', esc_attr( $fp_id ), $css_rules );
	}
	
	return $content;
}

/**
 * data-fp-id属性をコンテンツに追加
 *
 * @param string $content コンテンツ
 * @param string $fp_id フォーカルポイントID
 * @return string 処理されたコンテンツ
 */
function crf_add_fp_id_to_content( $content, $fp_id ) {
	// wp-block-coverクラスを持つ要素にdata-fp-id属性を追加
	return preg_replace_callback(
		// data-fp-id 属性が未設定の wp-block-cover 要素のみ
		'/<[^>]*class="[^"]*wp-block-cover[^"]*"(?:(?!data-fp-id)[^>])*?>/i',
		function( $matches ) use ( $fp_id ) {
			$tag = $matches[0];
			return rtrim( $tag, '>' ) . ' data-fp-id="' . esc_attr( $fp_id ) . '">';
		},
		$content
	);
}

/**
 * 一意のフォーカルポイントIDを生成
 *
 * @return string 一意ID
 */
function crf_generate_unique_fp_id() {
	return wp_unique_id( 'crf-' );
}

// render_blockフィルターを登録
add_filter( 'render_block', 'crf_render_block', 10, 2 );
