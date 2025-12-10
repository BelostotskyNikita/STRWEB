document.addEventListener('DOMContentLoaded', function() {
    const sliderContainer = document.getElementById('main-slider');
    if (!sliderContainer) return;

    const slides = sliderContainer.querySelectorAll('.slider-slide');
    if (slides.length === 0) return;

    const getBooleanAttribute = (attr) => {
        const value = sliderContainer.getAttribute(attr);
        return value === 'true';
    };

    const options = {
        loop: getBooleanAttribute('data-loop'),
        navs: getBooleanAttribute('data-navs'),
        pags: getBooleanAttribute('data-pags'),
        auto: getBooleanAttribute('data-auto'),
        stopMouseHover: getBooleanAttribute('data-stop-mouse-hover'),
        delay: parseInt(sliderContainer.getAttribute('data-delay')) || 5
    };
    
    const slider = new Slider('main-slider', options);
});

