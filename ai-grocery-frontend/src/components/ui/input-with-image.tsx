import React, { useState, useRef } from 'react';
import { Upload, X, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface InputWithImageUploadProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onInputChange: (value: string) => void;
  label?: string;
  className?: string;
}

const InputWithImageUpload: React.FC<InputWithImageUploadProps> = ({
  onInputChange,
  label,
  className,
  ...props
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle image upload button click
  const handleImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Process the selected file
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    // Create preview image
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreviewImage(e.target.result.toString());
      }
    };
    reader.readAsDataURL(file);
    
    try {
      // Create form data for upload
      const formData = new FormData();
      formData.append("image", file);
      
      // Send to backend for processing
      const response = await fetch('http://localhost:8000/upload-image/', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header, let the browser set it with the boundary
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const { extractedText } = await response.json();
      
      // Update textarea with extracted text
      if (textareaRef.current) {
        const currentValue = textareaRef.current.value;
        const newValue = currentValue 
          ? `${currentValue}\n${extractedText}` 
          : extractedText;
        textareaRef.current.value = newValue;
        onInputChange(newValue);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Clear the preview image
  const clearPreview = () => {
    setPreviewImage(null);
  };
  
  return (
    <div className={cn("relative", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        <div className="relative">
          {/* Textarea input */}
          <textarea
            ref={textareaRef}
            className={cn(
              "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px]",
              previewImage && "pb-[120px]" // Add padding at the bottom when there's a preview
            )}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Type your grocery list or use image upload..."
            {...props}
          />
          
          {/* Image preview directly in the textarea */}
          {previewImage && (
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-gray-100 rounded-md overflow-hidden z-10">
              <img 
                src={previewImage} 
                alt="Uploaded list" 
                className="w-full h-full object-contain mx-auto"
              />
              <button
                type="button"
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-gray-800 bg-opacity-70 flex items-center justify-center text-white"
                onClick={clearPreview}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
          
          {/* Upload button */}
          <div className="absolute bottom-2 right-2">
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="h-8 w-8 rounded-full"
              onClick={handleImageUpload}
              disabled={isUploading}
              title="Upload grocery list image"
            >
              {isUploading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Hidden file input for image upload */}
        <input 
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default InputWithImageUpload;
