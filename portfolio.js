// --- DOM Elements ---
const header = document.querySelector('.header');
const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section');
const reveals = document.querySelectorAll('.reveal');
const toggleIcon = menuToggle.querySelector('i');

// --- Header Scroll Effect ---
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// --- Mobile Menu Toggle ---
menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('show');
    
    if (navMenu.classList.contains('show')) {
        toggleIcon.classList.remove('bx-menu');
        toggleIcon.classList.add('bx-x');
    } else {
        toggleIcon.classList.remove('bx-x');
        toggleIcon.classList.add('bx-menu');
    }
});

// Close menu when a link is clicked
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('show');
        toggleIcon.classList.remove('bx-x');
        toggleIcon.classList.add('bx-menu');
    });
});

// --- Active Navigation Link on Scroll ---
window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        // Add an offset to trigger earlier
        if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current)) {
            link.classList.add('active');
        }
    });
});

// --- Scroll Reveal Animations ---
function revealOnScroll() {
    const windowHeight = window.innerHeight;
    const elementVisible = 150;

    reveals.forEach(reveal => {
        const elementTop = reveal.getBoundingClientRect().top;

        if (elementTop < windowHeight - elementVisible) {
            reveal.classList.add('active');
        }
    });
}

// Initial check
revealOnScroll();
window.addEventListener('scroll', revealOnScroll);

// --- Contact Form Handling ---
const form = document.getElementById('contactForm');
if (form) {
    form.addEventListener('submit', () => {
        const btn = form.querySelector('button');
        btn.innerHTML = 'Sending... <i class="bx bx-loader-alt bx-spin"></i>';
    });
}
