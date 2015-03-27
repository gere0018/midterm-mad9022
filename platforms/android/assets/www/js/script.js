
var midterm_gere0018 = {
    loadCount: 0,
    listview: [],
    pages:[],
    map:"",
    contacts:"",
    contactPostion:"",
    contactsMap: "",
    backBtn: "",
    modal:"",
    msgBox:"",
    overlay:"",
    H1:"",
    marker:"",
    parsedContacts: [],
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
       //console.log("entered execute");
       //define my global variables*****************************************************
       //Question to Steve: is it ok to define my vars on top like this??????????????
       listview = document.querySelector("[data-role=listview]");
        pages = document.querySelectorAll('[data-role = "page"]');
        backBtn = document.querySelector("#backBtn");
        overlay = document.querySelector('[data-role=overlay]');
        H1 = document.querySelector("h1");
        contactsMap = document.querySelector("#contactsMap");
        modal = document.querySelector('[data-role= modal]');
        msgBox = document.querySelector("#msgBox");

        //find the user's location to create map*****************************************
        if( navigator.geolocation ){
        var getLocation = {enableHighAccuracy: false, timeout:60000, maximumAge:60000};
        navigator.geolocation.getCurrentPosition( midterm_gere0018.reportPosition,
                                                 midterm_gere0018.gpsError, getLocation);
        //If it doesn't alert the user with the following message.
        }else{
            alert("OOPS!! your browser needs to be updated and currently does not support location based services.")
        }
        //read the contacts on the device************************************************
        var options = new ContactFindOptions();
        options.filter = "";  //leaving this empty will find return all contacts
        options.multiple = true;  //return multiple results
        var filter = ["displayName"];
        navigator.contacts.find(filter, midterm_gere0018.contactsSuccess,
                                midterm_gere0018.contactsError, options);

        //add hammer Listener to the Ul listview*****************************************
        var hammerlistview = new Hammer.Manager(listview);
        var singleTap = new Hammer.Tap({ event: 'singletap', threshold: 10 });
        var doubleTap = new Hammer.Tap({event: 'doubletap', taps: 2, threshold: 15, posThreshold: 30 });
        hammerlistview.add([doubleTap, singleTap]);
        doubleTap.recognizeWith(singleTap);
        singleTap.requireFailure([doubleTap]);
        hammerlistview.on('singletap', midterm_gere0018.displayContact);
        hammerlistview.on('doubletap', midterm_gere0018.displayContactLocation);

        //add listener to hardware's back button*****************************************
        window.addEventListener("popstate", midterm_gere0018.browserBackButton, false);
    },
      //Geolocation success function
    reportPosition:function( position ){
        contactPostion = position;
         //create the map with center current user position
        var mapOptions ={
          center:new google.maps.LatLng(contactPostion.coords.latitude,
                                        contactPostion.coords.longitude),
          zoom:14,
          disableDoubleClickZoom: true,
          zoomControl: false,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map =new google.maps.Map(contactsMap, mapOptions);
        midterm_gere0018.marker = new google.maps.Marker({
                                                      animation: google.maps.Animation.BOUNCE,
                                                      map: map
                                                    });

   },
     //placemarker function allows the user only one marker
   placeMarker: function placeMarker(location) {
          console.log("Inside placeMarker");
          midterm_gere0018.marker.setPosition(location);
          midterm_gere0018.marker.setAnimation(google.maps.Animation.BOUNCE);
          midterm_gere0018.marker.setMap(map);

    },



    //Contacts success function
    contactsSuccess: function (deviceContacts){
        contacts = deviceContacts;
        //check and handle localstorage*******************************************
        if(window.localStorage) {
            console.log("window has localstorage");
             parsedContacts = JSON.parse(localStorage.getItem("myContacts"));
            //when first opening app check if key doesn't exists in local storgae
            if (parsedContacts == null) {
                parsedContacts = [];
                console.log("this is: " + parsedContacts);
            }
        }
         //loop through my loaded contacts and transform each into a JSOn object
        for( var i=0; i<12; i++){
             //create an object of each contact with the values that I want to save.
             var objectContact = {
                 "id":i,
                 "name": contacts[i].displayName,
                 "numbers": contacts[i].phoneNumbers,
             };
            parsedContacts.push(objectContact);
            //if there is a saved lat and long value from previous use. when app first opens,
            //add values it to my contact object. otherwise lat and lng are set to null.
            if( parsedContacts[i].lat){
                objectContact.lat = parsedContacts[i].lat;
            }else{
                objectContact.lat = null;
            }
            if( parsedContacts[i].lng){
                objectContact.lng = parsedContacts[i].lng;
            }else{
                objectContact.lng = null;
            }


        }
        //stringify the parsedContacts and save it in local storage as a value for key myContacts.
         var stringContacts = JSON.stringify(parsedContacts);
         localStorage.setItem("myContacts", stringContacts);
         parsedContacts = JSON.parse(localStorage.getItem("myContacts"));

         for( var i=0; i<12; i++){
             listview.innerHTML += '<li data-ref = "' + i + '">' + parsedContacts[i].name + '</li>';
         }

    },
    //contacts error fucntion
    contactsError:function (){
        alert("sorry !! we are not able to load your contact right now!!")

    },
    //function that gets executed on single tap
    displayContact: function(ev){

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
       history.pushState(null, null, "#overlay");
       var hammerOk = new Hammer(ok);
       hammerOk.on('tap', function(){
            overlay.style.display = "none";
            modal.style.display = "none";

       });

   },
    //function that gets executed on single tap
    displayContactLocation: function(ev){
         //get the data-ref value of the li that is clicked to get its contact info
         var i = ev.target.getAttribute("data-ref");
        //clear all existing markers
         if(midterm_gere0018.marker){
             midterm_gere0018.marker.setMap(null);
             console.log(" clear marker");
         }
         //display the location page containing the map
          pages[0].classList.remove("activePage");
          pages[1].classList.add("activePage");
          //push history state to allow hardware backbtn to function
          history.pushState(null, null, "#location");
          // resizing the map after setting the location page display to block.
          //without this code map doesn't show fully.only small portion shows
          google.maps.event.trigger(map, "resize");
          //map.setZoom(map.getZoom());
          //adjust title position to accomodate backbtn
          H1.classList.add("movedH1");
          //display backbtn
          backBtn.style.display = "inline-block";
          //add hammer on back button. I noticed that hammer works only after button's diplay is
          //block. hammer didn't work when added before.
          var hammerBackBtn = new Hammer( backBtn);
          hammerBackBtn.on("tap", midterm_gere0018.browserBackButton);
         //add an event listener on my map. when double clicked add marker
         //and save position in localstorage.
         google.maps.event.addListener(map, 'dblclick', function(event) {
                console.log("setting marker");
                midterm_gere0018.placeMarker(event.latLng);//console.log(event.latLng);

                //set lat and long in the parsedcontacts object
                parsedContacts[i].lat = event.latLng.k;
                parsedContacts[i].lng = event.latLng.D;

                 console.log(parsedContacts[i]);
                //reset the whole object in local storage everytime you add a new
                //value or make a change. Cannot add the changed value alone.
                 localStorage.setItem("myContacts", JSON.stringify(parsedContacts));

            });

        //check if this contact's lat and lng have been set in local storage
         if(parsedContacts[i].lat && parsedContacts[i].lng){
             console.log("lat and long has saved value");
              //set map with existing lat and long values.
              var latlng = new google.maps.LatLng(parsedContacts[i].lat, parsedContacts[i].lng);

              midterm_gere0018.marker.setPosition(latlng);
              midterm_gere0018.marker.setAnimation(google.maps.Animation.BOUNCE);
              midterm_gere0018.marker.setMap(map);

              map.setCenter(latlng);
        }else{
             //if there is no saved value for longitude and latitude in local storage,
            //display msg to user
            msgBox.style.display = "block";
            overlay.style.display = "block";
            //ok button allows user to go back to map
            var ok2 = document.querySelector("#btnOk2");
            var hammerOk2 = new Hammer(ok2);
            hammerOk2.on('tap', function(){
                msgBox.style.display = "none";
                overlay.style.display = "none";
            });
        }

    },
    browserBackButton:function (ev){
      ev.preventDefault();
      pages[1].classList.remove("activePage");
      pages[0].classList.add("activePage");
      backBtn.style.display ="none";
      H1.classList.remove("movedH1");
      overlay.style.display = "none";
      modal.style.display = "none";
      msgBox.style.display = "none";
    },

    //location error function
    gpsError:function ( error ){
      var errors = {
        1: 'Permission denied',
        2: 'Position unavailable',
        3: 'Request timeout'
      };
        contactPostion = position;
         //create the map with center current user position
        var mapOptions ={
          center:new google.maps.LatLng(0,0),
          zoom:14,
          disableDoubleClickZoom: true,
          zoomControl: false,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map =new google.maps.Map(contactsMap, mapOptions);

    //in case of erros the following function gives an explanation of type of error to the user.
      alert("Error: " + errors[error.code]);
    },

 };

midterm_gere0018.initialize();
