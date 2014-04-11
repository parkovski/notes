define('notify', ['jquery'], function($) {
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
