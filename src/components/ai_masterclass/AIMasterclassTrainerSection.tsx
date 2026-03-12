import React from "react";
import trainerImg from "@/assets/trainer-photo.png";
import { CheckCircle, Globe, Linkedin, Instagram } from "lucide-react";

const stats = [
    { value: "4.8K+", label: "Students Trained" },
    { value: "50+", label: "Corporate Workshops" },
    { value: "10+", label: "AI Tools Covered" },
    { value: "7-Fig", label: "Business Built" },
];

const AIMasterclassTrainerSection: React.FC = () => {
    return (
        <section id="trainer" className="py-24 px-4 bg-gray-50 border-t border-gray-100">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-block px-4 py-2 bg-white rounded-full text-sm font-bold text-slate-600 shadow-sm border border-gray-200 mb-6">
                        👨‍🏫 Your Guide
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                        Meet Your <span className="text-blue-600">Mentor</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Left side: Image */}
                    <div className="flex justify-center lg:justify-end">
                        <div className="relative">
                            {/* Simple solid accent behind image */}
                            <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-3xl bg-brandGreen opacity-20"></div>
                            
                            <img
                                src={trainerImg}
                                alt="Antony Praveen - AI Trainer"
                                className="relative z-10 w-72 h-72 sm:w-[400px] sm:h-[400px] rounded-3xl object-cover shadow-2xl border border-gray-200"
                            />
                            
                            <div className="absolute -bottom-6 -left-6 z-20 bg-white border border-gray-200 text-slate-900 rounded-2xl px-6 py-4 text-center shadow-xl">
                                <div className="text-2xl font-black text-brandGreen">4.9/5</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">Average Rating</div>
                            </div>
                        </div>
                    </div>

                    {/* Right side: Content */}
                    <div>
                        <h3 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">Antony Praveen</h3>
                        <p className="text-blue-600 font-bold mb-6 tracking-wide text-sm uppercase">Founder, Tech Tycoon Digital Solutions</p>

                        <div className="bg-white border-l-4 border-brandGreen p-6 rounded-r-2xl mb-8 italic text-lg text-slate-600 shadow-sm">
                            "I help professionals build a powerful digital presence and attract
                            quality leads — using the exact AI strategies that scaled my own business."
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                            {[
                                "International Certified Trainer",
                                "AI Marketing Specialist",
                                "50+ Corporate Workshops",
                                "7-Figure Brand Builder"
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-brandGreen flex-shrink-0" />
                                    <span className="text-sm font-bold text-slate-700">{item}</span>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-10">
                            {stats.map((s, i) => (
                                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 text-center shadow-sm">
                                    <div className="text-2xl font-black text-blue-600 mb-1">{s.value}</div>
                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-4">
                            <a href="https://www.techtycoon.in/" target="_blank" className="p-3 rounded-full bg-white text-slate-400 hover:text-brandGreen hover:shadow-md transition-all border border-gray-200">
                                <Globe className="w-5 h-5" />
                            </a>
                            <a href="https://www.linkedin.com/in/antony-praveen-techtycoon" target="_blank" className="p-3 rounded-full bg-white text-slate-400 hover:text-brandGreen hover:shadow-md transition-all border border-gray-200">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="https://www.instagram.com/amiable_antony" target="_blank" className="p-3 rounded-full bg-white text-slate-400 hover:text-brandGreen hover:shadow-md transition-all border border-gray-200">
                                <Instagram className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AIMasterclassTrainerSection;
