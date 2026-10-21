/* ====================================================================
   GETHEN REPORT — SCRIPT
   This file ONLY handles the mobile hamburger menu.
   Everything else on the site is plain HTML/CSS — no JavaScript needed.
   ==================================================================== */

const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

// Clicking the hamburger button opens/closes the mobile menu
navToggle.addEventListener('click', function () {
  navLinks.classList.toggle('open');
});

// Clicking a link closes the mobile menu (so it doesn't stay open
// after the page scrolls to the new section)
navLinks.querySelectorAll('a').forEach(function (link) {
  link.addEventListener('click', function () {
    navLinks.classList.remove('open');
  });
});
