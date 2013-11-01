function selectCallback(selectionParentElement) {
  console.log(selectionParentElement.toString());
}

var mouseOrKeyUpHandler;

mouseOrKeyUpHandler = function() {
  var selection = window.getSelection();
  if (selection.rangeCount > 0) {
    var range = selection.getRangeAt(0);
    if (range.toString()) {
      selectCallback(range);
    }
  }
};

document.onmouseup = mouseOrKeyUpHandler;
