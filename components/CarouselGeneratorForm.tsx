import React, { useState, useEffect } from 'react';
import { MIN_SLIDES, MAX_SLIDES, ASPECT_RATIOS, DEFAULT_ASPECT_RATIO, DEFAULT_DISPLAY_BRAND_NAME, DEFAULT_FOOTER_TEXT, DEFAULT_TITLE_FONT_COLOR } from '../constants';
import type { UserSlideInput, AspectRatioOption } from '../types';
import { IconButton } from './IconButton';

const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
  </svg>
);

const PlusCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.243.096 3.222.261m3.222.261L12 5.291M12 5.291A23.882 23.882 0 0112 3m0 0A23.882 23.882 0 0012 3m0 0V0m11.25 5.25c0-1.06-.375-2.016-1.007-2.768a4.512 4.512 0 00-3.486-1.48H7.243a4.512 4.512 0 00-3.486 1.48A4.528 4.528 0 002.75 5.25m16.5 0c0 .983-.243 1.896-.685 2.633m.685-2.633L18.5 19.5m-14.5-14.25L5.5 19.5" />
  </svg>
);

const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
);


interface CarouselGeneratorFormProps {
  onSubmit: (
    slides: UserSlideInput[], 
    aspectRatio: string, 
    logoUrl?: string,
    displayBrandName?: string,
    footerText?: string,
    titleFontColor?: string
  ) => void;
  isLoading: boolean;
  maxSlides: number;
  currentLogoUrl?: string;
  currentDisplayBrandName?: string;
  currentFooterText?: string;
  currentTitleFontColor?: string;
}

