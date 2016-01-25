
// add markdown button under all posts and comments
$('ul.flat-list.buttons').append(
    '<li class="markdown-button"><a href="javascript:void(0)" class="markdown-anchor">markdown</a></li>');

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.element === "body") {
      console.log("Sending body...");
      console.log(document.body.innerHTML);
      sendResponse({pageHtml: document.body.innerHTML});
    }
  });

// when user clicks on markdown button
$('.markdown-anchor').click(function() {
  // find closest div to clicked markdown button
  var divContent = $(this).closest("div");
  console.log(divContent);
  getPostTitle(divContent);
  getAuthor(divContent);
  getDate(divContent);
  getUrl(divContent);
  getPostHtml(divContent);
});
