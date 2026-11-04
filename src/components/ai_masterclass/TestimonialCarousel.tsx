import React, { useState, useRef } from "react";
import TestimonialModal from "./TestimonialModal";
import { Star, CheckCircle2, Play, Users } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Karthick",
    role: "Business Coach & Trainer",
    videoUrl: "/videos/karthick.mp4",
  },
  {
    id: 3,
    name: "Sivarama Krishnan",
    role: "Entrepreneur",
    videoUrl: "/videos/sivarama krishnan.mp4",
  },
  {
    id: 4,
    name: "Ranjithkumar Sambath",
    role: "Digital Consultant",
    videoUrl: "/videos/Ranjithkumar Sambath.mp4",
  },
  {
    id: 5,
    name: "Gokulakrishnan",
    role: "Agency Founder",
    videoUrl: "/videos/GokulaKrishnan.mp4",
  },
  {
    id: 6,
    name: "Sree",
    role: "Corporate Executive",
    videoUrl: "/videos/sree_testimonial.mp4",
  },
  {
    id: 7,
    name: "Balan",
    role: "Business Owner",
    videoUrl: "/videos/Balan.mp4",
  },
  {
    id: 2,
    name: "Sheridian",
    role: "Educator & Creator",
    videoUrl: "/videos/sheridian.mp4",
  }
];

const writtenReviews = [
  {
    name: "Karthick R.",
    role: "Corporate Trainer & Coach",
    rating: 5,
    quote: "Antony explains complex AI workflows in clear, structured business language. We automated our client communication and content pipeline within the first week."
  },
  {
    name: "Sree Vidhya",
    role: "Business Owner",
    rating: 5,
    quote: "The prompt engineering frameworks alone saved our team over 15 hours every week. The practical value delivered in 3 hours is exceptional."
  },
  {
    name: "Gokulakrishnan M.",
    role: "Agency Founder",
    rating: 5,
    quote: "We built our company's campaign assets, pitch presentations, and outreach scripts immediately after the workshop. Highly recommended for business leaders."
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
      className="relative w-[320px] sm:w-[350px] h-[200px] flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer snap-start bg-slate-900 border border-slate-200/90 shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300 group"
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
        className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-all duration-300"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/25 to-transparent group-hover:from-slate-950/95 transition-opacity" />

      {/* Play Icon */}
      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 pointer-events-none ${isPlaying ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}>
        <div className="w-13 h-13 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform p-3.5">
          <Play className="w-5 h-5 fill-current ml-0.5" />
        </div>
      </div>

      {/* Delegate Badge Bottom Left */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between">
        <div>
          <span className="text-white font-bold text-sm tracking-wide block">
            {t.name}
          </span>
          <span className="text-[11px] text-blue-300 font-semibold block">
            {t.role}
          </span>
        </div>
        <span className="text-[10px] bg-white/15 border border-white/20 backdrop-blur-md text-white font-semibold px-2.5 py-1 rounded-md">
          Watch Review
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
    <section className="py-20 sm:py-24 px-4 bg-slate-50/70 border-t border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white rounded-md text-[11px] font-bold uppercase tracking-widest text-blue-700 border border-slate-200 shadow-2xs mb-4">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>Verified Delegate Feedback</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Trusted By <span className="text-blue-600">Business Leaders & Professionals</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Hear directly from founders, consultants, and corporate executives who have implemented our AI systems.
          </p>
        </div>

        {/* Video Scroller */}
        <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-6 px-1 no-scrollbar">
          {testimonials.map((t) => (
            <VideoCard key={t.id} t={t} openModal={openModal} />
          ))}
        </div>

        {/* Written Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {writtenReviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-4">
                  "{rev.quote}"
                </p>
              </div>

              <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{rev.name}</span>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">{rev.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && <TestimonialModal videoUrl={selected} onClose={closeModal} />}
    </section>
  );
};

export default TestimonialCarousel;
