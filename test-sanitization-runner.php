<?php
/**
 * サニタイゼーション関数の手動テストランナー
 */

// WordPress関数のモック
require_once 'tests/php/wp-functions-mock.php';

// プラグインファイルを読み込み
require_once 'cover-responsive-focal.php';

echo "=== サニタイゼーション関数のテスト実行（TDD GREEN段階） ===\n";

// テスト1: 基本的なサニタイゼーション
echo "テスト1: 基本的なサニタイゼーション\n";
$input = [
    'mediaType' => 'max-width',
    'breakpoint' => '767',
    'x' => '0.6',
    'y' => '0.4'
];

$sanitized = crf_sanitize_focal_point($input);
$expected = [
    'mediaType' => 'max-width',
    'breakpoint' => 767,
    'x' => 0.6,
    'y' => 0.4
];

if ($sanitized === $expected) {
    echo "✅ テスト1 成功\n";
} else {
    echo "❌ テスト1 失敗\n";
    echo "期待値: " . json_encode($expected) . "\n";
    echo "実際値: " . json_encode($sanitized) . "\n";
}

// テスト2: 不正な値のサニタイゼーション
echo "\nテスト2: 不正な値のサニタイゼーション\n";
$input_invalid = [
    'mediaType' => 'invalid-type',
    'breakpoint' => 'invalid',
    'x' => 'invalid',
    'y' => 'invalid'
];

$sanitized_invalid = crf_sanitize_focal_point($input_invalid);
if ($sanitized_invalid['mediaType'] === 'max-width' &&
    $sanitized_invalid['breakpoint'] === 768 &&
    $sanitized_invalid['x'] === 0.5 &&
    $sanitized_invalid['y'] === 0.5) {
    echo "✅ テスト2 成功\n";
} else {
    echo "❌ テスト2 失敗\n";
    echo "実際値: " . json_encode($sanitized_invalid) . "\n";
}

// テスト3: 範囲外の値の正規化
echo "\nテスト3: 範囲外の値の正規化\n";
$input_range = [
    'mediaType' => 'max-width',
    'breakpoint' => '-100',
    'x' => '-0.5',
    'y' => '1.5'
];

$sanitized_range = crf_sanitize_focal_point($input_range);
if ($sanitized_range['breakpoint'] === 768 && // デフォルト値
    $sanitized_range['x'] === 0.0 && // 最小値
    $sanitized_range['y'] === 1.0) { // 最大値
    echo "✅ テスト3 成功\n";
} else {
    echo "❌ テスト3 失敗\n";
    echo "実際値: " . json_encode($sanitized_range) . "\n";
}

// テスト4: 配列全体のサニタイゼーション
echo "\nテスト4: 配列全体のサニタイゼーション\n";
$input_array = [
    [
        'mediaType' => 'max-width',
        'breakpoint' => '767',
        'x' => '0.6',
        'y' => '0.4'
    ],
    [
        'mediaType' => 'invalid-type',
        'breakpoint' => 'invalid',
        'x' => '-0.1',
        'y' => '1.1'
    ]
];

$sanitized_array = crf_sanitize_responsive_focal_array($input_array);
if (count($sanitized_array) === 2 &&
    $sanitized_array[0]['mediaType'] === 'max-width' &&
    $sanitized_array[1]['mediaType'] === 'max-width' &&
    $sanitized_array[1]['x'] === 0.0 &&
    $sanitized_array[1]['y'] === 1.0) {
    echo "✅ テスト4 成功\n";
} else {
    echo "❌ テスト4 失敗\n";
    echo "実際値: " . json_encode($sanitized_array) . "\n";
}

echo "\n=== GREEN段階確認完了 ===\n";