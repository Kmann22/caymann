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


// Dynamic text with typing effect
const words = ["tech enthusiast", "developer", "designer", "entrepreneur", "investor"];
let currentWordIndex = 0;
let isDeleting = false;
let text = '';
let charIndex = 0;

function type() {
    const contentDiv = document.querySelector('.content');
    const prefix = "I am ";
    const currentWord = words[currentWordIndex];
    
    if (!isDeleting && charIndex < currentWord.length) {
        text = prefix + currentWord.substring(0, charIndex + 1);
        charIndex++;
    } else if (isDeleting && charIndex >= 0) {
        text = prefix + currentWord.substring(0, charIndex);
        charIndex--;
    }
    
    contentDiv.textContent = text;
    
    let typeSpeed = 150;
    
    if (isDeleting) {
        typeSpeed /= 2;
    }
    
    if (!isDeleting && charIndex === currentWord.length) {
        typeSpeed = 3500;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        currentWordIndex = (currentWordIndex + 1) % words.length;
        typeSpeed = 500;
    }
    
    setTimeout(type, typeSpeed);
}

// Start the typing effect
type();
