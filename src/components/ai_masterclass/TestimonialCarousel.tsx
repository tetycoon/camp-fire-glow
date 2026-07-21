import React, { useState, useRef } from "react";
import TestimonialModal from "./TestimonialModal";

const testimonials = [
  {
    id: 1,
    name: "Karthick",
    videoUrl: "/videos/karthick.mp4",
  },
  {
    id: 3,
    name: "Sivarama Krishnan",
    videoUrl: "/videos/sivarama krishnan.mp4",
  },
  {
    id: 4,
    name: "Ranjithkumar Sambath",
    videoUrl: "/videos/Ranjithkumar Sambath.mp4",
  },
  {
    id: 5,
    name: "Gokulakrishnan",
    videoUrl: "/videos/GokulaKrishnan.mp4",
  },
  {
    id: 6,
    name: "Sree",
    videoUrl: "/videos/sree_testimonial.mp4",
  },
  {
    id: 7,
    name: "Balan",
    videoUrl: "/videos/Balan.mp4",
  },
  {
    id: 2,
    name: "Sheridian",
    videoUrl: "/videos/sheridian.mp4",
  }
];

interface VideoCardProps {
  t: typeof testimonials[0];
  openModal: (url: string) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ t, openModal }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <div
      className="relative w-[340px] h-[190px] flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer snap-start bg-slate-950 border-2 border-white/5 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group"
      onClick={() => openModal(t.videoUrl)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={t.videoUrl}
        preload="metadata"
        muted
        loop
        playsInline
        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-300"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />
      
      {/* Play Button (Fades out when preview plays on hover) */}
      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 pointer-events-none ${isPlaying ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}>
        <div className="w-14 h-14 bg-emerald-500/90 rounded-full flex items-center justify-center shadow-lg group-hover:bg-emerald-400 group-hover:scale-110 transition-all duration-300">
          <svg
            className="w-7 h-7 text-white ml-1"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      {/* Name Display Bottom Left Corner */}
      <div className="absolute bottom-4 left-4 z-10">
        <span className="text-white font-medium text-xs tracking-wider bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-sm flex items-center gap-1.5 uppercase font-sans">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {t.name}
        </span>
      </div>
    </div>
  );
};

const TestimonialCarousel: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);

  const openModal = (url: string) => setSelected(url);
  const closeModal = () => setSelected(null);

  return (
    <section className="my-20">
      <h2 className="font-display text-3xl sm:text-4xl font-black text-center mb-12 text-slate-900 uppercase tracking-tight">
        Hear It From Our Students
      </h2>
      <div className="max-w-6xl mx-auto flex gap-6 overflow-x-auto snap-x snap-mandatory px-4 pb-8 no-scrollbar">
        {testimonials.map((t) => (
          <VideoCard key={t.id} t={t} openModal={openModal} />
        ))}
      </div>
      {selected && <TestimonialModal videoUrl={selected} onClose={closeModal} />}
    </section>
  );
};

export default TestimonialCarousel;
