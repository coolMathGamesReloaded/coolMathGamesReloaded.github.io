/**
 * @file
 * Uses the same old code from coolmath-games.com it's requirements.
 * Responsible for analytics.
 */
var cmg_gdpr_check = getCookie("GDPR");
var cmg_gdpr_reject_check = getCookie("GDPR_Reject");
var cmg_gdpr_all_check = getCookie("GDPR_All");  //GDPR_All cookie is set when user selects accept all cookies in the GDPR overlay
var cmg_gdpr_first_check = getCookie("GDPR_First");

if(cmg_gdpr_check == null || (cmg_gdpr_check != null && (cmg_gdpr_all_check != null || cmg_gdpr_first_check != null))) {  //If GDPR_Reject cookie is set or only GDPR cookie is set then don't add google analytics 
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','__gaTracker');

  if(window.location.host == "stage.coolmath-games.com" || window.location.host == "dev.coolmath-games.com" || window.location.host == "dev2.coolmath-games.com" || window.location.host == "dev3.coolmath-games.com" || window.location.host == "cmatgame.local") {
    __gaTracker('create', 'UA-1192998-21', 'auto');
  } else {
    __gaTracker('create', 'UA-1192998-2', 'auto');
  }
  if(cmg_gdpr_all_check !== null && cmg_gdpr_all_check === "true") {
    __gaTracker("set","contentGroup2","Accepted All Cookies");
  } else if(cmg_gdpr_first_check !== null && cmg_gdpr_first_check === "true"){
    __gaTracker("set","contentGroup2","Accepted First Party Cookies");     
  } else if(cmg_gdpr_check !== null) {
    __gaTracker("set","contentGroup2","GDPR Cookie set by Fastly"); 
  }
  if(typeof gamePage != "undefined" && gamePage) {
    
    if(typeof Drupal.settings.swfembed != "undefined") {
      __gaTracker("set","contentGroup1","Flash Game");        
    } else {
      __gaTracker("set","contentGroup1","HTML5 Game");        
    }
  }
  if(location.protocol == "https:") {
      __gaTracker("set","contentGroup3","HTTPS");
  } else {
    __gaTracker("set","contentGroup3","HTTP");
  }

  if(typeof myDebugAction === 'function' && (window.location.host == 'cmatgame.local' || window.location.host == 'dev.coolmath-games.com' || window.location.host == 'dev2.coolmath-games.com' )) {
    myDebugAction();
  }
  if(typeof subscriberLeg !== 'undefined' && subscriberLeg !== null && subscriberLeg !== '' && typeof freeTrialUser !== 'undefined' && freeTrialUser) {
    //console.log('Setting the subscriber leg to GA content group');
    __gaTracker("set","contentGroup4",subscriberLeg);
  }
  //Subscriber - non Subscriber
  if(typeof getCookie === 'function' ) {
    //console.log("getCookie is defined. Setting AnonymousVsSubscribers custom dimension");
    if(getCookie('cmg_l') !== null && getCookie('cmg_sx') !== null ) {
      __gaTracker("set","contentGroup5","Subscriber");
    } else if (getCookie('cmg_l') !== null && getCookie('cmg_sx') === null ) {
      __gaTracker("set","contentGroup5","Inactive Subscriber");
    } else {
      __gaTracker("set","contentGroup5","Anonymous user");
    }
  }
  //User timezone hour
  __gaTracker('set', 'dimension11', ''+new Date().getHours()+'');

  __gaTracker('send', 'pageview');

} else if(cmg_gdpr_reject_check != null && cmg_gdpr_reject_check == "true"){
  //delete all other cookies like mbox, 
  document.cookie = "has_js" +"=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=" + document.domain;
  if(document.domain == "www.coolmath-games.com") {
    document.cookie = "mbox" +"=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=.coolmath-games.com;";
    document.cookie = "_gat" +"=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=.coolmath-games.com;";
  } else {
    document.cookie = "mbox" +"=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=" + document.domain;
    document.cookie = "_gat" +"=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=" + document.domain;
  }  
  
}

function trackEvent(category, action, label, value) {
  if(typeof value === 'undefined' || value === null) {
    value = 0;
  }
  if(typeof __gaTracker !== "undefined") {
    __gaTracker('send', {
        hitType: 'event',
        eventCategory: category,
        eventAction: action,
        eventLabel: label,
        eventValue: value
    });
  }
}

