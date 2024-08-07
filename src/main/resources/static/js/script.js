// basic-N1 [kNlY6uYvo7]
(function() {
  $(function() {
    $(".basic-N1").each(function() {
      const $block = $(this);
      const $dim = $block.find('.header-dim');
      // Header Scroll
      $(window).on("load scroll", function() {
        const $thisTop = $(this).scrollTop();
        if ($thisTop > 120) {
          $block.addClass("header-top-active");
        } else {
          $block.removeClass("header-top-active");
        }
      });
      // Mobile Lang
      $block.find('.header-langbtn').on('click', function() {
        $(this).parent().toggleClass('lang-active');
      });
      // Mobile Top
      $block.find('.btn-momenu').on('click', function() {
        $block.addClass('momenu-active');
        $dim.fadeIn();
      });
      $block.find('.btn-close, .header-dim').on('click', function() {
        $block.removeClass('momenu-active');
        $dim.fadeOut();
      });
      // Mobile Gnb
      $block.find('.header-gnbitem').each(function() {
        const $this = $(this);
        const $thislink = $this.find('.header-gnblink');
        const $gnblink = $(this).find(".header-gnblink");
        const $sublist = $(this).find(".header-sublist");
        $thislink.on('click', function() {
          if (!$(this).parent().hasClass('item-active')) {
            $('.header-gnbitem').removeClass('item-active');
          }
          $(this).parents(".header-gnbitem").toggleClass("item-active");
        });
        // Header Mobile 1Depth Click
        if (window.innerWidth <= 992) {
          $block.find(".btn-momenu").on("click", function() {
            $block.addClass("mo-active");
            if ($sublist.length) {
              $gnblink.attr("href", "javascript:void(0);");
            }
          });
        }
      });
      // Menu Btn Click Gnb
      $block.find('.btn-allmenu').on('click', function() {
        $block.addClass('header-menuactive');
        $dim.fadeIn();
      });
      $block.find('.btn-close, .header-dim').on('click', function() {
        $block.removeClass('header-menuactive');
        $dim.fadeOut();
      });
    });
  });
})();
// basic-N5 [ChLY6uYVRZ]
(function() {
  $(function() {
    $(".basic-N5").each(function() {
      const $block = $(this);
      // Swiper
      const swiper = new Swiper(".basic-N5 .contents-swiper", {
        slidesPerView: 1,
        spaceBetween: 0,
        loop: true,
        autoplay: {
          delay: 5000,
        },
        pagination: {
          el: ".basic-N5 .swiper-pagination",
          type: "fraction",
          clickable: true,
          renderFraction: function(currentClass, totalClass) {
            return '<span class="' + currentClass + '"></span>' + '<span class="contents-deco"></span>' + '<span class="' + totalClass + '"></span>';
          }
        },
        navigation: {
          nextEl: ".basic-N5 .swiper-button-next",
          prevEl: ".basic-N5 .swiper-button-prev",
        },
      });
      // Swiper Play, Pause Button
      const pauseButton = $block.find('.swiper-button-pause');
      const playButton = $block.find('.swiper-button-play');
      playButton.hide();
      pauseButton.show();
      pauseButton.on('click', function() {
        swiper.autoplay.stop();
        playButton.show();
        pauseButton.hide();
      });
      playButton.on('click', function() {
        swiper.autoplay.start();
        playButton.hide();
        pauseButton.show();
      });
    });
  });
})();
// basic-N9 [aelY6UYWi9]
(function() {
  $(function() {
    $(".basic-N9").each(function() {
      const $block = $(this);
      // Swiper
      const swiper = new Swiper(".basic-N9 .contents-swiper", {
        slidesPerView: 'auto',
        spaceBetween: 0,
        loop: true,
        navigation: {
          nextEl: ".basic-N9 .swiper-button-next",
          prevEl: ".basic-N9 .swiper-button-prev",
        },
      });
    });
  });
})();