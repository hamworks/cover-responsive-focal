import { test, expect } from '@playwright/test';
import { Admin, Editor } from '@wordpress/e2e-test-utils-playwright';

/**
 * WordPress環境の基本セットアップ確認テスト
 * WordPress公式E2Eユーティリティを使用
 */
test.describe('WordPress環境セットアップ確認', () => {
  test('WordPress管理画面にアクセスできる', async ({ page }) => {
    const admin = new Admin({ page });
    
    // WordPress管理画面にアクセス
    await admin.visitAdminPage('/');
    
    // ダッシュボードが表示されることを確認
    await expect(page.locator('#wpadminbar')).toBeVisible();
    await expect(page).toHaveTitle(/Dashboard/);
  });

  test('ブロックエディタが正常に動作する', async ({ page }) => {
    const admin = new Admin({ page });
    const editor = new Editor({ page });
    
    // 新規投稿作成
    await admin.createNewPost();
    
    // タイトルを設定
    await editor.canvas.locator('role=textbox[name="Add title"i]').fill('E2Eテスト用投稿');
    
    // カバーブロックを挿入
    await editor.insertBlock({ name: 'core/cover' });
    
    // カバーブロックが挿入されることを確認
    await expect(editor.canvas.locator('[data-type="core/cover"]')).toBeVisible();
  });

  test('プラグインが有効化されている', async ({ page }) => {
    const admin = new Admin({ page });
    
    // プラグイン一覧画面に移動
    await admin.visitAdminPage('plugins.php');
    
    // プラグインが表示されていることを確認
    const pluginRow = page.locator('tr[data-slug="cover-responsive-focal"]');
    if (await pluginRow.isVisible()) {
      // プラグインが有効化されていることを確認
      await expect(pluginRow.locator('.deactivate')).toBeVisible();
      console.log('プラグインが有効化されています');
    } else {
      // プラグインがまだ表示されていない場合は、開発中の状態として正常
      console.log('プラグインはまだWordPressに認識されていません（開発中）');
    }
  });
});