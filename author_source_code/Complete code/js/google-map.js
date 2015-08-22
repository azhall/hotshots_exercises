$(function () {

    //init vars
    var api = google.maps,
        mapCenter = new api.LatLng(50.91710, -1.40419),
        mapOptions = {
            zoom: 13,
            center: mapCenter,
            mapTypeId: api.MapTypeId.ROADMAP,
            disableDefaultUI: true
        },
        map = new api.Map(document.getElementById("map"), mapOptions),
        ui = $("#ui"),
        clicks = 0,
        positions = [];

    //add marker for company hq
    var homeMarker = new api.Marker({
        position: mapCenter,
        map: map,
        icon: "img/hq.png"
    });

    //define hq marker info window
    var infoWindow = new api.InfoWindow({
        content: document.getElementById("hqInfo")
    });

    //show info window when hq marker clicked
    google.maps.event.addListener(homeMarker, "click", function () {
        infoWindow.open(map, homeMarker);
    });

    //function to add a marker at a clicked location
    var addMarker = function (e) {
        if (clicks <= 1) {

            //store latLng
            positions.push(e.latLng);
            
            //add marker
            var marker = new api.Marker({
                map: map,
                position: e.latLng,
                flat: (clicks === 0) ? true : false,
                animation: api.Animation.DROP,
                title: (clicks === 0) ? "Start" : "End",
                icon: (clicks === 0) ? "img/start.png" : "",
                draggable: true,
                id: (clicks === 0) ? "start" : "end"
            });

            api.event.addListener(marker, "dragend", markerDrag);

            //fire locationAdd event
            api.event.trigger(map, "locationAdd", e);
        } else {
            api.event.removeListener(mapClick);
            return false;
        }
    }

    //listen for clicks on the map
    var mapClick = api.event.addListener(map, "click", addMarker);

    //handle locationAdd event
    api.event.addListener(map, "locationAdd", function (e) {

        var journeyEl = $("#journey"),
            outer = (journeyEl.length) ? journeyEl : $("<div>", {
                id: "journey"
            });

        //reverse geocode latlng to get address of place clicked
        new api.Geocoder().geocode({ "latLng": e.latLng }, function (results) {

            //update UI with location
            $("<h3 />", {
                text: (clicks === 0) ? "Start:" : "End:"
            }).appendTo(outer);
            $("<p />", {
                text: results[0].formatted_address,
                id: (clicks === 0) ? "startPoint" : "endPoint",
                "data-latLng": e.latLng
            }).appendTo(outer);

            if (!journeyEl.length) {
                outer.appendTo(ui);
            } else {
                //add button if second click
                $("<button />", {
                    id: "getQuote",
                    text: "Get quote"
                }).prop("disabled", true).appendTo(journeyEl);
            }

            clicks++;
        });

    });

    //handle markers being dragged
    var markerDrag = function (e) {

        var elId = ["#", this.get("id"), "Point"].join("");

        //reverse geocode latlng to get address of place marker dragged to
        new api.Geocoder().geocode({ "latLng": e.latLng }, function (results) {
            $(elId).text(results[0].formatted_address);
        });
    };

    //enable button when weight entered
    $("#weight").on("keyup", function () {
        if (timeout) {
            clearTimeout(timeout);
        }

        var field = $(this),
            enableButton = function () {
                if (field.val()) {
                    $("#getQuote").prop("disabled", false);
                } else {
                    $("#getQuote").prop("disabled", true);
                }
            },
            timeout = setTimeout(enableButton, 250);
    });

    //compute distance and cost when button clicked
    $("body").on("click", "#getQuote", function (e) {
        e.preventDefault();

        $(this).remove();

        //get distance between points
        new api.DistanceMatrixService().getDistanceMatrix({
            origins: [$("#startPoint").attr("data-latLng")],
            destinations: [$("#endPoint").attr("data-latLng")],
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.IMPERIAL
        }, function (response) {

            var list = $("<dl/>", {
                    "class": "clearfix",
                    id: "quote"
                }),
                format = function (number) {

                    var rounded = Math.round(number * 100) / 100,                        
                        fixed = rounded.toFixed(2);
                        
                    return fixed;
                },
                term = $("<dt/>"),
                desc = $("<dd/>"),
                distance = response.rows[0].elements[0].distance,
                weight = $("#weight").val(),
                distanceString = distance.text + "les",
                distanceNum = parseFloat(distance.text.split(" ")[0]),
                distanceCost = format(distanceNum * 3),
                weightCost = format(weight * 0.25 * distanceNum),
                totalCost = format(+distanceCost + +weightCost);

            //display results
            $("<h3>", {
                text: "Your quote",
                id: "quoteHeading"
            }).appendTo(ui);
            term.clone().html("Distance:").appendTo(list);
            desc.clone().text(distanceString).appendTo(list);
            term.clone().text("Distance cost:").appendTo(list);
            desc.clone().text("£" + distanceCost).appendTo(list);
            term.clone().text("Weight cost:").appendTo(list);
            desc.clone().text("£" + weightCost).appendTo(list);
            term.clone().addClass("total").text("Total:").appendTo(list);
            desc.clone().addClass("total").text("£" + totalCost).appendTo(list);
            list.appendTo(ui);
        });
    });

});