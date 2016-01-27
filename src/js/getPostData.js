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
  var url = $(location).attr("href");

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
