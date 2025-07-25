<?php
/**
 * render_blockフィルターの手動テストランナー
 */

// WordPress関数のモック
require_once 'tests/php/wp-functions-mock.php';

// プラグインファイルを読み込み
require_once 'cover-responsive-focal.php';

echo "=== render_blockフィルターのテスト実行（TDD GREEN段階） ===\n";

// テスト1: カバーブロックのレスポンシブフォーカル処理
echo "テスト1: カバーブロックのレスポンシブフォーカル処理\n";
$block = [
    'blockName' => 'core/cover',
    'attrs' => [
        'responsiveFocal' => [
            [
                'mediaType' => 'max-width',
                'breakpoint' => 767,
                'x' => 0.6,
                'y' => 0.4
            ]
        ],
        'dataFpId' => 'test-123'
    ]
];

$content = '<div class="wp-block-cover">Test Content</div>';
$filtered_content = crf_render_block($content, $block);

// data-fp-id属性の確認
if (strpos($filtered_content, 'data-fp-id="test-123"') !== false) {
    echo "✅ data-fp-id属性追加成功\n";
} else {
    echo "❌ data-fp-id属性追加失敗\n";
}

// インラインスタイルの確認
if (strpos($filtered_content, '<style id="test-123">') !== false) {
    echo "✅ インラインスタイル追加成功\n";
} else {
    echo "❌ インラインスタイル追加失敗\n";
}

// CSS内容の確認
if (strpos($filtered_content, '@media (max-width: 767px)') !== false) {
    echo "✅ メディアクエリ生成成功\n";
} else {
    echo "❌ メディアクエリ生成失敗\n";
}

if (strpos($filtered_content, 'object-position: 60% 40%') !== false) {
    echo "✅ オブジェクトポジション設定成功\n";
} else {
    echo "❌ オブジェクトポジション設定失敗\n";
}

// テスト2: 非カバーブロックはそのまま返す
echo "\nテスト2: 非カバーブロック処理\n";
$non_cover_block = [
    'blockName' => 'core/paragraph',
    'attrs' => []
];

$paragraph_content = '<p>Test paragraph</p>';
$paragraph_filtered = crf_render_block($paragraph_content, $non_cover_block);

if ($paragraph_content === $paragraph_filtered) {
    echo "✅ 非カバーブロック無変更成功\n";
} else {
    echo "❌ 非カバーブロック変更されている\n";
}

// テスト3: 空のresponsiveFocal
echo "\nテスト3: 空のresponsiveFocal処理\n";
$empty_block = [
    'blockName' => 'core/cover',
    'attrs' => [
        'responsiveFocal' => []
    ]
];

$empty_content = '<div class="wp-block-cover">Empty Test</div>';
$empty_filtered = crf_render_block($empty_content, $empty_block);

if ($empty_content === $empty_filtered) {
    echo "✅ 空のresponsiveFocal無変更成功\n";
} else {
    echo "❌ 空のresponsiveFocal変更されている\n";
}

// テスト4: 一意ID生成のテスト
echo "\nテスト4: 一意ID生成テスト\n";
$id1 = crf_generate_unique_fp_id();
$id2 = crf_generate_unique_fp_id();

if (strpos($id1, 'crf-') === 0 && strpos($id2, 'crf-') === 0 && $id1 !== $id2) {
    echo "✅ 一意ID生成成功\n";
} else {
    echo "❌ 一意ID生成失敗\n";
    echo "ID1: $id1\n";
    echo "ID2: $id2\n";
}

// テスト5: data-fp-id属性重複防止テスト
echo "\nテスト5: data-fp-id属性重複防止テスト\n";
$existing_id_content = '<div class="wp-block-cover" data-fp-id="existing-id">Existing Test</div>';
$no_change_result = crf_add_fp_id_to_content($existing_id_content, 'new-id');

if ($existing_id_content === $no_change_result) {
    echo "✅ 既存data-fp-id属性の重複防止成功\n";
} else {
    echo "❌ 既存data-fp-id属性の重複防止失敗\n";
    echo "元の内容: $existing_id_content\n";
    echo "結果: $no_change_result\n";
}

echo "\n=== GREEN段階確認完了 ===\n";