class Slider {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container with id "${containerId}" not found`);
            return;
        }

        this.slides = this.container.querySelectorAll('.slider-slide');
        this.currentIndex = 0;
        this.totalSlides = this.slides.length;

        this.options = {
            loop: options.loop !== undefined ? options.loop : true,
            navs: options.navs !== undefined ? options.navs : true,
            pags: options.pags !== undefined ? options.pags : true,
            auto: options.auto !== undefined ? options.auto : true,
            stopMouseHover: options.stopMouseHover !== undefined ? options.stopMouseHover : true,
            delay: options.delay !== undefined ? options.delay : 5
        };

        this.autoInterval = null;
        this.isPaused = false;

        this.init();
    }

    init() {
        if (this.totalSlides === 0) return;

        this.createControls();
        this.showSlide(this.currentIndex);
        
        if (this.options.auto) {
            this.startAutoPlay();
        }

        if (this.options.auto && this.options.stopMouseHover) {
            this.container.addEventListener('mouseenter', () => {
                this.pauseAutoPlay();
            });

            this.container.addEventListener('mouseleave', () => {
                this.resumeAutoPlay();
            });
        }
    }

    createControls() {
        if (this.options.navs) {
            const prevBtn = document.createElement('button');
            prevBtn.className = 'slider-nav slider-nav-prev';
            prevBtn.innerHTML = '&#8249;';
            prevBtn.addEventListener('click', () => this.prevSlide());
            this.container.appendChild(prevBtn);

            const nextBtn = document.createElement('button');
            nextBtn.className = 'slider-nav slider-nav-next';
            nextBtn.innerHTML = '&#8250;';
            nextBtn.addEventListener('click', () => this.nextSlide());
            this.container.appendChild(nextBtn);
        }

        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'slider-controls';

        if (this.options.pags) {
            const pagination = document.createElement('div');
            pagination.className = 'slider-pagination';
            const totalPairs = this.totalSlides - 1;
            for (let i = 0; i < totalPairs; i++) {
                const pagDot = document.createElement('button');
                pagDot.className = 'slider-pag-dot';
                if (i === 0) pagDot.classList.add('active');
                pagDot.addEventListener('click', () => this.goToSlide(i));
                pagination.appendChild(pagDot);
            }
            controlsContainer.appendChild(pagination);
        }

        const counter = document.createElement('div');
        counter.className = 'slider-counter';
        controlsContainer.appendChild(counter);

        this.container.appendChild(controlsContainer);
        this.counterElement = counter;
        this.paginationDots = controlsContainer.querySelectorAll('.slider-pag-dot');
    }

    showSlide(index) {
        this.slides.forEach((slide, i) => {
            slide.classList.remove('active');
        });
        
        if (index < this.totalSlides) {
            this.slides[index].classList.add('active');
        }
        if (index + 1 < this.totalSlides) {
            this.slides[index + 1].classList.add('active');
        }

        if (this.paginationDots) {
            this.paginationDots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        }

        if (this.counterElement) {
            const firstSlide = index + 1;
            const secondSlide = Math.min(index + 2, this.totalSlides);
            if (secondSlide > firstSlide) {
                this.counterElement.textContent = `${firstSlide}-${secondSlide}/${this.totalSlides}`;
            } else {
                this.counterElement.textContent = `${firstSlide}/${this.totalSlides}`;
            }
        }

        this.currentIndex = index;
    }

    nextSlide() {
        let nextIndex = this.currentIndex + 1;
        const maxIndex = this.totalSlides - 2;
        if (nextIndex > maxIndex) {
            nextIndex = this.options.loop ? 0 : this.currentIndex;
        }
        if (nextIndex !== this.currentIndex) {
            this.showSlide(nextIndex);
            this.resetAutoPlay();
        }
    }

    prevSlide() {
        let prevIndex = this.currentIndex - 1;
        if (prevIndex < 0) {
            const maxIndex = this.totalSlides - 2;
            prevIndex = this.options.loop ? maxIndex : this.currentIndex;
        }
        if (prevIndex !== this.currentIndex) {
            this.showSlide(prevIndex);
            this.resetAutoPlay();
        }
    }

    goToSlide(index) {
        const maxIndex = this.totalSlides - 2;
        if (index >= 0 && index <= maxIndex) {
            this.showSlide(index);
            this.resetAutoPlay();
        }
    }

    startAutoPlay() {
        if (!this.options.auto) return;
        this.autoInterval = setInterval(() => {
            if (!this.isPaused) {
                this.nextSlide();
            }
        }, this.options.delay * 1000);
    }

    pauseAutoPlay() {
        this.isPaused = true;
    }

    resumeAutoPlay() {
        this.isPaused = false;
    }

    resetAutoPlay() {
        if (this.autoInterval) {
            clearInterval(this.autoInterval);
        }
        this.startAutoPlay();
    }

    destroy() {
        if (this.autoInterval) {
            clearInterval(this.autoInterval);
        }
    }
}

