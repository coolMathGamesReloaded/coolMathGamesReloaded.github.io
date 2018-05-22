(function ($) {
  Drupal.behaviors.cmatgame_subscription = {
  /**
  * Attach client side validation to form elements.
  *
  * @param context
  *   An element to attach behavior to.
  * @param settings
  *   An object containing settings for the current context.
  */
    loginHandler: function (event) {
      // Clear out all (Stripe) errors.
      $('.cmg-subscription-error').remove();
      var error_msg = '';
      var isValid = true;
      if($('.panel-pane.pane-pane-messages .pane-content').length) {
        $('.panel-pane.pane-pane-messages .pane-content').replaceWith('');
      }
      if($('#cmatgame_mobile_status_message_form .panel-pane').length) {
        $('#cmatgame_mobile_status_message_form .panel-pane').html("");
      }
      //console.log('submit button clicked');
      var validEmail = /^([\w-\+]+(?:\.[\w-\+]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
      if($('#edit-email').length) {
        var email = $('#edit-email').val();
        if(typeof email === 'undefined' || !validEmail.test(email)) {
          $('#edit-email').addClass('error');
          $('#edit-email').css('border: 1px solid #c00 !important;');
          error_msg = '<div class="messages--error" style="margin:0px;padding:0px;">Please enter a valid email address</div>';
          //console.log('Invalid email');
    	    isValid = false;
        } else {
          $('#edit-email').val(email.toLowerCase());
          $('#edit-email').removeClass('error');
          $('#edit-email').css('border: 1px solid #c00 !important;');
        }
      }
      if($('#edit-name').length && $('form#user-login').length) {
        var email = $('#edit-name').val();
        if(typeof email === 'undefined' || email === null || email === '') {
          $('#edit-name').addClass('error');
          $('#edit-name').css('border: 1px solid #c00 !important;');
          error_msg = '<div class="messages--error" style="margin:0px;padding:0px;">Please enter a valid email address</div>';
          //console.log('Invalid email');
          isValid = false;
        } else {
          $('#edit-name').val(email.toLowerCase());
          $('#edit-name').removeClass('error');
          $('#edit-name').css('border: 1px solid #c00 !important;');
        }
      }
      if($('#edit-name').length && $('form#cmatgame-subscription-myaccount-login-form').length) {
        var email = $('#edit-name').val();
        if(typeof email === 'undefined' || !validEmail.test(email)) {
          $('#edit-name').addClass('error');
          $('#edit-name').css('border: 1px solid #c00 !important;');
          error_msg = '<div class="messages--error" style="margin:0px;padding:0px;">Please enter a valid email address</div>';
          //console.log('Invalid email');
          isValid = false;
        } else {
          $('#edit-name').val(email.toLowerCase());
          $('#edit-name').removeClass('error');
          $('#edit-name').css('border: 1px solid #c00 !important;');
        }
      }
      
      var pass = $('#edit-pass').val();
      if(typeof pass === 'undefined' || pass === '' || pass.length < 6) {
      	$('#edit-pass').addClass('error');
      	$('#edit-pass').css('border: 1px solid #c00;');
      	error_msg += '<div class="messages--error" style="margin:0px;padding:0px;">Your Password should be at least 6 characters long.</div>';
      	//console.log('Invalid password');
    	isValid = false;
      	
      } else {
    	  $('#edit-pass').removeClass('error');
    	  $('#edit-pass').css('border: 1px solid #c00;');
      }
      if(!isValid) {
        error_msg = '<div style="clear: both; text-align: center; color: #8c2e0b;margin-bottom:20px " class="cmg-subscription-error">' + error_msg + '</div>';
        if($('.panel-pane.pane-pane-messages').length) {
          $('.panel-pane.pane-pane-messages').first().append(error_msg);
        }
        if($('.signup-page-header').length) {
          $('.signup-page-header').before(error_msg);
        }
        event.preventDefault();
        return false;
      } else {
    	return true;
      }
    },
    attach: function (context, settings)  {
      $('form#cmatgame-subscription-multistep-signup-form #edit-submit').click(Drupal.behaviors.cmatgame_subscription.loginHandler);
      $('form#cmatgame-subscription-signup-form1 #edit-submit').click(Drupal.behaviors.cmatgame_subscription.loginHandler);
      if($('form#cmatgame-subscription-myaccount-login-form').length) {
        $('form#cmatgame-subscription-myaccount-login-form #edit-submit').click(Drupal.behaviors.cmatgame_subscription.loginHandler);
      }
      else if($('form#user-login').length) {
        $('form#user-login #edit-submit').click(Drupal.behaviors.cmatgame_subscription.loginHandler);
      }
    },
  }
})(jQuery);;
