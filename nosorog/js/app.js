"use strict";

document.addEventListener("DOMContentLoaded", () => {


    const isMobile = {
        Android: function () {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function () {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function () {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function () {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function () {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function () {
            return (
                isMobile.Android() ||
                isMobile.BlackBerry() ||
                isMobile.iOS() ||
                isMobile.Opera() ||
                isMobile.Windows());
        },
    };

    function getNavigator() {
        if (isMobile.any() || window.innerWidth < 992) {
            document.body.classList.remove("_pc");
            document.body.classList.add("_touch");
        } else {
            document.body.classList.remove("_touch");
            document.body.classList.add("_pc");
        }
    }

    getNavigator();

    window.addEventListener('resize', () => {
        getNavigator()
    });


    var phoneInputs = document.querySelectorAll('input[type="tel"]');

    var getInputNumbersValue = function (input) {
        // Return stripped input value — just numbers
        return input.value.replace(/\D/g, '');
    }

    var onPhonePaste = function (e) {
        var input = e.target,
            inputNumbersValue = getInputNumbersValue(input);
        var pasted = e.clipboardData || window.clipboardData;
        if (pasted) {
            var pastedText = pasted.getData('Text');
            if (/\D/g.test(pastedText)) {
                // Attempt to paste non-numeric symbol — remove all non-numeric symbols,
                // formatting will be in onPhoneInput handler
                input.value = inputNumbersValue;
                return;
            }
        }
    }

    var onPhoneInput = function (e) {
        var input = e.target,
            inputNumbersValue = getInputNumbersValue(input),
            selectionStart = input.selectionStart,
            formattedInputValue = "";

        if (!inputNumbersValue) {
            return input.value = "";
        }

        if (input.value.length != selectionStart) {
            // Editing in the middle of input, not last symbol
            if (e.data && /\D/g.test(e.data)) {
                // Attempt to input non-numeric symbol
                input.value = inputNumbersValue;
            }
            return;
        }

        if (["7", "8", "9"].indexOf(inputNumbersValue[0]) > -1) {
            if (inputNumbersValue[0] == "9") inputNumbersValue = "7" + inputNumbersValue;
            var firstSymbols = (inputNumbersValue[0] == "8") ? "8" : "+7";
            formattedInputValue = input.value = firstSymbols + " ";
            if (inputNumbersValue.length > 1) {
                formattedInputValue += '(' + inputNumbersValue.substring(1, 4);
            }
            if (inputNumbersValue.length >= 5) {
                formattedInputValue += ') ' + inputNumbersValue.substring(4, 7);
            }
            if (inputNumbersValue.length >= 8) {
                formattedInputValue += '-' + inputNumbersValue.substring(7, 9);
            }
            if (inputNumbersValue.length >= 10) {
                formattedInputValue += '-' + inputNumbersValue.substring(9, 11);
            }
        } else {
            formattedInputValue = '+' + inputNumbersValue.substring(0, 16);
        }
        input.value = formattedInputValue;
    }
    var onPhoneKeyDown = function (e) {
        // Clear input after remove last symbol
        var inputValue = e.target.value.replace(/\D/g, '');
        if (e.keyCode == 8 && inputValue.length == 1) {
            e.target.value = "";
        }
    }
    for (var phoneInput of phoneInputs) {
        phoneInput.addEventListener('keydown', onPhoneKeyDown);
        phoneInput.addEventListener('input', onPhoneInput, false);
        phoneInput.addEventListener('paste', onPhonePaste, false);
    }


    const spollersArray = document.querySelectorAll("[data-spollers]");
    if (spollersArray.length > 0) {

        const spollersRegular = Array.from(spollersArray).filter(function (
            item,
            index,
            self
        ) {
            return !item.dataset.spollers.split(",")[0];
        });

        if (spollersRegular.length > 0) {
            initSpollers(spollersRegular);
        }

        const spollersMedia = Array.from(spollersArray).filter(function (
            item,
            index,
            self
        ) {
            return item.dataset.spollers.split(",")[0];
        });

        if (spollersMedia.length > 0) {
            const breakpointsArray = [];
            spollersMedia.forEach((item) => {
                const params = item.dataset.spollers;
                const breakpoint = {};
                const paramsArray = params.split(",");
                breakpoint.value = paramsArray[0];
                breakpoint.type = paramsArray[1] ? paramsArray[1].trim() : "max";
                breakpoint.item = item;
                breakpointsArray.push(breakpoint);
            });


            let mediaQueries = breakpointsArray.map(function (item) {
                return (
                    "(" +
                    item.type +
                    "-width: " +
                    item.value +
                    "px)," +
                    item.value +
                    "," +
                    item.type
                );
            });
            mediaQueries = mediaQueries.filter(function (item, index, self) {
                return self.indexOf(item) === index;
            });


            mediaQueries.forEach((breakpoint) => {
                const paramsArray = breakpoint.split(",");
                const mediaBreakpoint = paramsArray[1];
                const mediaType = paramsArray[2];
                const matchMedia = window.matchMedia(paramsArray[0]);

                const spollersArray = breakpointsArray.filter(function (item) {
                    if (item.value === mediaBreakpoint && item.type === mediaType) {
                        return true;
                    }
                });

                matchMedia.addListener(function () {
                    initSpollers(spollersArray, matchMedia);
                });
                initSpollers(spollersArray, matchMedia);
            });
        }


        function initSpollers(spollersArray, matchMedia = false) {
            spollersArray.forEach((spollersBlock) => {
                spollersBlock = matchMedia ? spollersBlock.item : spollersBlock;
                if (matchMedia.matches || !matchMedia) {
                    spollersBlock.classList.add("_init");
                    initSpollerBody(spollersBlock);
                    spollersBlock.addEventListener("click", setSpollerAction);
                } else {
                    spollersBlock.classList.remove("_init");
                    initSpollerBody(spollersBlock, false);
                    spollersBlock.removeEventListener("click", setSpollerAction);
                }
            });
        }

        function initSpollerBody(spollersBlock, hideSpollerBody = true) {
            const spollerTitles = spollersBlock.querySelectorAll("[data-spoller]");
            if (spollerTitles.length > 0) {
                spollerTitles.forEach((spollerTitle) => {
                    if (hideSpollerBody) {
                        spollerTitle.removeAttribute("tabindex");
                        if (!spollerTitle.classList.contains("_active")) {
                            spollerTitle.nextElementSibling.hidden = true;
                        }
                    } else {
                        spollerTitle.setAttribute("tabindex", "-1");
                        spollerTitle.nextElementSibling.hidden = false;
                    }
                });
            }
        }

        function setSpollerAction(e) {
            const el = e.target;
            if (el.hasAttribute("data-spoller") || el.closest("[data-spoller]")) {
                const spollerTitle = el.hasAttribute("data-spoller")
                    ? el
                    : el.closest("[data-spoller]");
                const spollersBlock = spollerTitle.closest("[data-spollers]");
                const oneSpoller = spollersBlock.hasAttribute("data-one-spoller")
                    ? true
                    : false;
                if (!spollersBlock.querySelectorAll("._slide").length) {
                    if (oneSpoller && !spollerTitle.classList.contains("_active")) {
                        hideSpollersBody(spollersBlock);
                    }
                    spollerTitle.classList.toggle("_active");
                    spollerTitle.nextElementSibling.slideToggle(300);
                }
                e.preventDefault();
            }
        }

        function hideSpollersBody(spollersBlock) {
            const spollerActiveTitle = spollersBlock.querySelector(
                "[data-spoller]._active"
            );
            if (spollerActiveTitle) {
                spollerActiveTitle.classList.remove("_active");
                spollerActiveTitle.nextElementSibling.slideUp(300);
            }
        }
    }



    // click handlers

    document.addEventListener('click', (e) => {

        const target = e.target;
        const menu = document.querySelector('.header__menu');
        const menuHeader = document.querySelector('.menu__header');
        const menuLocation = document.querySelector('.menu__location');
        const menuCaption = document.querySelector('.menu__caption');

        if (target.closest('.icon-menu') || target.classList.contains('menu__close')) {
            getMenu()
        }

        // Handle first-level menu toggling
        if (target.classList.contains('menu__arrow')) {
            let subMenu = target.nextElementSibling;
            const activeMenuItemText = target.previousElementSibling ? target.previousElementSibling.textContent : '';

            if (document.querySelector('.menu__arrow.active') !== target) {
                if (document.querySelector('.submenu.open')) {
                    document.querySelector('.submenu.open').classList.remove('open');
                }
                if (document.querySelector('.menu__arrow.active')) {
                    document.querySelector('.menu__arrow.active').classList.remove('active');
                }
                if (document.querySelector('.subsubmenu.open')) {
                    document.querySelector('.subsubmenu.open').classList.remove('open');
                }
                if (document.querySelector('.submenu__arrow.active')) {
                    document.querySelector('.submenu__arrow.active').classList.remove('active');
                }

                toggleClassSafely(menu, 'second-menu-open', false);
            }

            if (subMenu) {
                subMenu.classList.toggle('open');
            }
            target.classList.toggle('active');


            if (subMenu && subMenu.classList.contains('open')) {
                toggleClassSafely(menuHeader, 'hidden', false);
                toggleClassSafely(menuLocation, 'hidden');
                setTextContentSafely(menuCaption, activeMenuItemText);
                toggleClassSafely(menu, 'first-menu-open');
            } else {
                toggleClassSafely(menuHeader, 'hidden');
                toggleClassSafely(menuLocation, 'hidden', false);
                setTextContentSafely(menuCaption, '');
                toggleClassSafely(menu, 'first-menu-open', false);
            }
        }

        // Handle second-level menu toggling
        if (target.classList.contains('submenu__arrow')) {
            let subsubMenu = target.nextElementSibling;
            const activeSubMenuItemText = target.previousElementSibling ? target.previousElementSibling.textContent : '';

            if (document.querySelector('.submenu__arrow.active') !== target) {
                if (document.querySelector('.subsubmenu.open')) {
                    document.querySelector('.subsubmenu.open').classList.remove('open');
                }
                if (document.querySelector('.submenu__arrow.active')) {
                    document.querySelector('.submenu__arrow.active').classList.remove('active');
                }
            }

            if (subsubMenu) {
                subsubMenu.classList.toggle('open');
            }
            target.classList.toggle('active');


            if (subsubMenu && subsubMenu.classList.contains('open')) {
                setTextContentSafely(menuCaption, activeSubMenuItemText);
                toggleClassSafely(menu, 'second-menu-open');
            } else {

                const parentMenuLink = target.closest('.submenu__item') ? target.closest('.submenu__item').querySelector('.submenu__link') : null;
                if (parentMenuLink) {
                    setTextContentSafely(menuCaption, parentMenuLink.textContent);
                } else {

                    const activeMenuArrow = document.querySelector('.menu__arrow.active');
                    if (activeMenuArrow && activeMenuArrow.previousElementSibling) {
                        setTextContentSafely(menuCaption, activeMenuArrow.previousElementSibling.textContent);
                    }
                }
                toggleClassSafely(menu, 'second-menu-open', false);
            }
        }

        // Handle the "Back" button click
        if (target.classList.contains('menu__back')) {

            const openSubSubmenu = document.querySelector('.subsubmenu.open');
            if (openSubSubmenu) {
                openSubSubmenu.classList.remove('open');
                const activeSubmenuArrow = document.querySelector('.submenu__arrow.active');
                if (activeSubmenuArrow) {
                    activeSubmenuArrow.classList.remove('active');
                }

                const activeSubmenu = document.querySelector('.submenu.open');
                if (activeSubmenu) {
                    const parentMenuItemLink = activeSubmenu.closest('.menu__item') ? activeSubmenu.closest('.menu__item').querySelector('.menu__link') : null;
                    setTextContentSafely(menuCaption, parentMenuItemLink ? parentMenuItemLink.textContent : '');
                }
                toggleClassSafely(menu, 'second-menu-open', false);
            } else {

                const openSubmenu = document.querySelector('.submenu.open');
                if (openSubmenu) {
                    openSubmenu.classList.remove('open');
                    const activeMenuArrow = document.querySelector('.menu__arrow.active');
                    if (activeMenuArrow) {
                        activeMenuArrow.classList.remove('active');
                    }
                }


                toggleClassSafely(menuHeader, 'hidden');
                toggleClassSafely(menuLocation, 'hidden', false);
                setTextContentSafely(menuCaption, '');
                toggleClassSafely(menu, 'first-menu-open', false);
            }
        }


    });

    const toggleClassSafely = (element, className, add = true) => {
        if (element) {
            if (add) {
                element.classList.add(className);
            } else {
                element.classList.remove(className);
            }
        }
    };

    const setTextContentSafely = (element, text) => {
        if (element) {
            element.textContent = text;
        }
    };

    function getMenu() {
        document.querySelector('.header').classList.toggle('open-menu');
        toggleLocking();
    }

    function toggleLocking(lockClass) {

        const body = document.body;
        let className = lockClass ? lockClass : "lock";
        let pagePosition;

        if (body.classList.contains(className)) {
            pagePosition = parseInt(document.body.dataset.position, 10);
            body.dataset.position = pagePosition;
            body.style.top = -pagePosition + 'px';
        } else {
            pagePosition = window.scrollY;
            body.style.top = 'auto';
            window.scroll({ top: pagePosition, left: 0 });
            document.body.removeAttribute('data-position');
        }

        let lockPaddingValue = body.classList.contains(className)
            ? "0px"
            : window.innerWidth -
            document.querySelector(".wrapper").offsetWidth +
            "px";

        body.style.paddingRight = lockPaddingValue;
        body.classList.toggle(className);

    }

    // sliders

    if (document.querySelector('.promo__slider')) {
        new Swiper('.promo__slider', {
            slidesPerView: 1,
            speed: 800,
            loop: true,
            autoplay: {
                delay: 8000,
                stopOnLastSlide: false,
            },
            effect: "fade",
            fadeEffect: {
                crossFade: true
            },
            navigation: {
                prevEl: '.promo__controls-prev',
                nextEl: '.promo__controls-next'
            },
            on: {
                init: (swiper) => {
                    const nextEl = swiper.navigation.nextEl;
                    let speed = swiper.params.speed;
                    let autoplaySpeed = swiper.params.autoplay.delay;
                    nextEl.style.setProperty('--counting-speed', ((speed + autoplaySpeed) / 1000) + 's');
                    nextEl.classList.add('counting');
                },
                slideChangeTransitionStart: (swiper) => {
                    const nextEl = swiper.navigation.nextEl;
                    nextEl.classList.remove('counting');
                    void nextEl.offsetWidth;
                    nextEl.classList.add('counting');
                }
            }
        })
    }

    if (document.querySelectorAll('.project').length > 0) {
        document.querySelectorAll('.project').forEach(project => {

            const mainSliderEl = project.querySelector('.project__slider');
            const thumbsSliderEl = project.querySelector('.project__thumbs'); // Corrected: select the thumbnail slider element
            const prevBtn = project.querySelector('.project__controls-prev');
            const nextBtn = project.querySelector('.project__controls-next')


            const thumbsSlider = new Swiper(thumbsSliderEl, {
                spaceBetween: 5,
                slidesPerView: 3,
                freeMode: true,
                loop: true,
                watchSlidesProgress: true,
                breakpoints: {
                    1023.98: {
                        slidesPerView: "auto",
                    }
                }

            });

            const mainSlider = new Swiper(mainSliderEl, {
                spaceBetween: 10,
                loop: true,
                effect: "fade",
                fadeEffect: {
                    crossFade: true
                },
                autoplay: {
                    delay: 8000,
                    stopOnLastSlide: false,
                },
                navigation: {
                    nextEl: nextBtn,
                    prevEl: prevBtn,
                },
                thumbs: {
                    swiper: thumbsSlider
                },
                on: {
                    init: (swiper) => {
                        const nextEl = swiper.navigation.nextEl;
                        let speed = swiper.params.speed;
                        let autoplaySpeed = swiper.params.autoplay.delay;
                        nextEl.style.setProperty('--counting-speed', ((speed + autoplaySpeed) / 1000) + 's');
                        nextEl.classList.add('counting');
                    },
                    slideChangeTransitionStart: (swiper) => {
                        const nextEl = swiper.navigation.nextEl;
                        nextEl.classList.remove('counting');
                        void nextEl.offsetWidth;
                        nextEl.classList.add('counting');
                    }
                }
            });
        });
    }

    if (document.querySelectorAll('.prices__cases')) {
        new Swiper('.prices__cases', {
            slidesPerView: "auto",
            spaceBetween: 16,
            breakpoints: {
                767.98: {
                    spaceBetween: 8,
                }
            }
        })
    }

    if (document.querySelectorAll('.filters').length > 0) {
        document.querySelectorAll('.filters').forEach(filter => {
            new Swiper(filter, {
                slidesPerView: "auto",
            })
        });
    }

    if (document.querySelector('.reviews__slider')) {
        new Swiper('.reviews__slider', {
            slidesPerView: 1,
            speed: 800,
            loop: true,
            autoplay: {
                delay: 8000,
                stopOnLastSlide: false,
            },
            navigation: {
                prevEl: '.reviews__prev',
                nextEl: '.reviews__next'
            },
            on: {
                init: (swiper) => {
                    const nextEl = swiper.navigation.nextEl;
                    let speed = swiper.params.speed;
                    let autoplaySpeed = swiper.params.autoplay.delay;
                    nextEl.style.setProperty('--counting-speed', ((speed + autoplaySpeed) / 1000) + 's');
                    nextEl.classList.add('counting');
                },
                slideChangeTransitionStart: (swiper) => {
                    const nextEl = swiper.navigation.nextEl;
                    nextEl.classList.remove('counting');
                    void nextEl.offsetWidth;
                    nextEl.classList.add('counting');
                }
            }
        })
    }


    if (document.querySelector('.blog__slider')) {
        new Swiper('.blog__slider', {
            spaceBetween: 16,
            loop: true, slidesPerView: 1.15,
            autoplay: {
                delay: 8000,
                stopOnLastSlide: false,
            },
            navigation: {
                nextEl: '.blog__slider-next',
                prevEl: '.blog__slider-prev'
            },
            breakpoints: {

                768: {
                    slidesPerView: 2,
                },
                1279.98: {
                    slidesPerView: 3,
                },
                1439.98: {
                    slidesPerView: 4,
                }
            },
            on: {
                init: (swiper) => {
                    const nextEl = swiper.navigation.nextEl;
                    let speed = swiper.params.speed;
                    let autoplaySpeed = swiper.params.autoplay.delay;
                    nextEl.style.setProperty('--counting-speed', ((speed + autoplaySpeed) / 1000) + 's');
                    nextEl.classList.add('counting');
                },
                slideChangeTransitionStart: (swiper) => {
                    const nextEl = swiper.navigation.nextEl;
                    nextEl.classList.remove('counting');
                    void nextEl.offsetWidth;
                    nextEl.classList.add('counting');
                }
            }
        })
    }






});


if (typeof Fancybox !== "undefined" && Fancybox !== null) {
    Fancybox.bind("[data-fancybox]", {
        dragToClose: false,
        closeButton: false
    });
}


HTMLElement.prototype.slideToggle = function (duration, callback) {
    if (this.clientHeight === 0) {
        _s(this, duration, callback, true);
    } else {
        _s(this, duration, callback);
    }
};

HTMLElement.prototype.slideUp = function (duration, callback) {
    _s(this, duration, callback);
};

HTMLElement.prototype.slideDown = function (duration, callback) {
    _s(this, duration, callback, true);
};

function _s(el, duration, callback, isDown) {

    if (typeof duration === 'undefined') duration = 400;
    if (typeof isDown === 'undefined') isDown = false;

    el.style.overflow = "hidden";
    if (isDown) el.style.display = "block";

    var elStyles = window.getComputedStyle(el);

    var elHeight = parseFloat(elStyles.getPropertyValue('height'));
    var elPaddingTop = parseFloat(elStyles.getPropertyValue('padding-top'));
    var elPaddingBottom = parseFloat(elStyles.getPropertyValue('padding-bottom'));
    var elMarginTop = parseFloat(elStyles.getPropertyValue('margin-top'));
    var elMarginBottom = parseFloat(elStyles.getPropertyValue('margin-bottom'));

    var stepHeight = elHeight / duration;
    var stepPaddingTop = elPaddingTop / duration;
    var stepPaddingBottom = elPaddingBottom / duration;
    var stepMarginTop = elMarginTop / duration;
    var stepMarginBottom = elMarginBottom / duration;

    var start;

    function step(timestamp) {

        if (start === undefined) start = timestamp;

        var elapsed = timestamp - start;

        if (isDown) {
            el.style.height = (stepHeight * elapsed) + "px";
            el.style.paddingTop = (stepPaddingTop * elapsed) + "px";
            el.style.paddingBottom = (stepPaddingBottom * elapsed) + "px";
            el.style.marginTop = (stepMarginTop * elapsed) + "px";
            el.style.marginBottom = (stepMarginBottom * elapsed) + "px";
        } else {
            el.style.height = elHeight - (stepHeight * elapsed) + "px";
            el.style.paddingTop = elPaddingTop - (stepPaddingTop * elapsed) + "px";
            el.style.paddingBottom = elPaddingBottom - (stepPaddingBottom * elapsed) + "px";
            el.style.marginTop = elMarginTop - (stepMarginTop * elapsed) + "px";
            el.style.marginBottom = elMarginBottom - (stepMarginBottom * elapsed) + "px";
        }

        if (elapsed >= duration) {
            el.style.height = "";
            el.style.paddingTop = "";
            el.style.paddingBottom = "";
            el.style.marginTop = "";
            el.style.marginBottom = "";
            el.style.overflow = "";
            if (!isDown) el.style.display = "none";
            if (typeof callback === 'function') callback();
        } else {
            window.requestAnimationFrame(step);
        }
    }

    window.requestAnimationFrame(step);
}