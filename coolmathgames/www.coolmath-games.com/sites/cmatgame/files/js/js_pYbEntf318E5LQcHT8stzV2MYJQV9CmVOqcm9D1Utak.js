(function ($) {
  if (typeof Drupal.ajax !== 'undefined') {
    // Keep a reference to the original Drupal.ajax.prototype.beforeSerialize.
    var originalBeforeSerialize = Drupal.ajax.prototype.beforeSerialize;
    /**
     * Handler for the form serialization.
     *
     * Replace original Drupal.ajax.prototype.beforeSerialize to prevent (ajax)
     * submission of card data. This cannot be done using Drupal.detachBehaviors
     * because behaviors are not able to cancel a submission.
     */
    Drupal.ajax.prototype.beforeSerialize = function (element, options) {
      // Use newer jQuery's .prop() when available.
      var propFn = (typeof $.fn.prop === 'function') ? 'prop' : 'attr';
      // Prevent serialisation of form with card data (ie. with enabled stripe
      // inputs elements).
      if (this.form && $(':input[data-stripe]:enabled', this.form).length) {
        // Disable Stripe input elements (and add disabled class on wrapper).
        $(':input[data-stripe]:enabled', this.form)[propFn]('disabled', true)
          .closest('.form-item').addClass('form-disabled');
        // Create the token (unless the form is flagged to prevent it).
        if (!$.data(this, 'stripeNoToken')) {
          // Set publishable key *stored in the form element).
          Stripe.setPublishableKey(this.form.data('stripeKey'));
          //
          var elements = Drupal.behaviors.stripe.extractTokenData(this.form);
          
          Stripe.createToken(Drupal.behaviors.stripe.extractTokenData(this.form), $.proxy(Drupal.ajax.prototype.beforeSerializeStripeResponseHandler, this));
          // Cancel this submit, the form will be re-submitted in token creation
          // callback.
          return false;
        }
      }
      // Call original Drupal.ajax.prototype.beforeSerialize.
      originalBeforeSerialize.apply(this, arguments);
    }

    /**
     * Stripe response handler for intercepted (ajax) form submission.
     *
     * @see Drupal.ajax.prototype.beforeSerialize().
     */
    Drupal.ajax.prototype.beforeSerializeStripeResponseHandler = function(status, response) {
      Drupal.behaviors.stripe.processStripeResponse(status, response, this.form);
      // Always re-submit the form through AJAX, even if token can not be created.
      this.form.ajaxSubmit(this.options);
    }
  }

  Drupal.behaviors.stripe = {
    /**
     * Attach Stripe behavior to form elements.
     *
     * @param context
     *   An element to attach behavior to.
     * @param settings
     *   An object containing settings for the current context.
     */
    attach: function (context, settings)  {
      // Use newer jQuery's .prop() when available.
      var propFn = (typeof $.fn.prop === 'function') ? 'prop' : 'attr';
      // Process all Stripe form elements, even if already processed (ie. not
      // using .once() and context is intentional).
      display_regular_access_plan();
      var usersubpage = /user\/[0-9]*\/subscription/;
      
      if(jQuery('.panel-pane.pane-pane-messages').length && usersubpage.test(location.pathname) ) {
        jQuery('#edit-top-text').after(jQuery('.panel-pane.pane-pane-messages'));
        //jQuery('.panel-pane.pane-pane-messages').html('');
      } else if(jQuery('.panel-pane.pane-pane-messages').length && location.pathname !== '/myaccount') {
        jQuery('#cmatgame-custom-messages-pane').html(jQuery('.panel-pane.pane-pane-messages').html());
        jQuery('.panel-pane.pane-pane-messages').html('');
      } else
      if(jQuery('#cmatgame-custom-messages-pane .pane-content').length && location.pathname !== '/myaccount') {
        jQuery('#edit-top-text').after(jQuery('#cmatgame-custom-messages-pane .pane-content').html())
        jQuery('#cmatgame-custom-messages-pane .pane-content').html('');
      } else
      if(jQuery('#cmatgame-custom-messages-pane .messages.error').length && location.pathname !== '/myaccount') {
        jQuery('#edit-top-text').after(jQuery('#cmatgame-custom-messages-pane'));
      }
      image_preload();
      //attach email validation onblur
      if($(':input[name=email]').length) {
        //Drupal.behaviors.stripe.duplicate_email = true;
        Drupal.behaviors.stripe.duplicate_email_checking = false;
        $(':input[name=email]').blur(validate_subscriber_email);
      }
      $('*[data-stripe-key]').each(function() {
        // Ensure the current element has an DOM ID.
        if (!this.id) {
          $(this)[propFn]('id', 'stripe-' + Drupal.behaviors.stripe.id++);
        }
        var id = this.id;
        // Retrieve the stripe key for this element.
        var key = $(this).attr('data-stripe-key');
        // Get the form containing the Stripe fieldset.
        $(this).closest('form')
          // Enable Stripe input elements (and remove matching classes).
          .find(':input[data-stripe]', this)
            [propFn]('disabled', false)
            .closest('.form-item')
            	.removeClass('form-disabled')
            .end()
          .end()
          // Only do the following once for each form.
          .once('stripe')
          // Register submit handler.
          .submit(Drupal.behaviors.stripe.stripeSubmitHandler)
          // Prevent token generation when the form is submitted with a .stripe-no-token button.
          .find('input[type="submit"].stripe-no-token, button[type="submit"].stripe-no-token')
            .click(Drupal.behaviors.stripe.stripeNoTokenClickHandler)
          .end()
          // Store the key in the form element, to be used in our submit handlers.
          .data('stripeKey', key)
      });
    },
    detach: function(context, settings, trigger) {
      if (trigger === 'unload') {
        // Remove error message for unloaded Stripe inputs.
        $(':input[data-stripe].error', context).each(function(){
        	if (this.id) {
        	  $('#' + this.id + '-error').remove();
        	}
        });
      }
    },
    
    getParameterByName: function(name) {
      var regexS = "[\\?&]" + name + "=([^&#]*)";
      var regex = new RegExp(regexS);
      var results = regex.exec(location.href);
      if (results === null) {
        return "";
      }
      return decodeURIComponent(results[1].replace(/\+/g, " "));
    },
    /**
     * CMG - Verify token data before form submission
     *
     * Stripe.createToken() should support the form as first argument and pull the information
     * from inputs marked up with the data-stripe attribute. But it does not seems to properly
     * pull value from <select> elements for the 'exp_month' and 'exp_year' fields.
     *
     */
    verifyTokenData: function(form) {
      if($('form#cmatgame-subscription-single-page-new-signup-form').length) {
        $('#edit-card-submit').prop("disabled", true).removeClass('submit-start-free-trial').addClass('submit-process-item');
      }
      if(jQuery('.panel-pane.pane-pane-messages .pane-content').length) {
        jQuery('.panel-pane.pane-pane-messages .pane-content').html('');
      }
      if(jQuery('#cmatgame-custom-messages-pane .cmg-subscription-error').length) {
        jQuery('#cmatgame-custom-messages-pane .cmg-subscription-error').html('');
      }
      if(jQuery('#cmatgame_mobile_status_message').length) {
        jQuery('#cmatgame_mobile_status_message').html('');
      }
      if(jQuery('#cmatgame-custom-messages-pane').length) {
        jQuery('#cmatgame-custom-messages-pane').html('');
      }
      var usersubpage = /user\/[0-9]*\/subscription/;
      if(jQuery('.panel-pane.pane-pane-messages').length && usersubpage.test(location.pathname) ) {
        jQuery('.panel-pane.pane-pane-messages').html('');
      }
      var data = {};
      var is_valid = true;
      var error_field = '';
      var error_msg = '';
      var error_count = 0;
      var error_element = '';
      var canadian_states = ['AB', 'BC', 'MB', 'NB', 'NL', 'NT', 'NS', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];
      var country = "US";
      var selected_country = 'US';
      $('.cmg-subscription-error').remove();
      var formid = form.id;
      var duplicate_email_error_set = false;
      //validate_subscriber_email();Do not check on form submit, as the response is not asynchronous
      //check if the plan option is selected
      if(typeof jQuery('.form-item-plan-id input[type=radio]')[0] !== 'undefined' && !$('.form-item-plan-id input[type=radio]').is(':checked')) {
    	  is_valid = false;
    	  error_element = 'plan';
    	  error_count++;
    	  $('.form-item-plan-id input[type=radio]').parent().parent().addClass('radioerror');
      } else if($('.form-item-plan-id input[type=radio]').is(':checked')) {
    	  $('.form-item-plan-id input[type=radio]').parent().parent().removeClass('radioerror');
      }
      
      //
      //check if the form-item-tos is checked
      if(formid !== 'cmatgame-subscription-myaccount-billing-form' && typeof jQuery('.form-item-tos input[type=checkbox]')[0] !== 'undefined' && !$('.form-item-tos input[type=checkbox]').is(':checked')) {
    	  is_valid = false;
    	  error_element = 'tos';
    	  error_count++;
    	  $('.form-item-tos input[type=checkbox]').parent().addClass('checkboxerror');
      } else if(formid !== 'cmatgame-subscription-myaccount-billing-form' && $('.form-item-tos input[type=checkbox]').is(':checked')) {
    	  $('.form-item-tos input[type=checkbox]').parent().removeClass('checkboxerror');
      }
      
      //New Single page signup with minimal fields
      if($(':input[name=email]').length) {
        var validEmail = /^([\w-\+]+(?:\.[\w-\+]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        var email = $('#edit-email').val();
        if(typeof email === 'undefined' || !validEmail.test(email)) {
          $('#edit-email').addClass('error');
          $('#edit-email').css('border: 1px solid #c00 !important;');
          error_msg = '<div class="messages--error" style="margin:0px;padding:0px;">Please enter a valid email address</div>';
          error_element = $('#edit-email').attr('id');
          is_valid = false;
          error_count++;
        } else if(typeof Drupal.behaviors.stripe.duplicate_email !== 'undefined' && Drupal.behaviors.stripe.duplicate_email) {
          $('#edit-email').addClass('error');
          $('#edit-email').css('border: 1px solid #c00 !important;');
          error_msg = '<div class="messages--error" style="margin:0px;padding:0px;">Someone already signed up with that email. <br/><a href="/user/login" style="color: #31a2db;">Login</a> to update your subscription</div>';
          error_element = $('#edit-email').attr('id');
          is_valid = false;
          duplicate_email_error_set = true;
          error_count++;
        } else {
          $('#edit-email').val(email.toLowerCase());
          $('#edit-email').removeClass('error');
          $('#edit-email').css('border: 1px solid #c00 !important;');
        }
      }
      if($(':input[name=pass]').length) {
        var pass = $('#edit-pass').val();
        if(typeof pass === 'undefined' || pass === null || pass === '' || pass.length < 6) {
          $('#edit-pass').addClass('error');
          $('#edit-pass').css('border: 1px solid #c00;');
          error_msg += '<div class="messages--error" style="margin:0px;padding:0px;">Your Password should be at least 6 characters long.</div>';
          error_element = $('#edit-pass').attr('id');
          is_valid = false;
          error_count++;
        } else {
          $('#edit-pass').removeClass('error');
          $('#edit-pass').css('border: 1px solid #c00;');
        }
      }
      
      //check stripe elements like name, address... are set
      $(':input[data-stripe]').each(function() {
    	  var input = $(this);
    	  data[input.attr('data-stripe')] = input.val();
    	  //var validName = /^['’.Ã©Ã Ã«a-zA-Z 0-9-]+$/;
    	  var validName = /^(([A-Za-z\.]+[\-\'\’]?)*([A-Za-z\.]+)?\s)+([A-Za-z\.]+[\-\'\’]?)*([A-Za-z\.]+)?$/;
    	  var validEmail = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    	  if(input.attr('data-stripe') !== "token" && (typeof input.val() === "undefined" || input.val() === '')) {
    		  $(this).addClass('error');
              //console.log("Missing input in "+input.attr('data-stripe'));
    		  //$('.stripe-errors');
    		  is_valid = false;
    		  error_element = input.attr('data-stripe');
    		  error_count++;
	      } else {
	    	  //we need to check if we have valid data for card, zipcode and name...
	    	  switch(input.attr('data-stripe')) {
			    case 'name':
			      if(typeof input.val() === "undefined" || input.val() === '') {
			        error_msg = '<div>Please enter a cardholder name</div>';
              is_valid = false;
              error_count++;
			      } else if(!validName.test(input.val())) {
			        error_msg = '<div>Please enter a valid cardholder name</div>';
			        $(this).addClass('error');
			        is_valid = false;
			        error_count++;
			      }
			      break;
			    case 'address_zip':
			      var zipcode = /(^\d{5})(-\d{4})?$/;
			      var cazip = /^[ABCEGHJKLMNPRSTVXYabceghjklmnprstvxy]{1}\d{1}[A-Za-z]{1} *\d{1}[A-Za-z]{1}\d{1}$/;
			      var valid_zipcode = zipcode.test(input.val());
			      var valid_cazipcode = cazip.test(input.val());
			      if(selected_country === "US" && !valid_zipcode) {
			    	  error_msg = '<div>Please enter a valid zip/postal code</div>';
			    	  is_valid = false;
			    	  error_element = input.attr('data-stripe');
			    	  $(this).addClass('error');
				      error_count++;
			      } else if(selected_country === "CA" && !valid_cazipcode) {
			    	  error_msg = '<div>Please enter a valid zip/postal code</div>';
			    	  is_valid = false;
			    	  error_element = input.attr('data-stripe');
			    	  $(this).addClass('error');
				      error_count++;
			      }
			      break;
			    case 'number':
			      var validcardnumber = /(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/;
			      var isvalid_number = validcardnumber.test(input.val());
			      if(!isvalid_number) {
			        error_msg = '<div>Please enter a valid credit card number</div>';
			        is_valid = false;
			        error_count++;
			      }
			      break;
			    case 'cvc':
            var validcvc = /^[0-9]{3,4}$/;
            var isvalid_cvc = validcvc.test(input.val());
            if(!isvalid_cvc) {
              error_msg = '<div>Please enter a valid cvc</div>';
              is_valid = false;
              error_count++;
            }
            break;
          case 'address_state':
			    	var selected_state = input.val();
			    	selected_state = selected_state.trim();
			    	if(selected_state === "") {
			    		error_msg = '<div>Please select a valid State</div>';
			    		is_valid = false;
			    		error_element = input.attr('data-stripe');
			    		$(this).addClass('error');
				        error_count++;
			    	} else if(canadian_states.indexOf(selected_state) >= 0) {
			    		//console.log("Selected stae is from Canada");
			    		selected_country = 'CA';
			    	} else {
			    		//console.log("Selected stae is from US");
			    	}
			    	break;
			    case 'address_country':
			    	if(selected_country === 'CA') {
			    		input.val('CA');
			    	}
			    	break;
			    case 'exp_month':
			      var selected_month = input.val();
			      var curr_month = new Date().getMonth();
			      if(selected_month === '00') {
			        error_msg = '<div>Please select a valid expiration month</div>';
              is_valid = false;
              error_element = input.attr('data-stripe');
              $(this).addClass('error');
              error_count++;
            }
            break;
			    case 'exp_year':
			      var selected_year = input.val();
            if(selected_year === '0') {
              error_msg = '<div>Please select a valid expiration year</div>';
              is_valid = false;
              error_element = input.attr('data-stripe');
              $(this).addClass('error');
              error_count++;
            }
            break;
          default:
			    	var inputval = input.val();
			      break;
			  }
	      }
      });
      
      if(error_count > 1) {
    	  error_msg = '<div>Please correct the highlighted fields.</div>';
    	  //$('.panel-pane.pane-pane-messages').append(error_msg);
    	  //$('#edit-actions').prepend(error_msg);
      } else if(error_count == 1 && error_msg === '') {
    	  switch(error_element) {
		    case 'name':
		      error_msg = '<div>Please enter a cardholder name</div>';
		      break;
		    case 'address_line1':
		      error_msg = '<div>Please enter a valid Street Address</div>';
		      break;
		    case 'address_city':
		      error_msg = '<div>Please enter a valid City</div>';
		      break;
		    case 'address_state':
		      error_msg = '<div>Please select a State/Province</div>';
		      break;
		    case 'address_zip':
		      error_msg = '<div>Please enter a valid zip/postal code</div>';;
		      break;
		    case 'number':
		      error_msg = '<div>Please enter a valid Credit Card Number</div>';
		      break;
		    case 'cvc':
          error_msg = '<div>Please enter a valid CVC</div>';
          break;
        case 'plan':
		      error_msg = '<div>Please select a Subscription Plan</div>';
		      break;
		    case 'edit-email':
          error_msg = '<div>Please enter a valid email address</div>';
          break;
		    case 'edit-pass':
          error_msg = '<div>Your Password should be at least 6 characters long</div>';
          break;
        case 'tos':
			  error_msg = '<div>Please read and accept our Terms of Use</div>';
			  break;
		    default:
		      break;
		  }
      }
      if(!is_valid) {
    	//$('#cmatgame-subscription-multistep-signup-form').append(error_msg);
        error_msg = '<div class="cmg-subscription-error">' + error_msg + '</div>'
        if(formid === 'cmatgame-subscription-myaccount-billing-form') {
        	$('.panel-pane.pane-pane-messages').append(error_msg);
        } else {
	        $('#cmatgame-custom-messages-pane').append(error_msg);
	        if(jQuery('#cmatgame-custom-messages-pane .cmg-subscription-error').length) {
            jQuery('#edit-top-text').after(jQuery('#cmatgame-custom-messages-pane').html())
            jQuery('#cmatgame-custom-messages-pane').html('');
          }
        }
        if($('form#cmatgame-subscription-single-page-new-signup-form').length) {
          $('#edit-card-submit').prop("disabled", false).addClass('submit-start-free-trial').removeClass('submit-process-item');
        }
      } else {
    	  //console.log('verifyTokenData: Validation is successful');
      }
      
      return is_valid;
    },
    
    /**
     * Extract token creation data from a form.
     *
     * Stripe.createToken() should support the form as first argument and pull the information
     * from inputs marked up with the data-stripe attribute. But it does not seems to properly
     * pull value from <select> elements for the 'exp_month' and 'exp_year' fields.
     *
     */
    extractTokenData: function(form) {
    	var data = {};
      $(':input[data-stripe]').not('[data-stripe="token"]').each(function() {
    	  var input = $(this);
    	  data[input.attr('data-stripe')] = input.val();
    	});
    	return data;
    },
    /**
     * Submit handler for a form containing Stripe inputs.
     *
     * This function expect 'this' to be bound to the submitted form DOM element.
     *
     * @see https://stripe.com/docs/stripe.js#createToken
     *
     * @param event
     *   The triggering event object.
     */
    stripeSubmitHandler: function (event) {
      // Clear out all (Stripe) errors.
      $(':input[data-stripe].error', this).removeClass('error');
      $('.stripe-errors').remove();
      
      var formid = $(this).closest("form").attr('id');
      Drupal.behaviors.stripe.formid = formid;
      //console.log("Stripe.js Button clicked on form "+formid);
      if(formid === 'cmatgame-subscription-myaccount-form') {
    	  return;
      }
      
      var $is_valid = false;
      //validate the fields are not empty
      is_valid = Drupal.behaviors.stripe.verifyTokenData(this);
      if(!is_valid) {
        event.preventDefault();
        if(formid === 'cmatgame-subscription-myaccount-billing-form') {
          $("#edit-card-submit").prop("disabled", false).css("color", "black");
          $("#edit-card-submit-cancel").prop("disabled", false).css("color", "black");
        }
        return false;
      } else {
    	//Disable the submit button and change the image
      	//console.log("Disabling the edit-card-submit button ");
        if(formid === 'cmatgame-subscription-myaccount-billing-form') {
        	$('#edit-card-submit').prop("disabled", true).removeClass('submit-start-free-trial').addClass('myacct-process-item');
        	$('#edit-card-submit-cancel').prop("disabled", true).removeClass('myacct-show-item').addClass('myacct-hide-item');
        } else {
        	$('#edit-card-submit').prop("disabled", true).removeClass('submit-start-free-trial').addClass('submit-process-item');
        }
      }
      
      // Disable Stripe input elements (and add disabled class on wrapper).
      var propFn = (typeof $.fn.prop === 'function') ? 'prop' : 'attr';
      $(':input[data-stripe]:enabled', this.form)[propFn]('disabled', true)
        .closest('.form-item').addClass('form-disabled');
      //console.log("Client side form validation successful. Form fields should now be disabled. ");

      // Create the token (unless the form is flagged to prevent it).
      if (!$.data(this, 'stripeNoToken')) {
        // Set publishable key.
        Stripe.setPublishableKey($.data(this, 'stripeKey'));
        Stripe.createToken(Drupal.behaviors.stripe.extractTokenData(this), $.proxy(Drupal.behaviors.stripe.stripeResponseHandler, this));
        // Prevent the form from submitting with the default action.
        //Something occurred
        //console.log("stripeNoToken: Create the token");
        //TODO HYALLA
        //$(':input[data-stripe]:enabled', this.form)[propFn]('disabled', false)
        //.closest('.form-item').removeClass('form-disabled');
        event.preventDefault();
        return false;
      }
    },
    /**
     * No token button click handler.
     *
     * Set a flag on the form to prevent generation of a Stripe token on submit.
     *
     * @param event
     *   The triggering event object.
     */
    stripeNoTokenClickHandler: function (event) {
      $(this).closest('form').data('stripeNoToken', true);
    },
    /**
     * Stripe (create token) response handler.
     *
     * This function expect 'this' to be bound to the submitted form DOM element.
     *
     * @see https://stripe.com/docs/stripe.js#createToken
     *
     * @param status
     *   The response status code, as described in Stripe API doc.
     * @param response
     *   The response object.
     */
    stripeResponseHandler: function(status, response) {
      Drupal.behaviors.stripe.processStripeResponse(status, response, this);
      if (response.error) {
        // Re-enable Stripe input elements (and remove disabled class on wrapper).
        var propFn = (typeof $.fn.prop === 'function') ? 'prop' : 'attr';
        $(':input[data-stripe]:disabled', this)[propFn]('disabled', false)
          .closest('.form-item').removeClass('form-disabled');
        
        //Renable the submit
        //console.log("Enabling the edit-card-submit button ");
        var formid = Drupal.behaviors.stripe.formid;
        if(formid === 'cmatgame-subscription-myaccount-billing-form') {
        	$('#edit-card-submit').prop("disabled", false).removeClass('myacct-process-item').addClass('myacct-show-item');
        	$('#edit-card-submit-cancel').prop("disabled", false).removeClass('myacct-hide-item').addClass('myacct-show-item');
        } else {
        	$('#edit-card-submit').prop("disabled", false).removeClass('submit-process-item').addClass('submit-start-free-trial');
        }
      }
      else {
        //track form submission event
        if(typeof freeTrialUser !== 'undefined' && freeTrialUser) {
          //trackEvent('Premium Subscription ' +subscriberLeg, 'Subscription success', document.title);
          trackEvent('Premium Subscription ' +subscriberLeg, 'Subscription form submitted', document.title);
          if(typeof testCMGStorage === 'function' && testCMGStorage()) {
            localStorage.removeItem('cmgtypl');
          }
          var date = new Date();
          var hour = date.getHours();
          //trackEvent('Premium Subscription ' +subscriberLeg, 'Subscription success hour', hour);
          var user_played_games = Drupal.behaviors.stripe.getParameterByName('upg');
          if(typeof user_played_games !== 'undefined' && user_played_games !== null && user_played_games !== '') {
            //trackEvent('Premium Subscription ' +subscriberLeg, 'Subscription success - Free games played so far', parseInt(user_played_games));
          } else {
            //trackEvent('Premium Subscription ' +subscriberLeg, 'Subscription success - No free games played', 0);
          }
          //var zeroFreeGamesLeftUsers =localStorage.getItem("zeroFreeGamesLeftUsers");
          var zeroFreeGamesLeftUsers = Drupal.behaviors.stripe.getParameterByName('zfg');
          if(typeof zeroFreeGamesLeftUsers !== 'undefined' && zeroFreeGamesLeftUsers !== null && zeroFreeGamesLeftUsers !== '') {
            //trackEvent('ZeroFreeGamesLeftUsers Subscribed', subscriberLeg, hour);
          }
        }
        dates = new Date();
        //console.log("Signup Form submit :"+dates+". Timestamp: "+dates.getTime());
        this.submit();
      }
    },
    /**
     * Process a Stripe (create token) response for a given form.
     *  - Prepend error message to the form.
     *  - Set hidden token input value. 
     *
     * @param status
     *   The resposne status code, as described in Stripe API doc.
     * @param response
     *   The response object.
     * @param form
     *   The form used to create the token.
     */
    processStripeResponse: function(status, response, form, errorContainer) {
      if (response.error) {
      	var propFn = (typeof $.fn.prop === 'function') ? 'prop' : 'attr';
      	var errorElement = $(':input[data-stripe=' + response.error.param + ']', form);
      	if (errorElement.length === 0) {
      	  errorElement = $('*[data-stripe-key]', form);
      	}
      	// Ensure the error element has an ID
        var id = errorElement[propFn]('id');
        if (!id) {
        	id = 'stripe-' + Drupal.behaviors.stripe.id++;
          errorElement[propFn]('id', id);
        }      	
        
        if (typeof errorContainer === 'undefined') {
          errorContainer = form;
        }
        // Prepend error message to the container, wrapped in a error div.
        //$('<div class="stripe-errors messages error"></div>')
        //	.text(Drupal.t(response.error.message))
        //	[propFn]('id', id + '-error')
        //	.prependTo(form);
        var formid = Drupal.behaviors.stripe.formid
        if(formid === 'cmatgame-subscription-myaccount-billing-form') {
        	//$('<div class="stripe-errors messages error"></div>')
        	$('<div class="cmg-subscription-error"></div>')
        	.text(Drupal.t(response.error.message))
        	[propFn]('id', id + '-error')
            .appendTo('.panel-pane.pane-pane-messages');
        } else {
	        //$('<div class="stripe-errors messages error"></div>')
        	$('<div class="cmg-subscription-error"></div>')
        	.text(Drupal.t(response.error.message))
        	[propFn]('id', id + '-error')
            .appendTo('#cmatgame-custom-messages-pane');
        	if(jQuery('#cmatgame-custom-messages-pane .cmg-subscription-error').length) {
            jQuery('#edit-top-text').after(jQuery('#cmatgame-custom-messages-pane').html())
            jQuery('#cmatgame-custom-messages-pane').html('');
          }
        }

        // Add error class to the corresponding form element.
        errorElement.addClass('error');
      	// Insert empty value in token.
      	$(':input[data-stripe=token]', form).val(null);
      } else {
        // Use newer jQuery's .prop() when available.
        var propFn = (typeof $.fn.prop === 'function') ? 'prop' : 'attr';
        // Insert the token into the form and enabled its element so it gets submitted to the server.
        $(':input[data-stripe=token]', form)[propFn]('disabled', false).val(response.id);
      }
    },
    /**
     * A unique ID to be assigned to Stripe container element without a DOM ID.
     */
    id: 0
  };
  dater = new Date();
  //console.log("Signup Page Load:"+dater+". Timestamp: "+dater.getTime()); 
})(jQuery);

function display_class_room_access(button) {
	//console.log("Class room access button clicked");
	jQuery('.cmatgame-classroom-access-link').addClass("inactive").css('display', 'none');
	jQuery('#edit-regular-access').removeClass("inactive").css('display', 'block');
	jQuery('.class-plans').parent().css('display', 'block');
	jQuery('.non-class-plans').parent().css('display', 'none');
	jQuery('#class-room-access-top-text-wrapper').removeClass('class-signup-text-hide').addClass('class-signup-text-show');
	jQuery('#edit-top-text').removeClass('class-signup-text-show').addClass('class-signup-text-hide');
	return false;
}

function display_regular_access_plan(button) {
	//console.log("Showing Regular access plan");
	jQuery(button).addClass("inactive").css('display', 'none');
	jQuery('#edit-classroom-access').removeClass('inactive').css('display', 'block');
	jQuery('.class-plans').parent().css('display', 'none');
	jQuery('.non-class-plans').parent().css('display', 'block');
	jQuery('#class-room-access-top-text-wrapper').removeClass('class-signup-text-show').addClass('class-signup-text-hide');
  jQuery('#edit-top-text').removeClass('class-signup-text-hide').addClass('class-signup-text-show');
	return false;
}

function image_preload() {
  if (document.images) {
	var img1 = new Image();
	var img2 = new Image();
	var img3 = new Image();

	img1.src = "//www.coolmath-games.com/sites/cmatgame/files/button-processing.png";
	img2.src = "//www.coolmath-games.com/sites/cmatgame/files/free-trial-button-hover.png";
	img3.src = '//www.coolmath-games.com/sites/cmatgame/files/teacher-button-hover.png';
  }
}
function validate_subscriber_email() {
  //console.log('validate_subscriber_email called');
  if(Drupal.behaviors.stripe.duplicate_email_checking) {
    //return;
  }
  var email = jQuery(':input[name=email]').val();
  var validEmail = /^([\w-\+]+(?:\.[\w-\+]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
  if(typeof email !== 'undefined' && email !== null && email !== '') {
    if(!validEmail.test(email)) {
      return;
    }
    email = email.toLowerCase();
    jQuery('#edit-email').val(email);
  }
  if(typeof email !== 'undefined' && email !== null && email !== '' && (typeof Drupal.behaviors.stripe.email_checked === 'undefined' || Drupal.behaviors.stripe.email_checked !== email) ) {
    Drupal.behaviors.stripe.duplicate_email_checking = true;
    //console.log('validate_subscriber_email: posting request to verify '+email);
    var checkEmail = jQuery.post( '/ajax/subscriber/email', { email: email } );
    checkEmail.done(function( data ) {
      var existing_user = data["existing_user"];
      Drupal.behaviors.stripe.email_checked = email;
      //TODO
      if(typeof existing_user !== 'undefined' && existing_user !== null && existing_user !== '') {
        //console.log('Stripe subscription check: Existing user ? '+existing_user);
        Drupal.behaviors.stripe.duplicate_email = existing_user;
        Drupal.behaviors.stripe.duplicate_email_checking = false;
      }
    });
  }
}
;
