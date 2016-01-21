function getPostHtml() {
  // for testing
  var matches = document.querySelectorAll("#siteTable .md");
  console.log(matches.length + " html matches found");

  return $("#siteTable .md").html();
}


// html to element

var html = getPostHtml(); // get html from post
var startCopy, endCopy; // index of where to start and end copying

// regex for finding open tag
var findOpenTag = /<(p|em|strong|ul|li|h[1-6]|hr|br)[\s\S]*?>/g;
var findCurrentCloseTag; // regex for finding current close tag

var arrOpenTags = []; // array of currently open tags
// base containing all elements, tag must be "" for proper use in openTag()
// and closeTag()
var body = new Element("");
arrOpenTags.push(body);

// return current open tag
function getCurrentOpenTag() {
  return arrOpenTags[arrOpenTags.length - 1].tag;
}

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
  arrOpenTags = undefined; // clear arrOpenTags
}

// return a NextTag() object with information about the next closest tag found
function getNextTag(lastIndex) {

  // set the regex for closing tag based on last tag opened
  findCurrentCloseTag = new RegExp("<(\/" + getCurrentOpenTag() + ")>", "g");

  // set regex to search from same last index
  findOpenTag.lastIndex = findCurrentCloseTag.lastIndex = lastIndex;
  var infoOpenTag = findOpenTag.exec(html);
  var infoCurrentCloseTag = findCurrentCloseTag.exec(html);

  // if (!infoOpenTag) {
  //   console.log("infoOpenTag is null");
  // }
  // if (!infoCurrentCloseTag) {
  //   console.log("infoCurrentCloseTag is null");;
  // }

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
    var nextTag = new NextTag(false, infoCurrentCloseTag[1],
      infoCurrentCloseTag.index, findCurrentCloseTag.lastIndex);
      // console.log("Close Tag: " + infoCurrentCloseTag[0]);
      // console.log("Close Tag Index: " + infoCurrentCloseTag.index);
      // console.log("Close Tag Last Index: " + findCurrentCloseTag.lastIndex);
  }
  return nextTag;
}

function openTag(nextTag) {
  // there is a current open tag, add text content to last open element
  // if you are in body, currentOpenTag = "" and will be false
  if (getCurrentOpenTag()) {
    endCopy = nextTag.matchIndex;
    addTextContent();
  }

  startCopy = nextTag.lastIndex; // new start copy position

  var newElement = new Element(nextTag.tag);
  // add new element pointer to content of last open tag element
  arrOpenTags[arrOpenTags.length - 1].content.push(newElement);

  if (nextTag.isPaired) {
    // add new element pointer to end of arrOpenTags
    arrOpenTags.push(newElement);
  }
}

function closeTag(nextTag) {
  // add text conent to last open element
  endCopy = nextTag.matchIndex;
  addTextContent();

  // remove close tag from end of arrOpenTags
  arrOpenTags.pop();
  startCopy = nextTag.lastIndex;
}

// slice and add text to last added arrOpenTags Element
function addTextContent() {
  var currentTextContent = html.slice(startCopy, endCopy);
  // trim to remove line breaks in html, only trims at length less than 3 to it
  // doesn't trim important spaces
  if (currentTextContent.length <= 2) {
    currentTextContent = currentTextContent.trim();
  }
  if (currentTextContent) {
    // only add content if it is not empty
    arrOpenTags[arrOpenTags.length - 1].content.push(currentTextContent);
  }
}

// construcutor for an element object
function Element(tag) {
  this.tag = tag;     // elment tag
  // depth of element, 0 is the surface area; for dev purposes
  this.depth = arrOpenTags.length;
  this.content = [];  // content within element
}

// constructor for a next tag object
function NextTag(isOpenTag, tag, matchIndex, lastIndex) {
  this.isOpenTag = isOpenTag;   // boolean whether this tag is an open tag
  this.tag = tag;               // tag, ie. p, /p, em, /em
  this.matchIndex = matchIndex; // index of matching tag
  this.lastIndex = lastIndex;   // index where exec stopped

  // for unpaired tags
  if (tag === "hr" || tag === "br" || tag === "img") {
    this.isPaired = false;
  }
  else { // for paired tags
    this.isPaired = true;
  }
}



