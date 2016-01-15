function getPostHtml() {
  // for testing
  var matches = document.querySelectorAll("#siteTable .md");
  console.log(matches.length + " html matches found");

  return $("#siteTable .md").html();
}

var html = getPostHtml(); // get html from post
var startCopy, endCopy; // index of where to start and end copying
var currentDepth = 0; // how deep into the element tree the program is

var currentOpenTag = ""; // current opened tag, ie. "p"
var findOpenTag = /<(p|em|strong|ul|li)[\s\S]*?>/g // regex for finding open tag
var findCurrentCloseTag; // regex for finding current close tag

// base containing all elements, tag must be "" for proper use in openTag()
// and closeTag()
var body = new Element(0, "");
var arrOpenTags = []; // array of currently open tags
arrOpenTags.push(body);

function scanHtml() {

  var currentTextContent; // string of current text content
  // object containing information about the next tag, initially indexes are 0
  var nextTag = new NextTag(false, "body", 0, 0);

  while (true) {
    // get next tag based on the previous tag's last index
    nextTag = getNextTag(nextTag.lastIndex);

    // end of html when nextTag return false
    if (!nextTag) {
      break;
    }

    // an open tag
    if (nextTag.isOpenTag) {
      openTag(nextTag);
    } else {
      closeTag(nextTag);
    } // end else
  } // end while loop
}

// return a NextTag() object with information about the next closest tag found
function getNextTag(lastIndex) {

  // set the regex for closing tag based on last tag opened
  findCurrentCloseTag = new RegExp("<\/" + currentOpenTag + ">", "g");

  // set regex to search from same last index
  findOpenTag.lastIndex = findCurrentCloseTag.lastIndex = lastIndex;
  var infoOpenTag = findOpenTag.exec(html);
  var infoCurrentCloseTag = findCurrentCloseTag.exec(html);

  if (!infoOpenTag) {
    console.log("infoOpenTag is null");
  }
  if (!infoCurrentCloseTag) {
    console.log("infoCurrentCloseTag is null");;
  }

  // both regex area null indicating they have reached the end of the html
  if (!infoOpenTag && !infoCurrentCloseTag) {
    return false;
  }

  // if infoOpenTag is not null and an open tag first, or if
  // findCurrentCloseTag.exec() fails to find a match (ie. when first run
  // with "")
  if (!infoCurrentCloseTag ||
      infoOpenTag && infoOpenTag.index < infoCurrentCloseTag.index) {
    var nextTag = new NextTag(true, infoOpenTag[1], infoOpenTag.index,
      findOpenTag.lastIndex);
  } else { // find a close tag first
    var nextTag = new NextTag(false, infoCurrentCloseTag[0],
      infoCurrentCloseTag.index, findCurrentCloseTag.lastIndex);
  }
  return nextTag;
}

function openTag(nextTag) {
  // there is a current open tag, add text content to last open element
  // if you are in body, currentOpenTag = "" and will be false
  if (currentOpenTag) {
    endCopy = nextTag.matchIndex;
    var currentTextContent = html.slice(startCopy, endCopy);
    arrOpenTags[arrOpenTags.length - 1].content.push(currentTextContent);
  }

  // open new tag
  currentDepth += 1;
  currentOpenTag = nextTag.tag;
  startCopy = nextTag.lastIndex;

  var newElement = new Element(currentDepth, currentOpenTag);
  // add new element pointer to content of last open tag element
  arrOpenTags[arrOpenTags.length - 1].content.push(newElement);
  // add new element pointer to end of arrOpenTags
  arrOpenTags.push(newElement);
}

function closeTag(nextTag) {
  // add text conent to last open element
  endCopy = nextTag.matchIndex;
  var currentTextContent = html.slice(startCopy, endCopy);
  arrOpenTags[arrOpenTags.length - 1].content.push(currentTextContent);

  // remove close tag from end of arrOpenTags
  arrOpenTags.pop();
  currentDepth -= 1;
  // get current open tag for last element in arrOpenTags
  currentOpenTag = arrOpenTags[arrOpenTags.length - 1].tag;
}

// construcutor for an element object
function Element(depth, tag) {
  this.depth = depth; // depth of element, 0 is the surface area
  this.tag = tag;     // elment tag
  this.content = [];  // content within element
}

// constructor for a next tag object
function NextTag(isOpenTag, tag, matchIndex, lastIndex) {
  this.isOpenTag = isOpenTag;   // boolean whether this tag is an open tag
  this.tag = tag;               // tag, ie. p, /p, em, /em
  this.matchIndex = matchIndex; // index of matching tag
  this.lastIndex = lastIndex;   // index where exec stopped
}

//Tests

scanHtml();
body;
