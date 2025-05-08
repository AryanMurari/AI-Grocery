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
    if (isCameraActive) {
      // Stop camera
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setIsCameraActive(false);
      return;
    }
    
    try {
      // Start camera
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please make sure you have given camera permissions.');
    }
  };
  
  // Handle image upload
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
      const response = await fetch('http://localhost:8000/upload-image', {
        method: 'POST',
        body: formData,
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
  
  // Take photo from camera
  const capturePhoto = async () => {
    if (!videoRef.current) return;
    
    setIsUploading(true);
    
    // Create canvas to capture the frame
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx && videoRef.current) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      try {
        // Get image data as base64
        const imgData = canvas.toDataURL('image/jpeg');
        setPreviewImage(imgData);
        
        // Convert base64 to blob for upload
        const response = await fetch(imgData);
        const blob = await response.blob();
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        
        // Create form data for upload
        const formData = new FormData();
        formData.append("image", file);
        
        // Send to backend for processing
        const apiResponse = await fetch('http://localhost:8000/upload-image', {
          method: 'POST',
          body: formData,
        });
        
        if (!apiResponse.ok) {
          throw new Error(`Server responded with ${apiResponse.status}`);
        }
        
        const { extractedText } = await apiResponse.json();
        
        // Update textarea with extracted text
        if (textareaRef.current) {
          const currentValue = textareaRef.current.value;
          const newValue = currentValue 
            ? `${currentValue}\n${extractedText}` 
            : extractedText;
          textareaRef.current.value = newValue;
          onInputChange(newValue);
        }
        
        // Clean up: close camera after capturing
        toggleCamera();
      } catch (error) {
        console.error('Error capturing or processing photo:', error);
        alert('Failed to process image. Please try again.');
      } finally {
        setIsUploading(false);
      }
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
        <textarea
          ref={textareaRef}
          className={cn(
            "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px]",
            isCameraActive && "border-primary"
          )}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Type your grocery list or use image recognition..."
          {...props}
        />
        
        <div className="absolute bottom-2 right-2 flex space-x-2">
          {/* Image upload button */}
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-8 w-8 rounded-full"
            onClick={handleImageUpload}
            disabled={isCameraActive || isUploading}
            title="Upload grocery list image"
          >
            <Image className="h-4 w-4" />
          </Button>
          
          {/* Camera button */}
          <Button
            type="button"
            size="icon"
            variant={isCameraActive ? "default" : "outline"}
            className="h-8 w-8 rounded-full"
            onClick={toggleCamera}
            disabled={isUploading}
            title={isCameraActive ? "Stop camera" : "Start camera"}
          >
            {isUploading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </Button>
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
      
      {/* Camera view */}
      {isCameraActive && (
        <div className="mt-4 relative rounded-md overflow-hidden border border-gray-200">
          <video 
            ref={videoRef}
            autoPlay 
            playsInline
            className="w-full h-48 object-cover"
          />
          <div className="absolute bottom-2 right-2 flex space-x-2">
            <Button
              type="button"
              onClick={capturePhoto}
              size="sm"
              className="bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
            >
              <Camera className="h-4 w-4 mr-1" />
              Capture
            </Button>
            <Button
              type="button"
              onClick={toggleCamera}
              size="sm"
              variant="outline"
              className="bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      )}
      
      {/* Image preview */}
      {previewImage && !isCameraActive && (
        <div className="mt-4 relative rounded-md overflow-hidden border border-gray-200">
          <img 
            src={previewImage} 
            alt="Uploaded grocery list" 
            className="w-full h-48 object-contain"
          />
          {isUploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
              <div className="text-white text-center">
                <Loader className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm">Processing image...</p>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              onClick={clearPreview}
              size="sm"
              variant="outline"
              className="absolute top-2 right-2 bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default InputWithCamera; 