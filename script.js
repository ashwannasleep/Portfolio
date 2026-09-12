// Portfolio JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavigation();
    initThemeToggle();
    // Section reveals are handled by experience.js without transforming
    // the scrolling showcase's sticky ancestors.
    initGallery();
    initSmoothScrolling();
    initTypingHeading();
    // Apple Music integration is initialized in apple-music-integration.js
    initProjectDetails();
    initProgressBar();
});

// Navigation functionality
function initNavigation() {
    const body = document.body;
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    const closeMobileMenu = () => {
        if (!navMenu || !hamburger) return;
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
        body.classList.remove('menu-open');
    };

    // Mobile menu toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', (event) => {
            event.stopPropagation();
            const isActive = navMenu.classList.toggle('active');
            hamburger.classList.toggle('active', isActive);
            body.classList.toggle('menu-open', isActive);
        });

        navMenu.addEventListener('click', (event) => {
            event.stopPropagation();
        });

        document.addEventListener('click', closeMobileMenu);

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                closeMobileMenu();
            }
        });
    }

    // Close mobile menu when clicking on links
    navLinks.forEach((link) => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Active link highlighting
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const correspondingLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            // Sections without a nav link (e.g. #focus) shouldn't clear the
            // current highlight — leave the previous section's link active.
            if (!correspondingLink) return;

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                correspondingLink.classList.add('active');
            }
        });
    });
}

// Mobile typing effect for hero name (avoids CSS width/ch spacing artifacts)
function initTypingHeading() {
    if (!window.matchMedia('(max-width: 767px)').matches) return;

    const typingHeadings = document.querySelectorAll('.typing-heading');
    if (!typingHeadings.length) return;

    typingHeadings.forEach((heading) => {
        if (heading.dataset.mobileTyped === 'true') return;

        const fullText = (heading.dataset.fullText || heading.textContent || '').trim();
        if (!fullText) return;

        heading.dataset.mobileTyped = 'true';
        heading.dataset.fullText = fullText;
        heading.textContent = '';

        // Keep only cursor blink on mobile; JS controls character reveal.
        heading.style.width = 'auto';
        heading.style.maxWidth = '100%';
        heading.style.overflow = 'visible';
        heading.style.whiteSpace = 'nowrap';
        heading.style.animation = 'blink 0.75s step-end infinite';

        let charIndex = 0;
        const typeStep = () => {
            charIndex += 1;
            heading.textContent = fullText.slice(0, charIndex);
            if (charIndex < fullText.length) {
                window.setTimeout(typeStep, 95);
            }
        };

        window.setTimeout(typeStep, 160);
    });
}

// Theme toggle functionality - SIMPLIFIED AND WORKING
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Apply initial theme
    setTheme(savedTheme, false);
    
    // Add click event listener
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const isDark = document.body.classList.contains('dark-mode');
            setTheme(isDark ? 'light' : 'dark');
        });
    }
}

function setTheme(theme, persist = true) {
    const body = document.body;
    const normalizedTheme = theme === 'dark' ? 'dark' : 'light';

    body.classList.toggle('dark-mode', normalizedTheme === 'dark');
    updateThemeIcon(normalizedTheme);
    updateThemeColor(normalizedTheme);

    if (persist) {
        localStorage.setItem('theme', normalizedTheme);
    }
}

function updateThemeColor(theme) {
    const color = theme === 'dark' ? '#0A0A0A' : '#FAFAFA';
    let themeMeta = document.querySelector('meta[name="theme-color"]');

    if (!themeMeta) {
        themeMeta = document.createElement('meta');
        themeMeta.setAttribute('name', 'theme-color');
        document.head.appendChild(themeMeta);
    }

    themeMeta.setAttribute('content', color);
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('#theme-toggle i');
    if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Scroll effects
function initScrollEffects() {
    const backToTopBtn = document.getElementById('backToTop');
    
    // Back to top button
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });
    
    // Back to top functionality
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Scroll animations with Intersection Observer - Faster and earlier trigger
    const observerOptions = {
        threshold: 0.05,
        rootMargin: '0px 0px 100px 0px' // Trigger 100px before element enters viewport
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for animation - Faster transitions, minimal delay
    const animatedElements = document.querySelectorAll('.focus-card, .interest-item, .project-card, .contact-link, .cert-card, .learning-card');
    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(15px)'; // Reduced from 30px
        // Faster transition (0.3s), minimal delay (0.02s per item)
        el.style.transition = `opacity 0.3s ease ${index * 0.02}s, transform 0.3s ease ${index * 0.02}s`;
        observer.observe(el);
    });
    
    // Animate sections on load (only once) - Faster
    const sections = document.querySelectorAll('section');
    let sectionsAnimated = false;
    
    const animateSections = () => {
        if (sectionsAnimated) return;
        sectionsAnimated = true;
        
        sections.forEach((section, index) => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(10px)'; // Reduced from 20px
            setTimeout(() => {
                // Faster transition (0.4s), minimal delay (0.05s per section)
                section.style.transition = `opacity 0.4s ease ${index * 0.05}s, transform 0.4s ease ${index * 0.05}s`;
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }, 10); // Reduced from 50ms
        });
    };
    
    // Trigger on load
    if (document.readyState === 'loading') {
        window.addEventListener('load', animateSections);
    } else {
        animateSections();
    }
}

