// Walker Website JavaScript

// Email Signup Modal Functions
function openEmailSignup() {
    document.getElementById('emailModal').style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeEmailSignup() {
    document.getElementById('emailModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Handle email signup form submission
function handleEmailSignup(event) {
    event.preventDefault();
    
    const emailInput = document.getElementById('emailInput');
    const email = emailInput.value;
    const successMessage = document.getElementById('emailSuccess');
    const form = document.getElementById('emailForm');
    
    // Basic email validation
    if (!isValidEmail(email)) {
        alert('Please enter a valid email address.');
        return;
    }
    
    // TODO: Replace with your actual email collection service
    // For now, we'll simulate a successful signup
    console.log('Email signup:', email);
    
    // Hide form and show success message
    form.style.display = 'none';
    successMessage.style.display = 'block';
    
    // Store email locally for now (replace with actual service)
    storeEmailLocally(email);
    
    // Auto close after 3 seconds
    setTimeout(() => {
        closeEmailSignup();
        form.style.display = 'block';
        successMessage.style.display = 'none';
        emailInput.value = '';
    }, 3000);
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Store email locally (replace with actual service)
function storeEmailLocally(email) {
    let emails = JSON.parse(localStorage.getItem('walkerEmails') || '[]');
    if (!emails.includes(email)) {
        emails.push({
            email: email,
            timestamp: new Date().toISOString(),
            source: 'homepage'
        });
        localStorage.setItem('walkerEmails', JSON.stringify(emails));
    }
}

// FAQ Toggle Functionality
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        // Initially hide all answers
        answer.style.display = 'none';
        
        question.addEventListener('click', () => {
            const isOpen = answer.style.display === 'block';
            
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                const otherAnswer = otherItem.querySelector('.faq-answer');
                otherAnswer.style.display = 'none';
                otherItem.classList.remove('active');
            });
            
            // Toggle current item
            if (!isOpen) {
                answer.style.display = 'block';
                item.classList.add('active');
            }
        });
    });
}

// Smooth scrolling for navigation links
function initializeSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerOffset = 80; // Account for sticky header
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Mobile menu toggle (basic functionality)
function initializeMobileMenu() {
    const mobileToggle = document.querySelector('.nav-mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-open');
        });
    }
}

// Close modal when clicking outside
function initializeModalClose() {
    const modal = document.getElementById('emailModal');
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeEmailSignup();
        }
    });
}

// Keyboard accessibility for modal
function initializeKeyboardSupport() {
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('emailModal');
        
        // Close modal on Escape key
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeEmailSignup();
        }
        
        // Enter key to open email signup from CTA buttons
        const ctaButtons = document.querySelectorAll('.cta-primary');
        ctaButtons.forEach(button => {
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    openEmailSignup();
                }
            });
        });
    });
}

// Analytics tracking (placeholder)
function trackEvent(eventName, properties = {}) {
    // TODO: Replace with your analytics service (Google Analytics, Mixpanel, etc.)
    console.log('Track event:', eventName, properties);
    
    // Example for Google Analytics (gtag)
    // if (typeof gtag !== 'undefined') {
    //     gtag('event', eventName, properties);
    // }
}

// Track CTA clicks
function initializeAnalytics() {
    // Track email signup attempts
    document.getElementById('emailForm').addEventListener('submit', () => {
        trackEvent('email_signup_attempt', {
            source: 'homepage_modal'
        });
    });
    
    // Track WhatsApp button clicks
    const whatsappButtons = document.querySelectorAll('a[href*="whatsapp"]');
    whatsappButtons.forEach(button => {
        button.addEventListener('click', () => {
            trackEvent('whatsapp_click', {
                source: 'homepage'
            });
        });
    });
    
    // Track navigation clicks
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            trackEvent('navigation_click', {
                page: link.textContent.toLowerCase(),
                href: link.getAttribute('href')
            });
        });
    });
}

// Lazy loading for images (if you add any)
function initializeLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => imageObserver.observe(img));
    }
}

// Performance monitoring
function initializePerformance() {
    // Monitor page load performance
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
            
            trackEvent('page_performance', {
                load_time: loadTime,
                dom_content_loaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart
            });
        }, 0);
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeFAQ();
    initializeSmoothScrolling();
    initializeMobileMenu();
    initializeModalClose();
    initializeKeyboardSupport();
    initializeAnalytics();
    initializeLazyLoading();
    initializePerformance();
    
    // Add loading class removal after page loads
    document.body.classList.add('loaded');
    
    console.log('Walker website initialized successfully!');
});

// Service worker registration (for future PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        openEmailSignup,
        closeEmailSignup,
        handleEmailSignup,
        isValidEmail,
        trackEvent
    };
}