import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Mail, Globe, Linkedin, Instagram, ShieldCheck } from "lucide-react";

const Privacy = () => {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden">
            {/* Navigation Layer */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 py-3" : "bg-white py-5"}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-3 cursor-pointer">
                            <img src="/logo.png" alt="TechTycoon Logo" className="w-10 h-10 rounded-full border border-gray-200" />
                            <div className="flex flex-col">
                                <span className="text-xl font-black tracking-tight text-slate-900 uppercase leading-none">TechTycoon</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Digital Solutions LLP</span>
                            </div>
                        </Link>
                        <Link to="/" className="hidden md:block bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-all">Back to Home</Link>
                        <button className="md:hidden p-2 text-slate-900" onClick={() => setOpen(!open)}>
                            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
                {open && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-xl px-4 py-6 flex flex-col gap-4">
                        <Link to="/" className="bg-slate-900 text-white text-center font-bold py-3 rounded-lg mt-2">Back to Home</Link>
                    </div>
                )}
            </nav>

            <div className="max-w-4xl mx-auto px-6 py-40">
                <h1 className="text-5xl font-black mb-8 text-brandGreen tracking-tight">Privacy Policy</h1>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-10">Last Updated: April 27, 2026</p>
                
                <section className="mb-12">
                    <h2 className="text-2xl font-black mb-4 text-slate-900 tracking-tight text-center md:text-left">1. Information We Collect</h2>
                    <p className="text-slate-600 leading-relaxed font-normal mb-4">
                        We collect information that you provide directly to us when you register for our workshops, sign up for our newsletter, or communicate with us via WhatsApp. This includes:
                    </p>
                    <ul className="list-disc list-inside text-slate-600 space-y-2 font-normal">
                        <li>Name and contact information (Email, Phone Number)</li>
                        <li>Professional details (Job title, Industry)</li>
                        <li>Payment data (processed securely via Razorpay)</li>
                        <li>Communication history (WhatsApp messages)</li>
                    </ul>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-black mb-4 text-slate-900 tracking-tight text-center md:text-left">2. How We Use Your Information</h2>
                    <p className="text-slate-600 leading-relaxed font-normal">
                        We use the information we collect to provide, maintain, and improve our services, including processing registrations, sending workshop reminders via WhatsApp/Email, and responding to your support queries.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-black mb-4 text-slate-900 tracking-tight text-center md:text-left">3. Data Sharing</h2>
                    <p className="text-slate-600 leading-relaxed font-normal">
                        We do not sell your personal data. We only share information with third-party services necessary for our operations (e.g., Razorpay for payments, Meta for WhatsApp API, and Google for lead management).
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-black mb-4 text-slate-900 tracking-tight text-center md:text-left">4. Contact Us</h2>
                    <p className="text-slate-600 leading-relaxed font-normal">
                        If you have any questions about this Privacy Policy, please contact us at: <br />
                        <span className="text-brandGreen font-bold">techtycoondigitalsolutions@gmail.com</span>
                    </p>
                </section>
            </div>

            {/* Footer */}
            <footer id="contact" className="bg-slate-900 pt-20 pb-10 px-4 border-t border-slate-800">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <img src="/logo.png" alt="TechTycoon Logo" className="w-12 h-12 rounded-full border border-slate-700 bg-white" />
                            <div className="flex flex-col">
                                <span className="text-xl font-black tracking-tight text-white uppercase leading-none">TechTycoon</span>
                                <span className="text-[10px] font-bold text-brandGreen uppercase tracking-widest mt-0.5">Digital Solutions LLP</span>
                            </div>
                        </div>
                        <p className="text-slate-400 font-medium leading-relaxed max-w-sm">
                            Leading the charge in digital transformation. We train modern professionals, students, and corporate teams to master AI automation and generative models.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6 relative pl-3 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-brandGreen">Legal</h4>
                        <ul className="space-y-4">
                            <li><Link to="/privacy" className="text-slate-400 hover:text-brandGreen font-bold text-sm transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6 relative pl-3 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-brandGreen">Contact</h4>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3 text-slate-400">
                                <Mail className="w-4 h-4 text-brandGreen" />
                                <a href="mailto:techtycoondigitalsolutions@gmail.com" className="hover:text-brandGreen text-sm font-bold transition-colors">techtycoondigitalsolutions@gmail.com</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto border-t border-slate-800 pt-8 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        © 2026 TechTycoon Digital Solutions LLP. All Rights Reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Privacy;
