
var midterm_gere0018 = {
    pages:[],
    listview: "",
    contacts:"",
    contactPostion:"",
    loadCount: 0,
    contactsMap: "",
    backBtn: "",
    overlay:"",
    parsedContacts: [],
    marker:{},
    initialize: function() {
      midterm_gere0018.bindEvents();
    },
    bindEvents: function() {
      document.addEventListener('deviceready', midterm_gere0018.deviceAndDomReady, false);
      document.addEventListener("DOMContentLoaded", midterm_gere0018.deviceAndDomReady, false);
    },
    deviceAndDomReady:function(){
        midterm_gere0018.loadCount++ ;
        console.log(midterm_gere0018.loadCount);
        if(midterm_gere0018.loadCount === 2){
          midterm_gere0018.execute()
        }
    },
   execute: function() {
       console.log("entered execute");
        //define my global variables
        pages = document.querySelectorAll('[data-role = "page"]');
        backBtn = document.querySelector("#backBtn");
        overlay = document.querySelector('[data-role=overlay]');

        //find the user's location to create map
        if( navigator.geolocation ){
        var getLocation = {enableHighAccuracy: false, timeout:60000, maximumAge:60000};
        navigator.geolocation.getCurrentPosition( midterm_gere0018.reportPosition,
                                                 midterm_gere0018.gpsError, getLocation);
        //If it doesn't alert the user with the following message.
        }else{
            alert("OOPS!! your browser needs to be updated and currently does not support location based services.")
        }
     //read the contacts on the device
     var options = new ContactFindOptions();
        options.filter = "";  //leaving this empty will find return all contacts
        options.multiple = true;  //return multiple results
        var filter = ["displayName"];
        navigator.contacts.find(filter, midterm_gere0018.contactsSuccess,
                                midterm_gere0018.contactsError, options);
        listview = document.querySelector("[data-role=listview]");

        //add hammer Listener to the Ul listview
        var hammerlistview = new Hammer.Manager(listview);
        var singleTap = new Hammer.Tap({ event: 'singletap' });
        var doubleTap = new Hammer.Tap({event: 'doubletap', taps: 2 });
        hammerlistview.add([doubleTap, singleTap]);
        doubleTap.recognizeWith(singleTap);
        singleTap.requireFailure([doubleTap]);
        hammerlistview.on('singletap', midterm_gere0018.displayContact);
        hammerlistview.on('doubletap', midterm_gere0018.displayContactLocation);

    },
      //success function
    reportPosition:function( position ){
        contactPostion = position;

   },
    contactsSuccess: function (deviceContacts){
        contacts = deviceContacts;
        console.log("Got to success");
        var contactObjectsArray = [];
         for( var i=0; i<12; i++){
             var objectEntry = {
                 "id":i,
                 "name":contacts[i].displayName,
                 "numbers":contacts[i].phoneNumbers
                };
             contactObjectsArray.push(objectEntry);
        }
        //reset local storage
         //contactObjectsArray=[];
         var contactObjectString = JSON.stringify(contactObjectsArray);
         localStorage.setItem("myContacts", contactObjectString);
         parsedContacts = JSON.parse(localStorage.getItem("myContacts"));
         for( var i=0; i<12; i++){
             listview.innerHTML += '<li data-ref = "' + i + '">'+ parsedContacts[i].name + '</li>';
         }


    },
    contactsError:function (){
        alert("sorry !! we are not able to load your contact right now!!")

    },
    displayContact: function(ev){
       var modal = document.querySelector('[data-role= modal]');
       var ok = document.querySelector('#btnOk');
       var contactName = document.querySelector('#contactName');
       var contactPhoneNumbers = document.querySelector('#contactPhoneNumbers');
       //todo
        var i = ev.target.getAttribute("data-ref");
       contactName.innerHTML = parsedContacts[i].name;
       if(parsedContacts[i].numbers){
           contactPhoneNumbers.innerHTML= "";
            for(var j=0; j<parsedContacts[i].numbers.length; j++){
               contactPhoneNumbers.innerHTML += parsedContacts[i].numbers[j].value + "<br>";
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

    displayContactLocation: function(ev){
        contactsMap = document.querySelector("#contactsMap");
        var H1 = document.querySelector("h1");
        backBtn.style.display = "inline-block";
        H1.setAttribute("id", "movedH1");
        var hammerBackBtn = new Hammer( backBtn);
        hammerBackBtn.on("tap", midterm_gere0018.browserBackButton);
        //clear all existing markers.
//        console.log()
//         if(midterm_gere0018.marker){
//             midterm_gere0018.marker.setMap(null);
//         };
         var i = ev.target.getAttribute("data-ref");
         if(parsedContacts[i].lat && parsedContacts[i].lng){
             console.log("lat and long has saved value");
            var myLatlng = new google.maps.LatLng(parsedContacts[i].lat,
                                                   parsedContacts[i].lng);
            var mapOptions ={
              center:myLatlng,
              zoom:14,
              mapTypeId: google.maps.MapTypeId.ROADMAP
            };

              pages[0].classList.remove("activePage");
              pages[1].classList.add("activePage");
            var map =new google.maps.Map(contactsMap, mapOptions);
              //add animated marker in center of the map.
            marker = new google.maps.Marker({
                  position: myLatlng,
                  map: map,
                  animation: google.maps.Animation.DROP,
                  title: 'user position'
              });

        }else{
            console.log("no saved value");
             //if there is no saved value for longitude and latitude in local storage,
            //display msg to user
            var marker;
            var msgBox = document.querySelector("#msgBox");
            msgBox.style.display = "block";
            overlay.style.display = "block";
            //ok button allows user to go back to map
            var ok2 = document.querySelector("#btnOk2");
            var hammerOk2 = new Hammer(ok2);
            hammerOk2.on('tap', function(){
                console.log("hammer ok2");
                msgBox.style.display = "none";
                overlay.style.display = "none";
                var mapOptions ={
                  center:new google.maps.LatLng(contactPostion.coords.latitude,
                                                contactPostion.coords.longitude),
                  zoom:12,
                  disableDoubleClickZoom: true,
                  mapTypeId: google.maps.MapTypeId.ROADMAP
                };
                pages[0].classList.remove("activePage");
                pages[1].classList.add("activePage");
                  var map =new google.maps.Map(contactsMap, mapOptions);

                function placeMarker(location) {
                  if ( marker ) {
                    marker.setPosition(location);
                  } else {
                    marker = new google.maps.Marker({
                      position: location,
                      map: map
                    });
                  }
                }

                google.maps.event.addListener(map, 'dblclick', function(event) {
                  placeMarker(event.latLng);
                    //set lat and long in localstorage
                    parsedContacts[i].lat = event.latLng.k;
                    parsedContacts[i].lng = event.latLng.D;
                    console.log("The Following JSON is updated");
                    console.log(parsedContacts);
                    //console.log(event.latLng.k);
                    //reset the whole object in local storage everytime you add a new
                    //value or make a change. I cannot add the changed value alone.
                  localStorage.setItem("myContacts", JSON.stringify(parsedContacts));

                });

            });
        }


    },
    browserBackButton:function (ev){
      pages[1].classList.remove("activePage");
      pages[0].classList.add("activePage");
      backBtn.style.display ="none";
    },

    //contacts error fucntion

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
