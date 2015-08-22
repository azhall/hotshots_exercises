chrome.extension.onConnect.addListener(function (port) {
    port.onMessage.addListener(function (msg) {
        if (msg.command === "getData") {

            //get data from localStorage
            var contacts = localStorage.getItem("webContacts") || '{ "message": "no contacts" }',
                jsonContacts = JSON.parse(contacts);

            //send data back
            port.postMessage(jsonContacts);
        } else if (msg.command === "setData") {

            //save to localStorage
            localStorage.setItem("webContacts", JSON.stringify({ contacts: msg.contacts }));

            //confirm success
            port.postMessage({ message: "success" });

        }
    });
});