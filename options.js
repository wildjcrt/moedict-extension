$(document).ready(function() {
  chrome.storage.local.get('popup_dblclick_key', function(keys) {
    $('#popup_dblclick_key').val(keys.popup_dblclick_key);
  });

  $('#save_button').click(function() {
    chrome.storage.local.set({'popup_dblclick_key': $('#popup_dblclick_key').val()});
  });

  $('#reset_button').click(function() {
    $('#popup_dblclick_key').val('none');
    chrome.storage.local.set({'popup_dblclick_key': 'none'});
  });
});