(function () {
  var navToggle = document.querySelector('.nav-toggle');
  var mobileNav = document.getElementById('mobile-nav');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var previous = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-box]').forEach(function (box) {
    var targetSelector = box.getAttribute('data-filter-box');
    var target = document.querySelector(targetSelector) || document;
    var input = box.querySelector('[data-filter-input]');
    var selects = Array.prototype.slice.call(box.querySelectorAll('[data-filter-select]'));
    var cards = Array.prototype.slice.call(target.querySelectorAll('.movie-card'));

    function valueOf(card, name) {
      return String(card.getAttribute('data-' + name) || '').toLowerCase();
    }

    function filterCards() {
      var query = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var text = [
          valueOf(card, 'title'),
          valueOf(card, 'region'),
          valueOf(card, 'type'),
          valueOf(card, 'year'),
          valueOf(card, 'genre'),
          valueOf(card, 'tags'),
          valueOf(card, 'category')
        ].join(' ');
        var visible = !query || text.indexOf(query) !== -1;

        selects.forEach(function (select) {
          var key = select.getAttribute('data-filter-select');
          var selected = String(select.value || '').toLowerCase();
          if (selected && valueOf(card, key).indexOf(selected) === -1) {
            visible = false;
          }
        });

        card.hidden = !visible;
      });
    }

    if (input) {
      input.addEventListener('input', filterCards);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', filterCards);
    });
  });

  document.querySelectorAll('.player-shell').forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var streamUrl = player.getAttribute('data-stream');
    var hlsInstance = null;
    var ready = false;

    function playVideo() {
      if (!video) {
        return;
      }
      var play = video.play();
      if (play && typeof play.catch === 'function') {
        play.catch(function () {});
      }
    }

    function attach() {
      if (!video || !streamUrl || ready) {
        return;
      }
      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.load();
        playVideo();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        return;
      }

      video.src = streamUrl;
      video.load();
      playVideo();
    }

    function start() {
      if (cover) {
        cover.classList.add('is-hidden');
      }
      attach();
      playVideo();
    }

    if (cover) {
      cover.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener('play', function () {
        if (cover) {
          cover.classList.add('is-hidden');
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  });
})();
