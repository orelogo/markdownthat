// used to check more answers were loaded
var documentHeight = 0; // height of document

/**
 * Insert mark that down button below each quora post.
 */
function insertButtonQuora() {
  // if on quora page and there are new answers loaded
  if (/[\w\W]*quora.com\/[\w\W]+/.test(document.location.href) &&
      $(document).height() > documentHeight) {
    console.log("Quora content script loaded");

    documentHeight = $(document).height();

    var buttonsList = $("div.Answer.ActionBar > div.action_bar_inner");
    // add markdown button under all posts and comments
    buttonsList.append(function() {
      if (!$(this).hasClass("mtd-inserted")) {
        return '<div class="action_item"><a href="javascript:void(0)" class="mtd-button">mark that down</a></div>';
      }
    });
    // for keeping track of where mtd button is added
    buttonsList.addClass("mtd-inserted");

    // when user clicks on markdown button
    $(".mtd-button").click(function() {
      // nearest div.Answer object will be the post associated with the markdown
      // button that is pressed
      var divContent = $(this).closest("div.AnswerBase");
      console.log("Quora div.AnswerBase:");
      console.log(divContent);
      console.log("Quora Post Data:");
      // console.log(getQuoraPostData(divContent));
      console.log("Quora title: " + getQuoraPostTitle(divContent));
      console.log("Quora author: " + getQuoraAuthor(divContent));
      console.log("Quora url: " + getQuoraUrl(divContent));
      console.log("Quora html: " + getQuoraHtml(divContent));
      sendMessageToBackground(getQuoraPostData(divContent));
    });


    $(window).scroll(function () {
       if ($(document).height() > documentHeight) {
          // insert buttons when document height changes
          insertButtonQuora();
       }
    });
  }
}

/**
 * Get quora post information from a jQuery selector. Information includes:
 * title, author, date, url, and the post html.
 *
 * @param {Object} divContent - jQuery selector of quora post div
 * @returns {Object} object containing quora post information
 */
function getQuoraPostData(divContent) {
  var message = {
    "from": "postData",
    "title": getQuoraPostTitle(divContent),
    "author": getQuoraAuthor(divContent),
    "date": "",
    "url": getQuoraUrl(divContent),
    "html": getQuoraHtml(divContent)
  };
  return message;
}

/**
 * Get the title of the quora post.
 *
 * @param {Object} containerElement - jQuery object containing quora post
 * @returns {string} title - title of the quora post
 */
function getQuoraPostTitle(containerElement) {
  var title = $("h1 > span.rendered_qtext").text() + " answer";
  return title;
}

/**
 * Get author of quora post.
 *
 * @param {Object} containerElement - jQuery object containing post
 * @returns {string} author of the quora post
 */
function getQuoraAuthor(containerElement) {
  var authorElement = $(containerElement).find("a.user");
  // sometimes there are multiple a.user elements
  return authorElement[0].innerText;
}

/**
 * Get date of quora post.
 *
 * @param {Object} containerElement - jQuery object containing quora post
 * @returns {string} date of the quora post
 */
// function getQuoraDate(containerElement) {
//   var timeElement = $(containerElement).find("time");
//   console.log(timeElement);
//   // substring contains only date and not time
//   var date = timeElement.attr("datetime").substring(0, 10);
//   return date;
// }

/**
 * Get url of quora post.
 *
 * @param {Object} containerElement - jQuery object containing quora post
 * @returns {string} url of the quora post
 */
function getQuoraUrl(containerElement) {
  var premalinkElement = $(containerElement).find("a.answer_permalink");
  var url = "https://www.quora.com" + premalinkElement.attr("href");
  return url;
}

/**
 * Get the html of quora post.
 *
 * @param {Object} containerElement - jQuery object containing reddi tpost
 * @returns {string} html of quora post
 */
function getQuoraHtml(containerElement) {
  var postElement = $(containerElement).find("span.inline_editor_value > span.rendered_qtext");
  // There are two elements with span.rendered_qtext. The first corresponds to
  // the author information, the second to the post itself.
  var html = postElement.html();
  console.log("Quora HTML object:");
  console.log(postElement);
  return html;
}




insertButtonQuora();
