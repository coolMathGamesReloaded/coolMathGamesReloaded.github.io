request = jQuery.ajax("/get-random-games", {
    dataType: "json",
    type: "GET",
    cache: true
});

request.done(function( data, textStatus, jqXHR ) {
    var $rand = function(min, max) {
        return Math.floor(arguments.length > 1 ? (max - min + 1) * Math.random() + min : (min + 1) * Math.random());
    };
    window.location = data['#commands'][0]['urls_array'][$rand(0,data['#commands'][0]['urls_array'].length - 1)] + "?random_true";
});
;
