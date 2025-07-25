import { Page, expect } from '@playwright/test';

/**
 * WordPress管理画面での操作を支援するユーティリティクラス
 */
export class WPAdminUtils {
  constructor(private page: Page) {}

  /**
   * WordPress管理画面にログイン
   */
  async login(username = 'admin', password = 'password') {
    await this.page.goto('/wp-admin');
    
    // すでにログインしている場合はスキップ
    if (this.page.url().includes('wp-admin') && !this.page.url().includes('wp-login')) {
      return;
    }

    await this.page.fill('#user_login', username);
    await this.page.fill('#user_pass', password);
    await this.page.click('#wp-submit');
    
    // ダッシュボードが表示されるまで待機
    await expect(this.page.locator('#wpadminbar')).toBeVisible();
  }

  /**
   * 新しい投稿を作成してブロックエディタを開く
   */
  async createNewPost() {
    await this.page.goto('/wp-admin/post-new.php');
    
    // ブロックエディタが読み込まれるまで待機
    await expect(this.page.locator('.block-editor-writing-flow')).toBeVisible();
    
    // Welcome modalが表示される場合は閉じる
    const welcomeModal = this.page.locator('.components-modal__header');
    if (await welcomeModal.isVisible()) {
      await this.page.click('button[aria-label="Close"]');
    }
  }

  /**
   * ブロックインサーターを開く
   */
  async openBlockInserter() {
    const inserterButton = this.page.locator('button[aria-label="ブロックを追加"], button[aria-label="Toggle block inserter"]');
    await inserterButton.click();
    
    // インサーターが開かれるまで待機
    await expect(this.page.locator('.block-editor-inserter__menu')).toBeVisible();
  }

  /**
   * 特定のブロックを検索して挿入
   */
  async insertBlock(blockName: string) {
    await this.openBlockInserter();
    
    // ブロック検索
    const searchInput = this.page.locator('.block-editor-inserter__search input');
    await searchInput.fill(blockName);
    
    // 検索結果から最初のブロックをクリック
    const blockButton = this.page.locator(`button[aria-label*="${blockName}"]`).first();
    await blockButton.click();
    
    // インサーターが閉じられるまで待機
    await expect(this.page.locator('.block-editor-inserter__menu')).not.toBeVisible();
  }

  /**
   * カバーブロックを挿入してメディアを設定
   */
  async insertCoverBlock() {
    await this.insertBlock('カバー');
    
    // カバーブロックが挿入されるまで待機
    await expect(this.page.locator('[data-type="core/cover"]')).toBeVisible();
  }

  /**
   * ブロックインスペクターを開く
   */
  async openBlockInspector() {
    // 設定サイドバーのブロックタブをクリック
    const blockTab = this.page.locator('button[data-label="ブロック"], button[aria-label="Block"]');
    await blockTab.click();
    
    // インスペクターが表示されるまで待機
    await expect(this.page.locator('.block-editor-block-inspector')).toBeVisible();
  }

  /**
   * 投稿を保存
   */
  async savePost() {
    const saveButton = this.page.locator('button:has-text("保存"), button:has-text("Save")');
    await saveButton.click();
    
    // 保存完了まで待機
    await expect(this.page.locator('.editor-post-saved-state')).toContainText('保存済み');
  }

  /**
   * 投稿を公開
   */
  async publishPost() {
    const publishButton = this.page.locator('button:has-text("公開"), button:has-text("Publish")');
    await publishButton.click();
    
    // 公開確認ダイアログが表示される場合
    const confirmPublish = this.page.locator('button:has-text("公開")').last();
    if (await confirmPublish.isVisible()) {
      await confirmPublish.click();
    }
    
    // 公開完了まで待機
    await expect(this.page.locator('.editor-post-publish-panel__header')).toBeVisible();
  }

  /**
   * 投稿をプレビュー
   */
  async previewPost(): Promise<Page> {
    const previewButton = this.page.locator('button:has-text("プレビュー"), button:has-text("Preview")');
    await previewButton.click();
    
    // 新しいタブが開かれるまで待機
    const previewPage = await this.page.context().waitForEvent('page');
    await previewPage.waitForLoadState();
    
    return previewPage;
  }
}