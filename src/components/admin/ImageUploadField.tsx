import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, Link as LinkIcon, Sparkles, Check, AlertCircle } from 'lucide-react';

export interface PresetImage {
  label: string;
  url: string;
  category?: string;
}

interface ImageUploadFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (imageUrl: string) => void;
  helperText?: string;
  presets?: PresetImage[];
  required?: boolean;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  id,
  label,
  value,
  onChange,
  helperText = 'Upload a high-quality photo (JPG, PNG, WebP) or paste an image URL.',
  presets = [],
  required = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compress & convert file to optimized base64 data URL
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (JPG, PNG, WebP, GIF).');
      return;
    }

    // Limit raw upload size check (e.g., 15MB)
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 15MB. Please choose a smaller image.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onerror = () => {
      setIsProcessing(false);
      setErrorMessage('Error reading file. Please try again.');
    };

    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        setIsProcessing(false);
        setErrorMessage('Failed to read image.');
        return;
      }

      // Optimize using Canvas to ensure snappy loading
      const img = new Image();
      img.onerror = () => {
        setIsProcessing(false);
        onChange(result); // fallback to raw base64
      };
      img.onload = () => {
        try {
          const maxDim = 1280;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimized = canvas.toDataURL('image/jpeg', 0.85);
            onChange(optimized);
          } else {
            onChange(result);
          }
        } catch {
          onChange(result);
        } finally {
          setIsProcessing(false);
        }
      };
      img.src = result;
    };

    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processImageFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleClearImage = () => {
    onChange('');
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isCustomUpload = value && value.startsWith('data:image/');

  return (
    <div id={`${id}-wrapper`} className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-[#005BBD]" />
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
        </label>

        <div className="flex items-center gap-2">
          {presets.length > 0 && (
            <button
              type="button"
              id={`${id}-presets-toggle-btn`}
              onClick={() => {
                setShowPresets(!showPresets);
                setShowUrlInput(false);
              }}
              className="text-[11px] font-semibold text-slate-500 hover:text-[#005BBD] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{showPresets ? 'Hide Presets' : 'Sample Photos'}</span>
            </button>
          )}

          <button
            type="button"
            id={`${id}-url-toggle-btn`}
            onClick={() => {
              setShowUrlInput(!showUrlInput);
              setShowPresets(false);
            }}
            className="text-[11px] font-semibold text-slate-500 hover:text-[#005BBD] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <LinkIcon className="w-3 h-3 text-blue-500" />
            <span>{showUrlInput ? 'Hide URL Input' : 'Paste URL'}</span>
          </button>
        </div>
      </div>

      {/* ERROR MESSAGE IF ANY */}
      {errorMessage && (
        <div id={`${id}-error`} className="p-2 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ACTIVE IMAGE PREVIEW */}
      {value ? (
        <div id={`${id}-preview-card`} className="relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-900/5 group">
          <div className="relative h-44 sm:h-48 w-full bg-slate-100 flex items-center justify-center overflow-hidden">
            <img
              id={`${id}-preview-img`}
              src={value}
              alt="Uploaded service / facility"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              onError={() => setErrorMessage('The image URL could not be loaded. Please check or upload another image.')}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />

            {/* BADGES */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
              <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                <Check className="w-3 h-3" />
                {isCustomUpload ? 'Device Image Uploaded' : 'Active Image'}
              </span>
            </div>

            {/* ACTION BUTTONS */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
              <button
                type="button"
                id={`${id}-replace-btn`}
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg bg-white/90 hover:bg-white text-slate-800 text-[11px] font-bold shadow-sm transition-all flex items-center gap-1 cursor-pointer"
              >
                <Upload className="w-3 h-3 text-[#005BBD]" />
                <span>Replace</span>
              </button>
              <button
                type="button"
                id={`${id}-remove-btn`}
                onClick={handleClearImage}
                title="Remove image"
                className="p-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white shadow-sm transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* DRAG & DROP / UPLOAD DROPZONE */
        <div
          id={`${id}-dropzone`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
            isDragging
              ? 'border-[#005BBD] bg-blue-50/70 scale-[1.01]'
              : 'border-slate-300 hover:border-[#005BBD] hover:bg-slate-50/70 bg-white'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#005BBD] flex items-center justify-center shadow-xs">
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-[#005BBD] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-6 h-6 text-[#005BBD]" />
            )}
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-800">
              {isProcessing ? 'Optimizing and loading image...' : 'Click to browse or drag & drop image'}
            </p>
            <p className="text-[11px] text-slate-500">
              Supports PNG, JPG, WebP, GIF (Auto-optimized for mobile & web)
            </p>
          </div>

          <button
            type="button"
            id={`${id}-browse-btn`}
            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#005BBD] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Choose File from Device</span>
          </button>
        </div>
      )}

      {/* HIDDEN NATIVE FILE INPUT */}
      <input
        ref={fileInputRef}
        id={id}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* OPTIONAL DIRECT URL INPUT */}
      {showUrlInput && (
        <div id={`${id}-url-input-container`} className="pt-2 space-y-1">
          <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
            <LinkIcon className="w-3 h-3 text-[#005BBD]" />
            <span>Direct Image Web Link</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              id={`${id}-url-text-input`}
              type="url"
              placeholder="https://images.unsplash.com/... or https://..."
              value={value.startsWith('data:') ? '' : value}
              onChange={(e) => {
                onChange(e.target.value);
                setErrorMessage(null);
              }}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#005BBD]"
            />
            {value && !value.startsWith('data:') && (
              <button
                type="button"
                id={`${id}-clear-url-btn`}
                onClick={handleClearImage}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* OPTIONAL PRESET IMAGE GALLERY */}
      {showPresets && presets.length > 0 && (
        <div id={`${id}-presets-container`} className="pt-2 space-y-2 p-3 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Select from Curated Dialysis &amp; Medical Library</span>
            </span>
            <button
              type="button"
              id={`${id}-close-presets-btn`}
              onClick={() => setShowPresets(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                id={`${id}-preset-${idx}`}
                onClick={() => {
                  onChange(p.url);
                  setShowPresets(false);
                  setErrorMessage(null);
                }}
                className={`group relative rounded-xl overflow-hidden border text-left p-1 transition-all cursor-pointer ${
                  value === p.url ? 'border-[#005BBD] ring-2 ring-blue-200 bg-white' : 'border-slate-200 hover:border-[#005BBD] bg-white'
                }`}
              >
                <div className="h-16 w-full rounded-lg overflow-hidden bg-slate-100 mb-1">
                  <img src={p.url} alt={p.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <p className="text-[10px] font-bold text-slate-700 truncate">{p.label}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {helperText && !errorMessage && (
        <p className="text-[11px] text-slate-400">{helperText}</p>
      )}
    </div>
  );
};
