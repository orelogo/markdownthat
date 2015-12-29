function getPostHtml() {
  // for testing
  var matches = document.querySelectorAll("#siteTable .md");
  console.log(matches.length + " html matches found");

  return $("#siteTable .md").html();
}

var startCopy, endCopy; // index of where to start and end copying
var currentDepth = 0; // how deep into

var currentOpenTag; // current opened tag, ie. "p"
var findOpenTag = /<(p|em|strong|li)[\s\S]*?>/g // regex for finding open tag
var findCurrentCloseTag; // regex for finding current close tag

var body = new Element(0, "body"); // base containing all elements


function scanHtml(html) {
  // iterate through each character
  var counter = 0;
  var tagInfo; // information about regex result
  var currentTextContent; // string of current text content
  var lastIndex;

  do {
    counter++;

    tagInfo = findOpenTag.exec(html);
    currentOpenTag = tagInfo[1]; // current opened tag, ie "p"
    startCopy = findOpenTag.lastIndex;

    // set the RegExp for closing tag based on last tag opened
    findCurrentCloseTag = new RegExp(("<\/" + currentOpenTag + ">"), "g");
    // set lastIndex for the RegExp
    findCurrentCloseTag.lastIndex = findOpenTag.lastIndex;

    tagInfo = findCurrentCloseTag.exec(html);
    endCopy = tagInfo.index;

    // text content between open and close tags
    currentTextContent = html.slice(startCopy, endCopy);
    storeElement(currentOpenTag, currentTextContent);

    findOpenTag.lastIndex = findCurrentCloseTag.lastIndex;

  // lastIndex resets to 0 when end of html is reached
  } while (findOpenTag.lastIndex > 0);

}


function storeElement(tag, content) {
  var newElement = new Element(currentDepth + 1, tag);
  console.log(newElement.content);
  // add content to new element
  newElement.content.push(content);

  // add element to correct depth
  switch (currentDepth) {
    case 0:
      body.content.push(newElement);
  } // end switch
}


// constrcutor for an element object
function Element(depth, tag) {
  this.depth = depth;  // depth of element, 0 is the surface area
  this.tag = tag;
  this.content = [];        // content within element
}


//Tests

postHtml = getPostHtml();
//console.log(postHtml);
scanHtml(postHtml);
//parseParagraph(postHtml);
