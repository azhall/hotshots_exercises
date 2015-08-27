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
        previous = { },
        timer,
        currentTime = { },
        timerDisplay = container.find("#time").find("span");
    
    //generate puzzle pieces
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
                backgroundPosition: ["-", pieceW * a, "px ", "-", pieceH * x, "px"].join("")
            }).appendTo(imgContainer);

            //store positions
            positions.push({ top: top, left: left });
        }
    }

    img.remove();
    container.find("#0").remove();
    positions.shift();

    $("#start").on("click", function(e) {
        //shuffle the pieces randomly
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
        
        //set position of shuffled images
        $.each(pieces, function(i) {
            pieces.eq(i).css(positions[i]);
        });
        
        //replace existing pieces with shuffled pieces
        pieces.appendTo(imgContainer);
        
        //make sure empty slot is at position 0 when timer starts
        empty.top = 0;
        empty.left = 0;
        
        container.find("#ui").find("p").not("#time").remove();

        if(timer) {
            clearInterval(timer);
            timerDisplay.text("00:00:00");
        }

        timer = setInterval(updateTime, 1000);
        currentTime.seconds = 0;
        currentTime.minutes = 0;
        currentTime.hours = 0;

        function updateTime() {
            if(currentTime.hours === 23 && 
                   currentTime.minutes === 59 && 
                   currentTime.seconds === 59) {
                clearInterval(timer);
            }
        }
    
        pieces.draggable({
            containment: "parent",
            grid: [pieceW, pieceH],
            start: function(e, ui) {
                var current = getPosition(ui.helper);
                
                if(current.left === empty.left) {
                    ui.helper.draggable("option", "axis", "y");
                } else if(current.top === empty.top) {
                    ui.helper.draggable("option", "axis", "x");
                } else {
                    ui.helper.trigger("mouseup");
                    return false;
                }
                
                if(current.bottom < empty.top ||
                   current.top > empty.bottom ||
                   current.left > empty.right ||
                   current.right < empty.left) {
                       ui.helper.trigger("mouseup");
                       return false;                    
                   }
                   
                   previous.top = current.top;
                   previous.left = current.left;
            },
            drag: function(e, ui) {
                var current = getPosition(ui.helper);
                
                //stop dragging if we are in the empty space
                
                if(current.top === empty.top && current.left === empty.left) {
                    ui.helper.trigger("mouseup");
                    return false;
                }
                
                //stop dragging if moving away from empty space
                if (current.top > empty.bottom || current.bottom < empty.top || current.left > empty.right || current.right < empty.left) {
                    ui.helper.trigger("mouseup").css({
                                    top: previous.top,
                                    left: previous.left
                                });
                       return false;
                   }
            },
            stop: function(e, ui) {
                var current = getPosition(ui.helper),
					correctPieces = 0; 
                
                //move empty space if space now occupied
                if(current.top === empty.top && current.left === empty.left) {
                    empty.top = previous.top;
                    empty.left = previous.left;
                    empty.bottom = previous.top + pieceH;
                    empty.right = previous.left + pieceW;
                }
                
                //get positions of all pieces
                $.each(positions, function(i) {
                    var currentPiece = $("#" + (i + 1)),
                        currentPosition = getPosition(currentPiece);
                
                    //is the current piece in the correct place?
                    if(positions[i].top === currentPosition.top && positions[i].left === currentPosition.left) {
                        correctPieces++;
                    }
                });
                
                if(correctPieces === positions.length) {
                    //stop timer
                    clearInterval(timer);
                    $("<p />", {
                        text: "Congratulations, you solved the puzzle!"
                    }).appendTo("#ui");
                }
                
                // convert time to seconds
                var totalSeconds = (currentTime.hours * 60 * 60) + (currentTime.minutes * 60) + currentTime.seconds;
                
                if(localStorage.getItem("puzzleBestTime")) {
                    var bestTime = localStorage.getItem("puzzleBestTime");
                    if(totalSeconds < bestTime) {
                        localStorage.setItem("puzzleBestTime, totalSeconds");
                        
                        $("<p />", {
                            text: "You got a new best time!"
                        }).appendTo("#ui");
                    }
                } else {
                    localStorage.setItem("puzzleBestTime", totalSeconds);
                    
                    $("<p />", {
                        text: "You got a new best time!"
                    }).appendTo("#ui");
                }
            }
        });
        
        function getPosition(el) {
            return {
                top: parseInt(el.css("top")),
                bottom: parseInt(el.css("top")) + pieceH,
                left: parseInt(el.css("left")),
                right: parseInt(el.css("left")) + pieceW
            }
        }
    });
});