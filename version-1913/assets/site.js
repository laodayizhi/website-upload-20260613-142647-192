(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !mobileNav) {
            return;
        }
        toggle.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        start();
    }

    function initFilters() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
        if (!cards.length) {
            return;
        }
        var typeButtons = Array.prototype.slice.call(document.querySelectorAll("[data-type-filter]"));
        var yearButtons = Array.prototype.slice.call(document.querySelectorAll("[data-year-filter]"));
        var state = {
            query: "",
            type: "all",
            year: "all"
        };
        var params = new URLSearchParams(window.location.search);
        var queryParam = params.get("q");
        if (queryParam && inputs.length) {
            state.query = queryParam.trim().toLowerCase();
            inputs.forEach(function (input) {
                input.value = queryParam;
            });
        }
        function setActive(buttons, attribute, value) {
            buttons.forEach(function (button) {
                button.classList.toggle("active", button.getAttribute(attribute) === value);
            });
        }
        function apply() {
            cards.forEach(function (card) {
                var haystack = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
                var type = card.getAttribute("data-type") || "";
                var year = card.getAttribute("data-year") || "";
                var matchedQuery = !state.query || haystack.indexOf(state.query) !== -1;
                var matchedType = state.type === "all" || type === state.type;
                var matchedYear = state.year === "all" || year === state.year;
                card.hidden = !(matchedQuery && matchedType && matchedYear);
            });
        }
        inputs.forEach(function (input) {
            input.addEventListener("input", function () {
                state.query = input.value.trim().toLowerCase();
                apply();
            });
        });
        typeButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                state.type = button.getAttribute("data-type-filter") || "all";
                setActive(typeButtons, "data-type-filter", state.type);
                apply();
            });
        });
        yearButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                state.year = button.getAttribute("data-year-filter") || "all";
                setActive(yearButtons, "data-year-filter", state.year);
                apply();
            });
        });
        apply();
    }

    window.initMoviePlayer = function (streamUrl) {
        ready(function () {
            var video = document.getElementById("movie-player");
            var cover = document.querySelector("[data-player-cover]");
            if (!video || !streamUrl) {
                return;
            }
            var attached = false;
            var hlsInstance = null;
            function attachSource() {
                if (attached) {
                    return;
                }
                attached = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                    return;
                }
                video.src = streamUrl;
            }
            function startPlayback() {
                attachSource();
                if (cover) {
                    cover.classList.add("is-hidden");
                }
                var attempt = video.play();
                if (attempt && typeof attempt.catch === "function") {
                    attempt.catch(function () {});
                }
            }
            if (cover) {
                cover.addEventListener("click", startPlayback);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    startPlayback();
                }
            });
            video.addEventListener("play", function () {
                if (cover) {
                    cover.classList.add("is-hidden");
                }
            });
            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    };

    ready(function () {
        initNavigation();
        initHero();
        initFilters();
    });
})();
