import { test, expect } from '@playwright/test';
import { WPAdminUtils } from '../utils/wp-admin';
import { CoverBlockUtils } from '../utils/cover-block';
import { TEST_IMAGES, TEST_FOCAL_POINTS, TEST_VIEWPORTS } from '../fixtures/test-data';

/**
 * ビジュアル回帰テストの実装
 * レスポンシブフォーカルポイントの視覚的変化を検証
 */
test.describe('ビジュアル回帰テスト - レスポンシブフォーカルポイント', () => {
  let wpAdmin: WPAdminUtils;
  let coverBlock: CoverBlockUtils;

  test.beforeEach(async ({ page }) => {
    wpAdmin = new WPAdminUtils(page);
    coverBlock = new CoverBlockUtils(page);
    
    await wpAdmin.login();
    await wpAdmin.createNewPost();
  });

  test('ブロックエディタ - レスポンシブフォーカルポイント設定UI', async ({ page }) => {
    await wpAdmin.insertCoverBlock();
    await coverBlock.addMediaToCover(TEST_IMAGES.LANDSCAPE);
    await wpAdmin.openBlockInspector();
    
    const responsiveFocalPanel = page.locator('text=Responsive Focal Points');
    if (await responsiveFocalPanel.isVisible()) {
      await responsiveFocalPanel.click();
      
      // 初期状態のスクリーンショット
      const inspectorPanel = page.locator('.block-editor-block-inspector');
      await expect(inspectorPanel).toHaveScreenshot('responsive-focal-panel-empty.png', {
        mask: [
          page.locator('.block-editor-block-card'), // ブロック名部分をマスク
          page.locator('.components-panel__header') // パネルヘッダーをマスク
        ]
      });
      
      // ブレークポイントを追加
      await page.locator('button.crf-add-focal-point').click();
      
      // 1つのブレークポイント設定状態
      await expect(inspectorPanel).toHaveScreenshot('responsive-focal-panel-single.png', {
        mask: [
          page.locator('.block-editor-block-card'),
          page.locator('.components-panel__header')
        ]
      });
      
      // 複数のブレークポイントを追加
      await page.locator('button.crf-add-focal-point').click();
      await page.locator('button.crf-add-focal-point').click();
      
      // 複数ブレークポイント設定状態
      await expect(inspectorPanel).toHaveScreenshot('responsive-focal-panel-multiple.png', {
        mask: [
          page.locator('.block-editor-block-card'),
          page.locator('.components-panel__header')
        ]
      });
    }
  });

  test('フォーカルポイントピッカーの視覚的状態', async ({ page }) => {
    await wpAdmin.insertCoverBlock();
    await coverBlock.addMediaToCover(TEST_IMAGES.LANDSCAPE);
    await wpAdmin.openBlockInspector();
    
    const responsiveFocalPanel = page.locator('text=Responsive Focal Points');
    if (await responsiveFocalPanel.isVisible()) {
      await responsiveFocalPanel.click();
      await page.locator('button.crf-add-focal-point').click();
      
      const focalPointPicker = page.locator('.components-focal-point-picker');
      
      // デフォルト状態（中央）
      await expect(focalPointPicker).toHaveScreenshot('focal-point-picker-default.png');
      
      const pickerBounds = await focalPointPicker.boundingBox();
      if (pickerBounds) {
        // 左上に移動
        await page.mouse.click(
          pickerBounds.x + pickerBounds.width * 0.2,
          pickerBounds.y + pickerBounds.height * 0.2
        );
        await expect(focalPointPicker.locator('.components-focal-point-picker__icon_container')).toBeVisible();
        await expect(focalPointPicker).toHaveScreenshot('focal-point-picker-top-left.png');
        
        // 右下に移動
        await page.mouse.click(
          pickerBounds.x + pickerBounds.width * 0.8,
          pickerBounds.y + pickerBounds.height * 0.8
        );
        await expect(focalPointPicker.locator('.components-focal-point-picker__icon_container')).toBeVisible();
        await expect(focalPointPicker).toHaveScreenshot('focal-point-picker-bottom-right.png');
        
        // 中央に戻す
        await page.mouse.click(
          pickerBounds.x + pickerBounds.width * 0.5,
          pickerBounds.y + pickerBounds.height * 0.5
        );
        await expect(focalPointPicker.locator('.components-focal-point-picker__icon_container')).toBeVisible();
        await expect(focalPointPicker).toHaveScreenshot('focal-point-picker-center.png');
      }
    }
  });

  test('フロントエンド - レスポンシブ表示の視覚的変化', async ({ page }) => {
    await wpAdmin.insertCoverBlock();
    await coverBlock.addMediaToCover(TEST_IMAGES.LANDSCAPE);
    await wpAdmin.openBlockInspector();
    
    const responsiveFocalPanel = page.locator('text=Responsive Focal Points');
    if (await responsiveFocalPanel.isVisible()) {
      await responsiveFocalPanel.click();
      
      // デスクトップ用とモバイル用の設定を作成
      const addButton = page.locator('button.crf-add-focal-point');
      await addButton.click();
      await addButton.click();
      
      const mediaTypeSelects = page.locator('select');
      const breakpointInputs = page.locator('input[type="number"]');
      const focalPointPickers = page.locator('.components-focal-point-picker');
      
      // デスクトップ用: min-width 768px, 左上フォーカス
      await mediaTypeSelects.nth(0).selectOption('min-width');
      await breakpointInputs.nth(0).fill('768');
      let pickerBounds = await focalPointPickers.nth(0).boundingBox();
      if (pickerBounds) {
        await page.mouse.click(
          pickerBounds.x + pickerBounds.width * 0.2,
          pickerBounds.y + pickerBounds.height * 0.3
        );
      }
      
      // モバイル用: max-width 767px, 右下フォーカス
      await mediaTypeSelects.nth(1).selectOption('max-width');
      await breakpointInputs.nth(1).fill('767');
      pickerBounds = await focalPointPickers.nth(1).boundingBox();
      if (pickerBounds) {
        await page.mouse.click(
          pickerBounds.x + pickerBounds.width * 0.8,
          pickerBounds.y + pickerBounds.height * 0.7
        );
      }
      
      await wpAdmin.publishPost();
      const previewPage = await wpAdmin.previewPost();
      
      try {
        const coverElement = previewPage.locator('.wp-block-cover');
        
        // デスクトップビューでのスクリーンショット
        await previewPage.setViewportSize(TEST_VIEWPORTS.DESKTOP);
        await previewPage.waitForLoadState('networkidle');
        await expect(coverElement).toHaveScreenshot('cover-desktop-responsive.png', {
          animations: 'disabled'
        });
        
        // タブレットビューでのスクリーンショット
        await previewPage.setViewportSize(TEST_VIEWPORTS.TABLET);
        await previewPage.waitForLoadState('networkidle');
        await expect(coverElement).toHaveScreenshot('cover-tablet-responsive.png', {
          animations: 'disabled'
        });
        
        // モバイルビューでのスクリーンショット
        await previewPage.setViewportSize(TEST_VIEWPORTS.MOBILE);
        await previewPage.waitForLoadState('networkidle');
        await expect(coverElement).toHaveScreenshot('cover-mobile-responsive.png', {
          animations: 'disabled'
        });
        
      } finally {
        await previewPage.close();
      }
    }
  });

  test('異なる画像サイズでの視覚的一貫性', async ({ page }) => {
    const imageTests = [
      { name: 'landscape', url: TEST_IMAGES.LANDSCAPE },
      { name: 'portrait', url: TEST_IMAGES.PORTRAIT },
      { name: 'square', url: TEST_IMAGES.SQUARE }
    ];
    
    for (const imageTest of imageTests) {
      // 新しい投稿を作成
      await wpAdmin.createNewPost();
      await wpAdmin.insertCoverBlock();
      await coverBlock.addMediaToCover(imageTest.url);
      await wpAdmin.openBlockInspector();
      
      const responsiveFocalPanel = page.locator('text=Responsive Focal Points');
      if (await responsiveFocalPanel.isVisible()) {
        await responsiveFocalPanel.click();
        await page.locator('button.crf-add-focal-point').click();
        
        // 右上にフォーカスポイントを設定
        const focalPointPicker = page.locator('.components-focal-point-picker');
        const pickerBounds = await focalPointPicker.boundingBox();
        if (pickerBounds) {
          await page.mouse.click(
            pickerBounds.x + pickerBounds.width * 0.8,
            pickerBounds.y + pickerBounds.height * 0.2
          );
        }
        
        await wpAdmin.publishPost();
        const previewPage = await wpAdmin.previewPost();
        
        try {
          const coverElement = previewPage.locator('.wp-block-cover');
          await previewPage.setViewportSize(TEST_VIEWPORTS.DESKTOP);
          await previewPage.waitForLoadState('networkidle');
          
          // 画像サイズ別のスクリーンショット
          await expect(coverElement).toHaveScreenshot(`cover-${imageTest.name}-image.png`, {
            animations: 'disabled'
          });
          
        } finally {
          await previewPage.close();
        }
      }
    }
  });

  test('複雑なブレークポイント設定の視覚的検証', async ({ page }) => {
    await wpAdmin.insertCoverBlock();
    await coverBlock.addMediaToCover(TEST_IMAGES.LANDSCAPE);
    await wpAdmin.openBlockInspector();
    
    const responsiveFocalPanel = page.locator('text=Responsive Focal Points');
    if (await responsiveFocalPanel.isVisible()) {
      await responsiveFocalPanel.click();
      
      // 4つのブレークポイントを設定（詳細なレスポンシブ設計）
      const breakpointConfigs = [
        { mediaType: 'min-width', breakpoint: '1200', position: { x: 0.1, y: 0.1 } }, // 大画面
        { mediaType: 'min-width', breakpoint: '768', position: { x: 0.3, y: 0.3 } },  // タブレット
        { mediaType: 'min-width', breakpoint: '480', position: { x: 0.7, y: 0.5 } },  // 小タブレット
        { mediaType: 'max-width', breakpoint: '479', position: { x: 0.9, y: 0.9 } }   // モバイル
      ];
      
      for (let i = 0; i < breakpointConfigs.length; i++) {
        const addButton = page.locator('button.crf-add-focal-point');
        await addButton.click();
        
        const mediaTypeSelects = page.locator('select');
        const breakpointInputs = page.locator('input[type="number"]');
        const focalPointPickers = page.locator('.components-focal-point-picker');
        
        await mediaTypeSelects.nth(i).selectOption(breakpointConfigs[i].mediaType);
        await breakpointInputs.nth(i).fill(breakpointConfigs[i].breakpoint);
        
        const pickerBounds = await focalPointPickers.nth(i).boundingBox();
        if (pickerBounds) {
          await page.mouse.click(
            pickerBounds.x + pickerBounds.width * breakpointConfigs[i].position.x,
            pickerBounds.y + pickerBounds.height * breakpointConfigs[i].position.y
          );
        }
      }
      
      await wpAdmin.publishPost();
      const previewPage = await wpAdmin.previewPost();
      
      try {
        const coverElement = previewPage.locator('.wp-block-cover');
        
        // 各ブレークポイントに対応するビューポートサイズでテスト
        const viewportTests = [
          { name: 'large-desktop', size: { width: 1400, height: 800 } },
          { name: 'desktop', size: { width: 1000, height: 600 } },
          { name: 'tablet', size: { width: 600, height: 800 } },
          { name: 'mobile', size: { width: 375, height: 667 } }
        ];
        
        for (const viewportTest of viewportTests) {
          await previewPage.setViewportSize(viewportTest.size);
          await previewPage.waitForLoadState('networkidle');
          
          await expect(coverElement).toHaveScreenshot(`cover-complex-${viewportTest.name}.png`, {
            animations: 'disabled'
          });
        }
        
      } finally {
        await previewPage.close();
      }
    }
  });

  test('エラー状態とバリデーションの視覚的フィードバック', async ({ page }) => {
    await wpAdmin.insertCoverBlock();
    await coverBlock.addMediaToCover(TEST_IMAGES.LANDSCAPE);
    await wpAdmin.openBlockInspector();
    
    const responsiveFocalPanel = page.locator('text=Responsive Focal Points');
    if (await responsiveFocalPanel.isVisible()) {
      await responsiveFocalPanel.click();
      await page.locator('button.crf-add-focal-point').click();
      
      const breakpointInput = page.locator('input[type="number"]').first();
      const inspectorPanel = page.locator('.block-editor-block-inspector');
      
      // 正常な状態
      await expect(inspectorPanel).toHaveScreenshot('validation-normal-state.png', {
        mask: [page.locator('.block-editor-block-card')]
      });
      
      // 最小値以下の値を入力
      await breakpointInput.fill('50');
      await breakpointInput.blur();
      await expect(breakpointInput).toHaveValue('100');
      await expect(inspectorPanel).toHaveScreenshot('validation-min-clamped.png', {
        mask: [page.locator('.block-editor-block-card')]
      });
      
      // 最大値以上の値を入力
      await breakpointInput.fill('5000');
      await breakpointInput.blur();
      await expect(breakpointInput).toHaveValue('2000');
      await expect(inspectorPanel).toHaveScreenshot('validation-max-clamped.png', {
        mask: [page.locator('.block-editor-block-card')]
      });
      
      // 無効な文字列を入力
      await breakpointInput.fill('invalid');
      await breakpointInput.blur();
      await expect(breakpointInput).toHaveValue('768');
      await expect(inspectorPanel).toHaveScreenshot('validation-invalid-input.png', {
        mask: [page.locator('.block-editor-block-card')]
      });
    }
  });

  test('アニメーションとトランジション効果', async ({ page }) => {
    await wpAdmin.insertCoverBlock();
    await coverBlock.addMediaToCover(TEST_IMAGES.LANDSCAPE);
    await wpAdmin.openBlockInspector();
    
    const responsiveFocalPanel = page.locator('text=Responsive Focal Points');
    if (await responsiveFocalPanel.isVisible()) {
      await responsiveFocalPanel.click();
      await page.locator('button.crf-add-focal-point').click();
      
      // フォーカルポイントピッカーのアニメーション
      const focalPointPicker = page.locator('.components-focal-point-picker');
      const pickerBounds = await focalPointPicker.boundingBox();
      
      if (pickerBounds) {
        // アニメーション開始前
        await expect(focalPointPicker).toHaveScreenshot('animation-before.png');
        
        // クリック直後（アニメーション中）
        const clickPromise = page.mouse.click(
          pickerBounds.x + pickerBounds.width * 0.3,
          pickerBounds.y + pickerBounds.height * 0.7
        );
        
        // アニメーション中をキャプチャ
        await expect(focalPointPicker.locator('.components-focal-point-picker__icon_container')).toBeVisible();
        await expect(focalPointPicker).toHaveScreenshot('animation-during.png');
        
        await clickPromise;
        
        // アニメーション完了後
        await expect(focalPointPicker.locator('.components-focal-point-picker__icon_container')).toBeVisible();
        await expect(focalPointPicker).toHaveScreenshot('animation-after.png');
      }
    }
  });

  test.afterEach(async ({ page }) => {
    await page.close();
  });
});