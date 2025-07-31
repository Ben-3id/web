// Contact Page JavaScript Functionality

class ContactPage {
    constructor() {
        this.contactForm = document.getElementById('contactForm');
        this.suggestionForm = document.getElementById('suggestionForm');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFormValidation();
    }

    setupEventListeners() {
        // Contact form submission
        if (this.contactForm) {
            this.contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactForm();
            });
        }

        // Suggestion form submission
        if (this.suggestionForm) {
            this.suggestionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSuggestionForm();
            });
        }

        // Real-time form validation
        this.setupRealTimeValidation();
    }

    setupFormValidation() {
        // Add validation patterns
        this.validationRules = {
            name: {
                required: true,
                minLength: 2,
                maxLength: 50,
                pattern: /^[\u0600-\u06FF\s]+$/
            },
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            },
            message: {
                required: true,
                minLength: 10,
                maxLength: 1000
            },
            suggestionTitle: {
                required: true,
                minLength: 5,
                maxLength: 100
            },
            suggestionDescription: {
                required: true,
                minLength: 20,
                maxLength: 2000
            }
        };
    }

    setupRealTimeValidation() {
        // Contact form real-time validation
        if (this.contactForm) {
            const inputs = this.contactForm.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            });
        }

        // Suggestion form real-time validation
        if (this.suggestionForm) {
            const inputs = this.suggestionForm.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            });
        }
    }

    validateField(field) {
        const fieldName = field.name;
        const value = field.value.trim();
        const rules = this.validationRules[fieldName];

        if (!rules) return true;

        // Clear previous error
        this.clearFieldError(field);

        // Check required
        if (rules.required && !value) {
            this.showFieldError(field, 'هذا الحقل مطلوب');
            return false;
        }

        // Check minimum length
        if (rules.minLength && value.length < rules.minLength) {
            this.showFieldError(field, `يجب أن يكون الحقل على الأقل ${rules.minLength} أحرف`);
            return false;
        }

        // Check maximum length
        if (rules.maxLength && value.length > rules.maxLength) {
            this.showFieldError(field, `يجب أن لا يتجاوز الحقل ${rules.maxLength} حرف`);
            return false;
        }

        // Check pattern
        if (rules.pattern && !rules.pattern.test(value)) {
            if (fieldName === 'email') {
                this.showFieldError(field, 'يرجى إدخال بريد إلكتروني صحيح');
            } else if (fieldName === 'name') {
                this.showFieldError(field, 'يرجى إدخال اسم صحيح باللغة العربية');
            } else {
                this.showFieldError(field, 'القيمة المدخلة غير صحيحة');
            }
            return false;
        }

        return true;
    }

    showFieldError(field, message) {
        field.classList.add('error');
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    async handleContactForm() {
        if (!this.validateForm(this.contactForm)) {
            this.showMessage('يرجى تصحيح الأخطاء في النموذج', 'error');
            return;
        }

        const formData = new FormData(this.contactForm);
        const data = Object.fromEntries(formData.entries());

        // Show loading state
        const submitBtn = this.contactForm.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'جاري الإرسال...';
        submitBtn.disabled = true;

        try {
            // Simulate API call
            await this.simulateApiCall(data);
            
            this.showMessage('تم إرسال رسالتك بنجاح! سنقوم بالرد عليك قريباً.', 'success');
            this.contactForm.reset();
            
        } catch (error) {
            this.showMessage('حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    async handleSuggestionForm() {
        if (!this.validateForm(this.suggestionForm)) {
            this.showMessage('يرجى تصحيح الأخطاء في النموذج', 'error');
            return;
        }

        const formData = new FormData(this.suggestionForm);
        const data = Object.fromEntries(formData.entries());

        // Show loading state
        const submitBtn = this.suggestionForm.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'جاري الإرسال...';
        submitBtn.disabled = true;

        try {
            // Simulate API call
            await this.simulateApiCall(data);
            
            this.showMessage('تم إرسال اقتراحك بنجاح! شكراً لك على مساهمتك في تحسين موقعنا.', 'success');
            this.suggestionForm.reset();
            
        } catch (error) {
            this.showMessage('حدث خطأ أثناء إرسال الاقتراح. يرجى المحاولة مرة أخرى.', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    async simulateApiCall(data) {
        // Simulate network delay
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Form data submitted:', data);
                resolve();
            }, 1500);
        });
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;

        // Insert at the top of the form
        const form = type === 'success' ? 
            (this.contactForm.querySelector('.submit-btn') ? this.contactForm : this.suggestionForm) :
            (this.contactForm.querySelector('.submit-btn') ? this.contactForm : this.suggestionForm);
        
        form.insertBefore(messageDiv, form.firstChild);

        // Auto-remove success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                messageDiv.remove();
            }, 5000);
        }
    }

    // Utility function to format suggestion data
    formatSuggestionData(data) {
        const priorityLabels = {
            low: 'منخفضة',
            medium: 'متوسطة',
            high: 'عالية',
            critical: 'حرجة'
        };

        return {
            ...data,
            priorityLabel: priorityLabels[data.priority] || 'متوسطة',
            timestamp: new Date().toISOString(),
            id: this.generateId()
        };
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Function to save suggestion to localStorage (for demo purposes)
    saveSuggestionToStorage(suggestionData) {
        const suggestions = JSON.parse(localStorage.getItem('websiteSuggestions') || '[]');
        suggestions.push(suggestionData);
        localStorage.setItem('websiteSuggestions', JSON.stringify(suggestions));
    }

    // Function to get all suggestions from localStorage
    getSuggestionsFromStorage() {
        return JSON.parse(localStorage.getItem('websiteSuggestions') || '[]');
    }
}

// Initialize contact page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        const contactPage = new ContactPage();
        console.log('Contact page initialized successfully');
    } catch (error) {
        console.error('Failed to initialize contact page:', error);
    }
});

// Export for external use
window.ContactPageUtils = {
    // Function to get all suggestions
    getAllSuggestions: () => {
        const contactPage = new ContactPage();
        return contactPage.getSuggestionsFromStorage();
    },

    // Function to add a new suggestion
    addSuggestion: (suggestionData) => {
        const contactPage = new ContactPage();
        const formattedData = contactPage.formatSuggestionData(suggestionData);
        contactPage.saveSuggestionToStorage(formattedData);
        return formattedData;
    },

    // Function to clear all suggestions
    clearSuggestions: () => {
        localStorage.removeItem('websiteSuggestions');
    }
}; 