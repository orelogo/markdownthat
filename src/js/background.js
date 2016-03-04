// whether to include metadata with context menu selection
var metadataForSelection = true;
var metadataForPosts = true; // whether to include metadata with posts

// load options
chrome.storage.sync.get({
  // value is the default that will be returned if there is no value stored
  // in chrome.storage.sync
  "emChar": "*",
  "ulChar": "*",
  "hrLength": 3,
  "metadataForSelection": true,
  "metadataForPosts": true
}, function(items) {
  console.log("Loading items from storage.sync");
  // define character for emphasis
  EMPHASIS_CHAR = items.emChar;
  // define character for unordered list items
  UL_CHAR = items.ulChar + " ";
  HR_LENGTH = items.hrLength; // length of horizontal rule separator
  metadataForSelection = items.metadataForSelection;
  console.log("metadataForSelection: " + metadataForSelection);
  metadataForPosts = items.metadataForPosts;
  console.log("metadataForPosts: " + metadataForPosts);
});

// registers context menu on installation, since the background page is not
// persistent
chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    "title": "Mark That Down",
    "id": "markThatDown",
    "contexts": ["all"]
  });
});

// add contextMenu listener since our background page is not persistent
chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === "markThatDown") {
    console.log("Sending contextMenu message to content script");
    // deterine which tab is active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      // send message to active tab
      chrome.tabs.sendMessage(tabs[0].id, {
        "contextMenu": "markThatDown"
      });
    });
  }
});

// receive message from contentscript and respond with markdown
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  var markdown = ""; // markdown to be sent to popup
  if (message.from === "postData") {
    if (metadataForPosts) { // options set to include metadata
      markdown += getMarkdownMetadata(message.title, message.author, message.date, message.url);
    }
    markdown += getMarkdownString(message.html);
  }
  else if (message.from === "selectionData") {
    console.log("Selection post HTML received: " + message.html);
    console.log("Selection text received: " + message.selectionText);
    // add p tag if message has no outer tags, important in the event of a
    // strong tag within an excerpt of a single paragraph
    if (message.html[0] !== "<") {
      message.html = "<p>" + message.html + "</p>";
    }
    markdown = getMarkdownString(message.html);
    markdown = clipSelection(markdown, message.selectionText);

    // options set to include metadata for context menu selection
    if (metadataForSelection) {
      markdown = getMarkdownMetadata(message.title, message.author, message.date, message.url) +
          markdown;
    }
  }
  sendResponse({"markdown": markdown});
});

/**
 * Get markdown format of post html.
 *
 * @param {string} html - HTML of the post
 * @returns {string} markdown format of the post
 */
function getMarkdownString(html) {
  markdownString = "";
  postHtml = html;
  var body = scanHtml();
  console.log("Body element:");
  console.log(body);
  iterateElementContent(body);
  markdownCleanUp();
  console.log("MARKDOWN STRING: " + markdownString);
  return markdownString;
}

/**
 * Get markdown format of post metadata.
 *
 * @param {string} postTitle - title of the post
 * @param {string} author - author of the post
 * @param {string} date - date of the post
 * @param {string} url - url of the post
 * @returns {string} markdown format of post metadata
 */
function getMarkdownMetadata(postTitle, author, date, url) {
  console.log(postTitle + " " + postTitle.length);
  var metadata = postTitle + "\n" + Array(postTitle.length + 1).join("=") +
    "\n[";
  if (author) { // if there is author information
    metadata += author;
    if (date) { // if both author and date information, add dividor
      metadata += " | ";
    }
  }
  if (date) { // if there is date information
    metadata += date;
  }
  metadata += "](" + url + ")\n\n";
  return metadata;
}

/**
 * Clip the markdown of the entire html post to coincide with only the
 * selection text. This is necessary because the html post is often the entire
 * element which contains the selection text.
 *
 * @param {string} markdown - html post markdown
 * @param {string} selectionText - selection text
 * @returns {string} clipped markdown of the selection
 */
function clipSelection(markdown, selectionText) {

  // regular expression of first and last words from the selection text
  var regExpClip;
  // character for unordered list item that can be used in a reg exp
  var regExpUlChar = getRegExpUlChar(UL_CHAR);

  // array of first words (up to 6) of selection text
  // used to clip out selection from entire markdown of the element
  var firstWords = selectionText.match(
      /^\W*(\w+)\W*(\w*)\W*(\w*)\W*(\w*)\W*(\w*)\W*(\w*)/);
  var lastWords; // array of last 1-3 words of selection text

  if (firstWords[6]) { // if there are at least 6 words in the selection text
    lastWords = selectionText.match(/(\w+)\W*(\w+)\W*(\w+)\W*$/);
    // matches first 3 words and last 3 words
    regExpClip = new RegExp("([^\\w\\s]*|" + regExpUlChar + ")" +
      firstWords[1] + "\\W*" + firstWords[2] + "\\W*" + firstWords[3] +
      "[\\s\\S]*" + lastWords[1] + "\\W*" + lastWords[2] + "\\W*" +
      lastWords[3] + "[^\\s\\w]*");
  }
  else if (firstWords[4]) { // if there are only 4-5 words in the selection text
    lastWords = selectionText.match(/(\w+)\W*(\w+)\W*$/);
    // matches first 2 words and last 2 words
    regExpClip = new RegExp("([^\\w\\s]*|" + regExpUlChar + ")" +
      firstWords[1] + "\\W*" + firstWords[2] + "[\\s\\S]*" + lastWords[1] +
      "\\W*" + lastWords[2] + "[^\\s\\w]*");
  }
  else if (firstWords[2]) { // if there are only 2-3 words in the selection text
    lastWords = selectionText.match(/(\w+)\W*$/);
    // matches first word and last word
    regExpClip = new RegExp("([^\\w\\s]*|" + regExpUlChar + ")" +
    firstWords[1] + "[\\s\\S]*" + lastWords[1] + "[^\\s\\w]*");
  }
  else { // if there is only 1 word in the selection text
    // matches only one word and potential formatting characters
    regExpClip = new RegExp("([^\\w\\s]*|" + regExpUlChar + ")" +
    firstWords[1] + "[^\\s\\w]*");
  }

  var clippedMarkdown = markdown.match(regExpClip);
  if (!clippedMarkdown) {
    return "There was an error. markdown.match(regExpClip) was null";
  }
  return clippedMarkdown[0].trim();
}

/**
 * For use with UL_CHAR. Returns unordered list character with necessary escape
 * character so it can be used in a regular expression.
 *
 * @param {string} ulChar - unordered list character
 * @returns {string} unordered list character with necessary escape
 */
function getRegExpUlChar(ulChar) {
  switch (ulChar) {
    case "* ":
      return "\\* ";
    case "+ ":
      return "\\+ ";
    case "- ":
      return "- ";
  }
}
