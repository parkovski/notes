require(['jquery'], function($) {
  'use strict';
  
  $(function() {
    var getUrl = function() {
      if (typeof global_classId !== 'undefined') {
        return '/ajax/class/setdescription/' + global_classId;
      } else if (typeof global_orgId !== 'undefined') {
        return '/ajax/org/setdescription/' + global_orgId;
      }
      return '';
    };
    $('#editDesc').click(function() {
      $('#description').hide();
      $('#descriptionEditor').show();
    });
    $('#saveDescription').click(function() {
      var desc = $('#descTA').val();
      console.log(desc);
      if (!desc.length) {
        $('#descriptionEditor').hide();
        $('#description').show();
        return;
      }
      $.ajax({
        url: getUrl(),
        type: 'POST',
        cache: false,
        data: { description: desc },
        success: function(data) {
          $('#descriptionEditor').hide();
          $('#description').show();
          $('#descSpan').text(desc);
        }
      });
    });
    $('#cancelDescription').click(function() {
      $('#descriptionEditor').hide();
      $('#description').show();
    });
  });
});
