//TODO:[x] add hammer.js instead of handle touch and handle nav and get it functional in spite of event .current target.
//TODO: [x]js create UL with max 12 li and loop through contacts and display them in it.
//TODO: add all contacts to local storage. save contact info as object use JSON.
//TODO: [x]add a dynamic map, register and get key.
//TODO: [x]create modal window that will display contact info.
//TODO: double tap list view goes to map view, markers, contacts lat and long
//TODO: create back button functionality.
var midterm_gere0018 = {
    pages:[],
    numPages:0,
    lists:[],
    numLists:0,
    listview: "",
    contacts:"",
    initialize: function() {
      midterm_gere0018.bindEvents();
    },
    bindEvents: function() {
      document.addEventListener('deviceready', midterm_gere0018.onDeviceReady, false);
      document.addEventListener("DOMContentLoaded", midterm_gere0018.onDomReady, false);
    },
    onDeviceReady: function() {
        //When device is ready read the contacts on the device
     var options = new ContactFindOptions( );
        options.filter = "";  //leaving this empty will find return all contacts
        options.multiple = true;  //return multiple results
        var filter = ["displayName"];
        navigator.contacts.find(filter, midterm_gere0018.contactsSuccess,
                                midterm_gere0018.contactsError, options);
        //find the user's location
        if( navigator.geolocation ){
        var getLocation = {enableHighAccuracy: false, timeout:60000, maximumAge:60000};
        navigator.geolocation.getCurrentPosition( midterm_gere0018.reportPosition,
                                                 midterm_gere0018.gpsError, getLocation);
        //If it doesn't alert the user with the following message.
        }else{
            alert("OOPS!! your browser needs to be updated and currently does not support location based services.")
        }
    },
    // Update DOM on a Received Event
    onDomReady: function(id) {
      midterm_gere0018.prepareNavigation();
    },

    prepareNavigation:function(){
        //add hammer Listeners to toggle menu icon
       pages = document.querySelectorAll('[data-role="page"]');
	   numPages = pages.length;
	   lists = document.querySelectorAll(".tab");
	   numLists = lists.length;
        //loop through my lists and add hammer
	   for(var i=0;i<numLists; i++){
           var hammerLists = new Hammer(lists[i]);
           hammerLists.on('tap', midterm_gere0018.handleNav);
            //FUTURE:add listener to browser's back button

        }
         //load the first page with url=null
           midterm_gere0018.loadPage(null);
         //FUTURE: remove this when testing on device. temp for browser testing.
           //midterm_gere0018.contactsSuccess();

    },
    handleNav:function (ev){
        ev.preventDefault();// preventing page reload
        var href = ev.target.href;
        var parts = href.split("#");//returns an array with 2 strings, the string before # and the string after the #.
        midterm_gere0018.loadPage( parts[1] );
        return false;

    },

    //Deal with history API and switching divs
    loadPage:function ( url ){
        if(url == null){
            //home page first call
            pages[0].className = "activePage";
            history.pushState(null, null, "#contacts");
            setTimeout(function(){
                window.scrollTo(0,0);
            },100);

        }else{
            //loop through pages
            for(var i=0; i < numPages; i++){
                //In Page:for the selected page to become active page
              if(pages[i].id == url){
                  pages[i].className = "activePage pt-page-rotateInNewspaper pt-page-delay500";

                    setTimeout(function(){
                        window.scrollTo(0,0);
                    },100);
                      if(pages[i].id == "location"){
                      midterm_gere0018.displayLocation();
                      }

                history.pushState(null, null, "#" + url);
                }else{
                    //Out Page:for the other page that was active and will be replaced
                      var classes = pages[i].getAttribute("class");
                      if (classes && (-1 !== classes.indexOf("activePage"))){
                           pages[i].className = "activePage pt-page-rotateOutNewspaper";
                        setTimeout(function(pg){
                           pg.classList.remove("activePage");
                           pg.classList.remove("pt-page-rotateOutNewspaper");
                            }, 1000, pages[i]);
                       }
                    }
            }

        }
        //loop through lists
          for(var t=0; t < numLists; t++){
                lists[t].firstChild.classList.remove("activeTab");
            //location is a property of the window object that returns current location
              //url of the document.
                  if(lists[t].firstChild.href == window.location.href){
                    lists[t].firstChild.classList.add("activeTab");
                  }

            }

    },

    contactsSuccess: function (contactsList){
        contacts = contactsList;
        listview = document.querySelector("[data-role=listview]");
         for( var i=0; i<12; i++){
            listview.innerHTML += "<li data-ref= " + i + ">" + contacts[i].displayName + "</li>";
            var hammerlistview = new Hammer.Manager(listview);
            var singleTap = new Hammer.Tap({ event: 'singletap' });
            var doubleTap = new Hammer.Tap({event: 'doubletap', taps: 2 });
            hammerlistview.add([doubleTap, singleTap]);
            doubleTap.recognizeWith(singleTap);
            singleTap.requireFailure([doubleTap]);
            hammerlistview.on('doubletap', midterm_gere0018.displayContactLocation);
            hammerlistview.on('singletap', midterm_gere0018.displayContact);

         }



    },
    displayContactLocation: function(){
        var overlay = document.querySelector('[data-role=overlay]');
        var contactsMap = document.querySelector("#contactsMap");
        overlay.style.display = "block";
        var mapOptions ={
          center:new google.maps.LatLng(45.348247,-75.756086),
          zoom:8,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        contactsMap.style.display = "block";
        var map1 =new google.maps.Map(contactsMap, mapOptions);

    },
    displayContact: function(ev){
      console.log("contact display");
       var overlay = document.querySelector('[data-role=overlay]');
       var modal = document.querySelector('[data-role= modal]');
       var ok = document.querySelector('#btnOk');
       var contactName = document.querySelector('#contactName');
       var contactPhoneNumbers = document.querySelector('#contactPhoneNumbers');
        console.log(ev.target);
       var i = ev.target.getAttribute("data-ref");
       contactName.value = contacts[i].displayName;
       if(contacts[i].phoneNumbers){
            for(var j=0; j<contacts[i].phoneNumbers.length; j++){
               contactPhoneNumbers.value = contacts[i].phoneNumbers[j].value;
            }

       }else{
            contactPhoneNumbers.value = "";
         }

       overlay.style.display = "block";
       modal.style.display = "block";
       var hammerOk = new Hammer(ok);
       hammerOk.on('tap', function(){
            overlay.style.display = "none";
            modal.style.display = "none";

       });

   },
     //success function
    reportPosition:function( position ){
         midterm_gere0018.displayLocation();
        },

    displayLocation: function(){
        //create map options object
        var mapOptions ={
          center:new google.maps.LatLng(45.348247,-75.756086),
          zoom:14,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var mapContainer = document.querySelector(".mapContainer");
        //call the constructor function for the google Maps Object
        var map =new google.maps.Map(mapContainer, mapOptions);

   },
    //contacts error fucntion
    contactsError:function (){
        alert("sorry !! we are not able to load your contact right now!!")

    },
    //location error function
    gpsError:function ( error ){
      var errors = {
        1: 'Permission denied',
        2: 'Position unavailable',
        3: 'Request timeout'
      };
 //in case of erros the following function gives an explanation of type of error to the user.
      alert("Error: " + errors[error.code]);
    },

 };

midterm_gere0018.initialize();
