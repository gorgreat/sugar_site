document.addEventListener("DOMContentLoaded", function (event) {
  let slideIndex = 1,
    slides = document.getElementsByClassName('review__item'),
    leftArrow = document.querySelector('.reviews__left-arrow'),
    rightArrow = document.querySelector('.reviews__right-arrow'),
    dots = document.querySelector('.reviews__controls'),
    dot = document.getElementsByClassName('control__item');

  showSlides(slideIndex);

  function showSlides(n) {
    if (n > slides.length) {
      slideIndex = 1;
    }
    if (n < 1) {
      slideIndex = slides.length;
    }

    for (let i = 0; i < slides.length; i++) {
      slides[i].style.display = 'none';
    }

    for (let i = 0; i < dot.length; i++) {
      dot[i].classList.remove('dot-active');
    }

    slides[slideIndex - 1].style.display = 'flex';
    dot[slideIndex - 1].classList.add('dot-active');

  };

  function plusSlides(n) {
    showSlides(slideIndex += n);
  };

  leftArrow.addEventListener('click', function () {
    plusSlides(-1);
  });

  rightArrow.addEventListener('click', function () {
    plusSlides(1);
  });

  function currentSlide(n) {
    showSlides(slideIndex = n);
  };

  dots.addEventListener('click', function (event) {
    for (let i = 0; i < dot.length + 1; i++) {
      if (event.target.classList.contains('control__item') && event.target == dot[i - 1]) {
        currentSlide(i);
      }
    };
  });
  
});
