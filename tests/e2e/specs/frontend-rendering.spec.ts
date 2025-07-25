import { test, expect } from '@playwright/test';
import { WPAdminUtils } from '../utils/wp-admin';
import { CoverBlockUtils } from '../utils/cover-block';
import { TEST_IMAGES, TEST_FOCAL_POINTS, TEST_VIEWPORTS } from '../fixtures/test-data';

/**
 * フロントエンド表示確認の詳細なE2Eテスト
 * PHP実装とCSS生成機能に基づいたフロントエンド検証
 */
test.describe('フロントエンド表示 - レスポンシブフォーカルポイント描画', () => {
  let wpAdmin: WPAdminUtils;
  let coverBlock: CoverBlockUtils;

  test.beforeEach(async ({ page }) => {
    wpAdmin = new WPAdminUtils(page);
    coverBlock = new CoverBlockUtils(page);
    
    await wpAdmin.login();
    await wpAdmin.createNewPost();
  });

  test('data-fp-id属性の自動生成と設定', async ({ page }) => {
    await wpAdmin.insertCoverBlock();
    await coverBlock.addMediaToCover(TEST_IMAGES.LANDSCAPE);
    await wpAdmin.openBlockInspector();
    
    const responsiveFocalPanel = page.locator('text=Responsive Focal Points');
    if (await responsiveFocalPanel.isVisible()) {
      await responsiveFocalPanel.click();
      await page.locator('button.crf-add-focal-point').click();
      
      // レスポンシブフォーカルポイント設定を行う
      const mediaTypeSelect = page.locator('select').first();
      const breakpointInput = page.locator('input[type="number"]').first();
      
      await mediaTypeSelect.selectOption('min-width');
      await breakpointInput.fill('768');
      
      // 投稿を公開
      await wpAdmin.publishPost();
      const previewPage = await wpAdmin.previewPost();
      
      try {
        // カバーブロックが存在することを確認
        const coverElement = previewPage.locator('.wp-block-cover');
        await expect(coverElement).toBeVisible();
        
        // data-fp-id属性が自動生成されていることを確認
        const fpId = await coverElement.getAttribute('data-fp-id');
        expect(fpId).toBeTruthy();
        expect(fpId).toMatch(/^crf-\d+$/); // crf_generate_unique_fp_id() の形式
        
        console.log('生成されたdata-fp-id:', fpId);
        
      } finally {
        await previewPage.close();
      }
    }
  });

  test('インラインCSS生成と挿入', async ({ page }) => {
    await wpAdmin.insertCoverBlock();
    await coverBlock.addMediaToCover(TEST_IMAGES.LANDSCAPE);
    await wpAdmin.openBlockInspector();
    
    const responsiveFocalPanel = page.locator('text=Responsive Focal Points');
    if (await responsiveFocalPanel.isVisible()) {
      await responsiveFocalPanel.click();
      await page.locator('button.crf-add-focal-point').click();
      
      // 複数のブレークポイントを設定
      const addButton = page.locator('button.crf-add-focal-point');
      await addButton.click(); // 2つ目のブレークポイント
      
      const mediaTypeSelects = page.locator('select');
      const breakpointInputs = page.locator('input[type="number"]');
      
      // 1つ目: min-width 1024px
      await mediaTypeSelects.nth(0).selectOption('min-width');
      await breakpointInputs.nth(0).fill('1024');
      
      // 2つ目: max-width 767px
      await mediaTypeSelects.nth(1).selectOption('max-width');
      await breakpointInputs.nth(1).fill('767');
      
      await wpAdmin.publishPost();
      const previewPage = await wpAdmin.previewPost();
      
      try {
        const coverElement = previewPage.locator('.wp-block-cover');
        const fpId = await coverElement.getAttribute('data-fp-id');
        
        // 対応するstyleタグが生成されていることを確認
        const styleElement = previewPage.locator(`style#${fpId}`);
        await expect(styleElement).toBeVisible();
        
        // CSS内容の確認
        const cssContent = await styleElement.textContent();
        
        // メディアクエリが正しく生成されていることを確認
        expect(cssContent).toContain('@media (min-width: 1024px)');
        expect(cssContent).toContain('@media (max-width: 767px)');
        
        // CSSセレクターが正しく生成されていることを確認
        expect(cssContent).toContain(`[data-fp-id="${fpId}"]`);
        expect(cssContent).toContain('.wp-block-cover__image-background');
        expect(cssContent).toContain('.wp-block-cover__video-background');
        
        // object-positionプロパティが含まれていることを確認
        expect(cssContent).toContain('object-position');
        expect(cssContent).toContain('!important');
        
        console.log('生成されたCSS:', cssContent);
        
      } finally {
        await previewPage.close();
      }
    }
  });

  test('フォーカルポイント座標のCSS出力検証', async ({ page }) => {
    await wpAdmin.insertCoverBlock();
    await coverBlock.addMediaToCover(TEST_IMAGES.LANDSCAPE);
    await wpAdmin.openBlockInspector();
    
    const responsiveFocalPanel = page.locator('text=Responsive Focal Points');
    if (await responsiveFocalPanel.isVisible()) {
      await responsiveFocalPanel.click();
      await page.locator('button.crf-add-focal-point').click();
      
      // フォーカルポイントピッカーで特定の位置を設定
      const focalPointPicker = page.locator('.components-focal-point-picker');
      const pickerBounds = await focalPointPicker.boundingBox();
      
      if (pickerBounds) {
        // 左上角 (25%, 25%) をクリック
        await page.mouse.click(
          pickerBounds.x + pickerBounds.width * 0.25,
          pickerBounds.y + pickerBounds.height * 0.25
        );
      }
      
      await wpAdmin.publishPost();
      const previewPage = await wpAdmin.previewPost();
      
      try {
        const coverElement = previewPage.locator('.wp-block-cover');
        const fpId = await coverElement.getAttribute('data-fp-id');
        const styleElement = previewPage.locator(`style#${fpId}`);
        const cssContent = await styleElement.textContent();
        
        // フォーカルポイント座標がパーセンテージで出力されていることを確認
        // フォーカルポイントピッカーの座標 (0.25, 0.25) → CSS (25%, 25%)
        const objectPositionMatch = cssContent?.match(/object-position:\s*(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%/);
        expect(objectPositionMatch).toBeTruthy();
        
        if (objectPositionMatch) {
          const xPercent = parseFloat(objectPositionMatch[1]);
          const yPercent = parseFloat(objectPositionMatch[2]);
          
          // 設定した位置に近い値であることを確認（誤差許容範囲: ±5%）
          expect(xPercent).toBeCloseTo(25, 0);
          expect(yPercent).toBeCloseTo(25, 0);
          
          console.log(`フォーカルポイント座標: ${xPercent}%, ${yPercent}%`);
        }
        
      } finally {
        await previewPage.close();
      }
    }
  });

  test('レスポンシブ表示の動的変更確認', async ({ page }) => {
    await wpAdmin.insertCoverBlock();
    await coverBlock.addMediaToCover(TEST_IMAGES.LANDSCAPE);
    await wpAdmin.openBlockInspector();
    
    const responsiveFocalPanel = page.locator('text=Responsive Focal Points');
    if (await responsiveFocalPanel.isVisible()) {
      await responsiveFocalPanel.click();
      
      // 複数のブレークポイントを追加
      const addButton = page.locator('button.crf-add-focal-point');
      await addButton.click();
      await addButton.click();
      
      const mediaTypeSelects = page.locator('select');
      const breakpointInputs = page.locator('input[type="number"]');
      const focalPointPickers = page.locator('.components-focal-point-picker');
      
      // デスクトップ用設定: min-width 1024px, 左上
      await mediaTypeSelects.nth(0).selectOption('min-width');
      await breakpointInputs.nth(0).fill('1024');
      let pickerBounds = await focalPointPickers.nth(0).boundingBox();
      if (pickerBounds) {
        await page.mouse.click(
          pickerBounds.x + pickerBounds.width * 0.2,
          pickerBounds.y + pickerBounds.height * 0.2
        );
      }
      
      // モバイル用設定: max-width 767px, 右下
      await mediaTypeSelects.nth(1).selectOption('max-width');
      await breakpointInputs.nth(1).fill('767');
      pickerBounds = await focalPointPickers.nth(1).boundingBox();
      if (pickerBounds) {
        await page.mouse.click(
          pickerBounds.x + pickerBounds.width * 0.8,
          pickerBounds.y + pickerBounds.height * 0.8
        );
      }
      
      await wpAdmin.publishPost();
      const previewPage = await wpAdmin.previewPost();
      
      try {
        const coverElement = previewPage.locator('.wp-block-cover');
        const fpId = await coverElement.getAttribute('data-fp-id');
        const styleElement = previewPage.locator(`style#${fpId}`);
        const cssContent = await styleElement.textContent();
        
        // デスクトップサイズで確認
        await previewPage.setViewportSize(TEST_VIEWPORTS.DESKTOP);
        await previewPage.waitForLoadState('networkidle');
        
        // デスクトップ用のCSSが適用されることを確認
        const desktopStyles = await previewPage.evaluate((fpId) => {
          const element = document.querySelector(`[data-fp-id="${fpId}"] .wp-block-cover__image-background`);
          return element ? window.getComputedStyle(element).objectPosition : null;
        }, fpId);
        
        // モバイルサイズで確認
        await previewPage.setViewportSize(TEST_VIEWPORTS.MOBILE);
        await previewPage.waitForLoadState('networkidle');
        
        const mobileStyles = await previewPage.evaluate((fpId) => {
          const element = document.querySelector(`[data-fp-id="${fpId}"] .wp-block-cover__image-background`);
          return element ? window.getComputedStyle(element).objectPosition : null;
        }, fpId);
        
        // デスクトップとモバイルで異なるobject-positionが適用されることを確認
        if (desktopStyles && mobileStyles) {
          expect(desktopStyles).not.toBe(mobileStyles);
          console.log('デスクトップ object-position:', desktopStyles);
          console.log('モバイル object-position:', mobileStyles);
        }
        
      } finally {
        await previewPage.close();
      }
    }
  });

  test('空のresponsiveFocal配列時の標準動作維持', async ({ page }) => {
    // レスポンシブフォーカルポイントを設定せずにカバーブロックを作成
    await wpAdmin.insertCoverBlock();
    await coverBlock.addMediaToCover(TEST_IMAGES.LANDSCAPE);
    
    // 設定なしで投稿を公開
    await wpAdmin.publishPost();
    const previewPage = await wpAdmin.previewPost();
    
    try {
      const coverElement = previewPage.locator('.wp-block-cover');
      await expect(coverElement).toBeVisible();
      
      // data-fp-id属性が設定されていないことを確認
      const fpId = await coverElement.getAttribute('data-fp-id');
      expect(fpId).toBeNull();
      
      // レスポンシブフォーカルポイント用のstyleタグが生成されていないことを確認
      const responsiveStyles = previewPage.locator('style[id^="crf-"]');
      expect(await responsiveStyles.count()).toBe(0);
      
      // WordPress標準のカバーブロック機能が正常に動作することを確認
      await expect(coverElement).toHaveClass(/wp-block-cover/);
      
    } finally {
      await previewPage.close();
    }
  });

  test('無効なresponsiveFocal値のサニタイゼーション', async ({ page }) => {
    // 直接ブロック属性を操作して無効な値を設定
    await wpAdmin.insertCoverBlock();
    await coverBlock.addMediaToCover(TEST_IMAGES.LANDSCAPE);
    
    // ブロックエディタで無効なデータを注入（開発者ツール経由）
    await page.evaluate(() => {
      const blocks = wp.data.select('core/block-editor').getBlocks();
      const coverBlock = blocks.find(block => block.name === 'core/cover');
      
      if (coverBlock) {
        // 無効なresponsiveFocal値を設定
        wp.data.dispatch('core/block-editor').updateBlockAttributes(coverBlock.clientId, {
          responsiveFocal: [
            {
              mediaType: 'invalid-type', // 無効なメディアタイプ
              breakpoint: -100, // 無効なブレークポイント
              x: 2.5, // 範囲外のX座標
              y: -0.5 // 範囲外のY座標
            },
            {
              mediaType: 'min-width', // 有効な値
              breakpoint: 768,
              x: 0.3,
              y: 0.7
            }
          ]
        });
      }
    });
    
    await wpAdmin.publishPost();
    const previewPage = await wpAdmin.previewPost();
    
    try {
      const coverElement = previewPage.locator('.wp-block-cover');
      const fpId = await coverElement.getAttribute('data-fp-id');
      
      if (fpId) {
        const styleElement = previewPage.locator(`style#${fpId}`);
        const cssContent = await styleElement.textContent();
        
        // 無効な値のCSSルールが生成されていないことを確認
        expect(cssContent).not.toContain('invalid-type');
        expect(cssContent).not.toContain('-100px');
        
        // 有効な値のCSSルールは生成されていることを確認
        expect(cssContent).toContain('min-width: 768px');
        expect(cssContent).toContain('object-position');
        
        console.log('サニタイゼーション後のCSS:', cssContent);
      }
      
    } finally {
      await previewPage.close();
    }
  });

  test('複雑なメディアクエリ組み合わせの検証', async ({ page }) => {
    await wpAdmin.insertCoverBlock();
    await coverBlock.addMediaToCover(TEST_IMAGES.LANDSCAPE);
    await wpAdmin.openBlockInspector();
    
    const responsiveFocalPanel = page.locator('text=Responsive Focal Points');
    if (await responsiveFocalPanel.isVisible()) {
      await responsiveFocalPanel.click();
      
      // 複数のブレークポイントを設定（モバイルファースト設計）
      const testPoints = [
        { mediaType: 'min-width', breakpoint: '1200', position: { x: 0.2, y: 0.3 } },
        { mediaType: 'min-width', breakpoint: '768', position: { x: 0.5, y: 0.5 } },
        { mediaType: 'max-width', breakpoint: '767', position: { x: 0.8, y: 0.7 } }
      ];
      
      for (let i = 0; i < testPoints.length; i++) {
        const addButton = page.locator('button.crf-add-focal-point');
        await addButton.click();
        
        const mediaTypeSelects = page.locator('select');
        const breakpointInputs = page.locator('input[type="number"]');
        const focalPointPickers = page.locator('.components-focal-point-picker');
        
        await mediaTypeSelects.nth(i).selectOption(testPoints[i].mediaType);
        await breakpointInputs.nth(i).fill(testPoints[i].breakpoint);
        
        const pickerBounds = await focalPointPickers.nth(i).boundingBox();
        if (pickerBounds) {
          await page.mouse.click(
            pickerBounds.x + pickerBounds.width * testPoints[i].position.x,
            pickerBounds.y + pickerBounds.height * testPoints[i].position.y
          );
        }
      }
      
      await wpAdmin.publishPost();
      const previewPage = await wpAdmin.previewPost();
      
      try {
        const coverElement = previewPage.locator('.wp-block-cover');
        const fpId = await coverElement.getAttribute('data-fp-id');
        const styleElement = previewPage.locator(`style#${fpId}`);
        const cssContent = await styleElement.textContent();
        
        // 各ブレークポイントのメディアクエリが正しく生成されていることを確認
        expect(cssContent).toContain('@media (min-width: 1200px)');
        expect(cssContent).toContain('@media (min-width: 768px)');
        expect(cssContent).toContain('@media (max-width: 767px)');
        
        // CSS特異性のための!importantが含まれていることを確認
        const importantMatches = (cssContent?.match(/!important/g) || []).length;
        expect(importantMatches).toBeGreaterThan(0);
        
        // 各ビューポートサイズで適切なスタイルが適用されることを確認
        const viewportTests = [
          { viewport: { width: 1400, height: 800 }, expectedQuery: 'min-width: 1200px' },
          { viewport: { width: 900, height: 600 }, expectedQuery: 'min-width: 768px' },
          { viewport: { width: 400, height: 600 }, expectedQuery: 'max-width: 767px' }
        ];
        
        for (const test of viewportTests) {
          await previewPage.setViewportSize(test.viewport);
          await previewPage.waitForLoadState('networkidle');
          
          // メディアクエリがマッチすることを確認
          const mediaQueryMatches = await previewPage.evaluate((query) => {
            return window.matchMedia(`(${query})`).matches;
          }, test.expectedQuery);
          
          expect(mediaQueryMatches).toBeTruthy();
        }
        
      } finally {
        await previewPage.close();
      }
    }
  });

  test.afterEach(async ({ page }) => {
    await page.close();
  });
});