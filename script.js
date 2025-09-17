// Walker Website JavaScript

// Email Signup Modal Functions
function openEmailSignup() {
    document.getElementById('emailModal').style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    // Set timestamp when modal opens
    const timestamp = new Date().toISOString();
    const timestampField = document.querySelector('input[name="timestamp"]');
    if (timestampField) {
        timestampField.value = timestamp;
    }
    
    // Track modal open
    trackEvent('email_modal_opened', {
        source: 'homepage',
        timestamp: timestamp
    });
}

function closeEmailSignup() {
    document.getElementById('emailModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Track modal close
    trackEvent('email_modal_closed', {
        source: 'homepage'
    });
}

// Handle email signup form submission with Formspree
function handleEmailSignup(event) {
    event.preventDefault();
    
    const form = document.getElementById('emailForm');
    const emailInput = document.getElementById('emailInput');
    const email = emailInput.value;
    const successMessage = document.getElementById('emailSuccess');
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Basic email validation
    if (!isValidEmail(email)) {
        alert('Please enter a valid email address.');
        trackEvent('email_signup_validation_error', {
            error: 'invalid_email_format',
            email: email
        });
        return;
    }
    
    // Show loading state
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Signing up...';
    submitButton.disabled = true;
    submitButton.style.opacity = '0.7';
    
    // Prepare form data
    const formData = new FormData(form);
    
    // Add additional tracking data
    formData.set('timestamp', new Date().toISOString());
    formData.set('user_agent', navigator.userAgent);
    formData.set('referrer', document.referrer || 'direct');
    formData.set('page_url', window.location.href);
    
    // Submit to Formspree
    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            // Success - show success message
            form.style.display = 'none';
            successMessage.style.display = 'block';
            
            // Track successful signup
            trackEvent('email_signup_success', {
                email: email,
                source: 'homepage_modal',
                city: 'Bangalore',
                timestamp: new Date().toISOString()
            });
            
            // Store email locally for future reference
            storeEmailLocally(email);
            
            // Auto close after 5 seconds
            setTimeout(() => {
                closeEmailSignup();
                
                // Reset form for next use
                form.style.display = 'block';
                successMessage.style.display = 'none';
                emailInput.value = '';
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                submitButton.style.opacity = '1';
                
                // Optional: Show WhatsApp prompt
                showWhatsAppPrompt();
            }, 5000);
            
        } else {
            response.text().then(text => {
                throw new Error(`Server error: ${response.status} - ${text}`);
            });
        }
    })
    .catch(error => {
        console.error('Email signup error:', error);
        
        // Show user-friendly error message
        alert('Sorry, there was an error signing you up. Please try again or contact us directly at hello@walkmore.app');
        
        // Reset button state
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        submitButton.style.opacity = '1';
        
        // Track error
        trackEvent('email_signup_error', {
            error: error.message,
            email: email,
            source: 'homepage_modal',
            timestamp: new Date().toISOString()
        });
    });
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Store email locally for analytics
function storeEmailLocally(email) {
    try {
        let emails = JSON.parse(localStorage.getItem('walkerEmails') || '[]');
        const emailEntry = {
            email: email,
            timestamp: new Date().toISOString(),
            source: 'homepage_modal',
            city: 'Bangalore',
            user_agent: navigator.userAgent,
            page_url: window.location.href
        };
        
        // Avoid duplicates
        if (!emails.find(e => e.email === email)) {
            emails.push(emailEntry);
            localStorage.setItem('walkerEmails', JSON.stringify(emails));
        }
    } catch (error) {
        console.error('Error storing email locally:', error);
    }
}

// Optional WhatsApp prompt after successful signup
function showWhatsAppPrompt() {
    // Only show if we haven't shown it before
    if (!localStorage.getItem('walkerWhatsAppPromptShown')) {
        setTimeout(() => {
            if (confirm('🎉 Thanks for signing up! Would you like to join our WhatsApp community for early updates and local walks?')) {
                window.open('https://chat.whatsapp.com/placeholder', '_blank');
                trackEvent('whatsapp_prompt_accepted', {
                    source: 'post_email_signup'
                });
            } else {
                trackEvent('whatsapp_prompt_declined', {
                    source: 'post_email_signup'
                });
            }
            localStorage.setItem('walkerWhatsAppPromptShown', 'true');
        }, 1000);
    }
}

// FAQ Toggle Functionality
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach((item, index) => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        // Initially hide all answers
        answer.style.display = 'none';
        
        question.addEventListener('click', () => {
            const isOpen = answer.style.display === 'block';
            
            // Close all other FAQ items
            faqItems.forEach((otherItem, otherIndex) => {
                const otherAnswer = otherItem.querySelector('.faq-answer');
                otherAnswer.style.display = 'none';
                otherItem.classList.remove('active');
            });
            
            // Toggle current item
            if (!isOpen) {
                answer.style.display = 'block';
                item.classList.add('active');
                
                // Track FAQ interaction
                trackEvent('faq_opened', {
                    question_index: index,
                    question_text: question.textContent.trim()
                });
            }
        });
        
        // Make questions keyboard accessible
        question.setAttribute('tabindex', '0');
        question.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                question.click();
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
                
                // Track navigation clicks
                trackEvent('navigation_click', {
                    target_section: targetId,
                    link_text: link.textContent.trim()
                });
            }
        });
    });
}

