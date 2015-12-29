
// character used for unordered lists, common options *, +, -
var UL_CHAR = "- ";
var EM_CHAR = "*"; // character used for <em> and <strong>, other option is _

function parseParagraph(html) {
  var counter = 0;
  return html.replace(/<p.*>(.*)<\/p>/gm, function(match, p1) {
    counter++;
    console.log(counter);
    console.log(match);
    console.log(p1);
    return p1;
  });
}

/* parse <li> items in an unordered list, functions runs inside
   parseUnorderedList
*/
function parseUnorderedItems(list) {
  return list.replace(/<li.*>(.*)<\/li>/g, function(match, p1) {
    return UL_CHAR + p1;
  });
}

function parseUnorderedList(html) {
  return html.replace(/<ul.*>([\s\S]*)<\/ul>/g, function(match, p1) {
    return parseUnorderedItems(p1);
  });
}

/* not working properly
function parseUnorderedNestedItems(html) {
  return html.replace(/<li[\s\S]*>([\s\S]*)<\/li>/, function(match, p1) {
    console.log("nestedItems");
    return "  " + UL_CHAR + p1;
  });
}


function parseUnorderedNestedList(html) {
  return html.replace(/<ul[\s\S]*>[\s\S]*<ul[\s\S]*>([\s\S]*?)<\/ul>/g, function(match, p1) {
    console.log("match: " + match);
    console.log("p1: " + p1) // p1 remains empty and I don't know why
    return parseUnorderedNestedItems(p1);
  });
}
*/

// parse <li> items in an ordered list, functions runs inside parseOrderedList
function parseOrderedItems(list) {
  var startingNum = 0;
  return list.replace(/<li.*>(.*)<\/li>/g, function(match, p1) {
    startingNum += 1;
    return startingNum + ". " + p1;
  });
}

function parseOrderedList(html) {
  return html.replace(/<ol.*>([\s\S]*)<\/ol>/g, function(match, p1) {
    return parseOrderedItems(p1);
  });
}

function parseEmphasized(html) {
  return html.replace(/<em>(.*)<\/em>/g, function(match, p1) {
    return EM_CHAR + p1 + EM_CHAR;
  });
}

function parseStrong(html) {
  return html.replace(/<strong>(.*)<\/strong>/g, function(match, p1) {
    return EM_CHAR + EM_CHAR + p1 + EM_CHAR + EM_CHAR;
  });
}

function getMarkdownFromHtml(html) {
  //html = parseUnorderedNestedList(html);
  html = parseUnorderedList(html);
  html = parseUnorderedList(html);
  html = parseParagraph(html);
  html = parseEmphasized(html);
  html = parseStrong(html);
  return html;
}



// Tests
/*
var pHtml = "masterblast <p>Foo, bar, foo</p> ASDF\n<p>Boo bar bee</p>";
console.log(parsedP = parseParagraph(pHtml));

var ulHtml = "<ul>\n <li>Coffee</li>\n <li>Tea</li>\n <li>Milk</li>\n</ul>";
console.log(parseUnorderedList(ulHtml));

var olHtml = "<ol>\n <li>Coffee</li>\n <li>Tea</li>\n <li>Milk</li>\n</ol>";
console.log(parseOrderedList(olHtml));

var emHtml = "Hi there <em>friend</em>";
console.log(parseEmphasized(emHtml));

var strongHtml = "Hi there <strong>buddy</strong>, you rock!";
console.log(parseStrong(strongHtml));
*/
var ululHtml="";
ululHtml += "<ul>\n";
ululHtml += "<li>Dogs\n";
ululHtml += "<ul>\n";
ululHtml += "<li>Husky<\/li>\n";
ululHtml += "<li>Beagel<\/li>\n";
ululHtml += "<\/ul>\n";
ululHtml += "<\/li>\n";
ululHtml += "<li>Cats\n";
ululHtml += "<ul>\n";
ululHtml += "<li>Meowth<\/li>\n";
ululHtml += "<li>Sphinx<\/li>\n";
ululHtml += "<\/ul>\n";
ululHtml += "<\/li>\n";
ululHtml += "<\/ul>\n";
//console.log(parseUnorderedNestedList(ululHtml));


// markdown.js

function getPostHtml() {
  // for testing
  var matches = document.querySelectorAll("#siteTable .md");
  console.log(matches.length + " html matches found");

  return $("#siteTable .md").html();
}

postHtml = getPostHtml();
//console.log(postHtml);
mdHtml = getMarkdownFromHtml(postHtml);
//console.log(mdHtml);
