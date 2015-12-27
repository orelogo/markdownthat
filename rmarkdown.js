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

function getPostHtml() {
  // for testing
  var matches = document.querySelectorAll("#siteTable .md");
  console.log(matches.length + " html matches found");

  return $("#siteTable .md").html();
}



// Tests

console.log(getPostTitle());
console.log(getAuthor());
console.log(getPostDate());
console.log(getPostHtml());
