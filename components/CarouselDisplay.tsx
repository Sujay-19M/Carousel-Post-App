
import React from 'react';
import { SlideCard } from './SlideCard';
import type { SlideContent } from '../types'; // Removed AspectRatioOption as it's not used directly here.
import { IconButton } from './IconButton';
import { ASPECT_RATIOS } from '../constants';

interface CarouselDisplayProps {
  slides: SlideContent[];
  currentSlideIndex: number;
  aspectRatio: string;
  logoUrl?: string; // Added to match prop from App.tsx
  onNext: () => void;
  onPrev: () => void;
  onGoToSlide: (index: number) => void;
  onDownloadImage: (slideId: string, filename: string) => void; // Changed from imageUrl to slideId
  onDownloadAllText: () => void;
  onDownloadAllSlidesZip: (format?: 'png' | 'jpeg') => Promise<void>; // Added for completeness, though not used in this component's JSX
  carouselTitle: string;
  isDownloadingZip: boolean; // Added for completeness
  slideCardRefs?: React.RefObject<(HTMLDivElement | null)[]>; // Added for assigning refs
}

const ChevronLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

export const CarouselDisplay: React.FC<CarouselDisplayProps> = ({
  slides,
  currentSlideIndex,
  aspectRatio,
  // logoUrl, // Not directly used in this component's JSX but part of props
  onNext,
  onPrev,
  onGoToSlide,
  onDownloadImage,
  onDownloadAllText,
  // onDownloadAllSlidesZip, // Not directly used in this component's JSX
  carouselTitle,
  // isDownloadingZip, // Not directly used in this component's JSX
  slideCardRefs,
}) => {
  if (!slides || slides.length === 0) {
    return null;
  }

  const currentSlide = slides[currentSlideIndex];
  const safeCarouselTitle = carouselTitle.replace(/\s+/g, '_').replace(/[^\w-]/g, '');
  // Filename now based on slide ID which is what onDownloadImage expects for lookup
  const imageFilename = `${safeCarouselTitle || 'slide'}_${currentSlideIndex + 1}_image.png`;

  const selectedAspectRatioOption = ASPECT_RATIOS.find(ar => ar.value === aspectRatio) || ASPECT_RATIOS.find(ar => ar.value === '16:9');
  const aspectRatioClassName = selectedAspectRatioOption ? selectedAspectRatioOption.className : 'aspect-[16/9]';


  return (
    <div className="mt-8 p-4 sm:p-6 bg-slate-800/50 backdrop-blur-md rounded-lg shadow-xl border border-slate-700">
      <div className={`relative ${aspectRatioClassName} overflow-hidden rounded-lg shadow-lg bg-slate-700 mx-auto max-w-full`} 
           style={aspectRatio === '1.19:1' ? {aspectRatio: '119 / 100'} : {}}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            id={`slide-card-${slide.id}`} // ID for html2canvas targeting in App.tsx
            ref={el => { // Assign ref for html2canvas
              if (slideCardRefs && slideCardRefs.current) {
                slideCardRefs.current[index] = el;
              }
            }}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              index === currentSlideIndex ? 'opacity-100 z-10' : 'opacity-0'
            }`}
            aria-hidden={index !== currentSlideIndex}
          >
            {/* aspectRatioClassName is no longer passed to SlideCard */}
            <SlideCard slide={slide} />
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex items-center space-x-3">
          <IconButton onClick={onPrev} aria-label="Previous slide" title="Previous Slide">
            <ChevronLeftIcon className="w-6 h-6" />
          </IconButton>
          <span className="text-slate-300 font-medium">
            Slide {currentSlideIndex + 1} of {slides.length}
          </span>
          <IconButton onClick={onNext} aria-label="Next slide" title="Next Slide">
            <ChevronRightIcon className="w-6 h-6" />
          </IconButton>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Check if current slide is fully ready before offering download */}
          {currentSlide && currentSlide.imageUrl && !currentSlide.isImageLoading && !currentSlide.imageError && (
            <button
              onClick={() => onDownloadImage(currentSlide.id, imageFilename)} // Pass slide.id instead of imageUrl
              className="flex items-center px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md shadow-md transition-colors duration-150 text-sm font-medium"
              title="Download current slide image"
            >
              <DownloadIcon className="w-5 h-5 mr-2" />
              Slide Image
            </button>
          )}
          <button
            onClick={onDownloadAllText}
            className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-md transition-colors duration-150 text-sm font-medium"
            title="Download all text content as JSON"
          >
            <DownloadIcon className="w-5 h-5 mr-2" />
            All Text
          </button>
          {/* Button for Download All Slides ZIP is managed in App.tsx directly */}
        </div>
      </div>
      
      <div className="mt-4 flex justify-center space-x-2">
        {slides.map((_, index) => (
          <button
            key={`dot-${index}`}
            onClick={() => onGoToSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-150 ${
              index === currentSlideIndex ? 'bg-purple-500 scale-125' : 'bg-slate-600 hover:bg-slate-500'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
