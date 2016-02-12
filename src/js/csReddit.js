// if the url matches a reddit post, add mark that down button
if (/[\w\W]*reddit.com\/r\/[\w\W]*\/comments\//.test(document.location.href)) {
  // add markdown button under all posts and comments
  $("ul.flat-list.buttons").append(
      '<li><a href="javascript:void(0)" class="mtd-button">mark that down</a></li>');

  // when user clicks on markdown button
  $(".mtd-button").click(function() {
    // nearest div object will be the post associated with the markdown
    // button that is pressed
    var divContent = $(this).closest("div");
    sendMessageToBackground(getPostData(divContent));
  });
}

/**
 * Get post information from a jQuery selector. Information includes:
 * title, author, date, url, and the post html.
 *
 * @param {Object} divContent - jQuery selector of post div
 * @returns {Object} object containing post information
 */
function getPostData(divContent) {
  var message = {
    "from": "postData",
    "postTitle": getPostTitle(divContent),
    "author": getAuthor(divContent),
    "date": getDate(divContent),
    "url": getUrl(divContent),
    "postHtml": getPostHtml(divContent)
  };
  return message;
}

/**
 * Get the title of the post or comment.
 *
 * @param {Object} containerElement - jQuery object containing post
 * @returns {string} title - title of post
 */
function getPostTitle(containerElement) {
  // set title to title of post
  var title = $("a.title").text();
  var titleElement = $(containerElement).find("a.title");
  // if no title selector in containerElement, the post is a comment
  if (!titleElement[0]) {
    title += " comment";
  }
  return title;
}

/**
 * Get author of post or comment.
 *
 * @param {Object} containerElement - jQuery object containing post
 * @returns {string} author of the post or comment
 */
function getAuthor(containerElement) {
  var authorElement = $(containerElement).find("a.author");
  return authorElement.text();
}

/**
 * Get date of post or comment.
 *
 * @param {Object} containerElement - jQuery object containing post
 * @returns {string} date of the post or comment
 */
function getDate(containerElement) {
  var timeElement = $(containerElement).find("time");
  console.log(timeElement);
  // substring contains only date and not time
  var date = timeElement.attr("datetime").substring(0, 10);
  return date;
}

/**
 * Get url of post or comment.
 *
 * @param {Object} containerElement - jQuery object containing post
 * @returns {string} url of the post or comment
 */
function getUrl(containerElement) {
  // url is set to document URL by default, necessary since posts don't have
  // an a.bylink tag
  var url = document.location.href;

  var premalinkElement = $(containerElement).find("a.bylink");
  if (premalinkElement[0]) { // comments will produce a permalink
    url = premalinkElement.attr("href");
  }
  return url;
}

/**
 * Get the html of post or comment.
 *
 * @param {Object} containerElement - jQuery object containing post
 * @returns {string} html of post or comment
 */
function getPostHtml(containerElement) {
  var postElement = $(containerElement).find("div.md");
  var postHtml = postElement.html();
  return postHtml;
}