function trackEventNonInteractive(category, action, label, value, nonactive) {
  if(typeof value === 'undefined' || value === null) {
    value = 0;
  }
  if(typeof nonactive === 'undefined' || nonactive === null) {
    nonactive = 1;
  }
  if(typeof __gaTracker !== "undefined") {
    __gaTracker('send', {
      hitType: 'event',
      eventCategory: category,
      eventAction: action,
      eventLabel: label,
      eventValue: value,
      nonInteraction : nonactive
    });
  }
}

function recircEvt(evtAction) {
	// console.log("recircEvt: event action to track = " + evtAction);
    if(typeof __gaTracker !== "undefined") {
      __gaTracker('send', {
          'hitType': 'event',          // Required.
          'eventCategory': 'recirc',   // Required.
          'eventAction': evtAction,      // Required.
          'eventLabel': document.title,
          'eventValue': 0,
          'nonInteraction': 1
      });
    }
}

function emptyAdEvt(width, height) {
	adSize = width + 'x' + height;
	// console.log("emptyAdEvt: logging empty found for ad size " + adSize);
    if(typeof __gaTracker !== "undefined") {
      __gaTracker('send', {
          'hitType': 'event',          // Required.
          'eventCategory': 'ads',   // Required.
          'eventAction': 'empty_ad',      // Required.
          'eventLabel': adSize,
          'eventValue': 0,
          'nonInteraction': 1
      });
    }
}


//Subscription Promos
jQuery('a.subscribe-now-game-page-promo').click(function(){
  if(typeof __gaTracker !== "undefined") {
    __gaTracker('send', {
      hitType: 'event',
      eventCategory: 'Subscribe Promo Button',
      eventAction: 'Game Page Promo Clicked',
      eventLabel: document.title,
      eventValue: '0'
    });
  }
});
jQuery('a.signup-on-login-page').click(function(){
  if(typeof __gaTracker !== "undefined") {
    __gaTracker('send', {
      hitType: 'event',
      eventCategory: 'Subscribe Promo Button',
      eventAction: 'Signup On Login Page Clicked',
      eventLabel: document.title,
      eventValue: '0'
    });
  }
});
jQuery('a.top-subscriber-promo').click(function(){
  if(typeof __gaTracker !== "undefined") {
    __gaTracker('send', {
      hitType: 'event',
      eventCategory: 'Subscribe Promo Button',
      eventAction: 'Top Subscribe Promo Clicked',
      eventLabel: document.title,
      eventValue: '0'
    });
  }
});

jQuery('a.homepage-inline-remove-ads-1').click(function(){
  if(typeof __gaTracker !== "undefined") {
    __gaTracker('send', {
        hitType: 'event',
        eventCategory: 'Subscribe Promo Button',
        eventAction: 'Homepage Inline Promo Clicked',
        eventLabel: document.title,
        eventValue: '0'
    });
  }
});

jQuery('a.message-link').click(function(){
  if(typeof __gaTracker !== "undefined") {
    __gaTracker('send', {
        hitType: 'event',
        eventCategory: 'Subscribe Promo Button',
        eventAction: 'Message Link (Subscribe Info Page)',
        eventLabel: document.title,
        eventValue: '0'
    });
  }
});

//HTML5 Games Link when Flash Not Enabled
jQuery('#no-flash-overlay .bottom-text p a.html5-games-link').click(function(){
  if(typeof __gaTracker !== "undefined") {
  __gaTracker('send', {
    hitType: 'event',
        hitType: 'event',
        eventCategory: 'HTML5 Page',
        eventAction: 'Check Out Link',
        eventLabel: document.title,
        eventValue: '0'
    });
  }
});

//Chess Promo Clicks
jQuery('a.chess-link-header').click(function(){
  if(typeof __gaTracker !== "undefined") {
    __gaTracker('send',{
        hitType: 'event',
        eventCategory: 'Chess Promo Button',
        eventAction: 'Chess Header Promo Clicked',
        eventLabel: document.title,
        eventValue: '0'
    });
  }
});
jQuery('a.chess-link-right-rail').click(function(){
  if(typeof __gaTracker !== "undefined") {
    __gaTracker('send', {
        hitType: 'event',
        eventCategory: 'Chess Promo Button',
        eventAction: 'Chess Right Rail Promo Clicked',
        eventLabel: document.title,
        eventValue: '0'
    });
  }
});

;
