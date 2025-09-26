// Modern Carousel Handler
class ModernCarousel {
    constructor() {
        this.currentSlide = 0;
        this.slides = [];
        this.navDots = [];
        this.autoSlideInterval = null;
        this.isTransitioning = false;
        
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupCarousel());
        } else {
            this.setupCarousel();
        }
    }
    
    setupCarousel() {
        this.slides = document.querySelectorAll('.slide');
        this.navDots = document.querySelectorAll('.nav-dot');
        
        if (this.slides.length === 0) return;
        
        // Set background images for slides
        this.slides.forEach(slide => {
            const bgUrl = slide.dataset.bg;
            if (bgUrl) {
                slide.style.backgroundImage = `url(${bgUrl})`;
            }
        });
        
        // Setup navigation
        this.setupNavigation();
        
        // Start autoplay
        this.startAutoplay();
        
        // Setup touch/swipe support
        this.setupTouchSupport();
        
        console.log('🎠 Modern Carousel initialized with', this.slides.length, 'slides');
    }
    
    setupNavigation() {
        // Navigation dots
        this.navDots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Arrow buttons
        const prevBtn = document.getElementById('prev-slide');
        const nextBtn = document.getElementById('next-slide');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousSlide());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextSlide());
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.previousSlide();
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
            }
        });
    }
    
    setupTouchSupport() {
        let startX = 0;
        let endX = 0;
        
        const carousel = document.querySelector('.hero-carousel');
        if (!carousel) return;
        
        carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });
        
        carousel.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            this.handleSwipe(startX, endX);
        });
    }
    
    handleSwipe(startX, endX) {
        const threshold = 50; // minimum distance for swipe
        const diff = startX - endX;
        
        if (Math.abs(diff) < threshold) return;
        
        if (diff > 0) {
            // Swipe left - next slide
            this.nextSlide();
        } else {
            // Swipe right - previous slide
            this.previousSlide();
        }
    }
    
    goToSlide(index) {
        if (this.isTransitioning || index === this.currentSlide) return;
        
        this.isTransitioning = true;
        
        // Remove active class from current slide and dot
        this.slides[this.currentSlide].classList.remove('active');
        this.navDots[this.currentSlide].classList.remove('active');
        
        // Update current slide
        this.currentSlide = index;
        
        // Add active class to new slide and dot
        this.slides[this.currentSlide].classList.add('active');
        this.navDots[this.currentSlide].classList.add('active');
        
        // Reset transition lock after animation
        setTimeout(() => {
            this.isTransitioning = false;
        }, 800);
        
        // Restart autoplay
        this.restartAutoplay();
        
        console.log('🎯 Switched to slide', index + 1);
    }
    
    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(nextIndex);
    }
    
    previousSlide() {
        const prevIndex = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
        this.goToSlide(prevIndex);
    }
    
    startAutoplay() {
        this.autoSlideInterval = setInterval(() => {
            if (!this.isTransitioning) {
                this.nextSlide();
            }
        }, 5000); // Change slide every 5 seconds
    }
    
    stopAutoplay() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }
    
    restartAutoplay() {
        this.stopAutoplay();
        this.startAutoplay();
    }
    
    // Pause autoplay when user hovers over carousel
    pauseOnHover() {
        const carousel = document.querySelector('.hero-carousel');
        if (!carousel) return;
        
        carousel.addEventListener('mouseenter', () => this.stopAutoplay());
        carousel.addEventListener('mouseleave', () => this.startAutoplay());
    }
}

// Enhanced Home Page Functions
class ModernHomePage {
    constructor() {
        this.carousel = null;
        this.init();
    }
    
    init() {
        // Initialize carousel
        this.carousel = new ModernCarousel();
        
        // Setup additional home page functionality
        this.setupCategoryCards();
        this.setupScrollAnimations();
        this.setupButtonHandlers();
        this.setupDashboard();
        
        console.log('🏠 Modern HomePage initialized');
    }
    
