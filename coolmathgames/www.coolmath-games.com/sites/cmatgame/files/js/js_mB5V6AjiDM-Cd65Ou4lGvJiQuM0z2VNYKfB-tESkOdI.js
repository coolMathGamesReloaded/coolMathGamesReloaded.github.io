if (!window.console) console = {log: function() {}};

var enableDebug=false;
function debugOut(msg){if(enableDebug){console.log(msg);}}

// IE Detection and Version grabbing
ie = false;
if (navigator.appName == "Microsoft Internet Explorer") {
    ie = true;
    var ua = navigator.userAgent;
    var re = new RegExp("MSIE ([0-9]{1,}[.0-9]{0,})");
    if (re.exec(ua) != null) {
        ieVersion = parseInt(RegExp.$1)
    }
}
var refreshCnt = 0;
var refreshTimer;
var useNonGameEvtsTimer = true;
var skipGameEvtsLogic = false; // a few games have this hard-coded, to skip this logic
if ((ie || (ie && ieVersion < 8))) { useNonGameEvtsTimer = false; }
//adding logic for fireboy and run games
if(window.location.pathname == '/0-fireboy-watergirl-2-light-temple' || window.location.pathname == '/0-fireboy-watergirl-3-ice-temple' || window.location.pathname == '/0-fireboy-watergirl-4-crystal-temple' || window.location.pathname == '/0-fireboy-watergirl-forest-temple' || window.location.pathname == '/0-run' || window.location.pathname == '/0-run-2' || window.location.pathname == '/0-run-3') {
	if(ie && ieVersion < 8) {
		useNonGameEvtsTimer = false;
	} else {
		useNonGameEvtsTimer = true;
	}	
}
if(window.location.pathname == '/0-run' || window.location.pathname == '/0-run-2' || window.location.pathname == '/0-run-3') {
	skipGameEvtsLogic = true;
}
var intvlValue = ad_refresh_timer_interval? ad_refresh_timer_interval : 60000; // 1m0s
if(window.location.pathname == '/0-run' || window.location.pathname == '/0-run-2' || window.location.pathname == '/0-run-3' || window.location.pathname == '/0-duck-life' || window.location.pathname == '/0-duck-life-4' ) {
	intvlValue = 180000;
} else if (window.location.pathname == '/0-worlds-hardest-game') {
		intvlValue = 180000; //3  min
	 } else if(window.location.pathname == '/0-b-cubed' || window.location.pathname == '/0-bloxorz' || window.location.pathname == '/0-coffee-shop' ) {
	intvlValue = 60000;
} else if(typeof quizPage != "undefiend" && quizPage == true) {
	intvlValue = 30000;
}
//Free trial user change frequency of refresh to 24 hours
if(typeof freeTrialUser !== 'undefined' && freeTrialUser || cmatgame_subscriber) {
  intvlValue = 24 * 60 * 60* 1000;
}
debugOut("Starting with ad refresh timer of " + intvlValue + " ms")
if(typeof quizPage == "undefiend" || quizPage != true) {  //
	refreshTimer = setTimeout(function(){ myTimerAction() },intvlValue);
}

function myTimerAction() {
    console.log("Refresh timer " + intvlValue + " ms mark");
    refreshAds();
    myStopFunction();
	debugOut("Setting ad refresh timer of " + intvlValue + " ms")
    refreshTimer = setTimeout(function () { myTimerAction() }, intvlValue);
}

function myStopFunction() {
	debugOut("Clearing refreshTimer")
    clearTimeout(refreshTimer);
    refreshTimer = null;
}

// the myTimerAction() function is intended to be used by a client;
// this is intended to be a utility function.
function refreshAds() {

	refreshCnt++;
	googletag.pubads().setTargeting("RxCount", refreshCnt.toString());
    googletag.pubads().setTargeting("Refresh", "True");
	
	  pbjs.que.push(function() {
	  	//Remove video ad unit
	  	if(refreshCnt <= 1) {
	  		for (var i = 0; i < pbjs.adUnits.length; i++) {
		  		if(pbjs.adUnits[i].code == "video1") {
		  			pbjs.adUnits.pop();
		  		}
		  	}
	  	}
	  	pbjs.requestBids({
	        timeout: prebid_timeout_refresh_timeout,
	        bidsBackHandler: function() {
	          pbjs.setTargetingForGPTAsync();
	          jQuery(".reset-content").html("");
	          //googletag.pubads().refresh();
	          if( window.location.pathname == "/" || window.location.pathname == "/1-number-games" || window.location.pathname == "/1-skill-games" || window.location.pathname == "/1-logic-games" || window.location.pathname == "/1-playlists" || window.location.pathname == "/0-jigsaw-puzzles" || window.location.pathname == "/1-strategy-games" || window.location.pathname == "/1-mobile-categories") {
	          	googletag.pubads().refresh([gptadslots[0],gptadslots[1],gptadslots[2],gptadslots[4],gptadslots[5],gptadslots[6],gptadslots[7]]); 
	          } else if(quizPage == true) { // quiz pages refresh all ads 
	          	googletag.pubads().refresh();
	          } else { // all other pages 
	          	googletag.pubads().refresh([gptadslots[0],gptadslots[1],gptadslots[2],gptadslots[4],gptadslots[5]]); 
	          }
	        }
	    });
	  });
	
    doCustomAnalytics('ads', 'refresh');
}