// Photo gallery functionality - Continuous clockwise rotation with all photos moving
function initGallery() {
    const hiddenSlides = document.querySelectorAll('.gallery-slide.hidden');
    const slideFront = document.querySelector('.slide-front');
    const slideMiddle = document.querySelector('.slide-middle');
    const slideBack = document.querySelector('.slide-back');
    
    if (!hiddenSlides.length || !slideFront || !slideMiddle || !slideBack) return;
    
    const totalSlides = hiddenSlides.length;
    let currentIndex = 2; // Start with third image (index 2)
    let rotationTime = 0; // Time-based rotation
    
    // Get image sources from hidden slides
    const imageSources = Array.from(hiddenSlides).map(slide => {
        const img = slide.querySelector('img');
        return img ? img.src : '';
    });
    
    function updateImages() {
        // Calculate indices for triangle positions
        const frontIndex = currentIndex;
        const middleIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        const backIndex = (currentIndex - 2 + totalSlides) % totalSlides;
        
        // Update images
        const imgFront = slideFront.querySelector('img');
        const imgMiddle = slideMiddle.querySelector('img');
        const imgBack = slideBack.querySelector('img');
        
        if (imgFront && imageSources[frontIndex]) {
            imgFront.src = imageSources[frontIndex];
        }
        if (imgMiddle && imageSources[middleIndex]) {
            imgMiddle.src = imageSources[middleIndex];
        }
        if (imgBack && imageSources[backIndex]) {
            imgBack.src = imageSources[backIndex];
        }
    }
    
    function updateRotation() {
        // Increment rotation time (controls speed)
        rotationTime += 0.002; // Adjust for speed (0.002 = ~5 seconds per full cycle, slower)
        
        // Calculate progress (0 to 1, loops)
        const progress = rotationTime % 1;
        
        // Three positions in triangle, each photo moves through all three
        // Front: progress 0-0.33 = front position, 0.33-0.66 = middle, 0.66-1 = back
        // Middle: offset by 0.33
        // Back: offset by 0.66
        
        function getPosition(offset) {
            const pos = (progress + offset) % 1;
            let x, y, size, opacity, zIndex, rotation;
            
            if (pos < 0.33) {
                // Front position (center-right)
                x = -40; // Center-right
                y = -50;
                size = 0.75; // Fixed size, no zoom
                opacity = 1;
                zIndex = 3;
                rotation = 0; // No rotation at front
            } else if (pos < 0.66) {
                // Middle position (left)
                x = -80;
                y = -50;
                size = 0.6; // Fixed size, no zoom
                opacity = 0.85;
                zIndex = 2;
                rotation = -8; // Fixed rotation
            } else {
                // Back position (right)
                x = -10;
                y = -50;
                size = 0.55; // Fixed size, no zoom
                opacity = 0.7;
                zIndex = 1;
                rotation = 6; // Fixed rotation
            }
            
            return { x, y, size, opacity, zIndex, rotation };
        }
        
        // Update all three photos continuously - smooth 2D rotation
        const frontPos = getPosition(0);
        slideFront.style.width = (frontPos.size * 100) + '%';
        slideFront.style.height = (frontPos.size * 100) + '%';
        slideFront.style.transform = `translate(${frontPos.x}%, ${frontPos.y}%) rotate(${frontPos.rotation}deg)`;
        slideFront.style.zIndex = frontPos.zIndex;
        slideFront.style.opacity = frontPos.opacity;
        
        const middlePos = getPosition(0.33);
        slideMiddle.style.width = (middlePos.size * 100) + '%';
        slideMiddle.style.height = (middlePos.size * 100) + '%';
        slideMiddle.style.transform = `translate(${middlePos.x}%, ${middlePos.y}%) rotate(${middlePos.rotation}deg)`;
        slideMiddle.style.zIndex = middlePos.zIndex;
        slideMiddle.style.opacity = middlePos.opacity;
        
        const backPos = getPosition(0.66);
        slideBack.style.width = (backPos.size * 100) + '%';
        slideBack.style.height = (backPos.size * 100) + '%';
        slideBack.style.transform = `translate(${backPos.x}%, ${backPos.y}%) rotate(${backPos.rotation}deg)`;
        slideBack.style.zIndex = backPos.zIndex;
        slideBack.style.opacity = backPos.opacity;
        
        // Update images when cycle completes
        if (Math.floor(rotationTime) > Math.floor(rotationTime - 0.002)) {
            currentIndex = (currentIndex + 1) % totalSlides;
            updateImages();
        }
        
        // Continue animation
        requestAnimationFrame(updateRotation);
    }
    
    // Initialize with first three images
    updateImages();
    
    // Start continuous rotation
    updateRotation();
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.getBoundingClientRect().top + window.scrollY - 90;
                window.scrollTo({
                    top: offsetTop,
                    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
                });
            }
        });
    });
}

