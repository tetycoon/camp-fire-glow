import React, { useState, useRef } from "react";
import TestimonialModal from "./TestimonialModal";
import { Star, MessageSquareQuote, CheckCircle2, Play, Users } from "lucide-react";

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
    quote: "Antony explains everything in clear, simple language without technical jargon. I automated my entire social media and email workflow in my very first week!"
  },
  {
    name: "Sree Vidhya",
    role: "Business Owner",
    rating: 5,
    quote: "I was skeptical about AI, but the prompt engineering templates alone saved me 15+ hours every week. This masterclass is worth 100x the ₹99 ticket price."
  },
  {
    name: "Gokulakrishnan M.",
    role: "Agency Founder",
    rating: 5,
    quote: "We created our company's new promotional assets, video avatars, and sales scripts right after the session. Highly recommend for any entrepreneur."
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
      className="relative w-[320px] sm:w-[350px] h-[200px] flex-shrink-0 rounded-3xl overflow-hidden cursor-pointer snap-start bg-slate-900 border border-slate-200/80 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group"
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent group-hover:from-black/90 transition-opacity" />
      
      {/* Play Icon */}
      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 pointer-events-none ${isPlaying ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}>
        <div className="w-14 h-14 bg-brandGreen text-slate-950 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
          <Play className="w-6 h-6 fill-current ml-0.5" />
        </div>
      </div>

      {/* Student Badge Bottom Left */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between">
        <div>
          <span className="text-white font-black text-sm tracking-wide block">
            {t.name}
          </span>
          <span className="text-[11px] text-brandGreen font-bold block">
            {t.role}
          </span>
        </div>
        <span className="text-[10px] bg-white/20 backdrop-blur-md text-white font-bold px-2 py-0.5 rounded-full">
          ▶ Watch
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
    <section className="py-20 sm:py-24 px-4 bg-white relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 rounded-full text-xs font-bold text-emerald-800 border border-emerald-200 mb-4">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>Real Student Stories</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Hear It Directly From Our <span className="text-blue-600">Students</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Watch real reviews from coaches, trainers, business owners, and professionals who transformed their workflows with Tech Tycoon.
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
              className="bg-slate-50/80 border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed mb-4">
                  "{rev.quote}"
                </p>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-200/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-xs font-black text-slate-900 block">{rev.name}</span>
                  <span className="text-[10px] font-bold text-slate-500 block">{rev.role}</span>
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
