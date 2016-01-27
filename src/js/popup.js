// receive message from contentscript and respond with markdown
chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
  markdown = getMarkdownMetadata(message.postTitle, message.author, message.date, message.url) +
      getMarkdownString(message.postHtml);
  sendResponse({"markdown": markdown});
});

/**
 * Get markdown format of post html.
 *
 * @param {string} postHtml - HTML of the post
 * @returns {string} markdown format of the post
 */
function getMarkdownString(postHtml) {
  markdownString = "";
  postHtml = postHtml;
  var body = scanHtml();
  iterateElementContent(body);
  markdownCleanUp();
  return markdownString;
}

/**
 * Get markdown format of post metadata.
 *
 * @param {string} postTitle - title of the post
 * @param {string} author - author of the post
 * @param {string} date - date of the post
 * @param {string} url - url of the post
 */
function getMarkdownMetadata(postTitle, author, date, url) {
  console.log(postTitle + " " + postTitle.length);
  var metadata = postTitle + "\n" + Array(postTitle.length + 1).join("=");
  metadata += "\n[" + author + " | " + date + "](" + url + ")\n\n";
  return metadata;
}
