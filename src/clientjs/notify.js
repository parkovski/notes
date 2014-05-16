define('notify', ['jquery'], function($) {
  'use strict';

  return function notify(message) {
    var box = $('<div/>', {
      class: 'box notifyBox themeBox'
    });
    box.text(message);
    $('body').append(box);
    setTimeout(function() {
      box.remove();
    }, 2000);
  };
});
