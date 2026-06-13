
(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.nav-panel');

    if (menuButton && panel) {
        menuButton.addEventListener('click', function () {
            var isOpen = panel.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('[data-hero-carousel]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-slide')) || 0);
                restart();
            });
        });

        start();
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach(function (filterPanel) {
        var input = filterPanel.querySelector('[data-live-search]');
        var buttons = Array.prototype.slice.call(filterPanel.querySelectorAll('[data-filter]'));
        var results = document.querySelector('[data-search-results]');
        var cards = results ? Array.prototype.slice.call(results.querySelectorAll('.searchable-card')) : [];
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        var activeFilter = 'all';

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function textOf(card) {
            return [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-region') || '',
                card.getAttribute('data-genre') || '',
                card.getAttribute('data-tags') || '',
                card.getAttribute('data-year') || '',
                card.textContent || ''
            ].join(' ').toLowerCase();
        }

        function applyFilter() {
            var query = input ? input.value.trim().toLowerCase() : '';
            cards.forEach(function (card) {
                var content = textOf(card);
                var matchesQuery = !query || content.indexOf(query) !== -1;
                var matchesFilter = activeFilter === 'all' || content.indexOf(activeFilter.toLowerCase()) !== -1;
                card.classList.toggle('is-hidden', !(matchesQuery && matchesFilter));
            });
        }

        if (input) {
            input.addEventListener('input', applyFilter);
            applyFilter();
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                buttons.forEach(function (item) {
                    item.classList.remove('is-active');
                });
                button.classList.add('is-active');
                activeFilter = button.getAttribute('data-filter') || 'all';
                applyFilter();
            });
        });
    });
})();

var MoviePlayer = {
    init: function (source) {
        document.addEventListener('DOMContentLoaded', function () {
            var video = document.getElementById('movie-video');
            var overlay = document.querySelector('[data-play-overlay]');
            var hlsInstance = null;

            if (!video || !source) {
                return;
            }

            function attachSource() {
                if (video.getAttribute('data-ready') === '1') {
                    return;
                }

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }

                video.setAttribute('data-ready', '1');
            }

            function playVideo() {
                attachSource();
                var playTask = video.play();
                if (playTask && typeof playTask.catch === 'function') {
                    playTask.catch(function () {});
                }
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            }

            if (overlay) {
                overlay.addEventListener('click', playVideo);
            }

            video.addEventListener('click', function () {
                if (video.getAttribute('data-ready') !== '1') {
                    playVideo();
                }
            });

            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            });
        });
    }
};
