document.addEventListener("DOMContentLoaded", function (event) {
  let buttonToogle = document.querySelector('.page__header .toogle-btn'),
    buttonToogleFeatures = document.querySelector('.features .toogle-btn'),
    navItems = document.querySelector('.nav__items'),
    featuresItems = document.querySelector('.features__items'),
    serviseBtn = document.querySelectorAll('.servise___btn'),
    overlay = document.querySelector('.overlay'),
    popup = document.querySelector('.popup'),
    popupClose = document.querySelector('.popup__close');

  /*мобильное меню */
  buttonToogle.addEventListener('click', function () {
    navItems.classList.toggle('hidden');
    buttonToogle.classList.toggle('toogle-btn-open');
  });

  /*Преимущества */
  buttonToogleFeatures.addEventListener('click', function () {
    featuresItems.classList.toggle('hidden');
    buttonToogleFeatures.classList.toggle('toogle-btn-open');
  });

  //попап
  for (let i = 0; i < serviseBtn.length; i++) {
    serviseBtn[i].addEventListener('click', function () {
      overlay.style.display = 'block';
      popup.style.display = 'block';
    });
  }
  //закрытие попап
  function closePopup() {
    overlay.addEventListener('click', function () {
      popup.style.display = 'none';
      overlay.style.display = 'none';
    });
    popupClose.addEventListener('click', function () {
      popup.style.display = 'none';
      overlay.style.display = 'none';
    })
  };

  closePopup();
  
  
});

$(document).ready(function () {
  $(document).on('click', '.modal_btn', function () {
    $('#small-modal').arcticmodal();
  });
  $('input').attr('required', 'required')
});
$(function () {
  $(".input-phone").mask("8 (999) 999-99-99");
});