export const CarouselGeneratorForm: React.FC<CarouselGeneratorFormProps> = ({ 
    onSubmit, 
    isLoading, 
    maxSlides, 
    currentLogoUrl,
    currentDisplayBrandName,
    currentFooterText,
    currentTitleFontColor
}) => {
  const [slides, setSlides] = useState<UserSlideInput[]>([
    { id: crypto.randomUUID(), title: '', content: '' }
  ]);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>(DEFAULT_ASPECT_RATIO);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | undefined>(currentLogoUrl);
  const [displayBrandNameInput, setDisplayBrandNameInput] = useState<string>(currentDisplayBrandName || DEFAULT_DISPLAY_BRAND_NAME);
  const [footerTextInput, setFooterTextInput] = useState<string>(currentFooterText || DEFAULT_FOOTER_TEXT);
  const [titleFontColorInput, setTitleFontColorInput] = useState<string>(currentTitleFontColor || DEFAULT_TITLE_FONT_COLOR);


  useEffect(() => {
    setLogoPreviewUrl(currentLogoUrl);
    setDisplayBrandNameInput(currentDisplayBrandName || DEFAULT_DISPLAY_BRAND_NAME);
    setFooterTextInput(currentFooterText || DEFAULT_FOOTER_TEXT);
    setTitleFontColorInput(currentTitleFontColor || DEFAULT_TITLE_FONT_COLOR);
  }, [currentLogoUrl, currentDisplayBrandName, currentFooterText, currentTitleFontColor]);

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setLogoFile(null);
      setLogoPreviewUrl(undefined); 
    }
  };
  
  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreviewUrl(undefined);
    const logoInput = document.getElementById('logo-upload') as HTMLInputElement;
    if (logoInput) {
        logoInput.value = '';
    }
  };

  const handleAddSlide = () => {
    if (slides.length < maxSlides) {
      setSlides([...slides, { id: crypto.randomUUID(), title: '', content: '' }]);
    }
  };

  const handleRemoveSlide = (id: string) => {
    if (slides.length > MIN_SLIDES) {
      setSlides(slides.filter(slide => slide.id !== id));
    }
  };

  const handleSlideChange = (id: string, field: 'title' | 'content', value: string) => {
    setSlides(slides.map(slide => slide.id === id ? { ...slide, [field]: value } : slide));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validSlides = slides.filter(s => s.title.trim() || s.content.trim()); 
    if (validSlides.length === 0) {
      alert("Please ensure at least one slide has a title or subtitle.");
      return;
    }
    onSubmit(validSlides, selectedAspectRatio, logoPreviewUrl, displayBrandNameInput, footerTextInput, titleFontColorInput);
  };

  const canSubmit = slides.some(s => s.title.trim() || s.content.trim());

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-4 sm:p-6 bg-slate-800/50 backdrop-blur-md rounded-lg shadow-lg border border-slate-700">
      
      {/* Branding Section */}
      <fieldset className="space-y-4 p-4 border border-slate-700 rounded-md">
        <legend className="text-lg font-semibold text-purple-400 px-2">Branding & Style</legend>
        <div>
          <label htmlFor="logo-upload" className="block text-sm font-medium text-slate-300 mb-1">
            Brand Logo (Optional)
          </label>
          <div className="mt-1 flex items-center space-x-4">
            <span className="inline-block h-16 w-16 rounded-md overflow-hidden bg-slate-700 flex items-center justify-center">
              {logoPreviewUrl ? (
                <img src={logoPreviewUrl} alt="Logo preview" className="h-full w-full object-contain" />
              ) : (
                <UploadIcon className="h-8 w-8 text-slate-500" />
              )}
            </span>
            <label htmlFor="logo-upload" className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-2 px-3 border border-slate-600 rounded-md shadow-sm text-sm transition duration-150">
              <span>{logoPreviewUrl ? 'Change' : 'Upload'} logo</span>
              <input id="logo-upload" name="logo-upload" type="file" className="sr-only" onChange={handleLogoChange} accept="image/png, image/jpeg, image/svg+xml, image/webp" disabled={isLoading}/>
            </label>
            {logoPreviewUrl && (
              <button type="button" onClick={handleRemoveLogo} className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50" disabled={isLoading}>
                Remove
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">Recommended: PNG with transparent background, or SVG.</p>
        </div>

        <div>
          <label htmlFor="display-brand-name" className="block text-sm font-medium text-slate-300 mb-1">
            Display Brand Name
          </label>
          <input
            type="text"
            id="display-brand-name"
            value={displayBrandNameInput}
            onChange={(e) => setDisplayBrandNameInput(e.target.value)}
            placeholder="e.g., Your Brand Name"
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-white placeholder-slate-400 transition duration-150 ease-in-out"
            disabled={isLoading}
            maxLength={50}
          />
        </div>
         <div>
          <label htmlFor="footer-text" className="block text-sm font-medium text-slate-300 mb-1">
            Footer Text
          </label>
          <input
            type="text"
            id="footer-text"
            value={footerTextInput}
            onChange={(e) => setFooterTextInput(e.target.value)}
            placeholder="e.g., Your Brand | Your Tagline"
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-white placeholder-slate-400 transition duration-150 ease-in-out"
            disabled={isLoading}
            maxLength={100}
          />
        </div>
        <div>
          <label htmlFor="title-font-color" className="block text-sm font-medium text-slate-300 mb-1">
            Title Font Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              id="title-font-color"
              value={titleFontColorInput}
              onChange={(e) => setTitleFontColorInput(e.target.value)}
              className="p-1 h-10 w-14 block bg-slate-700 border border-slate-600 cursor-pointer rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              disabled={isLoading}
              title="Select title font color"
            />
             <input
              type="text"
              value={titleFontColorInput}
              onChange={(e) => setTitleFontColorInput(e.target.value)}
              placeholder="#FFFFFF"
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-white placeholder-slate-400 transition duration-150 ease-in-out sm:w-32"
              disabled={isLoading}
              maxLength={7}
            />
          </div>
        </div>
      </fieldset>


      <div className="space-y-6">
        {slides.map((slide, index) => (
          <div key={slide.id} className="p-4 bg-slate-700/50 rounded-md border border-slate-600 space-y-3 relative">
            <h3 className="text-lg font-semibold text-purple-400">Slide {index + 1} Content</h3>
            <p className="text-xs text-slate-400">
              For highlighted words in subtitle, use: <code>&lt;highlight color="yellow"&gt;your text&lt;/highlight&gt;</code> or <code>&lt;highlight color="#RRGGBB"&gt;your text&lt;/highlight&gt;</code>.
            </p>
            {slides.length > MIN_SLIDES && (
              <IconButton 
                onClick={() => handleRemoveSlide(slide.id)} 
                className="absolute top-2 right-2 text-red-400 hover:text-red-300 !p-1.5"
                aria-label="Remove slide"
                title="Remove Slide"
                disabled={isLoading}
              >
                <TrashIcon className="w-5 h-5" />
              </IconButton>
            )}
            <div>
              <label htmlFor={`title-${slide.id}`} className="block text-sm font-medium text-slate-300 mb-1">
                Title
              </label>
              <input
                type="text"
                id={`title-${slide.id}`}
                value={slide.title}
                onChange={(e) => handleSlideChange(slide.id, 'title', e.target.value)}
                placeholder="e.g., Exciting Biotech Opportunity"
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-white placeholder-slate-400 transition duration-150 ease-in-out"
                disabled={isLoading}
                maxLength={100}
              />
            </div>
            <div>
              <label htmlFor={`content-${slide.id}`} className="block text-sm font-medium text-slate-300 mb-1">
                Subtitle / Content
              </label>
              <textarea
                id={`content-${slide.id}`}
                value={slide.content}
                onChange={(e) => handleSlideChange(slide.id, 'content', e.target.value)}
                placeholder="e.g., Details about the job, company, or news... Use newlines for paragraphs and standard bullet characters (e.g., -, *) for lists."
                rows={4}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-white placeholder-slate-400 transition duration-150 ease-in-out"
                disabled={isLoading}
                maxLength={500} 
              />
            </div>
          </div>
        ))}
      </div>

      {slides.length < maxSlides && (
        <button
          type="button"
          onClick={handleAddSlide}
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-2 border border-dashed border-slate-600 text-sm font-medium rounded-md text-slate-300 hover:text-white hover:border-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-purple-500 disabled:opacity-50 transition duration-150 ease-in-out"
        >
          <PlusCircleIcon className="w-5 h-5 mr-2" />
          Add Slide ({slides.length}/{maxSlides})
        </button>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Slide Aspect Ratio
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ASPECT_RATIOS.map((ratio: AspectRatioOption) => (
            <label 
              key={ratio.value} 
              htmlFor={`aspect-ratio-${ratio.value}`}
              className={`flex items-center justify-center p-3 border rounded-md cursor-pointer transition-all duration-150 ease-in-out
                          ${selectedAspectRatio === ratio.value ? 'bg-purple-600 border-purple-500 text-white shadow-lg scale-105' : 'bg-slate-700 border-slate-600 hover:border-slate-500'}
                          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                id={`aspect-ratio-${ratio.value}`}
                name="aspectRatio"
                value={ratio.value}
                checked={selectedAspectRatio === ratio.value}
                onChange={(e) => setSelectedAspectRatio(e.target.value)}
                className="sr-only"
                disabled={isLoading}
                aria-describedby={`aspect-ratio-desc-${ratio.value}`}
              />
              <span id={`aspect-ratio-desc-${ratio.value}`} className="text-sm font-medium">{ratio.label}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !canSubmit}
        className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out group"
      >
        <SparklesIcon className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`} />
        {isLoading ? 'Generating Images...' : 'Generate Carousel Images'}
      </button>
    </form>
  );
};