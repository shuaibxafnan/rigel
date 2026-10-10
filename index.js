// ---------------------------------------darkmode-------------------------------------
let dayNight = document.querySelector('.dayNight');
let menuToggle = document.querySelector('.menuToggle');
let body = document.querySelector('body');
let navigation = document.querySelector('.navigation');
dayNight.onclick = function () {
    body.classList.toggle('dark')
    dayNight.classList.toggle('active')
}
menuToggle.onclick = function () {
    menuToggle.classList.toggle('active')
    navigation.classList.toggle('active')
}

// --------------------------------------typingEffect--------------------------------------------

var typingEffect = new Typed(".multi-text", {
    strings: ["DATA SCEINTIST!", "WEB DEVELOPER!", "DATA ANALYST!", "CODER!"],
    loop: true,
    typeSpeed: 100,
    backSpeed: 80,
    backDelay: 1500
})

// -------------------------------------------slidein--------------------------------------------------

const sliders = document.querySelectorAll(".slide-in");
const appearOptions = {
    threshold: 0,
    rootMargin: "0px 0px -150px 0px"
};
const appearOnScroll = new IntersectionObserver(function (
    entries,
    appearOnScroll
) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            return;
        } else {
            entry.target.classList.add("show")
            appearOnScroll.unobserve(entry.target)
        }
    });
},
    appearOptions);

sliders.forEach(slider => {
    appearOnScroll.observe(slider)
});

// -------------------------------------------------------parallax-------------------------------------------

document.addEventListener("mousemove", parallax);
function parallax(e) {
    this.querySelectorAll('.layer').forEach(Layer => {
        const speed = Layer.getAttribute('data-speed');
        const x = (window.innerWidth - e.pageX * speed) / 100
        const y = (window.innerHeight - e.pageY * speed) / 100
        Layer.style.transform = `translateX(${x}px) translateY(${y}px)`
    })
}

// ----------------------------------------------------clipPath--------------------------------------------------

let sec1 = document.querySelector('.sec1');
let sec2 = document.querySelector('.sec2');
window.addEventListener('scroll', function () {
    let value = this.window.scrollY;
    sec1.style.clipPath = "circle(" + value * 1.5 + "px at 0 0)"
    sec2.style.clipPath = "circle(" + value * 1.5 + "px at 100% 100%)"
})

// ---------------------------------------------------------parallaxTxt-------------------------------------------------
const position = document.documentElement;
position.addEventListener("mousemove", e => {
    position.style.setProperty('--txt', e.clientX + 'px')
})


// ----------------------------------------------form---------------------------------------------------------------
const scriptURL = 'https://script.google.com/macros/s/AKfycbzN6Rpmrt9Kj9wGnDdJgJsLYMY6cBy3pms_vki-07J0YUJkKiWzlTYqzkdcidHXqzmAoQ/exec'
const form = document.forms['submit-to-google-sheet']
const msg = document.getElementById("msg")
const credentials = document.getElementsByClassName(".credentials")

form.addEventListener('submit', e => {
    e.preventDefault()
    fetch(scriptURL, { method: 'POST', body: new FormData(form) })
        .then(response => {
            msg.innerHTML = "Thank's for your valuable feedback..."
            setTimeout(function(){
                msg.innerHTML = ""
            },5000)
            form.reset()
        })
        .catch(error => console.error('Error!', error.message))
})


// -----------------------------------------------------------jarallax-----------------------------------------------

jarallax(document.querySelectorAll('.jarallax'), {
    speed: 0.5,
})

// ------------------------------------------------------------socailMediaIcons-----------------------------------------





// const banner = document.querySelector('#home');
// window.addEventListener('scroll',function(){
//     const value = 900 - window.scrollY;
//     banner.style.clipPath = "circle("+ value +"px at center center)";
// })