import React, { useState, useRef } from 'react';
import { Mic, Square, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface InputWithVoiceProps {
  onTranscriptionReceived: (text: string) => void;
  className?: string;
}

const InputWithVoice: React.FC<InputWithVoiceProps> = ({
  onTranscriptionReceived,
  className,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        setIsProcessing(true);
        
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const formData = new FormData();
          formData.append("audio", audioBlob, "order.webm");
          
          const response = await fetch("http://localhost:8000/upload-audio/", {
            method: "POST",
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
          }
          
          const { transcribedText } = await response.json();
          onTranscriptionReceived(transcribedText);
        } catch (error) {
          console.error("Error processing audio:", error);
          alert("Failed to process audio. Please try again.");
        } finally {
          setIsProcessing(false);
          setRecordingTime(0);
        }
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start a timer to update recording time
      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds += 1;
        setRecordingTime(seconds);
        
        // Auto-stop after 15 seconds
        if (seconds >= 15) {
          stopRecording();
        }
      }, 1000);
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please make sure you have given microphone permissions.");
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };
  
  const formatTime = (seconds: number): string => {
    return `${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {isRecording ? (
        <>
          <div className="text-sm font-medium text-red-500 animate-pulse">
            Recording... {formatTime(recordingTime)}s
          </div>
          <Button 
            type="button" 
            variant="destructive"
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={stopRecording}
          >
            <Square className="h-5 w-5" />
          </Button>
        </>
      ) : isProcessing ? (
        <>
          <div className="text-sm font-medium text-gray-500">
            Processing audio...
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full"
            disabled
          >
            <Loader className="h-5 w-5 animate-spin" />
          </Button>
        </>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={startRecording}
          title="Speak your grocery list"
        >
          <Mic className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default InputWithVoice;
