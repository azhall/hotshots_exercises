(function () {

    //check page for person microdata
    var people = $("[itemtype*='schema.org/Person']"),
        peopleData = [];

    if (people.length) {

        //check for people
        people.each(function (i) {

            var person = people.eq(i),
                data = {},
                contactMethods = {};

            //highlight person on the page
            person.addClass("app-person");

            //get person's child elements that contain microdata
            person.children().each(function (j) {

                var child = person.children().eq(j),
                    iProp = child.attr("itemprop");

                //if there are childs with microdata
                if (iProp) {

                    if (child.attr("itemscope") !== "") {

                        //contact methods need to be in an object
                        if (iProp === "email" || iProp === "telephone") {
                            contactMethods[iProp] = child.text();
                        } else {
                            data[iProp] = child.text();
                        }

                    } else {

                        //itemscope elements will have child elements
                        var content = [];

                        child.children().each(function (x) {
                            content.push(child.children().eq(x).text());
                        });

                        //add joined data to data object
                        data[iProp] = content.join(", ");
                    }
                }
            });

            //check an object has props 
            var hasProps = function (obj) {
                var prop,
                    hasData = false;

                for (prop in obj) {
                    if (obj.hasOwnProperty(prop)) {
                        hasData = true;
                        break;
                    }
                }

                return hasData;
            };

            if (hasProps(contactMethods)) {
                //add contact methods to data obj
                data.contactMethods = contactMethods;
            }

            peopleData.push(data);

            //add button to save microdata
            $("<a/>", {
                href: "#",
                "class": "app-save",
                text: "Save"
            }).on("click", function (e) {
                e.preventDefault();

                var el = $(this),
                    port = chrome.extension.connect(),
                    contacts;

                if (!el.hasClass("app-saved")) {
                    //request saved contacts
                    port.postMessage({ command: "getData" });

                    //listen for response
                    port.onMessage.addListener(function (msg) {

                        //handle messaging
                        if (msg.message === "no contacts") {

                            //create new contacts array
                            contacts = [peopleData[i]];

                            //return updated contacts
                            port.postMessage({ command: "setData", contacts: contacts });

                        } else if (msg.contacts) {

                            //update existing array
                            contacts = msg.contacts;
                            contacts.push(peopleData[i]);

                            //return updated contacts
                            port.postMessage({ command: "setData", contacts: contacts });

                        } else if (msg.message === "success") {

                            //stop resaving by changing icon
                            el.addClass("app-saved").text("Contact information saved");

                            //close the port
                            port.disconnect();
                        }
                    });
                }
            }).appendTo(person);
        });
    }

} ());