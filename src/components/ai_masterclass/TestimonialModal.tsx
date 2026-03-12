import React from "react";

interface Props {
  videoUrl: string;
  onClose: () => void;
}

const TestimonialModal: React.FC<Props> = ({ videoUrl, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-3xl p-4" onClick={(e) => e.stopPropagation()}>
        <video src={videoUrl} controls autoPlay className="w-full h-auto rounded-lg" />
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white hover:text-gray-300"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default TestimonialModal;
