import type { Page } from '@playwright/test';
import { Editor } from '@wordpress/e2e-test-utils-playwright';

/**
 * Utility class for WordPress admin operations
 * Uses official WordPress E2E test utilities
 */
export class WPAdminUtils {
	private editor: Editor;

	constructor( private page: Page ) {
		// Use simplified initialization with only required dependencies
		this.editor = new Editor( { page } );
	}

	/**
	 * Login to WordPress admin
	 */
	async login() {
		await this.page.goto( '/wp-admin/' );
	}

	/**
	 * Create new post and open block editor
	 */
	async createNewPost() {
		await this.page.goto( '/wp-admin/post-new.php' );
		await this.page.waitForLoadState( 'networkidle' );
	}

	/**
	 * Insert specific block
	 * @param blockName - Block name to insert
	 */
	async insertBlock( blockName: string ) {
		await this.editor.insertBlock( { name: blockName } );
	}

	/**
	 * Insert cover block
	 */
	async insertCoverBlock() {
		await this.editor.insertBlock( { name: 'core/cover' } );
	}

	/**
	 * Open block inspector
	 */
	async openBlockInspector() {
		await this.editor.openDocumentSettingsSidebar();
	}

	/**
	 * Save post
	 */
	async savePost() {
		await this.editor.saveDraft();
	}

	/**
	 * Publish post
	 */
	async publishPost() {
		await this.editor.publishPost();
	}

	/**
	 * Preview post
	 */
	async previewPost(): Promise< Page > {
		// Open preview in new tab using keyboard shortcut
		await this.page.keyboard.press( 'Meta+Alt+P' );
		
		// Wait for new page to open and get the new page instance
		const newPagePromise = this.page.context().waitForEvent( 'page' );
		const previewPage = await newPagePromise;
		await previewPage.waitForLoadState();
		
		return previewPage;
	}

	/**
	 * Get editor instance (for direct operations if needed)
	 */
	getEditor(): Editor {
		return this.editor;
	}

	/**
	 * Get page instance (for direct operations if needed)
	 */
	getPage(): Page {
		return this.page;
	}
}
