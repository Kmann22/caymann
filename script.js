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

    const container = document.querySelector('.projects-container');
    const leftArrow = document.querySelector('.left-arrow');
    const rightArrow = document.querySelector('.right-arrow');
    
    // Calculate scroll distance based on card width + gap
    const scrollDistance = 350;  // card width (320px) + gap (30px)
    
    const updateArrowVisibility = () => {
        leftArrow.style.opacity = container.scrollLeft <= 0 ? '0.5' : '1';
        rightArrow.style.opacity = 
            container.scrollLeft >= container.scrollWidth - container.clientWidth - 10 
            ? '0.5' 
            : '1';
    };

    leftArrow.addEventListener('click', () => {
        container.scrollBy({
            left: -scrollDistance,
            behavior: 'smooth'
        });
    });
    
    rightArrow.addEventListener('click', () => {
        container.scrollBy({
            left: scrollDistance,
            behavior: 'smooth'
        });
    });

    // Update arrow visibility on scroll and initial load
    container.addEventListener('scroll', updateArrowVisibility);
    updateArrowVisibility();

    // Optional: Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            container.scrollBy({
                left: -scrollDistance,
                behavior: 'smooth'
            });
        } else if (e.key === 'ArrowRight') {
            container.scrollBy({
                left: scrollDistance,
                behavior: 'smooth'
            });
        }
    });
});


gsap.from('.stars-string, .page2 .title, .page2 .content, .black-moon', {
    opacity: 0,
    y: 30,
    duration: 2,
    ease: "power2.out",
    scrollTrigger: {
        trigger: '.page2',
        start: 'top 80%',
        end: 'center center',
        scrub: 2,        
    },
    stagger: 0.5,
}); 

// Add rotation animation for the earth
gsap.to('.earth', {
    rotation: 360,
    duration: 3,
    ease: "none",
    scrollTrigger: {
        trigger: '.page2',
        start: 'top 80%',
        end: 'center center',
        scrub: 2,
    },
}); 

// Add floating animation for the astronaut-moon
gsap.to('.astronaut-moon', {
    y: 20,
    duration: 2,
    ease: "power1.inOut",
    yoyo: true,
    repeat: -1
}); 

// Rotate black moon on scroll instead of continuously
gsap.to(".black-moon", {
    rotation: 360,
    ease: "none",
    scrollTrigger: {
        trigger: '.page2',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
    }
});

const navButton = document.querySelector('.mobile-nav-button');
const navIcon = document.querySelector('.nav-icon');
const mobileNav = document.querySelector('.mobile-nav');

navButton.addEventListener('click', () => {
    navIcon.classList.toggle('active');
    mobileNav.classList.toggle('active');
});

// Close menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navIcon.classList.remove('active');
        mobileNav.classList.remove('active');
    });
});

gsap.to('.astronaut-star', {
    scrollTrigger: {
        trigger: '.page3',
        start: 'top center',
        end: 'bottom top',
        scrub:2,
        // other ScrollTrigger options as needed
    },
    top: '-100%',
    ease: "power2.out",
    duration:  30
});

// Words animation for page 5
let words = gsap.utils.toArray('.word');
words.forEach((word, index) => {
    gsap.set(word, {
        opacity: 0,
        y: 50
    });
    
    ScrollTrigger.create({
        trigger: word,
        start: "top 80%",
        onEnter: () => {
            gsap.to(word, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: "power2.out",
                delay: index * 0.1 // Sequential animation
            });
        },
        onLeaveBack: () => {
            gsap.to(word, {
                opacity: 0,
                y: 50,
                duration: 0.4
            });
        }
    });
});