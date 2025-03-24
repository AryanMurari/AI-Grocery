
import React, { useState, useRef } from 'react';
import { Mic, MicOff, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface InputWithSpeechProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onInputChange: (value: string) => void;
  label?: string;
  className?: string;
}

const InputWithSpeech: React.FC<InputWithSpeechProps> = ({
  onInputChange,
  label,
  className,
  ...props
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Mock speech recognition (would use Web Speech API in production)
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    
    setIsListening(true);
    setIsLoading(true);
    
    // Simulate processing delay
    setTimeout(() => {
      setIsLoading(false);
      
      // Simulate recognized speech
      const mockRecognizedText = "2 avocados\n1 loaf of bread\n6 eggs\nGreek yogurt";
      
      if (textareaRef.current) {
        const currentValue = textareaRef.current.value;
        const newValue = currentValue ? `${currentValue}\n${mockRecognizedText}` : mockRecognizedText;
        textareaRef.current.value = newValue;
        onInputChange(newValue);
      }
      
      setIsListening(false);
    }, 2000);
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
            isListening && "border-primary"
          )}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Type your grocery list or use voice input..."
          {...props}
        />
        <Button
          type="button"
          size="icon"
          variant={isListening ? "default" : "outline"}
          className="absolute bottom-2 right-2 h-8 w-8 rounded-full"
          onClick={toggleListening}
        >
          {isLoading ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : isListening ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>
      </div>
      {isListening && (
        <div className="absolute -bottom-6 left-0 right-0 text-xs text-center text-primary animate-pulse-soft">
          Listening... Speak your grocery list
        </div>
      )}
    </div>
  );
};

export default InputWithSpeech;
