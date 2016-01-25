function getPostTitle(domObject) {
  // set title to title of post
  var title = $("a.title").text();
  var titleDom = $(domObject).find("a.title");
// if no title selector in domObject, the post is a comment
  if (!titleDom[0]) {
    title += " comment";
  }
  console.log(title);
  return title;
}

function getAuthor(domObject) {
  var authorDom = $(domObject).find("a.author");
  console.log(authorDom.text());
  return authorDom.text();
}

function getDate(domObject) {
  var timeDom = $(domObject).find("time");
  // substring contains only date and not time
  var date = timeDom.attr("datetime").substring(0, 10);
  console.log(date);
  return date;
}

function getUrl(domObject) {
  // url is set to document URL by default, necessary since posts don't have
  // an a.bylink tag
  var url = $(location).attr("href");

  var permalinkDom = $(domObject).find("a.bylink");
  if (permalinkDom[0]) { // comments will produce a permalink
    url = permalinkDom.attr("href");
  }
  console.log(url);
  return url;
}

function getPostHtml(domObject) {
  var postDom = $(domObject).find("div.md");
  var postHtml = postDom.html();
  console.log(postHtml);
  return postHtml;
}
