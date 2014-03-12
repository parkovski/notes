(function() {
  $(function() {
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
        url: '/ajax/class/setdescription/' + global_classId,
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
})();
