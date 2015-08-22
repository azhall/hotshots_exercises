$(function () {
    
    //store the initial position of the fixed element
    var win = $(window),
        page = $("body"),
        wrapper = page.find("div.wrapper"),
        article = page.find("article"),
        fixedEl = page.find("aside"),
        sections = page.find("section"),
        initialPos = fixedEl.offset(),
        width = fixedEl.width(),
        percentWidth = 100 * width / wrapper.width();
    
    //scroll to section if URL contains a hash on load
    if (document.location.hash) {

        var href = document.location.hash,
            target = parseInt(href.split("#part")[1]),
            targetOffset = sections.eq(target - 1).offset().top;

        page.scrollTop(0);
        document.location.hash = "";
        scrollPage(href, targetOffset, true);
    }

    //listen for the scroll event
    win.one("scroll", function () {
        fixedEl.css({
            width: width,
            position: "fixed",
            top: Math.round(initialPos.top),
            left: Math.round(initialPos.left)
        });
    });

    //listen for the resize event
    win.on("resize", function () {
        if (fixedEl.css("position") === "fixed") {
            var wrapperPos = wrapper.offset().left,
                wrapperWidth = wrapper.width(),
                fixedWidth = (wrapperWidth / 100) * percentWidth;
            
            fixedEl.css({
                width: fixedWidth,
                left: wrapperPos + wrapperWidth - fixedWidth,
                top: article.offset().top
            });
        }
    });

    //scrolling function
    function scrollPage(href, scrollAmount, updateHash) {

        if (page.scrollTop() !== scrollAmount) {
            page.animate({
                scrollTop: scrollAmount
            }, 500, function () {
                if (updateHash) {
                    document.location.hash = href;
                }
            });
        }
    }

    //navigate the page with animation
    page.on("click", "aside a", function (e) {
        e.preventDefault();
        
        var href = $(this).attr("href"),
            target = parseInt(href.split("#part")[1]),
            targetOffset = sections.eq(target - 1).offset().top;
        
        scrollPage(href, targetOffset, true);

    });

    //enable scrolling with back button
    win.on("hashchange", function () {
        var href = document.location.hash,
            target = parseInt(href.split("#part")[1]),
            targetOffset = (!href) ? 0 : sections.eq(target - 1).offset().top;

        scrollPage(href, targetOffset, false);

    });
});