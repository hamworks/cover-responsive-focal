import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { Editor } from '@wordpress/e2e-test-utils-playwright';
import { WPAdminUtils } from './wp-admin';

/**
 * Coordinate information for responsive focal point settings
 */
export interface ResponsiveFocalPoint {
  mediaType: 'min-width' | 'max-width';
  breakpoint: number;
  x: number;
  y: number;
}

/**
 * Utility for responsive focal point operations on cover blocks
 * Uses WordPress official E2E test utilities
 */
export class CoverBlockUtils {
  private wpAdmin: WPAdminUtils;
  private editor: Editor;

  constructor(private page: Page) {
    this.wpAdmin = new WPAdminUtils(page);
    this.editor = new Editor({ page });
  }

  /**
   * Select the cover block
   */
  async selectCoverBlock() {
    await this.editor.selectBlocks(this.editor.canvas.locator('[data-type="core/cover"]'));
  }

  /**
   * Add media to cover block
   * @param mediaUrl Image URL (test image)
   */
  async addMediaToCover(mediaUrl?: string) {
    await this.selectCoverBlock();
    
    // Use default test image
    const testImageUrl = mediaUrl || 'https://picsum.photos/1200/800';
    
    // Add media using WordPress official utilities
    // Actual implementation will use media library functionality
    // Currently in development, so setting directly via style
    await this.page.evaluate((url) => {
      const coverBlock = document.querySelector('[data-type="core/cover"]');
      if (coverBlock) {
        (coverBlock as HTMLElement).style.backgroundImage = `url(${url})`;
        coverBlock.setAttribute('data-has-background-image', 'true');
      }
    }, testImageUrl);
    
    // Wait for image to be set
    await this.page.waitForTimeout(1000);
  }

  /**
   * Open responsive focal point settings in block inspector
   */
  async openResponsiveFocalSettings() {
    await this.selectCoverBlock();
    
    // Open sidebar using WordPress official utilities
    await this.editor.openDocumentSettingsSidebar();
    
    // Find responsive focal point settings panel (supports both Japanese and English UI)
    const settingsPanel = this.page.locator('text=レスポンシブフォーカルポイント').or(
      this.page.locator('text=Responsive Focal Point')
    );
    
    if (await settingsPanel.isVisible()) {
      await settingsPanel.click();
    } else {
      // Handle case when plugin is not activated
      console.warn('Responsive focal point settings not found (plugin may not be activated)');
    }
    
    // Wait for settings panel to expand (after plugin implementation)
    // await expect(this.page.locator('.responsive-focal-controls')).toBeVisible();
  }

  /**
   * Add new breakpoint
   */
  async addNewBreakpoint() {
    const addButton = this.page.locator('button:has-text("Add New Breakpoint")');
    await addButton.click();
    
    // Wait for new row to be added
    await this.page.waitForTimeout(500);
  }

  /**
   * Set responsive focal point
   * @param index Row index to configure (starting from 0)
   * @param settings Focal point settings
   */
  async setResponsiveFocalPoint(index: number, settings: ResponsiveFocalPoint) {
    // Select media type
    const mediaTypeSelect = this.page.locator('.responsive-focal-row').nth(index).locator('select');
    await mediaTypeSelect.selectOption(settings.mediaType);
    
    // Input breakpoint
    const breakpointInput = this.page.locator('.responsive-focal-row').nth(index).locator('input[type="number"]');
    await breakpointInput.fill(settings.breakpoint.toString());
    
    // Click focal point picker
    const focalPointPicker = this.page.locator('.responsive-focal-row').nth(index).locator('.components-focal-point-picker');
    
    // Set focal point coordinates (click at relative position on picker)
    const pickerBounds = await focalPointPicker.boundingBox();
    if (pickerBounds) {
      const x = pickerBounds.x + (pickerBounds.width * settings.x / 100);
      const y = pickerBounds.y + (pickerBounds.height * settings.y / 100);
      await this.page.click(`css=.components-focal-point-picker`, { position: { x: x - pickerBounds.x, y: y - pickerBounds.y } });
    }
  }

  /**
   * Remove breakpoint row
   * @param index Index of row to delete
   */
  async removeBreakpointRow(index: number) {
    const deleteButton = this.page.locator('.responsive-focal-row').nth(index).locator('button[aria-label="Delete"]');
    await deleteButton.click();
    
    // Wait for row to be deleted
    await this.page.waitForTimeout(500);
  }

  /**
   * Get count of configured responsive focal points
   */
  async getBreakpointRowCount(): Promise<number> {
    const rows = this.page.locator('.responsive-focal-row');
    return await rows.count();
  }

  /**
   * Verify frontend display
   * @param expectedFocalPoints Expected focal point settings
   */
  async verifyFrontendDisplay(expectedFocalPoints: ResponsiveFocalPoint[]) {
    // Publish post and open preview page
    await this.wpAdmin.publishPost();
    const previewPage = await this.wpAdmin.previewPost();
    
    try {
      // Wait for cover block to be visible
      await expect(previewPage.locator('.wp-block-cover')).toBeVisible();
      
      // Verify data-fp-id attribute is set
      const coverElement = previewPage.locator('.wp-block-cover[data-fp-id]');
      await expect(coverElement).toBeVisible();
      
      // Verify display at each breakpoint
      for (const focalPoint of expectedFocalPoints) {
        // Change viewport size
        const viewportWidth = focalPoint.mediaType === 'min-width' 
          ? focalPoint.breakpoint + 100 
          : focalPoint.breakpoint - 100;
        
        await previewPage.setViewportSize({ width: viewportWidth, height: 800 });
        
        // Verify CSS object-position is set
        const objectPosition = await coverElement.evaluate((el) => {
          return window.getComputedStyle(el).getPropertyValue('--responsive-object-position');
        });
        
        expect(objectPosition).toContain(`${focalPoint.x}%`);
        expect(objectPosition).toContain(`${focalPoint.y}%`);
      }
      
    } finally {
      // Close preview page
      await previewPage.close();
    }
  }

  /**
   * Take screenshot for visual regression testing
   * @param name Screenshot name
   * @param viewport Viewport size
   */
  async takeResponsiveScreenshot(name: string, viewport: { width: number; height: number }) {
    await this.page.setViewportSize(viewport);
    await this.page.waitForTimeout(1000); // Wait for CSS animations to complete
    
    const coverBlock = this.page.locator('[data-type="core/cover"]');
    await expect(coverBlock).toHaveScreenshot(`${name}-${viewport.width}x${viewport.height}.png`);
  }
}