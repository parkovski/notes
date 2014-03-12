$(function() {
  var showCheck = function(selector) {
    var obj = $(selector);
    obj.css({visibility: '', color: 'green'});
    obj.html('&#x2713;');
  };
  var showX = function(selector) {
    var obj = $(selector);
    obj.css({visibility: '', color: 'red'});
    obj.html('&#x2717;');
  };
  var hide = function(selector) {
    $(selector).css({visibility: 'hidden'});
  };
  var showMessage = function(which, message) {
    var obj = $('#' + which + 'Message');
    var span = $('#' + which + 'MessageSpan');
    obj.css({display: '', color: 'red'});
    span.text(message);
  };
  var dontShowMessage = function(which) {
    $('#' + which + 'Message').css({display: 'none'});
  };

  var validate = function(which, valid, message, text) {
    if (typeof text !== 'undefined' && text.length === 0) {
      hide('#' + which + 'Checkmark');
      dontShowMessage(which);
      return;
    }

    if (valid) {
      showCheck('#' + which + 'Checkmark');
      dontShowMessage(which);
    } else {
      showX('#' + which + 'Checkmark');
      showMessage(which, message);
    }
  };

  $('#username').bind('input', function() {
    var text = $(this).val();
    if (text.length === 0) {
      hide('#usernameCheckmark');
      dontShowMessage('username');
      return;
    }
    setTimeout(function() {
      var newText = $('#username').val();
      if (text !== newText) {
        return;
      }
      $.ajax({
        url: '/isuser/' + text,
        cache: false,
        success: function(data) {
          validate(
            'username',
            data === 'false',
            'That username is already taken.'
          );
        }
      });
    }, 500);
  });
  $('#password').bind('input', function() {
    validate(
      'password',
      $(this).val().length >= 6,
      'Dawg that is wack. Make it at least 6 characters.',
      $(this).val()
    );
  });
  $('#email').bind('input', function() {
    var isemail = function(text) {
      var at = text.indexOf('@');
      var dot = text.lastIndexOf('.');
      return text.length >= 5 && ~at && dot > at;
    };

    validate(
      'email',
      isemail($(this).val()),
      'That is not an email. Note that this field is optional.',
      $(this).val()
    );
  });
});
