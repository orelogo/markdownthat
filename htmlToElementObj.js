function getPostHtml() {
  // for testing
  var matches = document.querySelectorAll("#siteTable .md");
  console.log(matches.length + " html matches found");

  return $("#siteTable .md").html();
}

var html = getPostHtml(); // get html from post
var startCopy, endCopy; // index of where to start and end copying
var currentDepth = 0; // how deep into

var currentOpenTag; // current opened tag, ie. "p"
var findOpenTag = /<(p|em|strong|li)[\s\S]*?>/g // regex for finding open tag
var findCurrentCloseTag; // regex for finding current close tag

var body = new Element(0, "body"); // base containing all elements


function scanHtml() {

  var currentTextContent; // string of current text content
  // object containing information about the next tag, initially indexes are 0
  var nextTag = new NextTag(false, "body", 0, 0);

  while (true) {
    // get next tag based on the previous tag's last index
    var nextTag = getNextTag(nextTag.lastIndex);

    // end of html when nextTag return false
    if (!nextTag) {
      break;
    }

    // an open tag
    if (nextTag.openTag) {
      currentOpenTag = nextTag.tag;
      startCopy = nextTag.lastIndex;
    } else {
      endCopy = nextTag.matchIndex;
      currentTextContent = html.slice(startCopy, endCopy);
      console.log(currentTextContent);
      storeElement(currentOpenTag, currentTextContent);
    } // end else
  } // end while loop
}

// return a NextTag() object with information about the next closest tag found
function getNextTag(lastIndex) {

  // set the regex for closing tag based on last tag opened
  findCurrentCloseTag = new RegExp(("<\/" + currentOpenTag + ">"), "g");

  // set regex to search from same last index
  findOpenTag.lastIndex = findCurrentCloseTag.lastIndex = lastIndex;
  var infoOpenTag = findOpenTag.exec(html);
  var infoCurrentCloseTag = findCurrentCloseTag.exec(html);

  if (!infoOpenTag) {
    console.log("infoOpenTag is null")
  }
  if (!infoCurrentCloseTag) {
    console.log("infoCurrentCloseTag is null")
  }

  // both regex area null indicating they have reached the end of the html
  if (!infoOpenTag && !infoCurrentCloseTag) {
    return false;
  }

  // if infoOpenTag is not null and an open tag first
  if (infoOpenTag && infoOpenTag.index < infoCurrentCloseTag.index) {
    return new NextTag(true, infoOpenTag[1], infoOpenTag.index,
        findOpenTag.lastIndex);
  } else { // find a close tag first
    return new NextTag(false, infoCurrentCloseTag[0],
        infoCurrentCloseTag.index, findCurrentCloseTag.lastIndex);
  }
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

// constructor for a next tag object
function NextTag(openTag, tag, matchIndex, lastIndex) {
  this.openTag = openTag;   // boolean whether this tag is an open tag
  this.tag = tag;           // tag, ie. p, /p, em, /em
  this.matchIndex = matchIndex;       // index of matching tag
  this.lastIndex = lastIndex;         // index where exec stopped
}

//Tests

scanHtml();
body;
