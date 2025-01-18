gsap.from("h1",{
    opacity:0,
    duration:1,
    y:5,
    ease:"ease",
    scrollTrigger:{
        trigger:".page1,.page2,.page3",
        start:"top 100%"
    }
})