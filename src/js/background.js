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
  if (message.from === "postData") {
    markdown = getMarkdownMetadata(message.title, message.author, message.date, message.url) +
        getMarkdownString(message.html);
    sendResponse({"markdown": markdown});
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

    markdown = getMarkdownMetadata(message.title, message.author, message.date, message.url) +
        markdown;
    sendResponse({"markdown": markdown});
  }
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

// clip the markdown so that it only includes the selected text

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
  // array of first words (up to 6) of selection text
  // used to clip out selection from entire markdown of the element
  var firstWords = selectionText.match(
      /^\W*(\w+)\W*(\w*)\W*(\w*)\W*(\w*)\W*(\w*)\W*(\w*)/);
  var lastWords; // array of last 1-3 words of selection text
  console.log("First words:");
  console.log(firstWords);

  if (firstWords[6]) { // if there are at least 6 words in the selection text
    lastWords = selectionText.match(/(\w+)\W*(\w+)\W*(\w+)\W*$/);
    // matches first 3 words and last 3 words
    regExpClip = new RegExp("([^\\w\\s]*|" + UL_CHAR + ")" + firstWords[1] +
      "\\W*" + firstWords[2] + "\\W*" + firstWords[3] + "[\\s\\S]*" +
      lastWords[1] + "\\W*" + lastWords[2] + "\\W*" + lastWords[3] +
      "[^\\s\\w]*");
  }
  else if (firstWords[4]) { // if there are only 4-5 words in the selection text
    lastWords = selectionText.match(/(\w+)\W*(\w+)\W*$/);
    // matches first 2 words and last 2 words
    regExpClip = new RegExp("([^\\w\\s]*|" + UL_CHAR + ")" + firstWords[1] +
      "\\W*" + firstWords[2] + "[\\s\\S]*" + lastWords[1] + "\\W*" +
      lastWords[2] + "[^\\s\\w]*");
  }
  else if (firstWords[2]) { // if there are only 2-3 words in the selection text
    lastWords = selectionText.match(/(\w+)\W*$/);
    // matches first word and last word
    regExpClip = new RegExp("([^\\w\\s]*|" + UL_CHAR + ")" + firstWords[1] +
      "[\\s\\S]*" + lastWords[1] + "[^\\s\\w]*");
  }
  else { // if there is only 1 word in the selection text
    // matches only one word and potential formatting characters
    regExpClip = new RegExp("([^\\w\\s]*|" + UL_CHAR + ")" + firstWords[1] +
      "[^\\s\\w]*");
  }

  console.log("regExpClip: " + regExpClip);
  var clippedMarkdown = markdown.match(regExpClip);
  if (!clippedMarkdown) {
    return "There was an error. markdown.match(regExpClip) was null";
  }
  return clippedMarkdown[0].trim();
}
