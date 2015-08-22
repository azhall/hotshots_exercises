$(function () {

    //vars
    var doc = $(document),
        url = document.location.href,
        layouts = [],
        clicks = [];

    //set some AJAX defaults
    $.ajaxSetup({
        type: "POST",
        contentType: "application/json",
        dataType: "json"
    });

    //parse stylesheet(s) for media queries
    $.each(doc[0].styleSheets, function (x, ss) {

        $.each(ss.rules, function (y, rule) {

            if (rule.media && rule.media.length) {

                //get min/max values
                var current = rule.media[0],
                    mq = {
                        min: (current.indexOf("min") !== -1) ? $.trim(current.split("min-width:")[1].split("px")[0]) : 0,
                        max: (current.indexOf("max") !== -1) ? $.trim(current.split("max-width:")[1].split("px")[0]) : "none",
                    };

                layouts.push(mq);
            }
        });
    });

    //sort layouts array
    layouts.sort(function (a, b) {
        return a.min - b.min;
    });

    //store number of layouts
    $.ajax({
        url: "/heat-map.asmx/saveLayouts",
        data: JSON.stringify({ url: url, layouts: layouts })
    });

    $("body").imagesLoaded(function () {

        //capture clicks
        doc.on("click.jqHeat", function (e) {

            //build data for click
            var x = e.pageX,
                y = e.pageY,
                docWidth = doc.outerWidth(),
                docHeight = doc.outerHeight(),
                layout,
                click = {
                    url: url,
                    x: Math.ceil((x / docWidth) * 100),
                    y: Math.ceil((y / docHeight) * 100)
                };

            //determine which layout we are in
            $.each(layouts, function (i, item) {
                
                var min = item.min || 0,
                    max = item.max || docWidth,
                    bp = i + 1;

                if (docWidth >= min && docWidth <= max) {
                    click.layout = bp;
                } else if (docWidth > max) {
                    click.layout = bp + 1;                    
                }
                
            });

            //add to clickStats object
            clicks.push(click);
        });

    });

    //handle leaving the page
    window.onbeforeunload = function () {
        
        //send to server for storage
        $.ajax({
            async: false,
            url: "/heat-map.asmx/saveClicks",
            data: JSON.stringify({ clicks: clicks })
        });
    }
});