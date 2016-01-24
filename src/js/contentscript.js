console.log("above");

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.element === "body") {
      console.log("Sending body...");
      console.log(document.body.innerHTML);
      sendResponse({pageHtml: document.body.innerHTML});
    }
  });

console.log("below");