// Mobile menu toggle
function initializeMobileMenu() {
    const mobileToggle = document.querySelector('.nav-mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-open');
            
            // Track mobile menu usage
            trackEvent('mobile_menu_toggle', {
                action: navLinks.classList.contains('mobile-open') ? 'opened' : 'closed'
            });
        });
        
        // Close mobile menu when clicking on a link
        const mobileNavLinks = navLinks.querySelectorAll('a');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('mobile-open');
            });
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
        
        // Focus management for modal
        if (modal.style.display === 'block' && e.key === 'Tab') {
            const focusableElements = modal.querySelectorAll('input, button, [tabindex]:not([tabindex="-1"])');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    });
}

// Analytics tracking
function trackEvent(eventName, properties = {}) {
    // Console logging for development
    console.log('Track event:', eventName, properties);
    
    // Add common properties
    const eventData = {
        ...properties,
        timestamp: new Date().toISOString(),
        page_url: window.location.href,
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`
    };
    
    // TODO: Replace with your analytics service
    // Example for Google Analytics 4:
    // if (typeof gtag !== 'undefined') {
    //     gtag('event', eventName, eventData);
    // }
    
    // Example for Mixpanel:
    // if (typeof mixpanel !== 'undefined') {
    //     mixpanel.track(eventName, eventData);
    // }
    
    // Store events locally for now
    try {
        let events = JSON.parse(localStorage.getItem('walkerEvents') || '[]');
        events.push({ event: eventName, properties: eventData });
        
        // Keep only last 100 events to avoid storage bloat
        if (events.length > 100) {
            events = events.slice(-100);
        }
        
        localStorage.setItem('walkerEvents', JSON.stringify(events));
    } catch (error) {
        console.error('Error storing analytics event:', error);
    }
}

// Track CTA and link interactions
function initializeAnalytics() {
    // Track WhatsApp button clicks
    const whatsappButtons = document.querySelectorAll('a[href*="whatsapp"]');
    whatsappButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            trackEvent('whatsapp_click', {
                button_location: index === 0 ? 'hero' : 'final_cta',
                button_text: button.textContent.trim()
            });
        });
    });
    
    // Track footer link clicks
    const footerLinks = document.querySelectorAll('.footer a');
    footerLinks.forEach(link => {
        link.addEventListener('click', () => {
            trackEvent('footer_link_click', {
                link_text: link.textContent.trim(),
                link_href: link.getAttribute('href')
            });
        });
    });
    
    // Track "View All Walks" button
    const viewAllWalksBtn = document.querySelector('.walks-cta .btn-outline');
    if (viewAllWalksBtn) {
        viewAllWalksBtn.addEventListener('click', () => {
            trackEvent('view_all_walks_click', {
                source: 'community_walks_section'
            });
        });
    }
}

// Page visibility tracking
function initializeVisibilityTracking() {
    let startTime = Date.now();
    let isVisible = true;
    
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (isVisible) {
                const timeSpent = Date.now() - startTime;
                trackEvent('page_visibility_hidden', {
                    time_visible: timeSpent,
                    time_visible_seconds: Math.round(timeSpent / 1000)
                });
                isVisible = false;
            }
        } else {
            startTime = Date.now();
            isVisible = true;
            trackEvent('page_visibility_visible');
        }
    });
    
    // Track time spent on page when leaving
    window.addEventListener('beforeunload', () => {
        if (isVisible) {
            const timeSpent = Date.now() - startTime;
            trackEvent('page_unload', {
                total_time_on_page: timeSpent,
                total_time_seconds: Math.round(timeSpent / 1000)
            });
        }
    });
}

// Performance monitoring
function initializePerformance() {
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (performance.getEntriesByType) {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    trackEvent('page_performance', {
                        load_time: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
                        dom_content_loaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
                        first_byte: Math.round(perfData.responseStart - perfData.requestStart),
                        dom_interactive: Math.round(perfData.domInteractive - perfData.navigationStart)
                    });
                }
            }
        }, 0);
    });
}

// Check for URL parameters (success state, etc.)
function checkURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get('signup') === 'success') {
        // Show success message or take action for successful signup
        setTimeout(() => {
            alert('🎉 Thanks for signing up for Walker! Check your email for confirmation.');
            
            // Clean up URL
            const cleanURL = window.location.href.split('?')[0];
            window.history.replaceState({}, document.title, cleanURL);
        }, 1000);
        
        trackEvent('signup_success_page_view', {
            referrer: document.referrer
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Core functionality
    initializeFAQ();
    initializeSmoothScrolling();
    initializeMobileMenu();
    initializeModalClose();
    initializeKeyboardSupport();
    
    // Analytics and tracking
    initializeAnalytics();
    initializeVisibilityTracking();
    initializePerformance();
    
    // Check URL parameters
    checkURLParameters();
    
    // Add loaded class for CSS animations
    document.body.classList.add('loaded');
    
    // Track page load
    trackEvent('page_loaded', {
        page_title: document.title,
        referrer: document.referrer || 'direct'
    });
    
    console.log('Walker website initialized successfully! 🚶‍♀️🚶‍♂️');
});

// Service worker registration (for future PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
                trackEvent('service_worker_registered');
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
                trackEvent('service_worker_registration_failed', {
                    error: registrationError.message
                });
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
        trackEvent,
        storeEmailLocally
    };
}
