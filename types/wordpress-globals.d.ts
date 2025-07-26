/**
 * WordPress global variables type definitions
 */

import { dispatch, select } from '@wordpress/data';

declare global {
	interface Window {
		wp: {
			data: {
				select: typeof select;
				dispatch: typeof dispatch;
			};
		};
	}
}

// Block type definitions for WordPress core blocks
export interface WordPressBlock {
	clientId: string;
	name: string;
	attributes: Record<string, any>;
	innerBlocks: WordPressBlock[];
}

export interface CoverBlockAttributes {
	responsiveFocal?: Array<{
		mediaType: string;
		breakpoint: number;
		x: number;
		y: number;
	}>;
	[key: string]: any;
}