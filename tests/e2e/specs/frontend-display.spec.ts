import { test, expect } from '@playwright/test';
import { WPAdminUtils } from '../utils/wp-admin';
import { CoverBlockUtils } from '../utils/cover-block';
import { TEST_FOCAL_POINTS, TEST_IMAGES, TEST_VIEWPORTS, SELECTORS, EXPECTED_VALUES } from '../fixtures/test-data';

/**
 * フロントエンドでのレスポンシブフォーカルポイント表示のE2Eテスト
 */
test.describe('フロントエンド表示 - レスポンシブフォーカルポイント', () => {
  let wpAdmin: WPAdminUtils;
  let coverBlock: CoverBlockUtils;

  test.beforeEach(async ({ page }) => {
    wpAdmin = new WPAdminUtils(page);
    coverBlock = new CoverBlockUtils(page);
    
    await wpAdmin.login();
    await wpAdmin.createNewPost();
    await wpAdmin.insertCoverBlock();
    await coverBlock.addMediaToCover(TEST_IMAGES.LANDSCAPE);
  });

  test('data-fp-id属性が正しく設定される', async ({ page }) => {
    await coverBlock.openResponsiveFocalSettings();
    await coverBlock.addNewBreakpoint();
    
    const testFocalPoint = TEST_FOCAL_POINTS.BASIC_RESPONSIVE[0];
    await coverBlock.setResponsiveFocalPoint(0, testFocalPoint);
    
    // 投稿を保存
    await wpAdmin.savePost();
    
    // プレビューページを開く
    const previewPage = await wpAdmin.previewPost();
    
    try {
      // カバーブロックにdata-fp-id属性が設定されていることを確認
      const coverElement = previewPage.locator(SELECTORS.COVER_WITH_FP_ID);
      await expect(coverElement).toBeVisible();
      
      // data-fp-id属性の値が期待される形式であることを確認
      const fpId = await coverElement.getAttribute('data-fp-id');
      expect(fpId).toMatch(EXPECTED_VALUES.FP_ID_PATTERN);
      
    } finally {
      await previewPage.close();
    }
  });

  test('インラインCSSが正しく生成される', async ({ page }) => {
    await coverBlock.openResponsiveFocalSettings();
    
    // 複数のブレークポイントを設定
    const testFocalPoints = TEST_FOCAL_POINTS.BASIC_RESPONSIVE;
    
    for (let i = 0; i < testFocalPoints.length; i++) {
      await coverBlock.addNewBreakpoint();
      await coverBlock.setResponsiveFocalPoint(i, testFocalPoints[i]);
    }
    
    await wpAdmin.savePost();
    const previewPage = await wpAdmin.previewPost();
    
    try {
      // カバーブロックを取得
      const coverElement = previewPage.locator(SELECTORS.COVER_WITH_FP_ID);
      await expect(coverElement).toBeVisible();
      
      // data-fp-id属性を取得
      const fpId = await coverElement.getAttribute('data-fp-id');
      
      // 対応するstyleタグが存在することを確認
      const styleElement = previewPage.locator(`style:has-text("${fpId}")`);
      await expect(styleElement).toBeVisible();
      
      // CSSの内容を確認
      const cssContent = await styleElement.textContent();
      
      // 各ブレークポイントのメディアクエリが含まれていることを確認
      for (const focalPoint of testFocalPoints) {
        const mediaQuery = `@media (${focalPoint.mediaType}: ${focalPoint.breakpoint}px)`;
        expect(cssContent).toContain(mediaQuery);
        
        // object-positionの値が含まれていることを確認
        const objectPosition = `${focalPoint.x}% ${focalPoint.y}%`;
        expect(cssContent).toContain(objectPosition);
      }
      
    } finally {
      await previewPage.close();
    }
  });

  test('レスポンシブ表示が正しく動作する', async ({ page }) => {
    await coverBlock.openResponsiveFocalSettings();
    
    const testFocalPoints = TEST_FOCAL_POINTS.BASIC_RESPONSIVE;
    
    for (let i = 0; i < testFocalPoints.length; i++) {
      await coverBlock.addNewBreakpoint();
      await coverBlock.setResponsiveFocalPoint(i, testFocalPoints[i]);
    }
    
    await wpAdmin.savePost();
    const previewPage = await wpAdmin.previewPost();
    
    try {
      const coverElement = previewPage.locator(SELECTORS.COVER_WITH_FP_ID);
      await expect(coverElement).toBeVisible();
      
      // 各ブレークポイントでの表示を確認
      for (const focalPoint of testFocalPoints) {
        // ビューポートサイズを設定
        const viewportWidth = focalPoint.mediaType === 'min-width' 
          ? focalPoint.breakpoint + 100 
          : focalPoint.breakpoint - 100;
        
        await previewPage.setViewportSize({ width: viewportWidth, height: 800 });
        await previewPage.waitForTimeout(500); // CSS適用まで待機
        
        // 計算されたスタイルを確認
        const computedStyle = await coverElement.evaluate((el) => {
          return window.getComputedStyle(el);
        });
        
        // object-positionが適用されていることを確認
        // （実際の実装に応じて、background-positionやその他のプロパティを確認）
        const backgroundPosition = await coverElement.evaluate((el) => {
          return window.getComputedStyle(el).backgroundPosition;
        });
        
        // 期待される位置の計算（簡易版）
        const expectedX = `${focalPoint.x}%`;
        const expectedY = `${focalPoint.y}%`;
        
        expect(backgroundPosition).toContain(expectedX);
        expect(backgroundPosition).toContain(expectedY);
      }
      
    } finally {
      await previewPage.close();
    }
  });

  test('ビジュアル回帰テスト - デスクトップ表示', async ({ page }) => {
    await coverBlock.openResponsiveFocalSettings();
    await coverBlock.addNewBreakpoint();
    
    const testFocalPoint = TEST_FOCAL_POINTS.BASIC_RESPONSIVE[0];
    await coverBlock.setResponsiveFocalPoint(0, testFocalPoint);
    
    await wpAdmin.savePost();
    const previewPage = await wpAdmin.previewPost();
    
    try {
      // デスクトップサイズでスクリーンショット
      await previewPage.setViewportSize(TEST_VIEWPORTS.DESKTOP);
      await previewPage.waitForTimeout(1000);
      
      const coverElement = previewPage.locator(SELECTORS.COVER_WITH_FP_ID);
      await expect(coverElement).toHaveScreenshot('cover-desktop.png');
      
    } finally {
      await previewPage.close();
    }
  });

  test('ビジュアル回帰テスト - モバイル表示', async ({ page }) => {
    await coverBlock.openResponsiveFocalSettings();
    await coverBlock.addNewBreakpoint();
    
    const testFocalPoint = TEST_FOCAL_POINTS.BASIC_RESPONSIVE[1];
    await coverBlock.setResponsiveFocalPoint(0, testFocalPoint);
    
    await wpAdmin.savePost();
    const previewPage = await wpAdmin.previewPost();
    
    try {
      // モバイルサイズでスクリーンショット
      await previewPage.setViewportSize(TEST_VIEWPORTS.MOBILE);
      await previewPage.waitForTimeout(1000);
      
      const coverElement = previewPage.locator(SELECTORS.COVER_WITH_FP_ID);
      await expect(coverElement).toHaveScreenshot('cover-mobile.png');
      
    } finally {
      await previewPage.close();
    }
  });

  test('設定なしの場合の標準動作確認', async ({ page }) => {
    // レスポンシブフォーカルポイントを設定せずに保存
    await wpAdmin.savePost();
    const previewPage = await wpAdmin.previewPage();
    
    try {
      // カバーブロックが表示される
      const coverElement = previewPage.locator(SELECTORS.COVER_FRONTEND);
      await expect(coverElement).toBeVisible();
      
      // data-fp-id属性が設定されていないことを確認
      const fpIdAttribute = await coverElement.getAttribute('data-fp-id');
      expect(fpIdAttribute).toBeNull();
      
      // 追加のCSSが生成されていないことを確認
      const styleElements = previewPage.locator('style[data-responsive-focal]');
      expect(await styleElements.count()).toBe(0);
      
    } finally {
      await previewPage.close();
    }
  });

  test.afterEach(async ({ page }) => {
    await page.close();
  });
});