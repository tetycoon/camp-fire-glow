import React from "react";
import { Users, Star } from "lucide-react";

const GuestSection: React.FC = () => {
  return (
    <section className="section-border py-24 px-4 bg-muted/20">
      <div className="max-w-5xl mx-auto text-center">
        <p className="font-body text-xs tracking-[0.3em] text-primary uppercase font-semibold mb-3">Special Sessions</p>
        <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-6">
          Guest <span className="text-gradient">Expert Sessions</span>
        </h2>
        <p className="font-body text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
          Learn directly from industry leaders and AI practitioners. Our guest sessions bring real-world insights from professionals working at the forefront of artificial intelligence.
        </p>

        <div className="card-glow rounded-3xl p-10 sm:p-14 relative overflow-hidden">
          <div className="absolute top-4 left-6 text-primary/20 font-display text-8xl font-black leading-none">"</div>
          <div className="relative z-10">
            <p className="font-body text-lg sm:text-xl text-foreground/90 leading-relaxed mb-8 italic">
              Exclusive interactions with AI industry experts, startup founders, and tech leaders who share their journey and insights.
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="flex -space-x-3">
                {[0,1,2,3,4].map(i => (
                  <div key={i} className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/80 to-secondary/80 border-2 border-card flex items-center justify-center">
                    <Users className="w-4 h-4 text-primary-foreground" />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1 text-primary">
                {[0,1,2,3,4].map(i => <Star key={i} className="w-4 h-4 fill-primary" />)}
              </div>
              <span className="font-body text-sm text-muted-foreground">Expert speakers each session</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GuestSection;
