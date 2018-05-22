$=jQuery;
//pre fetch json
cmatgameSearchGames = '';
$(document).ready(function () {
  $.getJSON("/sites/cmatgame/files/cmatgame_games.json", function(data, status, response) {
    if(typeof data !== 'undefined' && data.length >= 1) {
      cmatgameSearchGames = data;
    }
  }).fail(function(jqxhr, status, error) {
    var err = status + ", " + error;
  });
});

$('.pane-cmatgame-search-search-game').appendTo('ul#menuItems');
$('input[edit-search-bar]').append('<div id="close-search-box">X</div>');

//click on magnifying glass
if ( $('#close-search-box').parent().is('span.field-suffix') ) {
  $('#close-search-box').unwrap();
}

$('.pane-cmatgame-search-search-game label').click(function(e){
  //if it is hidden show it
  $('#edit-search-bar').toggle();
  $('.global-wrapper').css('overflow','hidden');
  $('.search-results-container').toggle();
  $('.search-results-container li').toggle();
  e.stopPropagation();
  $('.pane-cmatgame-search-search-game label').css({
      'float': 'right',
      'text-indent':' -99999px',
      'top': '0px',
      'right': '400px',
      'position': 'relative',
      'border-radius-bottom':'0px'
    });
  $('form#cmatgame-search-block-form div:first-child').addClass('stay-behind');
  $('#close-search-box').css('display','block');
  $('#edit-search-bar').css({'border-bottom-left-radius':'8px','border-bottom-right-radius':'8px'})
});

$('#edit-search-bar').click(function(e) {
  e.stopPropagation();
})
$(document).click(function(e) {
  $('#edit-search-bar').hide();
  $('#close-search-box').hide();
  $('.search-results-container').hide();
  $('.global-wrapper').css('overflow','hidden');
  $('.search-results-container li').toggle();
  $('#edit-search-bar').css({'border-bottom-left-radius':'8px','border-bottom-right-radius':'8px'})
  // $('#cmatgame-search-block-form label').css('left','-2px');
  if(jQuery('.search-results-container').length && jQuery('.search-results-container').html().length) {
    jQuery('.search-results-container').html('');
    $('#edit-search-bar').css({'border-bottom-left-radius':'8px','border-bottom-right-radius':'8px'})
  }
  if($('#edit-search-bar').length && $('#edit-search-bar').val().length) {
    $('#edit-search-bar').val('');
  }
  e.stopPropagation();
})
$('form#cmatgame-search-block-form').submit(function(e){
  e.preventDefault();
});

$(document).ready(function () {
$('form').attr('autocomplete', 'off');
$(".search-item-result .row").click(function() {
  window.location = $(this).find("a").attr("href");
  return false;
});
  if($('#edit-search-bar').length) {
    $('#edit-search-bar').keyup(function (event) {
      if(this.value.length >= 3 && this.value.trim().length >= 2) {
        displaySearchResults(this.value);
      } else {
        $('#edit-search-bar').css({'border-bottom-left-radius':'0px','border-bottom-right-radius':'0px'})
        $('.search-results-container').html('<div class="search-result-no-item"><div class="no-results-row" style="background:#FFF !important;">'+
            '<p>Sorry, no match found</p></div></div').css('display', 'none');
      }
    });
  }
});

function displaySearchResults(searchStr) {
  searchStr = searchStr.trim().replace(/ +(?= )/g,'');
  var matchesStartsWith = searchGamesStartingWith(searchStr);
  var matchesOthers = searchGames(searchStr);
  var matchesWordStartsWith = searchGamesWordStartingWith(searchStr);
  if(typeof matchesStartsWith !== 'undefined' && matchesStartsWith.length || typeof matchesOthers !== 'undefined' && matchesOthers.length || typeof matchesWordStartsWith !== 'undefined' && matchesWordStartsWith.length) {
    // Prepare matches.
    //TODO - simplify
    var ul = $('<ul></ul>');
    var fullResult = [];
    matches = matchesStartsWith;
    for (key in matches) {
      if(fullResult.indexOf(matches[key]['title']) == -1) {
        var src = '/sites/cmatgame/files/styles/thumbnail_small/public/game_thumbnail/'+matches[key]['image'];
        var li_html = '<div class="search-result-item">'+
          '<a class="search-result-link" onclick="cmatgame_search_click(\''+matches[key]['alias']+'\', \''+searchStr+'\'); return false;" href="javascript: cmatgame_search_click(\''+matches[key]['alias']+'\', \''+searchStr+'\');" title="'+matches[key]["title"]+'">'+
          '<div class="row row-class">'+
          '<img class="search-result-image" src="'+src+'">'+matches[key]["title"]+'</div></a></div>';
        var li = $('<li></li>').html(li_html);
        fullResult.push(matches[key]['title'])
        li.appendTo(ul);
      }
    }
    //matchesWordStartsWith
    matches = matchesWordStartsWith;
    for (key in matches) {
      if(fullResult.indexOf(matches[key]['title']) == -1) {
        var src = '/sites/cmatgame/files/styles/thumbnail_small/public/game_thumbnail/'+matches[key]['image'];
        var li_html = '<div class="search-result-item">'+
          '<a class="search-result-link" onclick="cmatgame_search_click(\''+matches[key]['alias']+'\', \''+searchStr+'\'); return false;" href="javascript: cmatgame_search_click(\''+matches[key]['alias']+'\', \''+searchStr+'\');" title="'+matches[key]["title"]+'">'+
          '<div class="row row-class">'+
          '<img class="search-result-image" src="'+src+'">'+matches[key]["title"]+'</div></a></div>';
        var li = $('<li></li>').html(li_html);
        fullResult.push(matches[key]['title'])
        li.appendTo(ul);
      }
    }
    //matchesOthers
    matches = matchesOthers;
    for (key in matches) {
      if(fullResult.indexOf(matches[key]['title']) == -1) {
        var src = '/sites/cmatgame/files/styles/thumbnail_small/public/game_thumbnail/'+matches[key]['image'];
        var li_html = '<div class="search-result-item">'+
          '<a  class="search-result-link" onclick="cmatgame_search_click(\''+matches[key]['alias']+'\', \''+searchStr+'\'); return false;" href="javascript: cmatgame_search_click(\''+matches[key]['alias']+'\', \''+searchStr+'\');" title="'+matches[key]["title"]+'">'+
          '<div class="row row-class">'+
          '<img class="search-result-image" src="'+src+'">'+matches[key]["title"]+'</div></a></div>';
        var li = $('<li></li>').html(li_html);
        fullResult.push(matches[key]['title']);
        li.appendTo(ul);
      }
    }
    $('.search-results-container').html(ul).css('display', 'block');
    $('#edit-search-bar').css({'border-bottom-left-radius':'0px','border-bottom-right-radius':'0px'})
  } else {
    $('#edit-search-bar').css({'border-bottom-left-radius':'0px','border-bottom-right-radius':'0px'})
    $('.search-results-container').html('<div class="search-result-no-item"><div class="no-results-row">'+
        '<p class="no-results-text">Sorry, no match found</p></div></div').css('display', 'block');
  }
}

