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
latestQuizzesData = '';
showMoreData = '';
showMoreStart = 0;
showMoreLimit = 15;
showMoreRunning = false;
triviaSource = 'https://www.quizlife.com/sites/acquia_prod/files/quiz/';
$(document).ready(function () {
  //Show navigation block for all users on trivia landing and category pages
  jQuery('.block-projectcuriously-custom-cmc-category-sidebar').show();
  if(typeof getCookie === 'function' && getCookie("cmg_l") !== null) {
    jQuery('.pane-cmatgame-advertisement-cm-g-otherpages-300x250-top').hide()
    jQuery('.pane-cmatgame-advertisement-cm-g-otherpages-300x250-center').hide();
  }
  $.getJSON(triviaSource+"latest-quiz3.json", function(data, status, response) {
    //console.log("Loaded Trivia latest-quiz3.json");
    if(typeof data !== 'undefined' && typeof data.latestQuizzes !== 'undefined' && data.latestQuizzes.length >= 1) {
      latestQuizzesData = data.latestQuizzes;
      latestQuizzesHtml = getLatestQuizzesHtml();
      jQuery("#trivia-home-container").html('<div id="trivia-home-latest-quizzes">'+latestQuizzesHtml+'</div>');
      jQuery('body').addClass('trivia-home');
    }
  }).fail(function(jqxhr, status, error) {
    var err = status + ", " + error;
    //console.log("Failed to load trivia latest-quiz3.json");
  });
  
  //if(showMoreData === '' && showMoreRunning === false) {
    showMoreRunning = true;
    //console.log("Loading homepage-more-favorites.json.")
    $.getJSON(triviaSource+"homepage-more-favorites.json", function(data, status, response) {
      //console.log("Loaded Trivia homepage-more-favorites.json");
      if(typeof data !== 'undefined' && typeof data.showMoreQuizzes !== 'undefined' && data.showMoreQuizzes.length >= 1) {
        showMoreData = data.showMoreQuizzes;
        showMoreFavoritesHtml = getShowMoreHtml();
      }
    }).fail(function(jqxhr, status, error) {
      var err = status + ", " + error;
      //console.log("Failed to load trivia homepage-more-favorites.json");
    }).done(function() {
      //console.log("Done loading json file");
      showMoreRunning = false;
    });
  //}

  //Top Five - Most Popular / Right At Home / On the web...
  //console.log("Loading top-five-top-5-most-popular.json.")
  $.getJSON(triviaSource+"top-five-top-5-most-popular.json", function(data, status, response) {
    //console.log("Loaded Trivia top-five-top-5-most-popular.json");
    mostPopularHtml = getTopFiveHtml(data);
    jQuery('#cmatgame-top-5-most-popular').html(mostPopularHtml);
  }).fail(function(jqxhr, status, error) {
    var err = status + ", " + error;
    //console.log("Failed to load trivia top-five-top-5-most-popular.json");
  }).done(function() {
    //console.log("Done loading top-five-top-5-most-popular.json file");
  });
});