// Apple Music integration is handled in apple-music-integration.js
// The AppleMusicIntegration class initializes automatically when the script loads

// Progress bar animation
function initProgressBar() {
    const progressBar = document.querySelector('.progress-fill');
    const progressPercent = document.querySelector('.progress-percent');
    
    if (!progressBar || !progressPercent) return;
    
    const targetProgress = 65; // Target percentage
    let currentProgress = 0;
    const duration = 2000; // 2 seconds
    const increment = targetProgress / (duration / 16); // 60fps
    
    // Use Intersection Observer to trigger animation when element is visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && currentProgress === 0) {
                animateProgress();
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.3
    });
    
    const progressContainer = progressBar.closest('.current-work-card');
    if (progressContainer) {
        observer.observe(progressContainer);
    }
    
    function animateProgress() {
        // Reset to 0
        progressBar.style.width = '0%';
        progressPercent.textContent = '0%';
        
        const interval = setInterval(() => {
            currentProgress += increment;
            
            if (currentProgress >= targetProgress) {
                currentProgress = targetProgress;
                clearInterval(interval);
            }
            
            progressBar.style.width = currentProgress + '%';
            progressPercent.textContent = Math.round(currentProgress) + '%';
        }, 16); // ~60fps
    }
}

// Error handling
window.addEventListener('error', (e) => {
    console.error('Portfolio error:', e.error);
});

// Project Details functionality
function initProjectDetails() {
    const detailButtons = document.querySelectorAll('.project-details-btn');
    if (!detailButtons.length) return;

    const modal = document.createElement('div');
    modal.className = 'project-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
        <div class="project-modal-overlay" data-modal-close></div>
        <div class="project-modal-content" role="dialog" aria-modal="true" aria-labelledby="project-modal-title">
            <div class="project-modal-header">
                <h4 id="project-modal-title"></h4>
                <button class="project-modal-close" type="button" aria-label="Close project details">
                    <span aria-hidden="true">×</span>
                </button>
            </div>
            <div class="project-modal-body"></div>
        </div>
    `;
    document.body.appendChild(modal);

    const modalTitle = modal.querySelector('#project-modal-title');
    const modalBody = modal.querySelector('.project-modal-body');
    const modalCloseBtn = modal.querySelector('.project-modal-close');
    const modalOverlay = modal.querySelector('.project-modal-overlay');
    let activeButton = null;

    const resetButtonState = () => {
        detailButtons.forEach((btn) => btn.classList.remove('active'));
        if (activeButton) {
            activeButton.focus();
        }
        activeButton = null;
    };

    const closeModal = () => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('project-modal-open');
        resetButtonState();
    };

    const handleKeydown = (event) => {
        if (event.key === 'Escape') {
            closeModal();
        }
    };

    const openModal = (button, details, title) => {
        if (!modalBody || !modalTitle) return;

        detailButtons.forEach((btn) => btn.classList.remove('active'));
        button.classList.add('active');
        activeButton = button;

        modalTitle.textContent = title || 'Project Details';
        modalBody.innerHTML = details.innerHTML;
        modalBody.scrollTop = 0;

        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('project-modal-open');
        modalCloseBtn?.focus();
    };

    detailButtons.forEach((button) => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            const projectId = button.getAttribute('data-project');
            const details = document.getElementById(`${projectId}-details`);
            const projectTitle = button.closest('.project-info')?.querySelector('h4')?.textContent?.trim();
            if (!details) return;

            const isAlreadyOpen = modal.classList.contains('active') && activeButton === button;
            if (isAlreadyOpen) {
                closeModal();
                return;
            }

            openModal(button, details, projectTitle);
        });
    });

    modalCloseBtn?.addEventListener('click', closeModal);
    modalOverlay?.addEventListener('click', closeModal);
    document.addEventListener('keydown', handleKeydown);
}
