
import React, { useEffect, useRef } from 'react';
import type { SlideContent } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { DEFAULT_DISPLAY_BRAND_NAME, DEFAULT_FOOTER_TEXT, DEFAULT_TITLE_FONT_COLOR } from '../constants';

const ImagePlaceholderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

const ErrorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

interface SlideCardProps {
  slide: SlideContent;
}

// Helper function to determine text color for a given background color
const getTextColorForBackground = (bgColor: string): string => {
    if (!bgColor) return '#FFFFFF'; // Default to white if no color provided

    // Rudimentary check for named colors vs hex
    if (!bgColor.startsWith('#')) {
        // For common light named colors, return black. Otherwise, white.
        // This is a simplification; a comprehensive mapping or color library would be better.
        const lightNamedColors = ['white', 'yellow', 'lime', 'aqua', 'pink', 'lightyellow', 'lightcyan', 'beige', 'ivory'];
        if (lightNamedColors.includes(bgColor.toLowerCase())) {
            return '#000000'; // Black text for light backgrounds
        }
        return '#FFFFFF'; // White text for dark or unknown named backgrounds
    }

    try {
        const color = bgColor.substring(1); // strip #
        const rgb = parseInt(color, 16);   // convert rrggbb to decimal
        if (isNaN(rgb)) return '#FFFFFF'; // Invalid hex

        const r = (rgb >> 16) & 0xff;  // extract red
        const g = (rgb >>  8) & 0xff;  // extract green
        const b = (rgb >>  0) & 0xff;  // extract blue

        // HSP (Highly Sensitive Poo) equation for perceived brightness
        const hsp = Math.sqrt(
          0.299 * (r * r) +
          0.587 * (g * g) +
          0.114 * (b * b)
        );
        // Using 127.5 as the threshold (midpoint of 255)
        return hsp > 127.5 ? '#000000' : '#FFFFFF'; // Black for light, White for dark
    } catch (e) {
        // console.error("Error parsing background color for text contrast:", e);
        return '#FFFFFF'; // Default to white on error
    }
};


// Helper function to parse text with <highlight> tags
const parseHighlightedText = (text: string | undefined): React.ReactNode[] => {
  if (!text) return [];
  
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const regex = /<highlight color="([^"]+?)">(.*?)<\/highlight>/gs;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Text before the highlight
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    
    const color = match[1]; // Captured color
    const content = match[2]; // Captured content

    parts.push(
      <span 
        key={`highlight-${match.index}-${color}`} 
        style={{ 
          backgroundColor: color, 
          padding: '0.1em 0.3em', 
          borderRadius: '3px',
          color: getTextColorForBackground(color), // Determine contrasting text color
          boxDecorationBreak: 'clone', // Ensures background wraps nicely on line breaks
          WebkitBoxDecorationBreak: 'clone'
        }}
      >
        {content}
      </span>
    );
    lastIndex = regex.lastIndex;
  }

  // Remaining text after the last highlight
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  // If no highlights were found, return the original text as a single node
  if (parts.length === 0 && text.length > 0) {
      return [text];
  }

  return parts;
};


