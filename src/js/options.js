/**
 * Saves options to chrome.storage.sync.
 */
function saveOptions() {

  // span element for alerting user that options were successfully saved
  var status = document.getElementById("save-status");

  // store emphasis character
  var emCharRadio = document.getElementsByName("em-char");
  for (var i = 0; i < emCharRadio.length; i++) {
    if (emCharRadio[i].checked) {
      var emChar = emCharRadio[i].value;
    }
  }

  // store character for unordered list item
  var ulCharRadio = document.getElementsByName("ul-char");
  for (var i = 0; i < ulCharRadio.length; i++) {
    if (ulCharRadio[i].checked) {
      var ulChar = ulCharRadio[i].value;
    }
  }

  // store length of <hr>
  var hrLength = document.getElementById("hr-length").value;
  // if there is no valid value, return out of the function
  // value will be "" in these cases
  if (!hrLength) {
    status.textContent = "Error: need valid separator length";
    return;
  }
  hrLength = parseInt(hrLength, 10);

  // include metadata for context menu selection
  var metadataForSelection =
      document.getElementById("metadata-selection").checked;

  // include metadata for context menu selection
  var metadataForPosts = document.getElementById("metadata-posts").checked;

  // save options in chrome
  chrome.storage.sync.set({
    "emChar": emChar,
    "ulChar": ulChar,
    "hrLength": hrLength,
    "metadataForSelection": metadataForSelection,
    "metadataForPosts": metadataForPosts
  }, function() {
    // update status to let user know options were saved
    status.textContent = "Options saved";
    setTimeout(function() { // status message disappears in 1 second
      status.textContent = "";
    }, 1000);
  });

  // reload background page so that options take effect immediately
  chrome.extension.getBackgroundPage().window.location.reload();
}

/**
 * Restores options based on preferences stored in chrome.storage.sync.
 */
function restoreOptions() {

  // retreieve options
  chrome.storage.sync.get({
    "emChar": "*",
    "ulChar": "*",
    "hrLength": 3,
    "metadataForSelection": true,
    "metadataForPosts": true
  }, function(items) {
    // array of radio elements for emphasis character
    var emCharRadio = document.getElementsByName("em-char");
    for (var i = 0; i < emCharRadio.length; i++) {
      if (emCharRadio[i].value === items.emChar) {
        emCharRadio[i].checked = true;
      }
    }
    var ulCharRadio = document.getElementsByName("ul-char");
    for (var i = 0; i < ulCharRadio.length; i++) {
      if (ulCharRadio[i].value === items.ulChar) {
        ulCharRadio[i].checked = true;
      }
    }
    document.getElementById("hr-length").value = items.hrLength;
    document.getElementById("metadata-selection").checked = items.metadataForSelection;
    document.getElementById("metadata-posts").checked = items.metadataForPosts;
  });
}

/**
 * Ensure hr length textbox can contain only valid values and warn user if
 * there is an invalid value.
 */
function hrLengthVerify() {
  // hr-length text box
  var hrLength = document.getElementById("hr-length");
  // status to inform user is value is valid
  var status = document.getElementById("hr-length-status");
  var validInt = validHrLength(hrLength.value); // test if value is valid
  // valid value
  if (Number.isInteger(validInt)) {
    status.textContent = "";
    hrLength.value = validInt;
  }
  else { // invalid value
    status.textContent = " Invalid value";
    hrLength.value = "";
  }
}

/**
 * If value is between 0 and 100, return value as an integer, otherwise return
 * false.
 *
 * @param {string} value - hr length value
 * @returns {int|boolean} hr length as integer if 0 - 100, otherwise false
 */
function validHrLength(value) {
  var intValue = parseInt(value, 10);
  if (intValue >= 0 && intValue <= 100) {
    return intValue;
  }
  else {
    return false;
  }
}

// when page loads
document.addEventListener("DOMContentLoaded", function() {
  restoreOptions();
  document.getElementById("save").addEventListener("click",
      saveOptions);
  // whenever an input is typed for hr-length, check to see if it is valid
  $("#hr-length").on("input", hrLengthVerify);
});
