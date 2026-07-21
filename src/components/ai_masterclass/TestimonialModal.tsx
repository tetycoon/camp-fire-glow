import React from "react";
import { X } from "lucide-react";

interface Props {
  videoUrl: string;
  onClose: () => void;
}

const TestimonialModal: React.FC<Props> = ({ videoUrl, onClose }) => {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4" 
      onClick={onClose}
    >
      <div 
        className="relative max-w-sm w-full bg-slate-950 rounded-3xl border border-white/10 shadow-2xl flex flex-col justify-center items-center overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button - highly visible floating top-right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/75 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <video 
          src={videoUrl} 
          controls 
          autoPlay 
          playsInline
          className="w-full max-h-[82vh] h-auto object-contain" 
        />
      </div>
    </div>
  );
};

export default TestimonialModal;
