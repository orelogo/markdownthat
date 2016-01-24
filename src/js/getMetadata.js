function getPostTitle() {
  // for testing
  var matches = document.querySelectorAll("a.title");
  console.log(matches.length + " title matches found");

  return $("a.title").text();
}

function getAuthor() {
  // for testing
  var matches = document.querySelectorAll("#siteTable a.userTagged");
  console.log(matches.length + " author matches found");

  return $("#siteTable a.userTagged").text();
}

function getPostDate() {
  //for testing
  var matches = document.querySelectorAll("#siteTable time");
  console.log(matches.length + " times matches found");

  return $("#siteTable time").attr("datetime").substring(0, 10);
}

function getPostHtml(pageHtml) {
  // for testing
  // var matches = document.querySelectorAll("#siteTable, .md");
  // console.log(matches.length + " html matches found");

  // console.log($(pageHtml).find("#siteTable .md").html());
  // return $(pageHtml).find("#siteTable .md").html();

  var postRegExp = /<div class="expando">[\s\S]*?<div class="md">([\s\S]*?)<\/div>/;
  var execResult = postRegExp.exec(pageHtml);
  console.log(execResult);
  return execResult[1];
}
