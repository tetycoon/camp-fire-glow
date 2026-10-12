import React from "react";
import logoImg from "../../assets/tech_tycoon_logo_llp.png";
import { Mail, Phone, ShieldCheck, MapPin } from "lucide-react";

const ConsultingFooter: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-slate-800 items-start">
          {/* Col 1: Brand */}
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-2.5">
              <img
                src={logoImg}
                alt="Tech Tycoon Digital Solution LLP"
                className="h-9 w-auto object-contain flex-shrink-0"
              />
              <div className="flex flex-col justify-center">
                <span className="text-sm sm:text-base font-black tracking-wider text-white uppercase leading-none whitespace-nowrap">
                  TECH TYCOON
                </span>
                <span className="text-[8px] sm:text-[9.5px] font-bold text-slate-400 uppercase tracking-wider leading-none -mt-[3px] sm:-mt-[4px] whitespace-nowrap">
                  Digital Solution LLP
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Empowering business owners, executives, and working professionals with practical, ethical, and high-leverage Artificial Intelligence & AI Agent solutions.
            </p>
          </div>

          {/* Col 2: Fast Links */}
          <div className="text-left space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Quick Links
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li>
                <a href="/professionals" className="hover:text-white transition-colors">
                  AI for Working Professionals
                </a>
              </li>
              <li>
                <a href="/ai_bgm" className="hover:text-white transition-colors">
                  Business Generative AI Masterclass
                </a>
              </li>
              <li>
                <a href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy & Disclaimers
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Support */}
          <div className="text-left space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Support & Inquiries
            </h4>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>support@techtycoon.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>+91 99403 06161 (WhatsApp Support)</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Registered LLP in India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <div>
            © {new Date().getFullYear()} Tech Tycoon Digital Solutions LLP. All Rights Reserved.
          </div>
          <div className="flex items-center gap-4">
            <a href="/privacy" className="hover:text-slate-400 transition-colors">
              Privacy Policy
            </a>
            <span>•</span>
            <span className="text-slate-400">
              Personalized 1-on-1 AI Advisory Session
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ConsultingFooter;
