import { Page, expect } from '@playwright/test';
import { Editor } from '@wordpress/e2e-test-utils-playwright';
import { WPAdminUtils } from './wp-admin';

/**
 * レスポンシブフォーカルポイント設定の座標情報
 */
export interface ResponsiveFocalPoint {
  mediaType: 'min-width' | 'max-width';
  breakpoint: number;
  x: number;
  y: number;
}

/**
 * カバーブロックでのレスポンシブフォーカルポイント操作ユーティリティ
 * WordPress公式のE2Eテストユーティリティを使用
 */
export class CoverBlockUtils {
  private wpAdmin: WPAdminUtils;
  private editor: Editor;

  constructor(private page: Page) {
    this.wpAdmin = new WPAdminUtils(page);
    this.editor = new Editor({ page });
  }

  /**
   * カバーブロックを選択状態にする
   */
  async selectCoverBlock() {
    await this.editor.selectBlocks(this.editor.canvas.locator('[data-type="core/cover"]'));
  }

  /**
   * カバーブロックにメディアを追加
   * @param mediaUrl 画像のURL（テスト用画像）
   */
  async addMediaToCover(mediaUrl?: string) {
    await this.selectCoverBlock();
    
    // デフォルトのテスト画像を使用
    const testImageUrl = mediaUrl || 'https://picsum.photos/1200/800';
    
    // WordPress公式ユーティリティでメディアを追加
    // 実際の実装ではメディアライブラリ機能を使用する予定
    // 現在は開発中のため、直接スタイルで設定
    await this.page.evaluate((url) => {
      const coverBlock = document.querySelector('[data-type="core/cover"]');
      if (coverBlock) {
        (coverBlock as HTMLElement).style.backgroundImage = `url(${url})`;
        coverBlock.setAttribute('data-has-background-image', 'true');
      }
    }, testImageUrl);
    
    // 画像が設定されるまで待機
    await this.page.waitForTimeout(1000);
  }

  /**
   * ブロックインスペクターでレスポンシブフォーカルポイント設定を開く
   */
  async openResponsiveFocalSettings() {
    await this.selectCoverBlock();
    
    // WordPress公式ユーティリティでサイドバーを開く
    await this.editor.openDocumentSettingsSidebar();
    
    // レスポンシブフォーカルポイント設定パネルを探す
    const settingsPanel = this.page.locator('text=レスポンシブフォーカルポイント').or(
      this.page.locator('text=Responsive Focal Point')
    );
    
    if (await settingsPanel.isVisible()) {
      await settingsPanel.click();
    } else {
      // プラグインが有効化されていない場合の処理
      console.warn('レスポンシブフォーカルポイント設定が見つかりません（プラグインが未有効化の可能性）');
    }
    
    // 設定パネルが展開されるまで待機（プラグイン実装後）
    // await expect(this.page.locator('.responsive-focal-controls')).toBeVisible();
  }

  /**
   * 新しいブレークポイントを追加
   */
  async addNewBreakpoint() {
    const addButton = this.page.locator('button:has-text("新しいブレークポイントを追加")');
    await addButton.click();
    
    // 新しい行が追加されるまで待機
    await this.page.waitForTimeout(500);
  }

  /**
   * レスポンシブフォーカルポイントを設定
   * @param index 設定する行のインデックス（0から開始）
   * @param settings フォーカルポイント設定
   */
  async setResponsiveFocalPoint(index: number, settings: ResponsiveFocalPoint) {
    // メディアタイプを選択
    const mediaTypeSelect = this.page.locator('.responsive-focal-row').nth(index).locator('select');
    await mediaTypeSelect.selectOption(settings.mediaType);
    
    // ブレークポイントを入力
    const breakpointInput = this.page.locator('.responsive-focal-row').nth(index).locator('input[type="number"]');
    await breakpointInput.fill(settings.breakpoint.toString());
    
    // フォーカルポイントピッカーをクリック
    const focalPointPicker = this.page.locator('.responsive-focal-row').nth(index).locator('.components-focal-point-picker');
    
    // フォーカルポイントの座標を設定（ピッカーの相対位置でクリック）
    const pickerBounds = await focalPointPicker.boundingBox();
    if (pickerBounds) {
      const x = pickerBounds.x + (pickerBounds.width * settings.x / 100);
      const y = pickerBounds.y + (pickerBounds.height * settings.y / 100);
      await this.page.click(`css=.components-focal-point-picker`, { position: { x: x - pickerBounds.x, y: y - pickerBounds.y } });
    }
  }

  /**
   * ブレークポイント行を削除
   * @param index 削除する行のインデックス
   */
  async removeBreakpointRow(index: number) {
    const deleteButton = this.page.locator('.responsive-focal-row').nth(index).locator('button[aria-label="削除"]');
    await deleteButton.click();
    
    // 行が削除されるまで待機
    await this.page.waitForTimeout(500);
  }

  /**
   * 設定されたレスポンシブフォーカルポイントの数を取得
   */
  async getBreakpointRowCount(): Promise<number> {
    const rows = this.page.locator('.responsive-focal-row');
    return await rows.count();
  }

  /**
   * フロントエンドでの表示を確認
   * @param expectedFocalPoints 期待されるフォーカルポイント設定
   */
  async verifyFrontendDisplay(expectedFocalPoints: ResponsiveFocalPoint[]) {
    // 投稿を公開してプレビューページを開く
    await this.wpAdmin.publishPost();
    const previewPage = await this.wpAdmin.previewPost();
    
    try {
      // カバーブロックが表示されるまで待機
      await expect(previewPage.locator('.wp-block-cover')).toBeVisible();
      
      // data-fp-id属性が設定されていることを確認
      const coverElement = previewPage.locator('.wp-block-cover[data-fp-id]');
      await expect(coverElement).toBeVisible();
      
      // 各ブレークポイントでの表示確認
      for (const focalPoint of expectedFocalPoints) {
        // ビューポートサイズを変更
        const viewportWidth = focalPoint.mediaType === 'min-width' 
          ? focalPoint.breakpoint + 100 
          : focalPoint.breakpoint - 100;
        
        await previewPage.setViewportSize({ width: viewportWidth, height: 800 });
        
        // CSS の object-position が設定されていることを確認
        const objectPosition = await coverElement.evaluate((el) => {
          return window.getComputedStyle(el).getPropertyValue('--responsive-object-position');
        });
        
        expect(objectPosition).toContain(`${focalPoint.x}%`);
        expect(objectPosition).toContain(`${focalPoint.y}%`);
      }
      
    } finally {
      // プレビューページを閉じる
      await previewPage.close();
    }
  }

  /**
   * ビジュアル回帰テスト用のスクリーンショット撮影
   * @param name スクリーンショットの名前
   * @param viewport ビューポートサイズ
   */
  async takeResponsiveScreenshot(name: string, viewport: { width: number; height: number }) {
    await this.page.setViewportSize(viewport);
    await this.page.waitForTimeout(1000); // CSSアニメーション完了まで待機
    
    const coverBlock = this.page.locator('[data-type="core/cover"]');
    await expect(coverBlock).toHaveScreenshot(`${name}-${viewport.width}x${viewport.height}.png`);
  }
}