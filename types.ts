export interface UserSlideInput {
  id: string; // for React key
  title: string;
  content: string; // User-provided subtitle/main content
}

export interface SlideContent {
  id: string;
  title: string; // User-provided
  content: string; // User-provided
  imagePrompt: string; // Generated based on user title/content
  imageUrl?: string;
  isImageLoading: boolean;
  imageError?: string;
  logoUrl?: string; // For the user-uploaded logo
  displayBrandName?: string; // User-defined brand name for display
  footerText?: string; // User-defined footer text
  titleFontColor?: string; // User-defined title font color
}

export interface AspectRatioOption {
  label: string;
  value: string; // e.g., '1:1', '4:5', '16:9'
  className: string; // e.g., 'aspect-square', 'aspect-[4/5]', 'aspect-[16/9]'
}