function doCustomAnalytics( evtCat, evtAct ) {
	// Google Analytics
	if(typeof __gaTracker !== "undefined") {
		__gaTracker('send', {
	        'hitType': 'event',          // Required.
	        'eventCategory': evtCat,   // Required.
	        'eventAction': evtAct,      // Required.
	        'eventLabel': document.title,
	        'eventValue': refreshCnt,
	        'nonInteraction': 1
	    });
	}
    
}

// START GAME EVENTS AD REFRESH LOGIC
var gameEvtTimerDone = true; // refresh ads when an event and this boolean is true
var gameEvtTimer;
// START Quiz EVENTS AD REFRESH LOGIC
var quizEvtTimerDone = true; // refresh ads when an event and this boolean is true
var quizEvtTimer;


function cmgDataEvent(key,value) {
	if(typeof __gaTracker !== "undefined") {
		__gaTracker('send', {
	        'hitType': 'event',          // Required.
	        'eventCategory': "game-data-events",   // Required.
	        'eventAction': key,      // Required.
	        'eventLabel': value,
	        'eventValue': 1,
	        'nonInteraction': 1
	    });
	}
	
}
function cmgGameEvent(cm_game_evt, cm_game_lvl) {
	if (!skipGameEvtsLogic) {
		debugOut("cmgGameEvent 2 params received values: " + cm_game_evt + " | " + cm_game_lvl);
		if (useNonGameEvtsTimer) {
			// switch to using Game Events ad refresh logic
			debugOut("Stopping ad refresh timer - switching to Game Events logic");
			myStopFunction();
			//do one time ad refresh
			debugOut("Game Evts ad refresh for the first time");
	    	if(typeof googletag != "undefined") {
	    		googletag.pubads().setTargeting("RxCount", refreshCnt.toString());
	    		googletag.pubads().setTargeting("Action_Refresh", "True");
	    	} 
    		if(typeof pbjs != "undefiend" && typeof googletag != "undefined") {
	    		pbjs.que.push(function() {
	    			//Remove video ad unit
				  	if(refreshCnt <= 1) {
				  		for (var i = 0; i < pbjs.adUnits.length; i++) {
					  		if(pbjs.adUnits[i].code == "video1") {
					  			pbjs.adUnits.pop();
					  		}
					  	}
				  	}
			    	pbjs.requestBids({
				        timeout: prebid_timeout_refresh_timeout,
				        bidsBackHandler: function() {
				          pbjs.setTargetingForGPTAsync();
				          jQuery(".reset-content").html("");
				          //googletag.pubads().refresh(); 
				          googletag.pubads().refresh([gptadslots[0],gptadslots[1],gptadslots[2],gptadslots[4],gptadslots[5]]);
				        }
			    	});
			  	});
	    	}
	    	doCustomAnalytics('ads', 'evt-refresh');
			useNonGameEvtsTimer = false;
			// set the Game Events ad refresh Timer
			if(window.location.pathname == '/0-reach-the-core' ) {
				intvlValue = 120000; // 2 minutes
			} else if(window.location.pathname == '/0-pixel-quest-the-lost-gifts' || window.location.pathname == '/0-ayo-the-hero' || window.location.pathname == '/0-dig-to-china' || window.location.pathname == '/0-jelly-truck' || window.location.pathname == '/0-jelly-escape') {
				intvlValue = 180000; // 3 minutes
			} else if(window.location.pathname == '/0-run' || window.location.pathname == '/0-run-2' || window.location.pathname == '/0-run-3') {
				intvlValue = 180000; // 5 minutes
			} else if(window.location.pathname == '/0-fireboy-watergirl-2-light-temple' || window.location.pathname == '/0-fireboy-watergirl-3-ice-temple' || window.location.pathname == '/0-fireboy-watergirl-4-crystal-temple' || window.location.pathname == '/0-fireboy-watergirl-forest-temple') {
				intvlValue = 300000; // 5 minutes
			} else {
				intvlValue = ad_refresh_event_interval? ad_refresh_event_interval : 30000; // 30 sec
			}
            debugOut("Setting Game Evts ad refresh timer of " + intvlValue + " ms")
		    gameEvtTimer = setTimeout(function () { gameEvtTimerAction() }, intvlValue);
		    gameEvtTimerDone = false;
		}
		if (typeof cm_game_lvl !== 'undefined' && cm_game_evt != 'station') { 
			debugOut("AN EVENT HAPPENED - A LEVEL VALUE WAS RECEIVED");
			gameEvtRefreshAds();
			doCustomAnalytics('game-events', 'start-' + cm_game_lvl);
		} else if (cm_game_evt == "start" || cm_game_evt == "replay" || cm_game_evt == "restart" ) {
			debugOut("STARTING OR RESTARTING PLAY - NO LEVEL INDICATED");
			gameEvtRefreshAds();
			doCustomAnalytics('game-events', 'start');
		} else if (cm_game_evt == 'station') {
			debugOut("STATION RECEIVED");
			doCustomAnalytics('game-events', 'station-' + cm_game_lvl);
		} else if (cm_game_evt !== 'undefined') {
			debugOut("MISC GAME EVENT RECEIVED");
			doCustomAnalytics('game-events', cm_game_evt + '-' + cm_game_lvl);
		}
	} else {
		debugOut("SKIPPING GAME EVENTS LOGIC");
	}
}

