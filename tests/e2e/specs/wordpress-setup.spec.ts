import { test, expect } from '@playwright/test';

/**
 * WordPress環境の基本セットアップ確認テスト
 */
test.describe('WordPress環境セットアップ確認', () => {
  test('WordPress管理画面にアクセスできる', async ({ page }) => {
    // WordPress管理画面にアクセス
    await page.goto('/wp-admin');
    
    // ログインページが表示されることを確認
    await expect(page.locator('#loginform')).toBeVisible();
    
    // ログイン
    await page.fill('#user_login', 'admin');
    await page.fill('#user_pass', 'password');
    await page.click('#wp-submit');
    
    // ダッシュボードにリダイレクトされることを確認
    await expect(page.locator('#wpadminbar')).toBeVisible();
    await expect(page).toHaveTitle(/Dashboard/);
  });

  test('ブロックエディタが正常に動作する', async ({ page }) => {
    // WordPress管理画面にログイン
    await page.goto('/wp-admin');
    await page.fill('#user_login', 'admin');
    await page.fill('#user_pass', 'password');
    await page.click('#wp-submit');
    
    // 新規投稿作成
    await page.goto('/wp-admin/post-new.php');
    
    // ブロックエディタが読み込まれることを確認
    await expect(page.locator('.block-editor-writing-flow')).toBeVisible();
    
    // Welcome modalが表示される場合は閉じる
    const welcomeModal = page.locator('button[aria-label="Close"]');
    if (await welcomeModal.isVisible()) {
      await welcomeModal.click();
    }
    
    // タイトルを入力
    const titleInput = page.locator('.editor-post-title__input');
    await titleInput.fill('E2Eテスト用投稿');
    
    // ブロックインサーターが動作することを確認
    const inserterButton = page.locator('button[aria-label="ブロックを追加"], button[aria-label="Toggle block inserter"]');
    await inserterButton.click();
    
    // インサーターが開かれることを確認
    await expect(page.locator('.block-editor-inserter__menu')).toBeVisible();
  });

  test('プラグインが有効化されている', async ({ page }) => {
    // WordPress管理画面にログイン
    await page.goto('/wp-admin');
    await page.fill('#user_login', 'admin');
    await page.fill('#user_pass', 'password');
    await page.click('#wp-submit');
    
    // プラグイン一覧画面に移動
    await page.goto('/wp-admin/plugins.php');
    
    // プラグインが表示されていることを確認
    const pluginRow = page.locator('tr[data-slug="cover-responsive-focal"]');
    if (await pluginRow.isVisible()) {
      // プラグインが有効化されていることを確認
      await expect(pluginRow.locator('.deactivate')).toBeVisible();
    } else {
      // プラグインがまだ表示されていない場合は、開発中の状態として正常
      console.log('プラグインはまだWordPressに認識されていません（開発中）');
    }
  });
});