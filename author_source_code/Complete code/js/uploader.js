;(function ($) {

    //default configuration
    var defaults = {
        strings: {
            title: "Up - A jQuery uploader",
            dropText: "Drag files here",
            altText: "Or select using the button",
            buttons: {
                choose: "Choose files", 
                upload: "Upload files" 
            },
            tableHeadings: ["Type", "Name", "Size", "Remove all x"]
        }
    }

    //plugin constructor
    function Up(el, opts) {

        //merge defaults and options
        this.config = $.extend(true, {}, defaults, opts);

        //set other props
        this.el = el;
        this.fileList = [];
        this.allXHR = [];
    }

    Up.prototype.init = function() {
        
        var widget = this,
            strings = widget.config.strings,
            container = $("<article/>", {
                "class": "up"
            }),
            heading = $("<header/>").appendTo(container),
            title = $("<h1/>", {
                text: strings.title
            }).appendTo(heading),
            drop = $("<div/>", {
                "class": "up-drop-target",
                html: $("<h2/>", {
                    text: strings.dropText
                })
            }).appendTo(container),
            alt = $("<h3/>", {
                text: strings.altText
            }).appendTo(container),
            upload = $("<input/>", {
                type: "file"
            }).prop("multiple", true).appendTo(container),
            select = $("<a/>", {
                href: "#",
                "class": "button up-choose",
                text: strings.buttons.choose
            }).appendTo(container),
            selected = $("<div/>", {
                "class": "up-selected"
            }).appendTo(container),
            upload = $("<a/>", {
                href: "#",
                "class": "button up-upload",
                text: strings.buttons.upload
            }).appendTo(container);
        
        widget.el.append(container);

        //trigger native file select dialog
        widget.el.on("click", "a.up-choose", function(e) {
            e.preventDefault();
            
            widget.el.find("input[type='file']").click();
        });

        //handle files selected for upload
        widget.el.on("drop change dragover", function(e) {
           
            if (e.type === "dragover") {
                e.preventDefault();
                e.stopPropagation();
                return false;
            } else if (e.type === "drop") {
                e.preventDefault();
                e.stopPropagation();
                widget.files = e.originalEvent.dataTransfer.files;
            } else {
                widget.files = widget.el
                      .find("input[type='file']")[0]
                      .files;
            }
            
            widget.handleFiles();
        });
        
        //remove file or all files
        widget.el.on("click", "td a", function(e) {
            e.preventDefault();

            //remove table
            var removeAll = function() {
                widget.el.find("table").remove();
                widget.el.find("input[type='file']").val("");
                widget.fileList = [];
            }
            
            if (e.originalEvent.target.className == "up-remove-all") {
                removeAll();
            } else {
                var link = $(this),
                    removed,
                    filename = link.closest("tr").children().eq(1).text();
                
                //remove the row
                link.closest("tr").remove();

                //remove from filelist array
                $.each(widget.fileList, function(i, item) {
                    if (item.name === filename) {
                        removed = i;
                    }
                });
                widget.fileList.splice(removed, 1);
                
                //remove table if no more files
                if (widget.el.find("tr").length === 1) {
                    removeAll();
                } 
            }
        });
        
        //upload selected files
        widget.el.on("click", "a.up-upload", function(e) {
            e.preventDefault();

            widget.uploadFiles();
        }); 

    }

    Up.prototype.handleFiles = function() {
        
        //build list of files to be updated
        var widget = this,
            container = widget.el.find("div.up-selected"),
            row = $("<tr/>"),
            cell = $("<td/>"),
            remove = $("<a/>", {
                href: "#"
            }),
            table;

        //create or select table
        if (!container.find("table").length) {
            table = $("<table/>");
            var header = row.clone().appendTo(table),
                strings = widget.config.strings.tableHeadings;

            //build header row
            $.each(strings, function(i, string) {
                var cs = string.toLowerCase().replace(/\s/g, "_"),
                    newCell = cell.clone().addClass("up-table-head " + cs).appendTo(header);

                if (i === strings.length - 1) {
                    //create clear all link
                    var clear = remove.clone().text(string).addClass("up-remove-all");

                    newCell.html(clear).attr("colspan", 2);
                } else {
                    newCell.text(string);
                }
            });
        } else {
            table = container.find("table");
        }

        //build rows
        $.each(widget.files, function(i, file) {
            var fileRow = row.clone(),
                filename = file.name.split("."),
                ext = filename[filename.length - 1],
                del = remove.clone().text("x").addClass("up-remove");
                
            cell.clone().addClass("icon " + ext).appendTo(fileRow);
            cell.clone().text(file.name).appendTo(fileRow);
            cell.clone().text((Math.round(file.size / 1024)) + " kb").appendTo(fileRow);
            cell.clone().html(del).appendTo(fileRow);
            cell.clone().html("<div class='up-progress'/>").appendTo(fileRow);

            fileRow.appendTo(table);

            widget.fileList.push(file);
        });

        //append table if necessary
        if (!container.find("table").length) {
            table.appendTo(container);
        }

        //initialise progress bars
        widget.initProgress();
    }

    //create progressbars
    Up.prototype.initProgress = function() {
        
        this.el.find("div.up-progress").each(function() {
            var el = $(this);

            if (!el.hasClass("ui-progressbar")) {
                el.progressbar();
            }
        });
    }

    //update progressbar
    Up.prototype.handleProgress = function(e, progress) {
        
        //compute percent complete
        var complete = Math.round((e.loaded / e.total) * 100);

        //update progressbar
        progress.progressbar("value", complete);
        
    }

    Up.prototype.uploadFiles = function() {
        var widget = this,
            a = widget.el.find("a.up-upload");

        //don't do it if disabled
        if (!a.hasClass("disabled")) {

            //disable upload button
            a.addClass("disabled");

            //add each file to FormData 
            $.each(widget.fileList, function(i, file) {
                var fd = new FormData(),
                    prog = widget.el.find("div.up-progress").eq(i);
                
                fd.append("file-" + i, file);

                widget.allXHR.push($.ajax({
                    type: "POST",
                    url: "/upload.asmx/uploadFile",
                    data: fd,
                    contentType: false,
                    processData: false,
                    xhr: function() {
                        
                        //add progress handler
                        var xhr = jQuery.ajaxSettings.xhr();
                        
                        if (xhr.upload) {
                            xhr.upload.onprogress = function(e) {
                                widget.handleProgress(e, prog);
                            }
                        }

                        return xhr;
                    }
                }).done(function() {
                    
                    //show confirmation message
                    var parent = prog.parent(),
                        prev = parent.prev();

                    prev.add(parent).empty();
                    prev.text("File uploaded!");
                }));
            });     
                
            //clear table when all uploads complete
            $.when.apply($, widget.allXHR).done(function() {
                widget.el.find("table").remove();

                //re-enable upload button
                widget.el.find("a.up-upload").removeClass("disabled");
            });       
        }
    }

    //extend jQuery with our plugin
    $.fn.up = function(options) {
        new Up(this, options).init();
        return this;
    };

}(jQuery));