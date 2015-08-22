(function () {

    //add template helper to extract keys and vals from iteration object
    $.views.helpers({
        getMembers: function (obj) {
            var prop,
                arr = [];

            for (prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    var newObj = {
                        key: prop,
                        val: obj[prop]
                    }

                    arr.push(newObj);
                }
            }

            return arr;
        }
    });

    //compile template
    var template = $.templates($("#contactTemplate").html());

    //listen for message events
    window.addEventListener("message", function (e) {
        
        if (e.data.command === "issueTemplate") {
            
            //create template with received data
            var message = {
                markup: template.render(e.data.context)
            };

            //return template
            e.source.postMessage(message, event.origin);
        }
    });
    
} ());