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
        '<div class="mtd-popup"><button type="button" class="mtd-close"><span>&times;</span></button><h1 class="mtd-title">rMarkdown</h1><textarea class="mtd-textarea"></textarea></div>');
  }
  $(".mtd-textarea").val(markdown);
  $(".mtd-close").click(function() {
    $(".mtd-popup").remove();
  });
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
      "postHtml": selectionContent,
      "selectionText": selection.toString()
    };
    sendMessageToBackground(message);
  }
  else { // node is a text node
    console.log("nodeType: text");
    selectionContent = selection.toString(); // content is plain text
    displayPopup(selectionContent);
  }
}
