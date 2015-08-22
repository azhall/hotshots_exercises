(function () {

    //function to get data from SO
    var tags = "",
        getBounties = function (page, callback) {
            $.ajax({
                url: "https://api.stackexchange.com/2.0/questions/featured",
                dataType: "jsonp",
                data: {
                    page: page,
                    pagesize: 10,
                    tagged: tags,
                    order: "desc",
                    sort: "activity",
                    site: "stackoverflow",
                    filter: "!)4k2jB7EKv1OvDDyMLKT2zyrACssKmSCXeX5DeyrzmOdRu8sC5L8d7X3ZpseW5o_nLvVAFfUSf"
                },
                beforeSend: function () {
                    $.mobile.loadingMessageTextVisible = true;
                    $.mobile.showPageLoadingMsg("a", "Searching");
                }
            }).done(function (data) {
                callback(data);
            });
        };

    $(document).on("pageinit", "#welcome", function () {

        //get bounties
        $("#search").on("click", function () {

            //disable button to prevent multiple requests
            $(this).closest(".ui-btn").addClass("ui-disabled");

            //get tags
            tags = $("#tags").val();

            getBounties(1, function (data) {

                data.currentPage = 1;

                //store data
                localStorage.setItem("res", JSON.stringify(data));

                //go to results page
                $.mobile.changePage("bounty-hunter-list.html", {
                    transition: "slide"
                });
            });

        });
    });

    //handle pageshow event
    $(document).on("pageshow", "#welcome", function () {

        //enable button
        $("#search").closest(".ui-btn").removeClass("ui-disabled");

    });

    $(document).on("pageinit", "#list", function () {

        var data = JSON.parse(localStorage.getItem("res")),
            total = parseInt(data.total, 10),
            size = parseInt(data.page_size, 10),
            totalPages = Math.ceil(total / size),
            months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        //add helper function
        var createDate = function (date) {

            //create and format date string
            var cDate = new Date(date * 1000),
                fDate = [cDate.getDate(), months[cDate.getMonth()], cDate.getFullYear()].join(" ");

            return fDate;
        }

        //register helper function
        $.views.helpers({ CreateDate: createDate });

        //render the list template
        $("#results").append($("#listTemplate").render(data)).find("ul").listview();

        //add utility function to set button classes
        var setClasses = function () {
            if (data.currentPage > 1) {
                $("a[data-icon='back']").removeClass("ui-disabled");
            } else {
                $("a[data-icon='back']").addClass("ui-disabled");
            }

            if (data.currentPage < totalPages) {
                $("a[data-icon='forward']").removeClass("ui-disabled");
            } else {
                $("a[data-icon='forward']").addClass("ui-disabled");
            }
        };

        //update current and total pages
        $("span.num").text(data.currentPage);
        $("span.of").text(totalPages);

        //update button state
        setClasses();

        //add click handler to display an individual question
        $("#results").on("click", "li", function () {

            //get data for question
            var index = $(this).find("a").attr("id").split("-")[1],
                question = data.items[index];

            //add id to question
            question.pageid = "item-view-" + index;

            //render the item template
            $("body").append($("#itemTemplate").render(question));

            var page = $("#item-view-" + index);

            //remove from DOM when leave page
            page.attr("data-external-page", true).on("pageinit", $.mobile._bindPageRemove);

            //show new page
            $.mobile.changePage(page, {
                transition: "slide"
            });
        });

        //add paging handlers
        $("a[data-icon='forward'], a[data-icon='back']").on("click", function () {

            var button = $(this),
                dir = button.attr("data-icon"),
                page = parseInt($("span.num").eq(0).text(), 10);

            if (dir === "forward") {
                page++;
            } else {
                page--;
            }

            getBounties(page, function (newData) {

                //update stored data
                data = newData;
                data.currentPage = page;
                localStorage.setItem("res", JSON.stringify(newData));

                //hide spinner
                $.mobile.hidePageLoadingMsg();

                //render new data
                $("#results").empty().append($("#listTemplate").render(newData)).find("ul").listview();

                //update page number and button states
                $("span.num").text(page);
                setClasses();

            });
        });
    });

} ());