function searchGamesStartingWith(searchStr) {
  if(cmatgameSearchGames.length) {
    regex = new RegExp('^' +searchStr, 'i');
    matches = $.grep(cmatgameSearchGames, function(element, index){
      return regex.test(element.title);
    });
    if(typeof matches !== 'undefined' && matches.length) {
      return matches;
    } else {
      return;
    }
  }
}

function searchGames(searchStr) {
  if(cmatgameSearchGames.length) {
    regex = new RegExp(searchStr, 'i');
    matches = $.grep(cmatgameSearchGames, function(element, index){ 
      return regex.test(element.title);
    });
    if(typeof matches !== 'undefined' && matches.length) {
      return matches;
    } else {
      return;
    }
  }
}

function searchGamesWordStartingWith(searchStr) {
  if(cmatgameSearchGames.length) {
    regex = new RegExp('\\b' +searchStr, 'i');
    matches = $.grep(cmatgameSearchGames, function(element, index){
      return regex.test(element.title);
    });
    if(typeof matches !== 'undefined' && matches.length) {
      return matches;
    } else {
      return;
    }
  }
}

function cmatgame_search_click(path, str) {
  if(typeof path !== 'undefined' && typeof str !== 'undefined') {
    trackEvent('CmatgameSearch '+str, path, document.title);
    window.location = "http://" + window.location.hostname + '/'+path;
  }
}
;
$=jQuery;
//pre fetch json
qotdData = '';
triviaSource = 'https://www.quizlife.com/sites/acquia_prod/files/quiz/';
$(document).ready(function () {
  $.getJSON(triviaSource+"qotd3.json", function(data, status, response) {
    //console.log("Loaded Trivia qotd3.json");//&& typeof data.qotdQuiz !== 'undefined' && data.qotdQuiz.length >= 1
    if(typeof data !== 'undefined' ) {
      qotdData = data;
      qotdQuizHtml = getqotdQuizHtml();
      jQuery(".homepage-trivia-promo-2").html(qotdQuizHtml);
    }
  }).fail(function(jqxhr, status, error) {
    var err = status + ", " + error;
    //console.log("Failed to load qotd3.json");
  });
});

function getqotdQuizHtml() {
  qotdQuizHtml = '';
  if(typeof qotdData.qotd_image !== 'undefined' && qotdData.qotd_image !== '') {
    qTitle = qotdData.quizTitle;
    qUrl = "/trivia/" + qTitle.replace(" & ","-").replace(/\s/g,"-").replace(/['"!@#$%()?:,.]/g,'').toLowerCase().trim();
    
    qotdQuizHtml = '<div class="game-item trivia-item">'+
    '<div class="game-link-wrapper">'+
      '<a href="'+qUrl+'" class="trivia-link">'+
       '<div class="field-image">'+
       '<img class="trivia-image" typeof="foaf:Image" src="'+qotdData.qotd_image +'" width="83" height="50" alt="" title="'+qTitle+'">'+  
       '</div>'+
       '<h3 class="game-title">QUIZ OF THE DAY: '+qTitle+'</h3>'+
      '</a>'+
    '</div>'+
    '<div class="game-item-description">'+
     '<div class="field-body">'+
     '<p>'+qotdData.dek+' Take the quiz!</p>'+
     '</div>'+
    '</div>'+
   '</div>';
  }
  return qotdQuizHtml;
};
