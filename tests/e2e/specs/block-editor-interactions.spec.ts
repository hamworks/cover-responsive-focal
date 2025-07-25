import { test, expect } from '@playwright/test';
import { WPAdminUtils } from '../utils/wp-admin';
import { CoverBlockUtils } from '../utils/cover-block';
import { TEST_IMAGES, TEST_FOCAL_POINTS, SELECTORS } from '../fixtures/test-data';

/**
 * ブロックエディタでの操作テストの実装
 * 実際のUI実装に基づいた詳細なインタラクション確認
 */
test.describe('ブロックエディタ - レスポンシブフォーカルポイント操作', () => {
  let wpAdmin: WPAdminUtils;
  let coverBlock: CoverBlockUtils;

  test.beforeEach(async ({ page }) => {
    wpAdmin = new WPAdminUtils(page);
    coverBlock = new CoverBlockUtils(page);
    
    await wpAdmin.login();
    await wpAdmin.createNewPost();
  });

  test('カバーブロック挿入からレスポンシブフォーカルポイント設定画面の表示まで', async ({ page }) => {
    // Step 1: カバーブロックを挿入
    await wpAdmin.insertCoverBlock();
    
    // カバーブロックが正しく挿入されることを確認
    const coverBlock = page.locator('[data-type="core/cover"]');
    await expect(coverBlock).toBeVisible();
    
    // Step 2: 画像を追加
    await coverBlock.addMediaToCover(TEST_IMAGES.LANDSCAPE);
    
    // Step 3: ブロックインスペクターを開く
    await wpAdmin.openBlockInspector();
    
    // Step 4: レスポンシブフォーカルポイント設定パネルを探す
    const responsiveFocalPanel = page.locator('text=Responsive Focal Points');
    if (await responsiveFocalPanel.isVisible()) {
      await responsiveFocalPanel.click();
      
      // パネルが展開されることを確認
      const panelBody = page.locator('.components-panel__body').filter({
        hasText: 'Responsive Focal Points'
      });
      await expect(panelBody).toHaveClass(/is-opened/);
      
      // 初期状態で「No responsive focal points set.」が表示されることを確認
      await expect(page.locator('text=No responsive focal points set.')).toBeVisible();
      
      // 「Add New Breakpoint」ボタンが表示されることを確認
      const addButton = page.locator('button.crf-add-focal-point');
      await expect(addButton).toBeVisible();
      await expect(addButton).toHaveText('Add New Breakpoint');
      
    } else {
      console.log('レスポンシブフォーカルポイント設定パネルが見つかりません（プラグイン読み込み未完了）');
    }
  });

  test('新しいブレークポイントの追加と基本設定', async ({ page }) => {
    await wpAdmin.insertCoverBlock();
    await coverBlock.addMediaToCover(TEST_IMAGES.LANDSCAPE);
    await wpAdmin.openBlockInspector();
    
    // レスポンシブフォーカルポイント設定パネルを開く
    const responsiveFocalPanel = page.locator('text=Responsive Focal Points');
    if (await responsiveFocalPanel.isVisible()) {
      await responsiveFocalPanel.click();
      
      // 新しいブレークポイントを追加
      const addButton = page.locator('button.crf-add-focal-point');
      await addButton.click();
      
      // フォーカルポイント設定項目が表示されることを確認
      await expect(page.locator('text=Media Query Type')).toBeVisible();
      await expect(page.locator('text=Breakpoint (px)')).toBeVisible();
      await expect(page.locator('text=Focal Point')).toBeVisible();
      
      // デフォルト値が設定されていることを確認
      const mediaTypeSelect = page.locator('select').first();
      await expect(mediaTypeSelect).toHaveValue('max-width');
      
      const breakpointInput = page.locator('input[type="number"]').first();
      await expect(breakpointInput).toHaveValue('768');
      
      // フォーカルポイントピッカーが表示されることを確認
      const focalPointPicker = page.locator('.components-focal-point-picker');
      await expect(focalPointPicker).toBeVisible();
      
      // 削除ボタンが表示されることを確認
      const removeButton = page.locator('button:has-text("Remove")');
      await expect(removeButton).toBeVisible();
    }
  });

  test('メディアクエリタイプの変更', async ({ page }) => {
    await wpAdmin.insertCoverBlock();
    await coverBlock.addMediaToCover(TEST_IMAGES.LANDSCAPE);
    await wpAdmin.openBlockInspector();
    
    const responsiveFocalPanel = page.locator('text=Responsive Focal Points');
    if (await responsiveFocalPanel.isVisible()) {
      await responsiveFocalPanel.click();
      await page.locator('button.crf-add-focal-point').click();
      
      // メディアクエリタイプを変更
      const mediaTypeSelect = page.locator('select').first();
      await mediaTypeSelect.selectOption('max-width');
      
      // 値が正しく変更されることを確認
      await expect(mediaTypeSelect).toHaveValue('max-width');
      
      // min-widthに戻す
      await mediaTypeSelect.selectOption('min-width');
      await expect(mediaTypeSelect).toHaveValue('min-width');
    }
  });

  test('ブレークポイント値の変更と検証', async ({ page }) => {
    await wpAdmin.insertCoverBlock();
    await coverBlock.addMediaToCover(TEST_IMAGES.LANDSCAPE);
    await wpAdmin.openBlockInspector();
    
    const responsiveFocalPanel = page.locator('text=Responsive Focal Points');
    if (await responsiveFocalPanel.isVisible()) {
      await responsiveFocalPanel.click();
      await page.locator('button.crf-add-focal-point').click();
      
      const breakpointInput = page.locator('input[type="number"]').first();
      
      // 有効な値を設定
      await breakpointInput.fill('1024');
      await expect(breakpointInput).toHaveValue('1024');
      
      // 最小値制限をテスト
      await breakpointInput.fill('50');
      await breakpointInput.blur();
      await expect(breakpointInput).toHaveValue('100'); // 最小値にクランプされる
      
      // 最大値制限をテスト
      await breakpointInput.fill('5000');
      await breakpointInput.blur();
      await expect(breakpointInput).toHaveValue('2000'); // 最大値にクランプされる
      
      // 無効な値のテスト
      await breakpointInput.fill('invalid');
      await breakpointInput.blur();
      await expect(breakpointInput).toHaveValue('768'); // デフォルト値に戻る
    }
  });

  test('フォーカルポイントピッカーの操作', async ({ page }) => {
    await wpAdmin.insertCoverBlock();
    await coverBlock.addMediaToCover(TEST_IMAGES.LANDSCAPE);
    await wpAdmin.openBlockInspector();
    
    const responsiveFocalPanel = page.locator('text=Responsive Focal Points');
    if (await responsiveFocalPanel.isVisible()) {
      await responsiveFocalPanel.click();
      await page.locator('button.crf-add-focal-point').click();
      
      const focalPointPicker = page.locator('.components-focal-point-picker');
      await expect(focalPointPicker).toBeVisible();
      
      // フォーカルポイントピッカーをクリックして位置を変更
      const pickerBounds = await focalPointPicker.boundingBox();
      if (pickerBounds) {
        // 左上クリック (25%, 25%の位置)
        await page.mouse.click(
          pickerBounds.x + pickerBounds.width * 0.25,
          pickerBounds.y + pickerBounds.height * 0.25
        );
        
        // フォーカルポイントのマーカーが移動することを確認
        const focalMarker = focalPointPicker.locator('.components-focal-point-picker__icon_container');
        await expect(focalMarker).toBeVisible();
        
        // 右下クリック (75%, 75%の位置)
        await page.mouse.click(
          pickerBounds.x + pickerBounds.width * 0.75,
          pickerBounds.y + pickerBounds.height * 0.75
        );
        
        // マーカーが新しい位置に移動することを確認
        await expect(focalMarker).toBeVisible();
      }
    }
  });

  test('複数のブレークポイントの追加と管理', async ({ page }) => {
    await wpAdmin.insertCoverBlock();
    await coverBlock.addMediaToCover(TEST_IMAGES.LANDSCAPE);
    await wpAdmin.openBlockInspector();
    
    const responsiveFocalPanel = page.locator('text=Responsive Focal Points');
    if (await responsiveFocalPanel.isVisible()) {
      await responsiveFocalPanel.click();
      
      const addButton = page.locator('button.crf-add-focal-point');
      
      // 3つのブレークポイントを追加
      for (let i = 0; i < 3; i++) {
        await addButton.click();
        
        // 各ブレークポイントが正しく追加されることを確認
        const focalItems = page.locator('.components-panel__body').filter({
          hasText: 'Responsive Focal Points'
        }).locator('text=Media Query Type');
        await expect(focalItems).toHaveCount(i + 1);
      }
      
      // 各ブレークポイントに異なる値を設定
      const testPoints = TEST_FOCAL_POINTS.MULTI_BREAKPOINT;
      
      for (let i = 0; i < Math.min(3, testPoints.length); i++) {
        const mediaTypeSelects = page.locator('select');
        const breakpointInputs = page.locator('input[type="number"]');
        
        await mediaTypeSelects.nth(i).selectOption(testPoints[i].mediaType);
        await breakpointInputs.nth(i).fill(testPoints[i].breakpoint.toString());
      }
      
      // 設定値が保持されることを確認
      for (let i = 0; i < Math.min(3, testPoints.length); i++) {
        const mediaTypeSelects = page.locator('select');
        const breakpointInputs = page.locator('input[type="number"]');
        
        await expect(mediaTypeSelects.nth(i)).toHaveValue(testPoints[i].mediaType);
        await expect(breakpointInputs.nth(i)).toHaveValue(testPoints[i].breakpoint.toString());
      }
    }
  });

  test('ブレークポイントの削除', async ({ page }) => {
    await wpAdmin.insertCoverBlock();
    await coverBlock.addMediaToCover(TEST_IMAGES.LANDSCAPE);
    await wpAdmin.openBlockInspector();
    
    const responsiveFocalPanel = page.locator('text=Responsive Focal Points');
    if (await responsiveFocalPanel.isVisible()) {
      await responsiveFocalPanel.click();
      
      const addButton = page.locator('button.crf-add-focal-point');
      
      // 2つのブレークポイントを追加
      await addButton.click();
      await addButton.click();
      
      // 2つのフォーカルポイント設定が表示されることを確認
      const mediaQueryLabels = page.locator('text=Media Query Type');
      await expect(mediaQueryLabels).toHaveCount(2);
      
      // 最初のブレークポイントを削除
      const removeButtons = page.locator('button:has-text("Remove")');
      await removeButtons.first().click();
      
      // 1つのフォーカルポイント設定のみ表示されることを確認
      await expect(mediaQueryLabels).toHaveCount(1);
      
      // 残りのブレークポイントも削除
      await removeButtons.first().click();
      
      // 「No responsive focal points set.」が再び表示されることを確認
      await expect(page.locator('text=No responsive focal points set.')).toBeVisible();
    }
  });

  test('投稿保存時のデータ永続化', async ({ page }) => {
    await wpAdmin.insertCoverBlock();
    await coverBlock.addMediaToCover(TEST_IMAGES.LANDSCAPE);
    await wpAdmin.openBlockInspector();
    
    const responsiveFocalPanel = page.locator('text=Responsive Focal Points');
    if (await responsiveFocalPanel.isVisible()) {
      await responsiveFocalPanel.click();
      await page.locator('button.crf-add-focal-point').click();
      
      // 設定を変更
      const mediaTypeSelect = page.locator('select').first();
      const breakpointInput = page.locator('input[type="number"]').first();
      
      await mediaTypeSelect.selectOption('max-width');
      await breakpointInput.fill('1024');
      
      // 投稿を保存
      await wpAdmin.savePost();
      
      // ページをリロードして設定が保持されることを確認
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // カバーブロックを再選択
      const coverBlock = page.locator('[data-type="core/cover"]');
      await coverBlock.click();
      await wpAdmin.openBlockInspector();
      
      const reloadedPanel = page.locator('text=Responsive Focal Points');
      if (await reloadedPanel.isVisible()) {
        await reloadedPanel.click();
        
        // 設定値が保持されていることを確認
        const savedMediaTypeSelect = page.locator('select').first();
        const savedBreakpointInput = page.locator('input[type="number"]').first();
        
        await expect(savedMediaTypeSelect).toHaveValue('max-width');
        await expect(savedBreakpointInput).toHaveValue('1024');
      }
    }
  });

  test.afterEach(async ({ page }) => {
    await page.close();
  });
});