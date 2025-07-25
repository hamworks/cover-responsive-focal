import { Page } from '@playwright/test';
import { Admin, Editor } from '@wordpress/e2e-test-utils-playwright';

/**
 * WordPress管理画面での操作を支援するユーティリティクラス
 * WordPress公式のE2Eテストユーティリティを使用
 */
export class WPAdminUtils {
  private admin: Admin;
  private editor: Editor;

  constructor(private page: Page) {
    this.admin = new Admin({ page });
    this.editor = new Editor({ page });
  }

  /**
   * WordPress管理画面にログイン
   */
  async login(username = 'admin', password = 'password') {
    await this.admin.visitAdminPage('/');
  }

  /**
   * 新しい投稿を作成してブロックエディタを開く
   */
  async createNewPost() {
    await this.admin.createNewPost();
  }

  /**
   * 特定のブロックを挿入
   */
  async insertBlock(blockName: string) {
    await this.editor.insertBlock({ name: blockName });
  }

  /**
   * カバーブロックを挿入
   */
  async insertCoverBlock() {
    await this.editor.insertBlock({ name: 'core/cover' });
  }

  /**
   * ブロックインスペクターを開く
   */
  async openBlockInspector() {
    await this.editor.openDocumentSettingsSidebar();
  }

  /**
   * 投稿を保存
   */
  async savePost() {
    await this.editor.saveDraft();
  }

  /**
   * 投稿を公開
   */
  async publishPost() {
    await this.editor.publishPost();
  }

  /**
   * 投稿をプレビュー
   */
  async previewPost(): Promise<Page> {
    return await this.editor.previewPost();
  }

  /**
   * エディタインスタンスを取得（直接操作が必要な場合）
   */
  getEditor(): Editor {
    return this.editor;
  }

  /**
   * 管理画面インスタンスを取得（直接操作が必要な場合）
   */
  getAdmin(): Admin {
    return this.admin;
  }
}