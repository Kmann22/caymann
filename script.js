gsap.to(".horizontal",{
    x:"-100vw",
    duration:2,
    scrollTrigger:{
        trigger:".horizontal-wrapper",
        start:"top top",
        end:"bottom top",
        scrub:1,
        markers:true,
        pin:true,
    }    
})