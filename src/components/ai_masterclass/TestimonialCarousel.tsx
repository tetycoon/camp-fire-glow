import React, { useState } from "react";
import TestimonialModal from "./TestimonialModal";

// Placeholder data – replace with your actual video URLs or paths
const testimonials = [
  {
    id: 1,
    title: "Student Success Story",
    thumbnail: "/videos/thumb1.jpg",
    videoUrl: "/videos/testimonial1.mp4",
  },
  {
    id: 2,
    title: "AI Masterclass Review",
    thumbnail: "/videos/thumb2.jpg",
    videoUrl: "/videos/testimonial2.mp4",
  },
  // Add more items as needed
];

const TestimonialCarousel: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);

  const openModal = (url: string) => setSelected(url);
  const closeModal = () => setSelected(null);

  return (
    <section className="my-12">
      <h2 className="font-display text-4xl font-black text-center mb-12 text-slate-900 uppercase tracking-tight">
        Hear It From Our Students
      </h2>
      <div className="max-w-6xl mx-auto flex gap-8 overflow-x-auto snap-x snap-mandatory px-4 pb-8 no-scrollbar">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="relative w-[340px] h-[190px] flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer snap-start bg-slate-900 border-2 border-slate-100 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group"
            onClick={() => openModal(t.videoUrl)}
          >
            <img
              src={t.thumbnail}
              alt={t.title}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-brandGreen/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg
                  className="w-8 h-8 text-slate-900 ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
              <span className="text-white font-bold text-sm uppercase tracking-wider bg-slate-900/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                {t.title}
              </span>
            </div>
          </div>
        ))}
      </div>
      {selected && <TestimonialModal videoUrl={selected} onClose={closeModal} />}
    </section>
  );
};

export default TestimonialCarousel;
