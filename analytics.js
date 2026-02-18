// GOOGLE ANALYTICS CONFIGURATION (MQ News Today)
// ID: G-0VMCLH4RD5

(function () {
    // 1. Load the gtag script asynchronously
    const script = document.createElement('script');
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=G-0VMCLH4RD5";
    document.head.appendChild(script);

    // 2. Initialize dataLayer and gtag function
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag; // Expose globally just in case

    // 3. Configure Analytics
    gtag('js', new Date());
    gtag('config', 'G-0VMCLH4RD5', {
        'page_title': document.title,
        'page_location': window.location.href,
        'page_path': window.location.pathname
    });

    console.log("GA4 Initialized: G-0VMCLH4RD5");
})();
