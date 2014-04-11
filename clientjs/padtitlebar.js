require(['jquery', 'notify'], function($, notify) {
  $(function() {
    $('#topBar').append($('<input>', {
      type: 'text',
      id: 'titleBar'
    }));

    $('#titleBar').bind('input', function() {
      var $this = $(this);
      var text = $this.val();
      setTimeout(function() {
        var newText = $this.val();
        if (newText !== text || newText.length === 0) {
          return;
        }
        $.ajax({
          url: '/ajax/class/setpagename/' + global_docId,
          type: 'POST',
          cache: false,
          data: { name: newText },
          success: function(data) {
            notify('Document title saved.');
          }
        });
      }, 500);
    });
  });
});
