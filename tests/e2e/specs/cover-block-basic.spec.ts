import { test, expect } from '@playwright/test';
import { WPAdminUtils } from '../utils/wp-admin';
import { CoverBlockUtils } from '../utils/cover-block';
import { TEST_FOCAL_POINTS, TEST_IMAGES, SELECTORS } from '../fixtures/test-data';

/**
 * カバーブロックの基本的なレスポンシブフォーカルポイント機能のE2Eテスト
 */
test.describe('カバーブロック - レスポンシブフォーカルポイント基本機能', () => {
  let wpAdmin: WPAdminUtils;
  let coverBlock: CoverBlockUtils;

  test.beforeEach(async ({ page }) => {
    wpAdmin = new WPAdminUtils(page);
    coverBlock = new CoverBlockUtils(page);
    
    // WordPress管理画面にログイン
    await wpAdmin.login();
    
    // 新しい投稿を作成
    await wpAdmin.createNewPost();
  });

  test('プラグインが正常にロードされていることを確認', async ({ page }) => {
    // カバーブロックを挿入
    await coverBlock.selectCoverBlock();
    
    // プラグインのJavaScriptが読み込まれていることを確認
    const pluginScript = await page.evaluate(() => {
      return Array.from(document.scripts).some(script => 
        script.src.includes('cover-responsive-focal')
      );
    });
    
    expect(pluginScript).toBeTruthy();
  });

  test('カバーブロックにレスポンシブフォーカルポイント設定が表示される', async ({ page }) => {
    // カバーブロックを挿入
    await wpAdmin.insertCoverBlock();
    
    // メディアを追加
    await coverBlock.addMediaToCover(TEST_IMAGES.LANDSCAPE);
    
    // レスポンシブフォーカルポイント設定を開く
    await coverBlock.openResponsiveFocalSettings();
    
    // 設定パネルが表示されることを確認
    await expect(page.locator(SELECTORS.RESPONSIVE_FOCAL_CONTROLS)).toBeVisible();
    
    // 「新しいブレークポイントを追加」ボタンが表示されることを確認
    await expect(page.locator('button:has-text("新しいブレークポイントを追加")')).toBeVisible();
  });

  test('新しいブレークポイントを追加できる', async ({ page }) => {
    await wpAdmin.insertCoverBlock();
    await coverBlock.addMediaToCover(TEST_IMAGES.LANDSCAPE);
    await coverBlock.openResponsiveFocalSettings();
    
    // 初期状態で設定行が0個であることを確認
    const initialRowCount = await coverBlock.getBreakpointRowCount();
    expect(initialRowCount).toBe(0);
    
    // 新しいブレークポイントを追加
    await coverBlock.addNewBreakpoint();
    
    // 設定行が1個追加されることを確認
    const newRowCount = await coverBlock.getBreakpointRowCount();
    expect(newRowCount).toBe(1);
    
    // 設定行の要素が正しく表示されることを確認
    const firstRow = page.locator(SELECTORS.RESPONSIVE_FOCAL_ROW).first();
    
    // メディアクエリタイプ選択
    await expect(firstRow.locator('select')).toBeVisible();
    
    // ブレークポイント入力
    await expect(firstRow.locator('input[type="number"]')).toBeVisible();
    
    // フォーカルポイントピッカー
    await expect(firstRow.locator(SELECTORS.FOCAL_POINT_PICKER)).toBeVisible();
    
    // 削除ボタン
    await expect(firstRow.locator('button[aria-label="削除"]')).toBeVisible();
  });

  test('レスポンシブフォーカルポイントを設定できる', async ({ page }) => {
    await wpAdmin.insertCoverBlock();
    await coverBlock.addMediaToCover(TEST_IMAGES.LANDSCAPE);
    await coverBlock.openResponsiveFocalSettings();
    
    // 新しいブレークポイントを追加
    await coverBlock.addNewBreakpoint();
    
    // フォーカルポイントを設定
    const testFocalPoint = TEST_FOCAL_POINTS.BASIC_RESPONSIVE[0];
    await coverBlock.setResponsiveFocalPoint(0, testFocalPoint);
    
    // 設定値が正しく反映されることを確認
    const firstRow = page.locator(SELECTORS.RESPONSIVE_FOCAL_ROW).first();
    
    // メディアクエリタイプ
    const mediaTypeSelect = firstRow.locator('select');
    await expect(mediaTypeSelect).toHaveValue(testFocalPoint.mediaType);
    
    // ブレークポイント
    const breakpointInput = firstRow.locator('input[type="number"]');
    await expect(breakpointInput).toHaveValue(testFocalPoint.breakpoint.toString());
  });

  test('ブレークポイント行を削除できる', async ({ page }) => {
    await wpAdmin.insertCoverBlock();
    await coverBlock.addMediaToCover(TEST_IMAGES.LANDSCAPE);
    await coverBlock.openResponsiveFocalSettings();
    
    // 2つのブレークポイントを追加
    await coverBlock.addNewBreakpoint();
    await coverBlock.addNewBreakpoint();
    
    // 2行あることを確認
    expect(await coverBlock.getBreakpointRowCount()).toBe(2);
    
    // 最初の行を削除
    await coverBlock.removeBreakpointRow(0);
    
    // 1行になることを確認
    expect(await coverBlock.getBreakpointRowCount()).toBe(1);
  });

  test('複数のブレークポイントを設定できる', async ({ page }) => {
    await wpAdmin.insertCoverBlock();
    await coverBlock.addMediaToCover(TEST_IMAGES.LANDSCAPE);
    await coverBlock.openResponsiveFocalSettings();
    
    // 複数のブレークポイントを追加
    const testFocalPoints = TEST_FOCAL_POINTS.MULTI_BREAKPOINT;
    
    for (let i = 0; i < testFocalPoints.length; i++) {
      await coverBlock.addNewBreakpoint();
      await coverBlock.setResponsiveFocalPoint(i, testFocalPoints[i]);
    }
    
    // 設定された行数を確認
    expect(await coverBlock.getBreakpointRowCount()).toBe(testFocalPoints.length);
    
    // 各行の設定値を確認
    for (let i = 0; i < testFocalPoints.length; i++) {
      const row = page.locator(SELECTORS.RESPONSIVE_FOCAL_ROW).nth(i);
      const mediaTypeSelect = row.locator('select');
      const breakpointInput = row.locator('input[type="number"]');
      
      await expect(mediaTypeSelect).toHaveValue(testFocalPoints[i].mediaType);
      await expect(breakpointInput).toHaveValue(testFocalPoints[i].breakpoint.toString());
    }
  });

  test.afterEach(async ({ page }) => {
    // テスト後のクリーンアップ（必要に応じて）
    await page.close();
  });
});