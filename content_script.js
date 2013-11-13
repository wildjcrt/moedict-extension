function selectCallback(selectionParentElement) {
  $.ajax({
    url: "https://www.moedict.tw/uni/" + selectionParentElement.toString(),
    dataType: 'json',
    success: function(result) {
      console.log(result);
    },
    error: function(result) {
      console.log('查無資料');
    }
  });
};

document.onmouseup = function() {
  var selection = window.getSelection();
  if (selection.rangeCount > 0) {
    var range = selection.getRangeAt(0);
    if (range.toString()) {
      selectCallback(range);
    }
  }
};
