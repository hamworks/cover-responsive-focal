import { test, expect } from '@playwright/test';
import { WPAdminUtils } from '../utils/wp-admin';
import { CoverBlockUtils } from '../utils/cover-block';
import { TEST_IMAGES, TEST_FOCAL_POINTS } from '../fixtures/test-data';

/**
 * レスポンシブフォーカルポイント設定の詳細なE2Eテスト
 * 実際のバリデーション実装とUI動作に基づいたテスト
 */
test.describe('レスポンシブフォーカルポイント設定 - 詳細機能テスト', () => {
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

  test('デフォルト値が正しく設定される', async ({ page }) => {
    await wpAdmin.openBlockInspector();
    
    const responsiveFocalPanel = page.locator('text=Responsive Focal Points');
    if (await responsiveFocalPanel.isVisible()) {
      await responsiveFocalPanel.click();
      await page.locator('button.crf-add-focal-point').click();
      
      // デフォルト値の確認（constants.ts に基づく）
      const mediaTypeSelect = page.locator('select').first();
      await expect(mediaTypeSelect).toHaveValue('max-width'); // DEFAULTS.MEDIA_TYPE
      
      const breakpointInput = page.locator('input[type="number"]').first();
      await expect(breakpointInput).toHaveValue('768'); // DEFAULTS.BREAKPOINT
      
      // フォーカルポイントのデフォルト値（中央: 0.5, 0.5）
      const focalPointPicker = page.locator('.components-focal-point-picker');
      const focalMarker = focalPointPicker.locator('.components-focal-point-picker__icon_container');
      await expect(focalMarker).toBeVisible();
      
      // マーカーが中央付近に位置していることを確認
      const markerPosition = await focalMarker.boundingBox();
      const pickerBounds = await focalPointPicker.boundingBox();
      
      if (markerPosition && pickerBounds) {
        const centerX = pickerBounds.x + pickerBounds.width / 2;
        const centerY = pickerBounds.y + pickerBounds.height / 2;
        
        // 中央から±20pxの範囲内にマーカーがあることを確認
        expect(Math.abs(markerPosition.x + markerPosition.width / 2 - centerX)).toBeLessThan(20);
        expect(Math.abs(markerPosition.y + markerPosition.height / 2 - centerY)).toBeLessThan(20);
      }
    }
  });

  test('ブレークポイント値のバリデーション - 範囲制限', async ({ page }) => {
    await wpAdmin.openBlockInspector();
    
    const responsiveFocalPanel = page.locator('text=Responsive Focal Points');
    if (await responsiveFocalPanel.isVisible()) {
      await responsiveFocalPanel.click();
      await page.locator('button.crf-add-focal-point').click();
      
      const breakpointInput = page.locator('input[type="number"]').first();
      
      // 最小値より小さい値のテスト
      await breakpointInput.fill('50');
      await breakpointInput.blur();
      await page.waitForTimeout(100);
      await expect(breakpointInput).toHaveValue('100'); // VALIDATION.MIN_BREAKPOINT
      
      // 最大値より大きい値のテスト
      await breakpointInput.fill('3000');
      await breakpointInput.blur();
      await page.waitForTimeout(100);
      await expect(breakpointInput).toHaveValue('2000'); // VALIDATION.MAX_BREAKPOINT
      
      // 有効な値のテスト
      await breakpointInput.fill('1024');
      await breakpointInput.blur();
      await expect(breakpointInput).toHaveValue('1024');
      
      // 負の値のテスト
      await breakpointInput.fill('-100');
      await breakpointInput.blur();
      await page.waitForTimeout(100);
      await expect(breakpointInput).toHaveValue('100'); // 最小値にクランプ
    }
  });

  test('ブレークポイント値のバリデーション - 無効な入力', async ({ page }) => {
    await wpAdmin.openBlockInspector();
    
    const responsiveFocalPanel = page.locator('text=Responsive Focal Points');
    if (await responsiveFocalPanel.isVisible()) {
      await responsiveFocalPanel.click();
      await page.locator('button.crf-add-focal-point').click();
      
      const breakpointInput = page.locator('input[type="number"]').first();
      
      // 文字列入力のテスト
      await breakpointInput.fill('invalid');
      await breakpointInput.blur();
      await page.waitForTimeout(100);
      await expect(breakpointInput).toHaveValue('768'); // デフォルト値に戻る
      
      // 空文字のテスト
      await breakpointInput.fill('');
      await breakpointInput.blur();
      await page.waitForTimeout(100);
      await expect(breakpointInput).toHaveValue('768'); // デフォルト値に戻る
      
      // 小数点のテスト
      await breakpointInput.fill('768.5');
      await breakpointInput.blur();
      await page.waitForTimeout(100);
      await expect(breakpointInput).toHaveValue('768'); // 整数に丸められる
    }
  });

  test('メディアクエリタイプの変更とバリデーション', async ({ page }) => {
    await wpAdmin.openBlockInspector();
    
    const responsiveFocalPanel = page.locator('text=Responsive Focal Points');
    if (await responsiveFocalPanel.isVisible()) {
      await responsiveFocalPanel.click();
      await page.locator('button.crf-add-focal-point').click();
      
      const mediaTypeSelect = page.locator('select').first();
      
      // 利用可能な選択肢を確認
      const options = await mediaTypeSelect.locator('option').allTextContents();
      expect(options).toContain('Min Width');
      expect(options).toContain('Max Width');
      
      // min-widthに変更
      await mediaTypeSelect.selectOption('min-width');
      await expect(mediaTypeSelect).toHaveValue('min-width');
      
      // max-widthに変更
      await mediaTypeSelect.selectOption('max-width');
      await expect(mediaTypeSelect).toHaveValue('max-width');
      
      // 値が正しく保持されることを確認
      await breakpointInput.fill('1200');
      await mediaTypeSelect.selectOption('min-width');
      await expect(breakpointInput).toHaveValue('1200'); // ブレークポイント値が保持される
    }
  });

  test('フォーカルポイントピッカーの詳細操作', async ({ page }) => {
    await wpAdmin.openBlockInspector();
    
    const responsiveFocalPanel = page.locator('text=Responsive Focal Points');
    if (await responsiveFocalPanel.isVisible()) {
      await responsiveFocalPanel.click();
      await page.locator('button.crf-add-focal-point').click();
      
      const focalPointPicker = page.locator('.components-focal-point-picker');
      const pickerBounds = await focalPointPicker.boundingBox();
      
      if (pickerBounds) {
        // 左上角をクリック (0%, 0%相当)
        await page.mouse.click(
          pickerBounds.x + 5,
          pickerBounds.y + 5
        );
        
        // マーカーが左上に移動することを確認
        const focalMarker = focalPointPicker.locator('.components-focal-point-picker__icon_container');
        const markerBounds = await focalMarker.boundingBox();
        expect(markerBounds!.x).toBeLessThan(pickerBounds.x + pickerBounds.width * 0.2);
        expect(markerBounds!.y).toBeLessThan(pickerBounds.y + pickerBounds.height * 0.2);
        
        // 右下角をクリック (100%, 100%相当)
        await page.mouse.click(
          pickerBounds.x + pickerBounds.width - 5,
          pickerBounds.y + pickerBounds.height - 5
        );
        
        // マーカーが右下に移動することを確認
        const newMarkerBounds = await focalMarker.boundingBox();
        expect(newMarkerBounds!.x).toBeGreaterThan(pickerBounds.x + pickerBounds.width * 0.8);
        expect(newMarkerBounds!.y).toBeGreaterThan(pickerBounds.y + pickerBounds.height * 0.8);
        
        // 中央をクリック (50%, 50%相当)
        await page.mouse.click(
          pickerBounds.x + pickerBounds.width / 2,
          pickerBounds.y + pickerBounds.height / 2
        );
        
        // マーカーが中央に戻ることを確認
        const centerMarkerBounds = await focalMarker.boundingBox();
        const centerX = pickerBounds.x + pickerBounds.width / 2;
        const centerY = pickerBounds.y + pickerBounds.height / 2;
        
        expect(Math.abs(centerMarkerBounds!.x + centerMarkerBounds!.width / 2 - centerX)).toBeLessThan(20);
        expect(Math.abs(centerMarkerBounds!.y + centerMarkerBounds!.height / 2 - centerY)).toBeLessThan(20);
      }
    }
  });

  test('複数ブレークポイントでの相互作用とバリデーション', async ({ page }) => {
    await wpAdmin.openBlockInspector();
    
    const responsiveFocalPanel = page.locator('text=Responsive Focal Points');
    if (await responsiveFocalPanel.isVisible()) {
      await responsiveFocalPanel.click();
      
      // 3つのブレークポイントを追加
      const addButton = page.locator('button.crf-add-focal-point');
      await addButton.click();
      await addButton.click();
      await addButton.click();
      
      const mediaTypeSelects = page.locator('select');
      const breakpointInputs = page.locator('input[type="number"]');
      
      // 各ブレークポイントに異なる設定を適用
      const testConfigs = [
        { mediaType: 'min-width', breakpoint: '1200' },
        { mediaType: 'min-width', breakpoint: '768' },
        { mediaType: 'max-width', breakpoint: '767' }
      ];
      
      for (let i = 0; i < testConfigs.length; i++) {
        await mediaTypeSelects.nth(i).selectOption(testConfigs[i].mediaType);
        await breakpointInputs.nth(i).fill(testConfigs[i].breakpoint);
      }
      
      // 設定が正しく適用されることを確認
      for (let i = 0; i < testConfigs.length; i++) {
        await expect(mediaTypeSelects.nth(i)).toHaveValue(testConfigs[i].mediaType);
        await expect(breakpointInputs.nth(i)).toHaveValue(testConfigs[i].breakpoint);
      }
      
      // 各フォーカルポイントピッカーが独立して動作することを確認
      const focalPointPickers = page.locator('.components-focal-point-picker');
      expect(await focalPointPickers.count()).toBe(3);
      
      // 各ピッカーをクリックして独立性を確認
      for (let i = 0; i < 3; i++) {
        const picker = focalPointPickers.nth(i);
        const pickerBounds = await picker.boundingBox();
        
        if (pickerBounds) {
          // 各ピッカーの異なる位置をクリック
          const clickX = pickerBounds.x + (pickerBounds.width * (i + 1) / 4);
          const clickY = pickerBounds.y + (pickerBounds.height * (i + 1) / 4);
          
          await page.mouse.click(clickX, clickY);
          
          // マーカーが正しい位置に配置されることを確認
          const marker = picker.locator('.components-focal-point-picker__icon_container');
          await expect(marker).toBeVisible();
        }
      }
    }
  });

  test('ブレークポイント削除時の状態管理', async ({ page }) => {
    await wpAdmin.openBlockInspector();
    
    const responsiveFocalPanel = page.locator('text=Responsive Focal Points');
    if (await responsiveFocalPanel.isVisible()) {
      await responsiveFocalPanel.click();
      
      // 3つのブレークポイントを追加して設定
      const addButton = page.locator('button.crf-add-focal-point');
      await addButton.click();
      await addButton.click(); 
      await addButton.click();
      
      const breakpointInputs = page.locator('input[type="number"]');
      await breakpointInputs.nth(0).fill('1200');
      await breakpointInputs.nth(1).fill('768');
      await breakpointInputs.nth(2).fill('400');
      
      // 中央のブレークポイント（768px）を削除
      const removeButtons = page.locator('button:has-text("Remove")');
      await removeButtons.nth(1).click();
      
      // 残り2つのブレークポイントが正しい値を保持していることを確認
      const remainingInputs = page.locator('input[type="number"]');
      await expect(remainingInputs).toHaveCount(2);
      await expect(remainingInputs.nth(0)).toHaveValue('1200');
      await expect(remainingInputs.nth(1)).toHaveValue('400');
      
      // 最初のブレークポイントを削除
      await removeButtons.nth(0).click();
      
      // 1つのブレークポイントが残ることを確認
      await expect(remainingInputs).toHaveCount(1);
      await expect(remainingInputs.nth(0)).toHaveValue('400');
      
      // 最後のブレークポイントを削除
      await removeButtons.nth(0).click();
      
      // 「No responsive focal points set.」が表示されることを確認
      await expect(page.locator('text=No responsive focal points set.')).toBeVisible();
      await expect(page.locator('input[type="number"]')).toHaveCount(0);
    }
  });

  test('エッジケース: 境界値でのバリデーション', async ({ page }) => {
    await wpAdmin.openBlockInspector();
    
    const responsiveFocalPanel = page.locator('text=Responsive Focal Points');
    if (await responsiveFocalPanel.isVisible()) {
      await responsiveFocalPanel.click();
      await page.locator('button.crf-add-focal-point').click();
      
      const breakpointInput = page.locator('input[type="number"]').first();
      
      // 境界値のテスト
      const boundaryTests = [
        { input: '100', expected: '100' }, // MIN_BREAKPOINT
        { input: '2000', expected: '2000' }, // MAX_BREAKPOINT
        { input: '99', expected: '100' }, // MIN_BREAKPOINT - 1
        { input: '2001', expected: '2000' }, // MAX_BREAKPOINT + 1
        { input: '0', expected: '100' }, // 0
        { input: '999999', expected: '2000' }, // 極端に大きい値
      ];
      
      for (const test of boundaryTests) {
        await breakpointInput.fill(test.input);
        await breakpointInput.blur();
        await page.waitForTimeout(100);
        await expect(breakpointInput).toHaveValue(test.expected);
      }
    }
  });

  test.afterEach(async ({ page }) => {
    await page.close();
  });
});