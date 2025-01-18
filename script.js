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