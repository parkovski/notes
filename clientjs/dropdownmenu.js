(function() {
  function dropdownMenu(toggle, div) {
    if (!(toggle instanceof $)) toggle = $('#' + toggle);
    if (!(div instanceof $)) div = $('#' + div);
    toggle.click(function(e) {
      var disp = div.css('display');
      console.log('toggle', '"' + disp + '"');
      if (disp === 'none') {
        div.css({display: 'block'});
      } else {
        div.css({display: 'none'});
      }
      e.stopPropagation();
      return false;
    });
  };

  $(function() {
    $('.dropdown').each(function() {
      var $this = $(this);
      console.log('data-toggle', $this.data('toggle'));
      dropdownMenu($this.data('toggle'), $this);
    });
    $(document).click(function() {
      $('.dropdown').css({display: 'none'});
    });
  });
})();
