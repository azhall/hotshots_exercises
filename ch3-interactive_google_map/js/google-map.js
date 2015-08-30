$(function() {
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

	var homeMarker = new api.Marker({
		position: mapCenter,
		map: map,
		icon: "img/hq.png"
	});

	var infoWindow = new api.InfoWindow({
		content: document.getElementById("hqInfo")
	});

	api.event.addListener(homeMarker, "click", function() {
		infoWindow.open(map, homeMarker);
	});
});