// We can't refresh ads until window has finished loading.
var refreshAvail = 0;
jQuery( window ).load(function() {
  refreshAvail = 1;
});

function gameEvtRefreshAds() {
	if ( refreshAvail && gameEvtTimerDone) {
		refreshCnt++;
			debugOut("Game Evts ad refresh");
	    	if(typeof googletag != "undefined") {
	    		googletag.pubads().setTargeting("RxCount", refreshCnt.toString());
	    		googletag.pubads().setTargeting("Action_Refresh", "True");
	    	} 
    		if(typeof pbjs != "undefiend" && typeof googletag != "undefined") {
	    		pbjs.que.push(function() {
	    			//Remove video ad unit
				  	if(refreshCnt <= 1) {
				  		for (var i = 0; i < pbjs.adUnits.length; i++) {
					  		if(pbjs.adUnits[i].code == "video1") {
					  			pbjs.adUnits.pop();
					  		}
					  	}
				  	}
				    pbjs.requestBids({
				        timeout: prebid_timeout_refresh_timeout,
				        bidsBackHandler: function() {
				          pbjs.setTargetingForGPTAsync();
				          jQuery(".reset-content").html("");
				          //googletag.pubads().refresh(); 
				          googletag.pubads().refresh([gptadslots[0],gptadslots[1],gptadslots[2],gptadslots[4],gptadslots[5]]);
				        }
				    });
				});
	    	}
	    	doCustomAnalytics('ads', 'evt-refresh');
			debugOut("Setting Game Evts ad refresh timer of " + intvlValue + " ms");
    	
		gameEvtTimer = setTimeout(function () { gameEvtTimerAction() }, intvlValue);
	    gameEvtTimerDone = false;	
	}
}
function gameEvtTimerAction() {
	console.log("Game Evts timer mark");
	gameEvtTimerDone = true;
	clearGameEvtTimer();
}

function clearGameEvtTimer() {
	debugOut("Clearing gameEvtTimer")
    clearTimeout(gameEvtTimer);
    gameEvtTimer = null;
}

function quizEvtRefreshAds() {
  if(refreshCnt == 0) {
  	debugOut("Setting Quiz Evts ad refresh timer of " + intvlValue + " ms" + ":refreshCnt: " + refreshCnt);
  	quizEvtTimer = setTimeout(function () { quizEvtTimerAction() }, intvlValue);
  	quizEvtTimerDone = false;
  	refreshCnt++
  } else if (quizEvtTimerDone) {
  	refreshCnt++;
  	debugOut("Quiz Evts ad refresh");
	if(typeof googletag != "undefined") {
		googletag.pubads().setTargeting("RxCount", refreshCnt.toString());
		googletag.pubads().setTargeting("Quiz_Refresh", "True");
	}
    if(typeof pbjs != "undefiend" && typeof googletag != "undefined") {
		pbjs.que.push(function() {
			pbjs.requestBids({
			    timeout: prebid_timeout_refresh_timeout,
			    bidsBackHandler: function() {
			      pbjs.setTargetingForGPTAsync();
			      jQuery(".reset-content").html("");
			      googletag.pubads().refresh(); 
			    }
			});
		});
	}
    doCustomAnalytics('ads', 'evt-quiz-refresh');
	debugOut("Setting Quiz Evts ad refresh timer of " + intvlValue + " ms");
    quizEvtTimer = setTimeout(function () { quizEvtTimerAction() }, intvlValue);
    quizEvtTimerDone = false;
  }
}
function quizEvtTimerAction() {
  quizEvtTimerDone = true;
  clearQuizEvtTimer();
}

function clearQuizEvtTimer() {
  clearTimeout(quizEvtTimer);
  quizEvtTimer = null;
}
;
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
