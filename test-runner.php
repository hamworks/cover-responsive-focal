<?php
/**
 * 手動テストランナー
 */

// WordPress関数のモック
require_once 'tests/php/wp-functions-mock.php';

// プラグインファイルを読み込み
require_once 'cover-responsive-focal.php';

echo "=== CSS生成関数のテスト実行 ===\n";

// テスト1: 単一フォーカルポイント
echo "テスト1: 単一フォーカルポイント\n";
$responsive_focal = [
    [
        'mediaType' => 'max-width',
        'breakpoint' => 767,
        'x' => 0.6,
        'y' => 0.4
    ]
];

$css = crf_generate_css_rules($responsive_focal, 'test-id');
$expected = '@media (max-width: 767px) { [data-fp-id="test-id"] .wp-block-cover__image-background, [data-fp-id="test-id"] .wp-block-cover__video-background { object-position: 60% 40%; } }';

if ($css === $expected) {
    echo "✅ テスト1 成功\n";
} else {
    echo "❌ テスト1 失敗\n";
    echo "期待値: " . $expected . "\n";
    echo "実際値: " . $css . "\n";
}

// テスト2: 空配列
echo "\nテスト2: 空配列\n";
$css_empty = crf_generate_css_rules([], 'empty-test');
if ($css_empty === '') {
    echo "✅ テスト2 成功\n";
} else {
    echo "❌ テスト2 失敗\n";
    echo "期待値: (空文字)\n";
    echo "実際値: " . $css_empty . "\n";
}

// テスト3: バリデーション関数
echo "\nテスト3: バリデーション関数\n";
$media_test = crf_validate_media_type('max-width') && crf_validate_media_type('min-width') && !crf_validate_media_type('invalid-type');
if ($media_test) {
    echo "✅ メディアタイプバリデーション成功\n";
} else {
    echo "❌ メディアタイプバリデーション失敗\n";
}

$breakpoint_test = crf_validate_breakpoint(768) && !crf_validate_breakpoint(0) && !crf_validate_breakpoint(10000);
if ($breakpoint_test) {
    echo "✅ ブレークポイントバリデーション成功\n";
} else {
    echo "❌ ブレークポイントバリデーション失敗\n";
}

$focal_test = crf_validate_focal_point_value(0.5) && crf_validate_focal_point_value(0.0) && crf_validate_focal_point_value(1.0) && !crf_validate_focal_point_value(-0.1) && !crf_validate_focal_point_value(1.1);
if ($focal_test) {
    echo "✅ フォーカルポイントバリデーション成功\n";
} else {
    echo "❌ フォーカルポイントバリデーション失敗\n";
}

echo "\n=== テスト完了 ===\n";