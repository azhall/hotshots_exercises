$(function () {

    //vars
    var data = {},
        startIndex = 1,
        listHeight = 0,
        win = $(window),
        winHeight = win.height();

    //get user
    var getUser = function () {
        return $.getJSON("http://gdata.youtube.com/feeds/api/users/tedtalksdirector?callback=?", {
            v: 2,
            alt: "json"
        }, function (user) {
            data.userdata = user.entry;
        });
    };

    //get data
    var getData = function () {
        return $.getJSON("https://gdata.youtube.com/feeds/api/videos?callback=?", {
            author: "tedtalksdirector",
            v: 2,
            alt: "jsonc",
            "start-index": startIndex,
            orderby: "published"
        }, function (videos) {
            data.videodata = videos.data.items;
        });
    };

    //add helper functions
    var truncate = function (summary) {
        return summary.substring(0, 200) + "...";
    },
    formatTime = function (time) {
        var timeArr = [],
            hours = Math.floor(time / 3600),
            mins = Math.floor((time % 3600) / 60),
            secs = Math.floor(time % 60);

        if (hours > 0) {
            timeArr.push(hours);
        }

        if (mins < 10) {
            timeArr.push("0" + mins);
        } else {
            timeArr.push(mins);
        }

        if (secs < 10) {
            timeArr.push("0" + secs);
        } else {
            timeArr.push(secs);
        }

        return timeArr.join(":");
    };

    //register helpers
    $.views.helpers({ Truncate: truncate, FormatTime: formatTime });

    //render the template
    var renderer = function (renderOuter) {
        var vidList = $("#videoList");

        if (renderOuter) {
            vidList.append($("#containerTemplate").render(data.userdata));
        }
        vidList.find("#videos").append($("#videoTemplate").render(data.videodata));

        //set height of content once template rendered
        vidList.imagesLoaded(function () {
            listHeight = $("#videoList").height();
        });
    }

    //get initial data set
    $.when(getUser(), getData()).done(function () {
        startIndex+=25;

        //format user object
        var ud = data.userdata,
            clean = {};
        
        clean.name = ud.yt$username.display;
        clean.avatar = ud.media$thumbnail.url;
        clean.summary = ud.summary.$t;

        data.userdata = clean;
        
        //template the response
        renderer(true);

    });

    //add scroll handler
    win.on("scroll", function (e) {
        
        if (win.scrollTop() + winHeight >= listHeight) {
            //show loader
            $("<li/>", {
                "class": "loading",
                html: "<span>Loading older videos...</span>"
            }).appendTo("#videos");

            //get next page
            $.when(getData()).done(function () {
                startIndex+=25;
                
                //template the new data
                renderer();

                //remove loader
                $("li.loading").remove();
                
            });
        }

    //handle window resizes
    }).on("resize", function() {
        winHeight = win.height();
    });
});