function getLatestQuizzesHtml() {
  var latestQuizzesHTML = '';
  var heroQuizHtml = '';
  var latestQuizzesPrefix = '<div class="contextual-links-region panel-pane pane-block pane-views-recent-quizzes-feed-list-block">'+
    '<div class="pane-content">'+
    '<div class="quiz-listing">'+
    '<div class="view-content">';

  var latestQuizzesSuffix = '</div></div></div></div>';

  if(typeof latestQuizzesData !== 'undefined') {
    //Desktop 3 column rows. recommended in first column
    latestQuizzesLength = latestQuizzesData.length;
    for(i=0; i<latestQuizzesLength; i++) {
      latestQuiz = latestQuizzesData[i];

      if(typeof latestQuiz !== 'undefined' && typeof latestQuiz.url !== 'undefined' && typeof latestQuiz.icon !== 'undefined') {
        qDek = typeof latestQuiz.dek !== 'undefined' ? latestQuiz.dek : '';
        qIcon = latestQuiz.icon;
        qTitle = latestQuiz.title;
        qNid = typeof latestQuiz.nid !== 'undefined' ? latestQuiz.nid : '';
        qUrl = "/trivia/" + qTitle.replace(" & ","-").replace(/\s/g,"-").replace(/['"!@#$%()?:,.]/g,'').toLowerCase().trim();

        qCategoryName = typeof latestQuiz.categoryName !== 'undefined' ? latestQuiz.categoryName : '';
        qCategoryUrl = "/quiz-category/" + qCategoryName.replace(" & ","-").replace(/\s/g,"-").replace(/['"!@#$%()?:,.]/g,'').toLowerCase().trim();
        qTaxColorDark = typeof latestQuiz.taxColorDark !== 'undefined' ? latestQuiz.taxColorDark : '';
        qTaxColorMedium = typeof latestQuiz.taxColorMedium !== 'undefined' ? latestQuiz.taxColorMedium : '';

        var row_type = 'even';
        if((i+1)%2 == 0) {
          row_type = 'odd';
        }
        if(i == 1) {
          row_type += ' views-row-first';
        } else if(i == latestQuizzesLength-1) {
          row_type += ' views-row-last';
        }

        if(typeof latestQuiz.heroQuiz !== 'undefined' && latestQuiz.heroQuiz) {
          if(typeof latestQuiz.heroIcon !== 'undefined' && latestQuiz.heroIcon !== '') {
            qIcon = latestQuiz.heroIcon;
          }
          quizColumn = '<div class="trivia-hero-quiz">'+
            '<div id="hpHero">'+
              '<div class="image-wrap">'+
                '<a href="'+qUrl+'"><img src="'+qIcon+'"></a>'+
              '</div>'+
              '<div class="link-wrap">'+
                '<div class="featured-quiz">QUIZ OF THE DAY</div>'+
                '<h2><a href="'+qUrl+'">'+qTitle+'</a></h2>'+
                '<p><a href="'+qUrl+'">'+qDek+'</a></p>'+
              '</div>'+
            '</div>' +
          '</div>';
          heroQuizHtml = quizColumn + '<div class="panel-separator"></div>';

        } else {
          quizColumn = '<div id="node-'+ qNid +'" class="quiz-row">'+
          '<div class="hp-quiz-icon">'+
          '<div class="field-content"><a href="'+qUrl+'">'+
          '<img class="listing_thumbnail quiz-icon" typeof="foaf:Image" src="'+qIcon+'" alt="'+qTitle+' image">'+
          '</a><noscript>&lt;img class="listing_thumbnail" typeof="foaf:Image" src="'+ qIcon +'" width="188" height="130" alt="" /&gt;</noscript>'+
          '</div></div><div class="quizzes-feed-content">'+
          '<span class="parent-tax-link" style="color:'+qTaxColorDark+'" onmouseover="this.style.color=\''+qTaxColorMedium+'\'" onmouseout="this.style.color=\''+qTaxColorDark+'\'">'+
          '<a href="'+qCategoryUrl+'">'+qCategoryName+'</a>'+
          '</span>'+
          '<div class="quiz-title">'+
          '<span>'+
          '<a href="'+qUrl+'">'+qTitle+'</a>'+
          '</span></div><div class="views-field views-field-body">'+
          '<div class="field-content"><p class="home-quiz-description">'+qDek+'</p>'+
          '</div></div></div></div>';

          latestQuizzesHTML = latestQuizzesHTML + quizColumn;
        }
      }
    }
    //End of for
    //Prepare full html
    if(latestQuizzesHTML.length) {
      latestQuizzesHTML = heroQuizHtml + latestQuizzesPrefix + latestQuizzesHTML + latestQuizzesSuffix;
    }
  } //End of latestQuizzesData processing
  return latestQuizzesHTML;
}

function getShowMoreHtml() {
  var showMoreHTML = '';
  var heroQuizHtml = '';
  jQuery('#trivia-show-more-container').show();
  jQuery('#trivia-home-show-more-container').css('display', 'block');//TODO
  var latestQuizzesPrefix = '<div class="contextual-links-region panel-pane pane-block pane-views-recent-quizzes-feed-list-block">'+
    '<div class="pane-content">'+
    '<div class="quiz-listing">'+
    '<div class="view-content">';

  var latestQuizzesSuffix = '</div></div></div></div>';

  if(typeof showMoreData !== 'undefined') {
    //Desktop 3 column rows. recommended in first column
    ShowMoreLength = showMoreData.length;
    start = showMoreStart;
    end = showMoreStart + showMoreLimit;
    if(end >= ShowMoreLength) {
      jQuery('#show-more-button').hide();
      //console.log('Reached the end of queue. Hide show more');
    } else {
      jQuery('#show-more-button').show();
    }
    ulrow = '';
    for(i=start; i<end; i++) {
      if(i%3 === 0) {
        ulrow = '';
      }
      latestQuiz = showMoreData[i];

      if(typeof latestQuiz !== 'undefined' && typeof latestQuiz.url !== 'undefined' && typeof latestQuiz.icon !== 'undefined') {
        qDek = typeof latestQuiz.dek !== 'undefined' ? latestQuiz.dek : '';
        qIcon = latestQuiz.icon;
        qTitle = latestQuiz.title;
        qNid = typeof latestQuiz.nid !== 'undefined' ? latestQuiz.nid : '';
        qUrl = "/trivia/" + qTitle.replace(" & ","-").replace(/\s/g,"-").replace(/['"!@#$%()?:,.]/g,'').toLowerCase().trim();

        qCategoryName = typeof latestQuiz.categoryName !== 'undefined' ? latestQuiz.categoryName : '';
        qCategoryUrl = typeof latestQuiz.categoryUrl !== 'undefined' ? latestQuiz.categoryUrl : '';
        qTaxColorDark = typeof latestQuiz.taxColorDark !== 'undefined' ? latestQuiz.taxColorDark : '';
        qTaxColorMedium = typeof latestQuiz.taxColorMedium !== 'undefined' ? latestQuiz.taxColorMedium : '';

        var row_type = 'even';
        if((i+1)%2 == 0) {
          row_type = 'odd';
        }
        if(i == 1) {
          row_type += ' views-row-first';
        } else if(i == ShowMoreLength-1) {
          row_type += ' views-row-last';
        }

        if(typeof latestQuiz.heroQuiz !== 'undefined' && latestQuiz.heroQuiz) {
          if(typeof latestQuiz.heroIcon !== 'undefined' && latestQuiz.heroIcon !== '') {
            qIcon = latestQuiz.heroIcon;
          }
          quizColumn = '<div class="contextual-links-region panel-pane pane-block pane-projectcuriously-custom-cmc-hero">'+
          '<div class="pane-content">'+
            '<div id="hpHero">'+
              '<div class="image-wrap">'+
                '<a href="'+qUrl+'"><img src="'+qIcon+'"></a>'+
              '</div>'+
              '<div class="link-wrap">'+
                '<div class="featured-quiz">QUIZ OF THE DAY</div>'+
                '<h2><a href="'+qUrl+'">'+qTitle+'</a></h2>'+
                '<p><a href="'+qUrl+'">'+qDek+'</a></p>'+
              '</div>'+
            '</div>'+
          '</div></div>';
          heroQuizHtml = quizColumn + '<div class="panel-separator"></div>';

        } else {/////botttom half
          quizColumn = '<div id="node-'+ qNid +'" class="quiz-row">'+
          '<div class="field-content"><a href="'+qUrl+'">'+
          '<img class="listing_thumbnail quiz-icon-bottom" typeof="foaf:Image" src="'+qIcon+'" alt="" style="display: inline-block;" >'+
          '</a><noscript>&lt;img class="listing_thumbnail" typeof="foaf:Image" src="'+ qIcon +'" alt="" /&gt;</noscript>'+
          '</div></div><div class="quizzes-feed-content">'+
          '<span class="parent-tax-link" style="color:'+qTaxColorDark+'" onmouseover="this.style.color=\''+qTaxColorMedium+'\'" onmouseout="this.style.color=\''+qTaxColorDark+'\'">'+
          '<a href="'+qCategoryUrl+'">'+qCategoryName+'</a>'+
          '</span>'+
          '<div class="quiz-title">'+
          '<span class="field-content">'+
          '<a href="'+qUrl+'">'+qTitle+'</a>'+
          '</span></div><div class="views-field-body">'+
          '<div class="field-content"><p>'+qDek+'</p>'+
          '</div></div></div>';

          ulrow = ulrow + '<li class="homepage-more-favorite-quiz">'+ quizColumn + '</li>';
          if(i%3 == 2) {
            showMoreHTML = showMoreHTML + '<ul style="list-style: none;">'+ ulrow + '</ul>';
            ulrow = '';
          }
          
        }
      }
    }
    //End of for
    //Prepare full html
    //console.log("showMoreStart "+showMoreStart+". Total show more "+ShowMoreLength);
    showMoreStart = showMoreStart + showMoreLimit;
    if(showMoreHTML.length) {
      showMoreHTML = heroQuizHtml + latestQuizzesPrefix + showMoreHTML + latestQuizzesSuffix;
    }
  } //End of showMoreData processing
  jQuery("#trivia-show-more-container #trivia-home-more-quizzes").append('<div class="home-more-quizzes">'+showMoreHTML+'</div>').show();
  //jQuery('#trivia-home-more-quizzes').show();
}

function getTopFiveHtml(data) {
  topFiveHtml = '';
  if(data !== '' ) {
    liHtml = '';
    for(i=0; i<5; i++) {
      qUrl = "/trivia/" + data.quizzes[i].title.replace(" & ","-").replace(/\s/g,"-").replace(/['"!@#$%()?:,.]/g,'').toLowerCase().trim();
      liHtml += '<li><!-- <em>'+(i+1)+'</em> --><a href="'+ qUrl +'">'+data.quizzes[i].title+'</a></li>';
    }
    //TODO - Remove hardcoded styles
    topFiveHtml = '<section class="block-bean-top-5-most-popular">'+
    '<style type="text/css">'+
    '.block-bean-top-5-most-popular .block-title {font-family: "Amasis MT","Helvetica Neue",Helvetica,Arial,sans-serif; border-bottom: 4px solid #000000; font-size: 20px; font-weight: bold; line-height: 25px; padding-bottom: 0px; }'+
    '.block-bean-top-5-most-popular .block-title span { color: '+data.color+' !important; }'+
    '.block-bean-top-5-most-popular ol.content li:before { background: '+data.color+' !important; content: counter(step-counter); position: absolute; left: -42px; top: 0; line-height: 1; text-align: center; font-style: normal; font-family: "Amasis MT"; font-weight: bold; border-radius: 1.5em; width: 16px; height: 16px; font-size: 17px; padding: 9px; margin-right: 10px; margin-bottom: 5px; color: #fff;}'+
    '.block-bean-top-5-most-popular ol.content { list-style-type: none; list-style-position: inside;}'+
    '.block-bean-top-5-most-popular ol.content li {margin-bottom: 0; position: relative; padding: 0; counter-increment: step-counter; margin: 0 0 15px 42px; padding-top: 3px;}'+
    '</style>'+
    '<h2 class="block-title">Top 5 <span>'+ data.title+'</span></h2>'+
    '<div class="entity entity-bean bean-curiously-top-five clearfix" about="/block/top-5-most-popular" typeof="">'+
    '<ol class="content">'+
    liHtml +
    '</ol></div></section>';
  }
  return topFiveHtml;
}
;
