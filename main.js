var json = "";
var loc = "";

var WSURL = "localhost/RESTInterface/";
var UIURL = "localhost/html5/";

function sync() {

	$.ajax({
		url: "http://" + WSURL + "?action=getAllTemplates",
		context: document.body
		}).done(function(data) {
			readJson(data);
	});
}

function openForm(template) {
	$.ajax({
		url: "http://" + WSURL + "?action=getTemplate&templateId=" + template,
		context: document.body
		}).done(function(data) {
			$("#FormFillerContent").html(data);
	});
	}

function readJson(data) {
	obj = jQuery.parseJSON(data);

	var content = "";
	
	for(var i = 0; i < obj.templateList.length; i++) {
		template = obj.templateList[i];
		div = "<div class=\"formsSelectRow\" onclick=\"ipcEvent('setTemplateId','" + template.templateId + "');\">"  + template.templateName + "</div>";
		content += div;
	}
	
	$("#formsSelectContent").html(content);
}

function loadPage(page) {
	loc = page;
	
	for(var i = 0; i< json.pages.length; i++) {
	if(json.pages[i] != null) {
		if(json.pages[i].pageId == page) {
				pageContent = json.pages[i];
				deployLayout(pageContent.layout,pageContent.fragments);
				
				var url = window.location.toString();
				url = url.substr(0, url.indexOf("#"));
				window.location = url + "#" + page;
				
				break;
			}
		}
	}
}

function constructPage(data) {
	var obj = jQuery.parseJSON(data);
	var layout = obj.pages[0].layout;

	json = obj;
	
	$.ajax({
		url: "http://" + UIURL + "?action=getLayout&layoutName=" + layout,
		context: document.body
		}).done(function(data) {
			$("#contentContainer").html(data);
			deployFragments(layout, obj.pages[0].fragments);
	});
}

function addPage() {
	$.ajax({
		url: "http://" + UIURL + "?action=addPage",
		context: document.body,
		method: "POST",
		data: "pageName=NEW"
		}).done(function(data) {
			refreshDeployInfo();
			refreshTabPanel();
		});

}

function deletePage() {
	$.ajax({
		url: "http://" + UIURL + "?action=deletePage",
		context: document.body,
		method: "POST",
		data: "pageId=" + loc
		}).done(function(data) {
			refreshTabPanel();
		});
	
}


function constructPageMenu(data) {
	var obj = jQuery.parseJSON(data);
	obj.pages.forEach(function(page) {
		
	});
}

function deployLayout(layout, fragments) {
	$.ajax({
		url: "http://" + UIURL + "?action=getLayout&layoutName=" + layout,
		context: document.body
		}).done(function(data) {
			$("#contentContainer").html(data);
			var slotCount = 1;
			while($("#" + layout + "_slot" + slotCount).length > 0) {
				makeSlotDropable("#" + layout + "_slot" + slotCount);
				slotCount++ ;
			}
			console.log("DEPLOYLAYOUT:" + fragments);
			if(fragments != null) {
				deployFragments(layout, fragments);
			}
			storePageLayout(layout, fragments);
	});
}

function storePageLayout(layout, fragments) {
	$.ajax({
		url: "http://" + UIURL + "?action=storePageLayout",
		context: document.body,
		method: "POST",
		data: "pageId="+loc+"&layout="+layout+"&fragments="+fragments
		}).done(function(data) {
			refreshDeployInfo();
		});
}

function deployFragments(layout, fragments) {
	for(var i = 0; i < fragments.length; i++) {
		console.log("deploying" + i);
		//var slot = "#" + layout + "_slot" + (i + 1);
		//var fragment = fragments[i];
		callFragment(fragments[i].slot, fragments[i].fragment);
	}
}

function callFragment(slot, fragment) {
	console.log("Slot: " + slot + " Fragment :" +fragment);
	if(fragment == "null") {
		return;
	}
	$.ajax({
		url: "http://" + UIURL + "?action=getFragment&fragmentId=" + fragment,
		context: document.body
		}).done(function(data) {
			$(slot).html(data);
	});
}


	
function ipcEvent(eventName, eventParam) {
	
	var events = json.events;
	for(var i = 0; i< events.length; i++) {
		if(events[i].eventName === eventName) {
			for(var j = 0; j<events[i].listener.length; j++){
				var exe = events[i].listener[j] + "_" + events[i].eventName + "('" + eventParam + "')";
				try {
					eval(exe);
				} catch(err) {
					console.log(err);
				}
			}
		}
	}
}


$( document ).ready(function() {
		$.ajax({
			url: "http://" + UIURL + "?action=getDeployInfo",
			context: document.body
			}).done(function(data) {
				constructPage(data);
				var url = window.location.toString();
                var thisurl = url.substr(0, url.indexOf("#"));

                if (url.indexOf("#") === -1) {
                    url = "startseite";
                }
                else {
                    url = url.substr(url.indexOf("#") + 1, url.length);
                }
				alert(url);
                loadPage(url);
		});
	});
	
function refreshDeployInfo() {
		$.ajax({
			url: "http://" + UIURL + "?action=getDeployInfo",
			context: document.body
			}).done(function(data) {
				var obj = jQuery.parseJSON(data);
				var layout = obj.pages[0].layout;
				json = obj;
		});
}
	
function makeSlotDropable(slot) {
        $( slot ).droppable({ accept : ".cpMenuItem", activeClass: "portletActive",
        drop: function( event, ui ) {
           var id = ui.draggable.attr("id").toLowerCase();
           id = id.substr(10, id.length - 1);
		   addFragmentToSlot(slot, id);
		   $('#ddListFragments').removeClass('cpDropDownOpen');
        },
        activate: function( event, ui ) {
            $(this).css("background", "#fff;");
        }
    });
}

function addFragmentToSlot(slot, id) {

	$.ajax({
		url: "http://" + UIURL + "?action=addFragmentToSlot",
		context: document.body,
		method: "POST",
		data: "pageId=" + loc + "&slot=" + slot + "&fragment=" + id
		}).done(function(data) {
			callFragment(slot, id);
			refreshDeployInfo();
	});
}

function refreshTabPanel() {
	$.ajax({
		url: "http://" + UIURL + "?action=getMenuItems",
		context: document.body
		}).done(function(data) {
			$(tabPanel).html(data);
	});
}

function makeDraggable(id) {
	$( id ).draggable( { 
		revert : true,
		start :  function( event, ui ) {
			$('#ddListFragments').addClass('cpDropDownOpen');
			}
		,
		stop :function( event, ui ) {
			$('#ddListFragments').removeClass('cpDropDownOpen');
			}
		});
	}
	
function loadjscssfile(filename, filetype){
    if (filetype=="js"){ //if filename is a external JavaScript file
        var fileref=document.createElement('script')
        fileref.setAttribute("type","text/javascript")
        fileref.setAttribute("src", filename)
    }
    else if (filetype=="css"){ //if filename is an external CSS file
        var fileref=document.createElement("link")
        fileref.setAttribute("rel", "stylesheet")
        fileref.setAttribute("type", "text/css")
        fileref.setAttribute("href", filename)
    }
    if (typeof fileref!="undefined")
        document.getElementsByTagName("head")[0].appendChild(fileref)
}