// element to string

var markdownString = "";  // string containing markdownString
var EMPHASIS_CHAR = "_";  // emphasis character, commonly * or _
var UL_CHAR = "- ";       // unordered list character, commonly, *, - or +
// amount of indent to subsequent lists (ie. list within a list)
var LIST_INDENT = "  ";
var HEADING_CHAR = "#";   // character added before and after h3-h6
var HR_CHAR = "-";        // for <hr>, commonly - or -
var HR_LENGTH = 20;        // length of <hr>
// array of currently open tags, used when reading Element
var arrReadOpenTags = [];


function iterateElement(element) {
  arrReadOpenTags.push(element.tag);
  element.content.forEach(function(currentValue, index) {
    // encounter a string value
    if (typeof currentValue === "string") {
      addStringContent(element.tag, currentValue);
    }
    else {  // encounter another element
      addElementContent(currentValue, index);
      iterateElement(currentValue);
    }
  });
  arrReadOpenTags.pop();
}

// add string content from element to markdownString
function addStringContent(tag, stringContent) {
  switch (tag) {
    case "em":
      markdownString += EMPHASIS_CHAR + stringContent +
        EMPHASIS_CHAR;
      break;
    case "strong":
      markdownString += EMPHASIS_CHAR + EMPHASIS_CHAR + stringContent +
        EMPHASIS_CHAR + EMPHASIS_CHAR;
      break;
    case "p":
    case "li":
      markdownString += stringContent;
      break;
    case "h1":
      markdownString += stringContent + "\n" +
        Array(stringContent.length + 1).join("=");
      break;
    case "h2":
      markdownString += stringContent + "\n" +
        Array(stringContent.length + 1).join("-");
      break;
    case "h3":
      markdownString += stringContent + " " + Array(4).join(HEADING_CHAR);
      break;
    case "h4":
      markdownString += stringContent + " " + Array(5).join(HEADING_CHAR);
      break;
    case "h5":
      markdownString += stringContent + " " + Array(6).join(HEADING_CHAR);
      break;
    case "h6":
      markdownString += stringContent + " " + Array(7).join(HEADING_CHAR);
      break;
  }
}

// add element modifiding content to markdownString
function addElementContent(element, index) {
  switch (element.tag) {
    case "p":
      // in case the <p> is the first paragraph in an <li>
      if (arrReadOpenTags[arrReadOpenTags.length - 1] !== "li" ||
          index !== 0) {
        markdownString += "\n\n";
        // are inside a <li>
        if (getListCount() > 0) {
          // spaces in place of bullet
          markdownString += Array(getListCount()).join(LIST_INDENT) +
            Array(UL_CHAR.length + 1).join(" ");
        }
      }
      break;
    case "ul":
      markdownString += "\n";
      break;
    case "li":
      //add leading spaces based on number of <ul> encountered
      markdownString += "\n" +
        Array(getListCount()).join(LIST_INDENT) + UL_CHAR;
      break;
    case "h1":
    case "h2":
      markdownString += "\n\n";
      break;
    case "h3":
      markdownString += "\n\n" + Array(4).join(HEADING_CHAR) + " ";
      break;
    case "h4":
      markdownString += "\n\n" + Array(5).join(HEADING_CHAR) + " ";
      break;
    case "h5":
      markdownString += "\n\n" + Array(6).join(HEADING_CHAR) + " ";
      break;
    case "h6":
      markdownString += "\n\n" + Array(7).join(HEADING_CHAR) + " ";
      break;
    case "hr":
      markdownString += "\n\n" + Array(HR_LENGTH + 1).join(HR_CHAR);
      break;
    case "br":
      markdownString += "\n";
      break;
  }
}

function getListCount() {
  var listCount = 0;
  arrReadOpenTags.forEach(function(currentValue){
    if (currentValue === "ul" || currentValue === "ol") {
      listCount++;
    }
  });
  return listCount;
}

//Tests

scanHtml();
iterateElement(body);
console.log(markdownString);
body;
