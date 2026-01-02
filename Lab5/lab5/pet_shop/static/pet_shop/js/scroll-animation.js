document.addEventListener('DOMContentLoaded', function() {
    const scrollContainer = document.querySelector('.scroll-animation-container');
    if (!scrollContainer) return;

    const fishes = scrollContainer.querySelectorAll('.scroll-fish');
    
    function updateAnimation() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const scrollProgress = maxScroll > 0 ? scrollTop / maxScroll : 0;
        
        fishes.forEach((fish, index) => {
            const rotationSpeed = (index % 3 + 1) * 0.5;
            const direction = index % 2 === 0 ? 1 : -1;
            const rotation = scrollProgress * 360 * rotationSpeed * direction;
            
            fish.style.transform = `rotate(${rotation}deg)`;
        });
    }
    
    let ticking = false;
    
    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateAnimation();
                ticking = false;
            });
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', onScroll, { passive: true });
    
    updateAnimation();
});

