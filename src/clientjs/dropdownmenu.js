require(['jquery'], function($) {
  'use strict';
  
  $(function() {
    var $sidebar = $('#sidebar');
    var $main = $('#main');
    $('#toggleSidebar').click(function() {
      $main.toggleClass('out');
      $sidebar.toggleClass('out');
      return false;
    });
  });
});
