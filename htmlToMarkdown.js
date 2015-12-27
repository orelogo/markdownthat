
// character used for unordered lists, common options *, +, -
var UL_CHAR = "- ";
var EM_CHAR = "*"; // character used for <em> and <strong>, other option is _

function getMarkdownFromHtml(html) {

}


function parseParagraph(html) {
  return html.replace(/<p>(.*)<\/p>/g, function(matched, p1) {
    return "\n" + p1;
  });
}

/* parse <li> items in an unordered list, functions runs inside
   parseUnorderedList
*/
function parseUnorderedListItems(list) {
  return list.replace(/<li>(.*)<\/li>/g, function(matched, p1) {
    return UL_CHAR + p1;
  });
}

function parseUnorderedList(html) {
  return html.replace(/<ul>([\s\S]*)<\/ul>/g, function(matched, p1) {
    return parseUnorderedListItems(p1);
  });
}

// parse <li> items in an ordered list, functions runs inside parseOrderedList
function parseOrderedListItems(list) {
  var startingNum = 0;
  return list.replace(/<li>(.*)<\/li>/g, function(matched, p1) {
    startingNum += 1;
    return startingNum + ". " + p1;
  });
}

function parseOrderedList(html) {
  return html.replace(/<ol>([\s\S]*)<\/ol>/g, function(matched, p1) {
    return parseOrderedListItems(p1);
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


// Tests

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
