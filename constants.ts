import type { AspectRatioOption } from './types';

export const MAX_SLIDES = 20; // Max slides user can add
export const MIN_SLIDES = 1;  // Min slides user must have

export const GEMINI_TEXT_MODEL = 'gemini-2.5-flash-preview-04-17'; // Still used for potential future text features, but not for slide content generation.
export const GEMINI_IMAGE_MODEL = 'imagen-3.0-generate-002';

export const DEFAULT_API_KEY_ERROR_MESSAGE = "API Key not configured or invalid. Please ensure process.env.API_KEY is set correctly.";

export const ASPECT_RATIOS: AspectRatioOption[] = [
  { label: 'Square (1:1)', value: '1:1', className: 'aspect-square' },
  { label: 'Portrait (4:5)', value: '4:5', className: 'aspect-[4/5]' },
  { label: 'Landscape (16:9)', value: '16:9', className: 'aspect-[16/9]' },
  { label: 'Custom (1.19:1)', value: '1.19:1', className: 'aspect-[119/100]' },
];

export const DEFAULT_ASPECT_RATIO = ASPECT_RATIOS[2].value; // Default to 16:9
export const BRAND_NAME = "BTGenZ"; // Fallback/Original Brand Name
export const DEFAULT_DISPLAY_BRAND_NAME = "BTGenZ";
export const DEFAULT_FOOTER_TEXT = `${DEFAULT_DISPLAY_BRAND_NAME} | Your Source for Biotech Careers`;
export const DEFAULT_TITLE_FONT_COLOR = '#FFFFFF'; // Default title color (white)