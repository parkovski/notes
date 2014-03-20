var n_notify = function(message) {
  var box = $('<div/>', {
    class: 'box',
    style: 'position: absolute;\n'
      + 'display: inline-block;\n'
      + 'left: 15px;\n'
      + 'bottom: 15px;\n'
      + 'width: 200px;\n'
      + 'height: 5em;'
  });
  box.text(message);
  $('body').append(box);
  setTimeout(function() {
    box.remove();
  }, 3000);
};
