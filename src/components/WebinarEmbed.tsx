import React, { useEffect, useRef } from 'react';

const WebinarEmbed: React.FC = () => {
    const embedRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load CSS files
        const cssFiles = [
            "https://cdn.jsdelivr.net/npm/intl-tel-input@19.5.6/build/css/intlTelInput.css",
            "https://web.funnelsdone.com/css/ewk_v5.css?cache=5"
        ];

        cssFiles.forEach(href => {
            if (!document.querySelector(`link[href="${href}"]`)) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = href;
                document.head.appendChild(link);
            }
        });

        // Load JS files sequentially to respect dependencies
        const loadScript = (src: string) => {
            return new Promise((resolve, reject) => {
                if (document.querySelector(`script[src="${src}"]`)) {
                    resolve(true);
                    return;
                }
                const script = document.createElement('script');
                script.src = src;
                script.async = false; // Important to preserve execution order
                script.onload = resolve;
                script.onerror = reject;
                document.body.appendChild(script);
            });
        };

        const initScripts = async () => {
            try {
                await loadScript("https://cdn.jsdelivr.net/npm/intl-tel-input@19.5.6/build/js/intlTelInput.min.js");
                await loadScript("https://cdn.jsdelivr.net/npm/luxon@3.4.4/build/global/luxon.min.js");
                await loadScript("https://web.funnelsdone.com/js/ewk_v7.js?v=7");
                await loadScript("https://web.funnelsdone.com/js/ewk_i.js?v=1");
            } catch (error) {
                console.error("Failed to load webinar scripts", error);
            }
        };

        initScripts();
    }, []);

    const rawHtml = `
<style>@media (max-width: 1e+09px) {  #wk_element_5593219dd237183413d27d0e5acd74ac { width: 540px; max-width: 100%; min-height: 16px; padding: 0px; margin: 0px auto; border-style: none; background: rgba(0, 0, 0, 0); }  #wk_element_5593219dd237183413d27d0e5acd74ac_calendar { background: rgb(51, 94, 234); }  #wk_element_45f8e93c3ca45229d03dbfdfd50fb418 { width: 540px; max-width: 100%; min-height: 16px; padding: 0px 16px 16px; margin: 0px auto; border-style: none; background: rgba(0, 0, 0, 0); }  #wk_element_d1217a9bd4050e903e6ed0eb69757d18 { width: 100%; max-width: 100%; min-height: 0px; padding: 0px; margin: 0px; border-style: none; background: rgba(0, 0, 0, 0); font-family: HKGroteskPro, serif; font-size: 16px; line-height: 1.35; letter-spacing: 0px; }  #wk_element_d1217a9bd4050e903e6ed0eb69757d18 :not(:last-child) { margin-bottom: 0px; }  #wk_element_3faa4a3b321e808bea1bb2a1728b1a2b { width: 540px; max-width: 100%; min-height: 16px; padding: 0px; margin: 0px auto 16px; border-style: none; background: rgba(0, 0, 0, 0); }  #wk_element_ef686ab4d9d28244630f2a52414694f4 { max-width: 540px; min-height: 16px; padding: 16px; margin: 0px auto; border-style: solid; border-color: rgb(255, 255, 255); border-width: 0px; border-radius: 16px; background: rgb(255, 255, 255); }  #wk_element_c6dd61bac74fea356fdc37879dfce67d { width: 100%; max-width: 100%; min-height: 0px; padding: 0px; margin: 0px; border-style: none; background: rgba(0, 0, 0, 0); font-family: HKGroteskPro, serif; font-size: 16px; line-height: 1.5; letter-spacing: 0px; display: flex; }  #wk_element_c6dd61bac74fea356fdc37879dfce67d :not(:last-child) { margin-bottom: 0px; }  #wk_element_e8f171a2c4dca2835f2cf81ff6b3ccba { width: 540px; max-width: 100%; min-height: 16px; padding: 0px; margin: 0px auto; border-style: none; background: rgba(0, 0, 0, 0); }  #wk_element_3faa4a3b321e808bea1bb2a1728b1a2b_calendar { background: rgb(51, 94, 234); }}@media (max-width: 992px) {}@media (max-width: 768px) {}</style><div class="wk_root" style="width: 100%; z-index: 100000;"><div class="wk_ascend_tree wk_editor_hide_tooltips col-12 col-md my-auto shadow wk_column" id="wk_element_ef686ab4d9d28244630f2a52414694f4" data-custom-css-classes="shadow" data-wk-background-type="solid" data-wk-border-style="solid" data-wk-border-style-desktop="solid" data-wk-background-type-desktop="solid"> <div class="wk_editor_hide_tooltips wk_thank_you_timer" calendar="hide" data-classes="wk_thank_you_timer" data-wk-date-format-type="en-US" data-wk-days-label="days" data-wk-entering-label="Entering event watch room..." data-wk-expired-label="Sorry, this event session has ended!" data-wk-hours-label="hours" data-wk-minutes-label="minutes" data-wk-seconds-label="seconds" data-wk-starts-in-label="Webinar starts in:" data-wk-webinar-id="6a3a66d3156b98b7ad30d16f" id="wk_element_3faa4a3b321e808bea1bb2a1728b1a2b" timer_size="small" data-wk-border-style-desktop="default" data-wk-background-type-desktop="default"> <div class="wk_row_internal mx-0"> <div class="wk_timer px-0 col"> <div class="rounded-2 mx-auto shadow wk_calendar" style="max-width:170px; background: #fff; display: none"> <div class="wk_calendar_color" style="border-top-left-radius: .375rem; border-top-right-radius: .375rem" id="wk_element_3faa4a3b321e808bea1bb2a1728b1a2b_calendar"> <h5 class="text-center fw-bold py-2 text-uppercase text-white wk_calendar_month">July</h5> </div> <h1 class="text-center fw-bold mb-2 pb-2 wk_calendar_day">7</h1> </div> <h5 class="text-center mb-4 mt-5 wk_calendar_header" style="display:none"><i class="fa-clock fa-regular"></i><span class="wk_calendar_time"> 5:44 PM GMT+5:30</span></h5> <h6 class="text-center fw-bold wk_timer_header">Webinar starts in:</h6> <div class="wk_row_internal mx-auto wk_timer_row"> <div class="px-0 col-3"> <h5 class="text-center mb-0 wk_timer_days">0</h5> <h6 class="text-center mb-0 wk_timer_days_label">days</h6> </div> <div class="px-0 col-3"> <h5 class="text-center mb-0 wk_timer_hours">0</h5> <h6 class="text-center mb-0 wk_timer_hours_label">hours</h6> </div> <div class="px-0 col-3"> <h5 class="text-center mb-0 wk_timer_minutes">0</h5> <h6 class="text-center mb-0 wk_timer_minutes_label">minutes</h6> </div> <div class="px-0 col-3"> <h5 class="text-center mb-0 wk_timer_seconds">0</h5> <h6 class="text-center mb-0 wk_timer_seconds_label">seconds</h6> </div> </div> </div> </div> </div> <div class="wk_thank_you_session_link" id="wk_element_e8f171a2c4dca2835f2cf81ff6b3ccba" data-classes="wk_thank_you_session_link" data-wk-webinar-id="6a3a66d3156b98b7ad30d16f" data-wk-background-type-desktop="default" data-wk-border-style-desktop="default"> <div class="wk_ascend_tree wk_row_internal mx-0"> <div class="text-center col mx-auto px-0 wk_ascend_tree"> <div class="wk_ascend_tree wk_editor_hide_tooltips wk_text" id="wk_element_c6dd61bac74fea356fdc37879dfce67d" data-wk-background-type-desktop="default" data-wk-border-style-desktop="default"> <div contenteditable="false" style="width: 100%; margin-top: auto; margin-bottom: auto;"> <h6><b>Your webinar session link:</b></h6> </div> </div> <div class="input-group input-group-lg mt-1"><input class="form-control wk_webinar_session_link" style="background-color: #f1f4f8; border-color: #f1f4f8;" readonly=""><button class="btn wk_copy_link_button" data-bs-container="body" data-bs-content="Link copied to clipboard!" data-bs-original-title="" data-bs-placement="top" data-bs-toggle="popover" style="color: inherit; background-color: rgba(80,102,144,.1)" type="button"><i class="fa-copy far" style="width: 19.125px"></i></button></div> </div> </div> </div> </div></div>
    `;

    return (
        <div 
            ref={embedRef} 
            dangerouslySetInnerHTML={{ __html: rawHtml }} 
            className="w-full mt-8 flex justify-center"
        />
    );
};

export default WebinarEmbed;
