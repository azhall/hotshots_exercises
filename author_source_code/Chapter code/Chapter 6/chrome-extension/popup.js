(function () {

    //get iframe and compose message
    var iframe = $("#poster"),
        message = {
            command: "issueTemplate",
            context: JSON.parse(localStorage.getItem("webContacts"))
        };

    //post message when frame loaded
    iframe.on("load", function () {
        if (message.context) {
            iframe[0].contentWindow.postMessage(message, "*");
        } else {
            $("<li>", {
                text: "No contacts added yet"
            }).appendTo($("#contacts"));
        }
    });

    //listen for response from iframe
    window.addEventListener("message", function (e) {
        $("#contacts").append((e.data.markup));
    });
    
} ());