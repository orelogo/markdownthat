
// add markdown button under all posts and comments
$("ul.flat-list.buttons").append(
    '<li><a href="javascript:void(0)" class="rmd-button">markdown</a></li>');

// when user clicks on markdown button
$(".rmd-button").click(function() {
  // nearest div object will be the post associated with the markdown
  // button that is pressed
  var divContent = $(this).closest("div");
  sendMessageToPopup(getPostData(divContent));
});

/**
 * Get post information from a jQuery selector. Information includes:
 * title, author, date, url, and the post html.
 *
 * @param {Object} divContent - jQuery selector of post div
 * @returns {Object} object containing post information
 */
function getPostData(divContent) {
  var message = {
    postTitle: getPostTitle(divContent),
    author: getAuthor(divContent),
    date: getDate(divContent),
    url: getUrl(divContent),
    postHtml: getPostHtml(divContent)
  };
  return message;
}

/**
 * Send message to chrome.
 *
 * @param {Object} message - object containing post information
 */
function sendMessageToPopup(message) {
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
  if (!$(".rmd-popup")[0]) {
    $(document.body).append(
        '<div class="rmd-popup"><button type="button" class="rmd-close"><span>&times;</span></button><h1 class="rmd-title">rMarkdown</h1><textarea class="rmd-textarea"></textarea></div>');
  }
  $(".rmd-textarea").val(markdown);
  $(".rmd-close").click(function() {
    $(".rmd-popup").remove();
  });
}
