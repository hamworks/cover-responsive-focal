import { ResponsiveFocalPoint } from '../utils/cover-block';

/**
 * E2Eテスト用のテストデータ定義
 */

/**
 * テスト用のレスポンシブフォーカルポイント設定パターン
 */
export const TEST_FOCAL_POINTS = {
  // 基本的なデスクトップ・モバイル設定
  BASIC_RESPONSIVE: [
    {
      mediaType: 'min-width' as const,
      breakpoint: 768,
      x: 30,
      y: 40,
    },
    {
      mediaType: 'max-width' as const,
      breakpoint: 767,
      x: 70,
      y: 60,
    },
  ] as ResponsiveFocalPoint[],

  // 複数ブレークポイント設定
  MULTI_BREAKPOINT: [
    {
      mediaType: 'min-width' as const,
      breakpoint: 1200,
      x: 25,
      y: 35,
    },
    {
      mediaType: 'min-width' as const,
      breakpoint: 768,
      x: 50,
      y: 50,
    },
    {
      mediaType: 'max-width' as const,
      breakpoint: 767,
      x: 75,
      y: 65,
    },
  ] as ResponsiveFocalPoint[],

  // 極端な値でのテスト
  EDGE_CASES: [
    {
      mediaType: 'min-width' as const,
      breakpoint: 320,
      x: 0,
      y: 0,
    },
    {
      mediaType: 'max-width' as const,
      breakpoint: 1920,
      x: 100,
      y: 100,
    },
  ] as ResponsiveFocalPoint[],
};

/**
 * テスト用の画像URL
 */
export const TEST_IMAGES = {
  // 横長画像（風景写真を想定）
  LANDSCAPE: 'https://picsum.photos/1200/800?random=1',
  
  // 縦長画像（ポートレートを想定）
  PORTRAIT: 'https://picsum.photos/800/1200?random=2',
  
  // 正方形画像
  SQUARE: 'https://picsum.photos/800/800?random=3',
  
  // 高解像度画像
  HIGH_RES: 'https://picsum.photos/2400/1600?random=4',
};

/**
 * テスト用のビューポートサイズ
 */
export const TEST_VIEWPORTS = {
  MOBILE: { width: 375, height: 667 },
  TABLET: { width: 768, height: 1024 },
  DESKTOP: { width: 1200, height: 800 },
  LARGE_DESKTOP: { width: 1920, height: 1080 },
};

/**
 * WordPressの標準ブレークポイント
 */
export const WP_BREAKPOINTS = {
  MOBILE: 600,
  TABLET: 782,
  DESKTOP: 1080,
};

/**
 * テスト用のWordPressユーザー認証情報
 */
export const TEST_USER = {
  USERNAME: 'admin',
  PASSWORD: 'password',
  EMAIL: 'admin@example.com',
};

/**
 * CSSセレクター定数
 */
export const SELECTORS = {
  // WordPress エディタ
  BLOCK_EDITOR: '.block-editor-writing-flow',
  COVER_BLOCK: '[data-type="core/cover"]',
  BLOCK_INSPECTOR: '.block-editor-block-inspector',
  
  // プラグイン固有
  RESPONSIVE_FOCAL_CONTROLS: '.responsive-focal-controls',
  RESPONSIVE_FOCAL_ROW: '.responsive-focal-row',
  FOCAL_POINT_PICKER: '.components-focal-point-picker',
  
  // フロントエンド
  COVER_FRONTEND: '.wp-block-cover',
  COVER_WITH_FP_ID: '.wp-block-cover[data-fp-id]',
};

/**
 * テスト用のアサーション期待値
 */
export const EXPECTED_VALUES = {
  // デフォルトのdata-fp-id形式（timestamp-based）
  FP_ID_PATTERN: /^fp-\d+$/,
  
  // CSSカスタムプロパティのパターン
  OBJECT_POSITION_PATTERN: /^\d+%\s+\d+%$/,
  
  // メディアクエリのパターン
  MEDIA_QUERY_PATTERN: /^@media\s+\((min|max)-width:\s*\d+px\)/,
};