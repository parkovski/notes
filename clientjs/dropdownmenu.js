require(['jquery'], function($) {
  function open(menu, button) {
    menu.css({display: 'block'});
    button.addClass('sel');
  }

  function close(menu, button) {
    menu.css({display: 'none'});
    button.removeClass('sel');
  }

  function dropdownMenu(toggle, div) {
    if (!(toggle instanceof $)) toggle = $('#' + toggle);
    if (!(div instanceof $)) div = $('#' + div);
    toggle.click(function(e) {
      var disp = div.css('display');
      if (disp === 'none') {
        open(div, toggle);
      } else {
        close(div, toggle);
      }
      e.stopPropagation();
      return false;
    });
  };

  $(function() {
    $('.dropdown').each(function() {
      var $this = $(this);
      dropdownMenu($this.data('toggle'), $this);
    });
    $(document).click(function() {
      $('.dropdown').css({display: 'none'});
      $('.dropdownButton').removeClass('sel');
    });
  });
});
