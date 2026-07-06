import { useEffect, useRef } from 'react';

export const AdBanner728x90 = () => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adRef.current && adRef.current.children.length === 0) {
      const configScript = document.createElement('script');
      configScript.type = 'text/javascript';
      configScript.innerHTML = `
        atOptions = {
          'key' : 'd8ca988a31e083d1d4a1964fb74c2fca',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `;
      adRef.current.appendChild(configScript);

      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = 'https://www.highperformanceformat.com/d8ca988a31e083d1d4a1964fb74c2fca/invoke.js';
      adRef.current.appendChild(invokeScript);
    }
  }, []);

  return (
    <div className="w-full flex justify-center py-6 px-4 overflow-hidden">
      <div ref={adRef} className="max-w-full" />
    </div>
  );
};

export const NativeBanner = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && containerRef.current.children.length === 0) {
      const script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = 'https://pl30225497.effectivecpmnetwork.com/3ebe57419059811ac5a8e274fd752b6d/invoke.js';
      
      const container = document.createElement('div');
      container.id = 'container-3ebe57419059811ac5a8e274fd752b6d';
      
      containerRef.current.appendChild(script);
      containerRef.current.appendChild(container);
    }
  }, []);

  return (
    <div className="w-full py-6 px-4">
      <div ref={containerRef} />
    </div>
  );
};
