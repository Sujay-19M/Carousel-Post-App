
import React, { useState, useCallback, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import html2canvas from 'html2canvas';
import { CarouselGeneratorForm } from './components/CarouselGeneratorForm';
import { CarouselDisplay } from './components/CarouselDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ProgressBar } from './components/ProgressBar';
import { generateSlideImage } from './services/geminiService';
import type { SlideContent, UserSlideInput } from './types';
import { MAX_SLIDES, DEFAULT_API_KEY_ERROR_MESSAGE, DEFAULT_ASPECT_RATIO, BRAND_NAME, DEFAULT_DISPLAY_BRAND_NAME, DEFAULT_FOOTER_TEXT, DEFAULT_TITLE_FONT_COLOR } from './constants';

const App: React.FC = () => {
  const [userSlidesInput, setUserSlidesInput] = useState<UserSlideInput[]>([]);
  const [aspectRatio, setAspectRatio] = useState<string>(DEFAULT_ASPECT_RATIO);
  const [slidesData, setSlidesData] = useState<SlideContent[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  
  const [isLoadingImages, setIsLoadingImages] = useState<boolean>(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState<boolean>(false);
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | undefined>(undefined);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [displayBrandName, setDisplayBrandName] = useState<string>(DEFAULT_DISPLAY_BRAND_NAME);
  const [footerText, setFooterText] = useState<string>(DEFAULT_FOOTER_TEXT);
  const [titleFontColor, setTitleFontColor] = useState<string>(DEFAULT_TITLE_FONT_COLOR);


  // Ref to hold slide card DOM elements for html2canvas
  const slideCardRefs = useRef<(HTMLDivElement | null)[]>([]);


  useEffect(() => {
    const key = process.env.API_KEY;
    if (!key) {
      setError(`API Key is not available. ${DEFAULT_API_KEY_ERROR_MESSAGE}`);
    }
    setApiKey(key);
  }, []);

  const handleGenerateCarousel = useCallback(async (
    formSlides: UserSlideInput[], 
    selectedAspectRatio: string, 
    newLogoUrl?: string,
    newDisplayBrandName?: string,
    newFooterText?: string,
    newTitleFontColor?: string
  ) => {
    if (!apiKey) {
      setError(`Cannot generate slides. ${DEFAULT_API_KEY_ERROR_MESSAGE}`);
      return;
    }
    if (formSlides.length === 0) {
      setError("Please add at least one slide with a title and content.");
      return;
    }

    setUserSlidesInput(formSlides); 
    setAspectRatio(selectedAspectRatio);
    
    if (newLogoUrl !== undefined) { 
        setLogoUrl(newLogoUrl);
    } else if (newLogoUrl === null) { // Explicitly cleared
        setLogoUrl(undefined);
    }

    setDisplayBrandName(newDisplayBrandName || DEFAULT_DISPLAY_BRAND_NAME);
    setFooterText(newFooterText || DEFAULT_FOOTER_TEXT);
    setTitleFontColor(newTitleFontColor || DEFAULT_TITLE_FONT_COLOR);


    setError(null);
    setIsLoadingImages(true);
    setSlidesData([]);
    setCurrentSlideIndex(0);
    setOverallProgress(0);
    slideCardRefs.current = []; 


    try {
      const initialSlides: SlideContent[] = formSlides.map(userInput => ({
        id: userInput.id,
        title: userInput.title,
        content: userInput.content,
        imagePrompt: `High-impact, visually appealing background for a social media post about "${userInput.title} - ${userInput.content}". Focus on abstract patterns, subtle gradients, or thematic elements related to biotechnology or professional content. The image should be suitable for being blurred. Aspect ratio: ${selectedAspectRatio}.`,
        isImageLoading: false,
        imageUrl: undefined,
        imageError: undefined,
        logoUrl: newLogoUrl === null ? undefined : (newLogoUrl || logoUrl),
        displayBrandName: newDisplayBrandName || DEFAULT_DISPLAY_BRAND_NAME,
        footerText: newFooterText || DEFAULT_FOOTER_TEXT,
        titleFontColor: newTitleFontColor || DEFAULT_TITLE_FONT_COLOR,
      }));
      setSlidesData(initialSlides);
      slideCardRefs.current = initialSlides.map(() => null);
      
      if (initialSlides.length > 0) {
        const totalImageSteps = initialSlides.length;
        let imagesCompleted = 0;

        for (let i = 0; i < initialSlides.length; i++) {
          setSlidesData(prevSlides => prevSlides.map((s, idx) => idx === i ? { ...s, isImageLoading: true } : s));
          try {
            const base64Image = await generateSlideImage(apiKey, initialSlides[i].imagePrompt);
            const imageUrl = `data:image/png;base64,${base64Image}`;
            setSlidesData(prevSlides => prevSlides.map((s, idx) => idx === i ? { ...s, imageUrl, isImageLoading: false } : s));
          } catch (imgErr: any) {
            console.error(`Error generating image for slide ${i + 1}:`, imgErr);
            setSlidesData(prevSlides => prevSlides.map((s, idx) => idx === i ? { ...s, imageError: `Failed to load image. ${imgErr.message || ''}`, isImageLoading: false } : s));
          }
          imagesCompleted++;
          setOverallProgress(Math.round((imagesCompleted / totalImageSteps) * 100));
        }
      }
    } catch (err: any) {
      console.error("Error generating slides:", err);
      setError(err.message || 'An unknown error occurred during slide generation.');
    } finally {
      setIsLoadingImages(false);
    }
  }, [apiKey, logoUrl]);

  const handleNextSlide = () => {
    setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % slidesData.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prevIndex) => (prevIndex - 1 + slidesData.length) % slidesData.length);
  };

  const handleGoToSlide = (index: number) => {
    setCurrentSlideIndex(index);
  };

  const commonHtml2CanvasOnClone = (clonedDoc: Document, elementToCapture: HTMLElement | null, originalElement: HTMLElement) => {
    const { body, documentElement: html } = clonedDoc;
    
    html.style.setProperty('height', 'auto', 'important');
    html.style.setProperty('overflow', 'hidden', 'important');
    body.style.setProperty('height', 'auto', 'important');
    body.style.setProperty('overflow', 'hidden', 'important');
    body.style.setProperty('margin', '0', 'important');
    body.style.setProperty('padding', '0', 'important');
    body.style.setProperty('transform', 'none', 'important');
    body.style.setProperty('background', 'transparent', 'important'); // Ensure body is transparent

    if (elementToCapture) {
        elementToCapture.style.setProperty('width', `${originalElement.offsetWidth}px`, 'important');
        elementToCapture.style.setProperty('height', `${originalElement.offsetHeight}px`, 'important');
        elementToCapture.style.setProperty('box-sizing', 'border-box', 'important');
        elementToCapture.style.setProperty('margin', '0', 'important');
        elementToCapture.style.setProperty('transform', 'none', 'important');
        const originalDisplay = window.getComputedStyle(originalElement).display;
        elementToCapture.style.setProperty('display', originalDisplay, 'important');
    }
    
    // Ensure fonts are linked in the cloned document
    // This replicates the @import rules from index.html
    const fontFamilies = [
        'Inter:wght@400;500;600;700;900',
        'Oswald:wght@400;500;600;700'
    ];

    fontFamilies.forEach(fontFamily => {
        const link = clonedDoc.createElement('link');
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(':',':wght@')}&display=swap`;
        clonedDoc.head.appendChild(link);
    });

    // Add a general style to ensure Inter is applied as body font in clone
    const style = clonedDoc.createElement('style');
    style.textContent = 'body { font-family: "Inter", sans-serif !important; }';
    clonedDoc.head.appendChild(style);
  };


  const handleDownloadSlideImage = useCallback(async (slideId: string, filename: string) => {
    const slideIndex = slidesData.findIndex(s => s.id === slideId);
    const slideElement = slideCardRefs.current[slideIndex];

    if (slideElement) {
      try {
        await document.fonts.ready; // Wait for fonts to be ready
        const canvas = await html2canvas(slideElement, { 
          useCORS: true, 
          allowTaint: true,
          backgroundColor: null, 
          scale: 2, 
          x: 0, 
          y: 0,
          width: slideElement.offsetWidth, 
          height: slideElement.offsetHeight, 
          onclone: (clonedDoc, clonedElement) => commonHtml2CanvasOnClone(clonedDoc, clonedElement as HTMLElement | null, slideElement)
        });
        const image = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.href = image;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e) {
        console.error("Error capturing slide for download:", e);
        setError("Could not capture slide image. Please try again.");
      }
    } else {
        console.error(`Slide element with ID slide-card-${slideId} (or its ref) not found for download.`);
        setError(`Could not find slide element to capture. Ref for slide index ${slideIndex} is ${slideElement}.`);
    }
  }, [slidesData]);

  const handleDownloadAllText = useCallback(() => {
    if (slidesData.length === 0) return;
    const textData = slidesData.map(s => ({ 
      title: s.title, 
      content: s.content, 
      imagePrompt: s.imagePrompt,
      displayBrandName: s.displayBrandName,
      footerText: s.footerText,
      logoUrl: s.logoUrl,
      titleFontColor: s.titleFontColor
    }));
    const jsonString = JSON.stringify(textData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    const safeCarouselName = (slidesData[0]?.title || slidesData[0]?.displayBrandName || BRAND_NAME).replace(/\s+/g, '_').replace(/[^\w-]/g, '');
    link.download = `${safeCarouselName}_content.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  }, [slidesData]);

  const handleDownloadAllSlidesZip = useCallback(async (format: 'png' | 'jpeg' = 'png') => {
    if (slidesData.length === 0) return;
    setIsDownloadingZip(true);
    setError(null);
    setOverallProgress(0);

    const zip = new JSZip();
    const safeCarouselName = (slidesData[0]?.title || slidesData[0]?.displayBrandName || BRAND_NAME).replace(/\s+/g, '_').replace(/[^\w-]/g, '');
    
    await document.fonts.ready; // Wait for fonts to be ready before starting the loop

    for (let i = 0; i < slidesData.length; i++) {
      const slide = slidesData[i];
      const slideElement = slideCardRefs.current[i]; 

      if (slideElement) {
        try {
          const canvas = await html2canvas(slideElement, { 
            useCORS: true, 
            allowTaint: true,
            backgroundColor: null, 
            scale: 2, 
            x: 0,
            y: 0,
            width: slideElement.offsetWidth, 
            height: slideElement.offsetHeight,
            onclone: (clonedDoc, clonedElement) => commonHtml2CanvasOnClone(clonedDoc, clonedElement as HTMLElement | null, slideElement)
          });
          const MimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
          const quality = format === 'jpeg' ? 0.9 : 1.0;
          const imageBlob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, MimeType, quality));
          
          if (imageBlob) {
            zip.file(`${safeCarouselName}_slide_${i + 1}.${format}`, imageBlob);
          } else {
            console.warn(`Could not generate blob for slide ${i + 1}`);
          }
        } catch (e) {
          console.error(`Error capturing slide ${i + 1}:`, e);
        }
      } else {
        console.warn(`Slide element ref for slide ${i+1} (ID: ${slide.id}) not found for zipping.`);
      }
       setOverallProgress(Math.round(((i + 1) / slidesData.length) * 100));
    }

    try {
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      const zipUrl = URL.createObjectURL(zipBlob);
      link.href = zipUrl;
      link.download = `${safeCarouselName}_slides.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(zipUrl);
    } catch (e) {
      console.error("Error generating ZIP file:", e);
      setError("Failed to generate ZIP file.");
    } finally {
      setIsDownloadingZip(false);
      setOverallProgress(0); 
    }
  }, [slidesData]);
  
  const isGenerating = isLoadingImages || isDownloadingZip;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col items-center p-4 sm:p-8 selection:bg-purple-500 selection:text-white">
      <style>{`
        body { font-family: 'Inter', sans-serif !important; }
        .font-inter { font-family: 'Inter', sans-serif !important; }
        .font-oswald { font-family: 'Oswald', sans-serif; }
        /* Fallback for Impact if Oswald doesn't load for some reason, or for comparison */
        .font-impact { font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif; } 
      `}</style>
      <header className="w-full max-w-4xl text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 font-oswald">
          {(displayBrandName || BRAND_NAME)} Carousel Generator
        </h1>
        <p className="text-slate-300 mt-2 text-lg">Define your slides, upload your logo, choose an aspect ratio, and let AI create the visuals!</p>
      </header>

      <main className="w-full max-w-4xl bg-slate-800 shadow-2xl rounded-xl p-6 sm:p-10">
        <CarouselGeneratorForm
          onSubmit={handleGenerateCarousel}
          isLoading={isGenerating}
          maxSlides={MAX_SLIDES}
          currentLogoUrl={logoUrl}
          currentDisplayBrandName={displayBrandName}
          currentFooterText={footerText}
          currentTitleFontColor={titleFontColor}
        />

        {error && (
          <div className="mt-6 bg-red-500/20 border border-red-700 text-red-300 px-4 py-3 rounded-lg shadow-md" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {isGenerating && (
          <div className="mt-8 text-center">
            <LoadingSpinner />
            <p className="text-lg mt-4 text-slate-300">
              {isDownloadingZip ? 'Packaging slides into ZIP...' : (isLoadingImages ? 'Generating stunning visuals...' : 'Processing...')}
            </p>
            <ProgressBar progress={overallProgress} />
            <p className="text-sm text-slate-400 mt-2">Progress: {overallProgress}%</p>
          </div>
        )}

        {!isGenerating && slidesData.length > 0 && (
          <CarouselDisplay
            slides={slidesData}
            currentSlideIndex={currentSlideIndex}
            aspectRatio={aspectRatio}
            logoUrl={logoUrl} 
            onNext={handleNextSlide}
            onPrev={handlePrevSlide}
            onGoToSlide={handleGoToSlide}
            onDownloadImage={handleDownloadSlideImage}
            onDownloadAllText={handleDownloadAllText}
            onDownloadAllSlidesZip={handleDownloadAllSlidesZip}
            carouselTitle={slidesData[0]?.title || slidesData[0]?.displayBrandName || BRAND_NAME}
            isDownloadingZip={isDownloadingZip} 
            slideCardRefs={slideCardRefs} 
          />
        )}

        {!isGenerating && slidesData.length === 0 && !error && (
           <div className="mt-12 text-center py-10 border-2 border-dashed border-slate-700 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-4 text-xl font-semibold text-slate-300">Ready to create?</h3>
            <p className="mt-1 text-slate-400">Add slides, upload a logo, and choose an aspect ratio above to begin.</p>
          </div>
        )}
      </main>
      <footer className="w-full max-w-4xl text-center mt-12 pb-8">
        <p className="text-slate-500 text-sm">
          Powered by Gemini AI. &copy; {new Date().getFullYear()} {displayBrandName || BRAND_NAME}.
        </p>
      </footer>
    </div>
  );
};

export default App;
