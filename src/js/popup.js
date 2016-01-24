

chrome.tabs.query({active: true, currentWindow:true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {element: "body"}, function(response) {
    if (response) {
      console.log("Received body");
      console.log(response.pageHtml);
      runMarkdownConvertion(response.pageHtml);
    }
    else {
      markdownString = "No response :(";
    }
    $("#markdown-textarea").val(markdownString);
  });
});


// $(document).ready(function() {
//   $("#markdown-textarea").val(markdownStringExample);
// });
