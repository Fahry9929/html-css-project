 
        document.addEventListener('DOMContentLoaded', function() {
            // Mobile menu toggle
            const menuToggle = document.querySelector('.menu-toggle');
            const navLinks = document.querySelector('.nav-links');
            
            menuToggle.addEventListener('click', function() {
                navLinks.classList.toggle('active');
            });
            
            // Close mobile menu when clicking on a link
            const navItems = document.querySelectorAll('.nav-links a');
            navItems.forEach(item => {
                item.addEventListener('click', function() {
                    navLinks.classList.remove('active');
                });
            });
            
            // Contact form validation
            const contactForm = document.getElementById('contactForm');
            const submitBtn = document.getElementById('submitBtn');
            const successMessage = document.getElementById('successMessage');
            const errorMessage = document.getElementById('errorMessage');
            
            // Function to validate email format
            function isValidEmail(email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(email);
            }
            
            // Function to show error
            function showError(fieldId, errorId) {
                document.getElementById(fieldId).style.borderColor = '#e74c3c';
                document.getElementById(errorId).style.display = 'block';
            }
            
            // Function to hide error
            function hideError(fieldId, errorId) {
                document.getElementById(fieldId).style.borderColor = '#ddd';
                document.getElementById(errorId).style.display = 'none';
            }
            
            // Function to validate form
            function validateForm() {
                let isValid = true;
                
                // Validate name
                const name = document.getElementById('name').value.trim();
                if (name === '') {
                    showError('name', 'nameError');
                    isValid = false;
                } else {
                    hideError('name', 'nameError');
                }
                
                // Validate email
                const email = document.getElementById('email').value.trim();
                if (email === '' || !isValidEmail(email)) {
                    showError('email', 'emailError');
                    isValid = false;
                } else {
                    hideError('email', 'emailError');
                }
                
                // Validate subject
                const subject = document.getElementById('subject').value.trim();
                if (subject === '') {
                    showError('subject', 'subjectError');
                    isValid = false;
                } else {
                    hideError('subject', 'subjectError');
                }
                
                // Validate message
                const message = document.getElementById('message').value.trim();
                if (message === '') {
                    showError('message', 'messageError');
                    isValid = false;
                } else {
                    hideError('message', 'messageError');
                }
                
                return isValid;
            }
            
            // Form submission handler
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Hide previous messages
                successMessage.style.display = 'none';
                errorMessage.style.display = 'none';
                
                // Validate form
                if (validateForm()) {
                    // Change button text to show loading state
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                    submitBtn.disabled = true;
                    
                    // Simulate form submission (replace with actual form submission code)
                    setTimeout(function() {
                        // Show success message
                        successMessage.style.display = 'block';
                        
                        // Reset form
                        contactForm.reset();
                        
                        // Reset button
                        submitBtn.innerHTML = 'Send Message';
                        submitBtn.disabled = false;
                        
                        // Hide success message after 5 seconds
                        setTimeout(function() {
                            successMessage.style.display = 'none';
                        }, 5000);
                    }, 2000);
                }
            });
            
            // Real-time validation for each field
            document.getElementById('name').addEventListener('input', function() {
                if (this.value.trim() !== '') {
                    hideError('name', 'nameError');
                }
            });
            
            document.getElementById('email').addEventListener('input', function() {
                if (this.value.trim() !== '' && isValidEmail(this.value)) {
                    hideError('email', 'emailError');
                }
            });
            
            document.getElementById('subject').addEventListener('input', function() {
                if (this.value.trim() !== '') {
                    hideError('subject', 'subjectError');
                }
            });
            
            document.getElementById('message').addEventListener('input', function() {
                if (this.value.trim() !== '') {
                    hideError('message', 'messageError');
                }
            });
        });