export const SlideCard: React.FC<SlideCardProps> = ({ slide }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null); 

  const textShadowStyle = { textShadow: '1px 1px 3px rgba(0,0,0,0.5)' };
  const contentTextShadowStyle = { textShadow: '1px 1px 2px rgba(0,0,0,0.4)' };

  const displayBrandName = slide.displayBrandName || DEFAULT_DISPLAY_BRAND_NAME;
  const footerText = slide.footerText || DEFAULT_FOOTER_TEXT;
  const titleFontColor = slide.titleFontColor || DEFAULT_TITLE_FONT_COLOR;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current; 
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return; // Avoid drawing if not visible

    canvas.width = rect.width * window.devicePixelRatio; // Scale for device pixel ratio
    canvas.height = rect.height * window.devicePixelRatio;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio); // Adjust context scale
    
    ctx.clearRect(0, 0, rect.width, rect.height);

    if (slide.imageUrl && !slide.isImageLoading && !slide.imageError) {
      const img = new Image();
      img.crossOrigin = 'Anonymous'; 
      img.onload = () => {
        const canvasAspect = rect.width / rect.height;
        const imgAspect = img.width / img.height;
        let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;
        
        const scaleFactor = 1.05; 

        if (imgAspect > canvasAspect) { 
          sHeight = img.height;
          sWidth = img.height * canvasAspect;
          sx = (img.width - sWidth) / 2;
        } else { 
          sWidth = img.width;
          sHeight = img.width / canvasAspect;
          sy = (img.height - sHeight) / 2;
        }

        const newSWidth = sWidth / scaleFactor;
        const newSHeight = sHeight / scaleFactor;
        sx += (sWidth - newSWidth) / 2;
        sy += (sHeight - newSHeight) / 2;
        sWidth = newSWidth;
        sHeight = newSHeight;

        ctx.filter = 'blur(4px)'; 
        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, rect.width, rect.height);
        ctx.filter = 'none';
      };
      img.onerror = () => {
        ctx.clearRect(0, 0, rect.width, rect.height); 
      };
      img.src = slide.imageUrl;
    }
  }, [slide.imageUrl, slide.isImageLoading, slide.imageError, containerRef]); 

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden rounded-lg bg-slate-900 font-inter">
      
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {slide.isImageLoading && (
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-slate-800/80 backdrop-blur-sm z-20">
          <LoadingSpinner size="lg" />
          <p className="mt-3 text-sm text-slate-200">Generating background...</p>
        </div>
      )}
      {slide.imageError && !slide.isImageLoading && (
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-red-800/70 backdrop-blur-sm text-red-200 p-4 text-center z-20">
          <ErrorIcon className="w-10 h-10 sm:w-12 sm:h-12 mb-2"/>
          <p className="text-sm font-semibold">Background Image Error</p>
          <p className="text-xs max-w-xs">{slide.imageError.length > 150 ? slide.imageError.substring(0, 147) + "..." : slide.imageError}</p>
        </div>
      )}
      {!slide.isImageLoading && !slide.imageUrl && !slide.imageError && (
          <div className="absolute inset-0 w-full h-full bg-slate-800/70 backdrop-blur-sm flex flex-col items-center justify-center text-slate-500 z-20">
            <ImagePlaceholderIcon className="w-16 h-16 opacity-50"/>
            <p className="mt-2 text-sm">Background will appear here</p>
          </div>
      )}

      <div className="absolute inset-0 flex flex-col p-3 sm:p-4 md:p-5 text-white z-10">
        <div className="flex items-center space-x-2 sm:space-x-3">
          {slide.logoUrl && (
            <img 
              src={slide.logoUrl} 
              alt={`${displayBrandName} Logo`} 
              className="h-8 sm:h-10 md:h-12 w-auto max-w-[80px] sm:max-w-[100px] md:max-w-[120px] object-contain"
            />
          )}
          <span 
            className="text-lg sm:text-xl md:text-2xl font-bold uppercase font-oswald tracking-wide"
            style={{ ...textShadowStyle }}
          >
            {displayBrandName}
          </span>
        </div>

        <div className="flex-grow"></div>

        <div className="mb-2 sm:mb-3 md:mb-4 w-full"> 
          {slide.title && (
            <h3 
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 p-1.5 sm:p-2 bg-black/10 backdrop-blur-sm rounded inline-block max-w-full break-words leading-tight font-oswald tracking-normal"
              style={{ ...textShadowStyle, color: titleFontColor }}
            >
              {slide.title}
            </h3>
          )}
          {slide.content && ( 
            <p 
              className="text-base sm:text-lg md:text-xl p-1.5 sm:p-2 bg-black/10 backdrop-blur-sm rounded leading-snug sm:leading-relaxed max-w-full break-words font-inter"
              style={{ ...contentTextShadowStyle, whiteSpace: 'pre-wrap' }}
            >
              {parseHighlightedText(slide.content).map((node, index) => (
                <React.Fragment key={index}>{node}</React.Fragment>
              ))}
            </p>
          )}
        </div>
        
        <div className="text-center pt-1 sm:pt-2 mt-auto border-t border-white/20">
          <p className="text-xs sm:text-sm font-medium text-slate-200/90 tracking-wide font-inter" style={contentTextShadowStyle}>
            {footerText}
          </p>
        </div>
      </div>
    </div>
  );
};