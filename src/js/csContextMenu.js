// whether to include metadata with context menu selection
var metadataForSelection = true;

// load necessary options into content script
chrome.storage.sync.get({
  "metadataForSelection": true,
}, function(items) {
  metadataForSelection = items.metadataForSelection;
});

// add listener to determine when markThatDown is clicked in the context menu
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log("Received onMessage");
  console.log(message);
  // if the message is from the background page
  if (message.contextMenu === "markThatDown") {
    console.log("Message recevied from background page");
    markdownSelection();
  }
});

/**
 * Send message to chrome which will be read by the background page. Upon
 * receiving a reply, the displayPopup function will be called.
 *
 * @param {Object} message - object containing post information
 */
function sendMessageToBackground(message) {
  chrome.runtime.sendMessage(message, function(response) {
    displayPopup(response.markdown);
  });
}


/**
 * Open the popup div with markdown text inside.
 *
 * @param {string} markdown - markdown formatted text
 */
function displayPopup(markdown) {
  // only inject popup html code if it is not already present
  if (!$(".mtd-popup")[0]) {
    $(document.body).append(
        '<div class="mtd-popup"><button type="button" class="mtd-close"><span>&times;</span></button><h1 class="mtd-title">Mark That Down</h1><textarea class="mtd-textarea"></textarea><div class="mtd-buttons"><button type="button" class="mtd-btn mtd-copy">copy to clipboard</button></div></div>');
  }
  $(".mtd-textarea").val(markdown);
  $(".mtd-close").click(function() {
    $(".mtd-popup").remove();
  });
  $(".mtd-copy").click(copyToClipboard);
}

/**
 * Copy text in popup textbox to clip board.
 */
function copyToClipboard() {
  var currentFocus = document.activeElement;
  var textarea = $(".mtd-textarea");
  textarea.focus();
  textarea.select();
  document.execCommand('copy');
  $(".mtd-copy").focus(); // put focus on copy button
}

/**
 * Get the title and url of the current page in markdown format.
 *
 * @returns {string} title and url of current page in markdown
 */
function getTitleUrlMarkdown() {
  var title = document.title;
  var titleUrl = title + "\n" + Array(title.length + 1).join("=") +
    "\n[](" + document.URL + ")\n\n";
  return titleUrl;
}

/**
 * Get the selection from the DOM, either as html or plain text. If plain text,
 * the popup will be displayed, otherwise a message with the html content will
 * be sent to the background page.
 */
function markdownSelection() {
  var selection = window.getSelection();
  // common node that contains all of the selection
  var container = selection.getRangeAt(0).commonAncestorContainer;
  var selectionContent;  // content of selection, either in text or html
  if (container.nodeType === 1) { // if node is Element
    console.log("nodeType: element");
    console.log(container);
    selectionContent = container.innerHTML; // content will be html
    var message = { // json message to be sent
      "from": "selectionData",
      "title": document.title,
      "author": "",
      "date": "",
      "url": document.URL,
      "html": selectionContent,
      "selectionText": selection.toString()
    };
    sendMessageToBackground(message);
  }
  else { // node is a text node
    console.log("nodeType: text");
    selectionContent = selection.toString(); // content is plain text
    if (metadataForSelection) {
      selectionContent = getTitleUrlMarkdown() + selectionContent;
    }
    displayPopup(selectionContent);
  }
}