    setupCategoryCards() {
        const categoryCards = document.querySelectorAll('.category-card.modern');
        
        categoryCards.forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                console.log('🏷️ Category clicked:', category);
                
                // Navigate to products with category filter
                if (window.viewManager) {
                    window.viewManager.loadView('products/list', { selectedCategory: category });
                }
            });
            
            // Add hover sound effect (optional)
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }
    
    setupScrollAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
                }
            });
        }, observerOptions);
        
        // Observe elements for animation
        const animatedElements = document.querySelectorAll('.feature-card, .category-card.modern, .section-title');
        animatedElements.forEach(el => observer.observe(el));
    }
    
    setupButtonHandlers() {
        // Browse Products buttons
        const browseButtons = document.querySelectorAll('#browse-products, #browse-products-cta');
        browseButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.viewManager) {
                    window.viewManager.loadView('products/list');
                }
            });
        });
        
        // Learn More button
        const learnMoreBtn = document.getElementById('learn-more');
        if (learnMoreBtn) {
            learnMoreBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Smooth scroll to features section
                document.querySelector('.features-section').scrollIntoView({
                    behavior: 'smooth'
                });
            });
        }
    }
    
    setupDashboard() {
        // Animate real-time counters
        this.animateRealtimeStats();
        
        // Setup periodic updates for real-time stats
        setInterval(() => {
            this.updateRealtimeStats();
        }, 5000); // Update every 5 seconds
        
        console.log('📊 Dashboard animations setup completed');
    }
    
    animateRealtimeStats() {
        const onlineUsers = document.getElementById('online-users');
        const todayDownloads = document.getElementById('today-downloads');
        const tutorialViews = document.getElementById('tutorial-views');
        
        if (onlineUsers) {
            this.animateCounter(onlineUsers, 1247, 2000);
        }
        if (todayDownloads) {
            this.animateCounter(todayDownloads, 342, 2500);
        }
        if (tutorialViews) {
            this.animateCounter(tutorialViews, 89, 1500);
        }
    }
    
    animateCounter(element, target, duration) {
        const start = 0;
        const startTime = performance.now();
        
        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(start + (target - start) * easeOutQuart);
            
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };
        
        requestAnimationFrame(updateCounter);
    }
    
    updateRealtimeStats() {
        const onlineUsers = document.getElementById('online-users');
        const todayDownloads = document.getElementById('today-downloads');
        const tutorialViews = document.getElementById('tutorial-views');
        
        // Generate small random fluctuations
        if (onlineUsers) {
            const currentUsers = parseInt(onlineUsers.textContent.replace(',', ''));
            const variation = Math.floor(Math.random() * 20) - 10; // ±10 users
            const newUsers = Math.max(1200, currentUsers + variation);
            this.smoothUpdateCounter(onlineUsers, newUsers);
        }
        
        if (todayDownloads) {
            const currentDownloads = parseInt(todayDownloads.textContent);
            const increment = Math.floor(Math.random() * 5) + 1; // +1 to +5
            const newDownloads = currentDownloads + increment;
            this.smoothUpdateCounter(todayDownloads, newDownloads);
        }
        
        if (tutorialViews) {
            const currentViews = parseInt(tutorialViews.textContent);
            const increment = Math.floor(Math.random() * 3) + 1; // +1 to +3
            const newViews = currentViews + increment;
            this.smoothUpdateCounter(tutorialViews, newViews);
        }
    }
    
    smoothUpdateCounter(element, newValue) {
        const currentValue = parseInt(element.textContent.replace(',', ''));
        const diff = newValue - currentValue;
        const duration = 800;
        const startTime = performance.now();
        
        const updateValue = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeInOutQuad = progress < 0.5 
                ? 2 * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
                
            const current = Math.floor(currentValue + diff * easeInOutQuad);
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateValue);
            }
        };
        
        requestAnimationFrame(updateValue);
    }
}

// Initialize when DOM is ready
function initializeCarousel() {
    // Esperar a que ViewManager cargue la vista
    setTimeout(() => {
        if (document.querySelector('.hero-carousel')) {
            window.modernHomePage = new ModernHomePage();
            console.log('🎠 Carousel initialized after view load');
        } else {
            // Reintentar si no encuentra el carrusel
            setTimeout(initializeCarousel, 500);
        }
    }, 100);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCarousel);
} else {
    initializeCarousel();
}