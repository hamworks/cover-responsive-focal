import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E テスト設定
 * WordPress ブロックエディタでのカバーブロック操作をテスト
 */
export default defineConfig({
  // テストディレクトリの指定
  testDir: './tests/e2e',
  
  // 並列実行の設定（CIでは1、ローカルでは2に制限）
  fullyParallel: true,
  
  // テスト失敗時の動作（CIでは失敗時に即座に停止）
  forbidOnly: !!process.env.CI,
  
  // 失敗時のリトライ回数（CIでは2回、ローカルでは0回）
  retries: process.env.CI ? 2 : 0,
  
  // ワーカー数の設定（CIでは1、ローカルではCPUの半分）
  workers: process.env.CI ? 1 : undefined,
  
  // レポーター設定
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    process.env.CI ? ['github'] : ['list']
  ],
  
  // グローバル設定
  use: {
    // ベースURL（wp-envのデフォルト）
    baseURL: 'http://localhost:8888',
    
    // ブラウザ設定
    headless: !!process.env.CI,
    viewport: { width: 1280, height: 720 },
    
    // スクリーンショット設定
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // トレース設定（失敗時のデバッグに使用）
    trace: 'on-first-retry',
    
    // WordPress固有の設定
    locale: 'ja-JP',
    timezoneId: 'Asia/Tokyo',
  },

  // プロジェクト設定（異なるブラウザでのテスト）
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // モバイル環境でのテスト
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // WordPress環境のセットアップ
  webServer: {
    command: 'npm run env start',
    port: 8888,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2分でタイムアウト
  },
  
  // テストの期待値設定
  expect: {
    // アサーションのタイムアウト
    timeout: 10 * 1000, // 10秒
    
    // スクリーンショット比較の設定
    toHaveScreenshot: {
      mode: 'css', // CSSアニメーションを無効化
      animations: 'disabled',
    },
    toMatchSnapshot: {
      threshold: 0.2, // 許容誤差20%
    },
  },
  
  // グローバルタイムアウト設定
  globalTimeout: 60 * 60 * 1000, // 全体で1時間
  timeout: 30 * 1000, // 個別テストは30秒
});