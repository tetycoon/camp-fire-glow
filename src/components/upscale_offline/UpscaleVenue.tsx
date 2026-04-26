import React from "react";
import { MapPin, Navigation, Map as MapIcon, Phone, Mail } from "lucide-react";

const UpscaleVenue: React.FC = () => {
    return (
        <section id="venue" className="py-24 px-6 bg-slate-50">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="inline-block px-4 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                            📍 THE LOCATION
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight mb-8">
                            Vestin Park Hotel, <br />
                            <span className="text-blue-600">Egmore Chennai.</span>
                        </h2>
                        <p className="text-lg text-slate-600 font-medium mb-10 max-w-lg leading-relaxed">
                            Located in the heart of the city, easily accessible from the Egmore Railway Station and all major hubs. A premium corporate space designed for deep focus.
                        </p>

                        <div className="space-y-6 mb-12">
                            <div className="flex items-center gap-6 group">
                                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">ADDRESS</div>
                                    <div className="text-lg font-black text-slate-900 leading-tight">39, Red Cross Rd, Egmore, <br />Chennai, Tamil Nadu 600008</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 group">
                                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">SUPPORT</div>
                                    <div className="text-lg font-black text-slate-900">+91 70103 40494</div>
                                </div>
                            </div>
                        </div>

                        <a 
                            href="https://www.google.com/maps/dir//vestin+park+hotel+egmore/@13.0784989,80.2541335,17z" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 bg-white border-2 border-slate-900 px-8 py-4 rounded-2xl font-black text-slate-900 hover:bg-slate-900 hover:text-white transition-all group"
                        >
                            <Navigation className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            <span>GET DIRECTIONS</span>
                        </a>
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-4 bg-blue-600/10 rounded-[48px] blur-2xl"></div>
                        <div className="relative rounded-[40px] overflow-hidden border-8 border-white shadow-3xl h-[450px]">
                            {/* Embedded Google Map */}
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.533250819779!2d80.25593817507804!3d13.077053587248066!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a52661ab2f9745b%3A0xc33eec0fe7876793!2sVestin%20Park!5e0!3m2!1sen!2sin!4v1715767838521!5m2!1sen!2sin"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen={true}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Vestin Park Hotel Map"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default UpscaleVenue;
