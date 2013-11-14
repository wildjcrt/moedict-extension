function selectCallback(selectionParentElement, callback) {
  $.ajax({
    url: "https://www.moedict.tw/uni/" + selectionParentElement.toString(),
    dataType: 'json',
    success: function(result) {
      createDiv('');
      if (typeof(callback) === 'function') {
          callback();
      };
    },
    error: function(result) {
      createDiv('查無資料');
      if (typeof(callback) === 'function') {
          callback();
      };
    }
  });
};

document.onmouseup = function() {
  var selection = window.getSelection();
  if (selection.rangeCount > 0) {
    var range = selection.getRangeAt(0);
    if (range.toString()) {
      thisY = window.pageYOffset + event.clientY + 10;
      thisX = window.pageXOffset + event.clientX + 10;
      selectCallback(range, function(){
        $('#moedict-extension').css('top', thisY);
        $('#moedict-extension').css('left', thisX);
      });
    }
  }
};

function createDiv(content) {
  $('<div id="moedict-extension">foo</div>').appendTo('body');
};
