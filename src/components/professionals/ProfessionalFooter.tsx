import React from "react";
import logoImg from "../../assets/tech_tycoon_logo_llp.png";
import { Mail, Phone, MapPin, Shield, CheckCircle2 } from "lucide-react";

const ProfessionalFooter: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white pt-12 pb-8 sm:pt-16 sm:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-10 sm:mb-14">
          {/* Brand Column */}
          <div className="space-y-4">
            <a href="/" className="flex items-center gap-2.5 sm:gap-3 group">
              <img 
                src={logoImg} 
                alt="Tech Tycoon Digital Solution LLP" 
                className="h-8 sm:h-10 w-auto object-contain flex-shrink-0 bg-white p-1 rounded-lg" 
              />
              <div className="flex flex-col text-left justify-center">
                <span className="text-xs sm:text-base font-black tracking-wider text-white uppercase leading-none whitespace-nowrap">
                  TECH TYCOON
                </span>
                <span className="text-[7.5px] sm:text-[9.5px] font-bold text-slate-400 uppercase tracking-wider leading-none -mt-[3px] sm:-mt-[4.5px] whitespace-nowrap">
                  Digital Solution LLP
                </span>
              </div>
            </a>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering non-technical corporate professionals, managers, and executives to lead with practical AI workflows and 10x their career trajectory.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Official Enterprise Training Partner</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Curriculum & Programs
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#career-impact" className="hover:text-indigo-400 transition-colors">Career Impact & Before/After</a></li>
              <li><a href="#roles" className="hover:text-indigo-400 transition-colors">Department & Role Breakdown</a></li>
              <li><a href="#curriculum" className="hover:text-indigo-400 transition-colors">7 Non-Tech Core Modules</a></li>
              <li><a href="#tools" className="hover:text-indigo-400 transition-colors">No-Code AI Stack (Claude, ChatGPT, Perplexity)</a></li>
              <li><a href="#trainer" className="hover:text-indigo-400 transition-colors">Mentor Profile — Antony Praveen</a></li>
            </ul>
          </div>

          {/* Platform Access */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Learning Portal
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a 
                  href="https://academy.techtycoon.in" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                >
                  <span>Student Portal (academy.techtycoon.in)</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                </a>
              </li>
              <li><span className="text-slate-500">Instant Access Delivered via Email</span></li>
              <li><span className="text-slate-500">Verifiable LinkedIn Certificate</span></li>
              <li><span className="text-slate-500">Lifetime Updates for 2026</span></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Corporate Support
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                <span>support@techtycoon.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                <span>+91 93457 40049</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <span>Tech Tycoon Digital Solution LLP, Tamil Nadu, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 text-center sm:flex sm:justify-between sm:items-center text-[11px] text-slate-500">
          <p>© 2026 TECH TYCOON Digital Solution LLP. All rights reserved.</p>
          <div className="mt-2 sm:mt-0 space-x-4">
            <a href="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Refund Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ProfessionalFooter;
