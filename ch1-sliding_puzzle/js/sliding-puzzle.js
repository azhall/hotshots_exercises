$(function() {
    var numberOfPieces = 12,
    aspect = "3:4",
    aspectW = parseInt(aspect.split(":")[0]),
    aspectH = parseInt(aspect.split(":")[1]),
    container = $("#puzzle"),
    imgContainer = container.find("figure"),
    img = imgContainer.find("img"),
    path = img.attr("src"),
    piece = $("<div/>"),
    pieceW = Math.floor(img.width() / aspectW),
    pieceH = Math.floor(img.height() / aspectH),
    idCounter = 0,
    positions = [],
    empty = {
        top: 0, 
        left: 0,
        bottom: pieceH, 
        right: pieceW
    },
    previous = {},
    timer,
    currentTime = {},
    timerDisplay = container.find("#time").find("span");
    
    for(var x = 0, y = aspectH; x < y; x++) {
        for(var a = 0, b = aspectW; a < b; a++) {
            var top = pieceH * x,
                left = pieceW * a;
                
            piece.clone()
                 .attr("id", idCounter++)  // Sets the id of the div-element to idCounter, then increments idCounter
                 .css({
                     width: pieceW,
                     height: pieceH,
                     position: "absolute",
                     top: top,
                     left: left,
                     backgroundImage: ["url(", path, ")"].join(""),
                     backgroundPosition: [
                         "-", left, "px ",
                         "-", top, "px"
                     ].join("")
            }).appendTo(imgContainer);
                
            positions.push({ top: top, left: left });
        }
    }
    
    img.remove();
    container.find("#0").remove();
    positions.shift();
    
    $("#start").on("click", function(e) {
        var pieces = imgContainer.children();
        
        function shuffle(array) {
            var i = array.length;
            
            if(i === 0) {
                return false;
            }
            while(--i) {
                var j = Math.floor(Math.random() * (i + 1)),
                    tempi = array[i],
                    tempj = array[j];
                    
                array[i] = tempj;
                array[j] = tempi;
            }
        }
        
        shuffle(pieces);
        
        $.each(pieces, function(i) {
            pieces.eq(i).css(positions[i]);
        });
        
        pieces.appendTo(imgContainer);
        
        empty.top = 0;
        empty.left = 0;
        
        container.find("#ui").find("p").not("#time").remove();
    });
});