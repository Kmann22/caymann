// GSAP Animation Configuration
function initializeHorizontalScroll() {
    gsap.to(".horizontal", {
        x: () => -(document.querySelector(".horizontal").offsetWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
            trigger: ".horizontal-wrapper",
            start: "top top",
            end: () => `+=${document.querySelector(".horizontal").offsetWidth - window.innerWidth}`,
            scrub: true,
            pin: true,
            invalidateOnRefresh: true,
            anticipatePin: 1
        }
    });
}

// Typing Animation Configuration
class TypingEffect {
    constructor(words, prefix = "I am ") {
        this.words = words;
        this.prefix = prefix;
        this.currentWordIndex = 0;
        this.isDeleting = false;
        this.text = '';
        this.charIndex = 0;
        this.contentDiv = document.querySelector('.content1');
    }

    type() {
        const currentWord = this.words[this.currentWordIndex];
        
        if (!this.isDeleting && this.charIndex < currentWord.length) {
            this.text = this.prefix + currentWord.substring(0, this.charIndex + 1);
            this.charIndex++;
        } else if (this.isDeleting && this.charIndex >= 0) {
            this.text = this.prefix + currentWord.substring(0, this.charIndex);
            this.charIndex--;
        }
        
        this.contentDiv.textContent = this.text;
        
        let typeSpeed = 150;
        
        if (this.isDeleting) {
            typeSpeed /= 2;
        }
        
        if (!this.isDeleting && this.charIndex === currentWord.length) {
            typeSpeed = 3500;
            this.isDeleting = true;
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.currentWordIndex = (this.currentWordIndex + 1) % this.words.length;
            typeSpeed = 500;
        }
        
        setTimeout(() => this.type(), typeSpeed);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize horizontal scroll
    initializeHorizontalScroll();
    
    // Initialize typing effect
    const typingEffect = new TypingEffect([
        "tech enthusiast",
        "developer",
        "designer",
        "entrepreneur",
        "investor"
    ]);
    typingEffect.type();
});


gsap.from('.stars-string', {
    opacity: 0,
    y: 30,
    duration: 2,
    ease: "power2.out",
    scrollTrigger: {
        trigger: '.page2',
        start: 'top 80%',
        end: 'center center',
        scrub: 2,
        
    }
}); 