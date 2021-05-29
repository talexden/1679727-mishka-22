let navMain = document.querySelector(".navigation");
let contactsMap = document.querySelector(".contacts__map");
let navToggle = document.querySelector(".navigation__toggle");
let modalClick = document.querySelectorAll(".promotion__button");
let modalWindow = document.querySelector(".popup-form");

navMain.classList.remove("navigation--nojs");
contactsMap.classList.remove("hidden");
navMain.classList.add("navigation--closed");
navMain.classList.remove("navigation--opened");

navToggle.addEventListener('click', function() {
  if (navMain.classList.contains("navigation--closed")) {
    navMain.classList.remove("navigation--closed");
    navMain.classList.add("navigation--opened");
  } else {
    navMain.classList.add("navigation--closed");
    navMain.classList.remove("navigation--opened");
  }
});

if (modalClick) {
    for (var i = 0; i < modalClick.length; i = i + 1) {
    modalClick[i].addEventListener("click", function(evt) {
      evt.preventDefault();
      modalWindow.classList.add("popup-form--reveal");
      //modalWindow.focus();
    });
  }
};

window.addEventListener("keydown", function(evt) {
  if (evt.keyCode === 27) {
    evt.preventDefault();
    if (modalClick) {
      if (modalWindow.classList.contains("popup-form--reveal")) {
        modalWindow.classList.remove("popup-form--reveal");
      }
    }
  }
});
