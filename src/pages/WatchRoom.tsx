import React, { useEffect } from 'react';

const WatchRoom: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);

        // Load the watch room JS script dynamically
        const scriptSrc = "https://web.funnelsdone.com/js/ewk_watch_v1.js";
        if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
            const script = document.createElement('script');
            script.src = scriptSrc;
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    return (
        <div className="w-full h-screen overflow-hidden bg-slate-950">
            <iframe 
                id="wk_watch_room_iframe" 
                data-wk-base-url="https://web.funnelsdone.com/webinar/watch/6a48e4ca9ae9f98813e853b6" 
                style={{ width: '100%', height: '100vh', border: 0 }} 
                allow="camera; microphone; display-capture; autoplay;"
                title="Webinar Watch Room"
            />
        </div>
    );
};

export default WatchRoom;
