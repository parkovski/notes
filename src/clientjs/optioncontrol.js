define('optioncontrol', ['jquery'], function($) {
  'use strict';

  function attachOptionControl(div) {
    var jqDiv = $(div);
    var jqSpans = $('span', div);
    jqSpans.each(function(outerIndex) {
      var jqSpan = $(this);
      jqSpan.click(function() {
        jqSpans.each(function(innerIndex) {
          if (outerIndex === innerIndex) {
            $(this).addClass('selectedOption');
            $(this).removeClass('option');
          } else {
            $(this).addClass('option');
            $(this).removeClass('selectedOption');
          }
        });
        var clickFn = jqDiv.data('click');
        if (typeof clickFn === 'function') {
          clickFn.call(div, jqSpan.attr('name'), outerIndex);
        }
      });
    });
  }

  $.fn.optionControl = function() {
    // $(divElement).optionControl();
    // $(divElement).optionControl(function change(name, index) {});
    if (arguments.length === 0 && this.length > 0) {
      return this.each(function() {
        if (this instanceof HTMLDivElement) {
          attachOptionControl(this);
        }
      });
    } else if (typeof arguments[0] === 'function') {
      var fn = arguments[0];
      return this.each(function() {
        if (this instanceof HTMLDivElement) {
          $(this).data('click', fn);
        }
      });
    }

    return this;
  };

  $('div.optionControl').optionControl();
  
  return 'fix me!';
});
