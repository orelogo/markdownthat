// function getPostHtml() {
//   // for testing
//   var matches = document.querySelectorAll("#siteTable .md");
//   console.log(matches.length + " html matches found");
//
//   return $("#siteTable .md").html();
// }

/*
   Convert post html to recursive Element objects
*/

  var postHtml;              // post html to be parsed
  // indexes of where to extract text content
  var startTextContent, stopTextContent;
  var arrOpenTags = []; // array of currently open tags

/**
 * Parses html code and returns a recursive Element object that contains
 * Elements of tags that are searched for.
 *
 * @returns {Element} body - base Element object containing other Elements
 */
function scanHtml() {

  // FoundTag object containing information about the next tag
  // initialized with this data for first iteration
  var foundTag = {
    isOpenTag: false,
    // base containing all elements, tag must be "" for proper use in openTag()
    // and closeTag()
    tag: "",
    matchIndex: 0,
    lastIndex: 0
  };

  // base Element object for containing other elements
  var body = new Element(foundTag);
  arrOpenTags.push(body);

  while (true) {
    // get next tag based on the previous tag
    foundTag = getNextTag(foundTag.lastIndex);

    // end of html code when foundTag returns null
    if (!foundTag) {
      break;
    }

    // open tag found first
    if (foundTag.isOpenTag) {
      openTag(foundTag);
    } else { // close tag found first
      closeTag(foundTag);
    }
  } // end while loop
  arrOpenTags = undefined; // clear arrOpenTags when done scannning html
  return body;
}

/**
 * Contains tag information, including tag, attributes, index of where the tag
 * start and where the tag ends.
 *
 * @constructor
 * @param {Array.<string>} regExpExec - return array of regExp.exec()
 * @param {number} lastIndex - last index searched by regExp
 */
function FoundTag(regExpExec, lastIndex) {
  this.tag = regExpExec[1];           // tag, ie. p, /p, em, /em
  this.attributes = regExpExec[2];    // attributes of the tag
  this.matchIndex = regExpExec.index; // index of matching tag
  this.lastIndex = lastIndex;         // index where exec stopped

  // boolean whether this tag is an open tag
  if (this.tag.charAt(0) === "/") {
    this.isOpenTag = false;
  }
  else {
    this.isOpenTag = true;
  }

  // for unpaired tags
  if (this.tag === "hr" || this.tag === "br" || this.tag === "img") {
    this.isPaired = false;
  }
  else { // for paired tags
    this.isPaired = true;
  }
}

/**
 * Returns current open tag element.
 *
 * @returns {Element} current open tag element
 */
function getCurrentOpenTag() {
  return arrOpenTags[arrOpenTags.length - 1];
}

/**
 * Finds next closest tag in html code.
 *
 * @param {number} lastIndex - last index searched by regExp
 * @returns {?FoundTag} next closest open or close tag; if no tag found,
 * returns null
 */
function getNextTag(lastIndex) {

  // regExp for finding open tag, must be global search
  var findOpenTag = /<\b(p|em|strong|ul|ol|li|h[1-6]|hr|br|a|img|span|blockquote|del|s|pre|code)\b([\s\S]*?)>/g;
  // regExp to find closing tag based on last tag opened
  var findCurrentCloseTag = new RegExp("<(\/" + getCurrentOpenTag().tag +
      ")>", "g");

  // set regExps to search from same last index
  findOpenTag.lastIndex = findCurrentCloseTag.lastIndex = lastIndex;
  var infoOpenTag = findOpenTag.exec(postHtml);
  var infoCurrentCloseTag = findCurrentCloseTag.exec(postHtml);

  // both regex are null indicating they have reached the end of the html
  if (!infoOpenTag && !infoCurrentCloseTag) {
    return null;
  }

  // if infoOpenTag is not null and an open tag first, or if
  // findCurrentCloseTag.exec() fails to find a match (ie. when first run
  // with "")
  if (!infoCurrentCloseTag ||
      infoOpenTag && infoOpenTag.index < infoCurrentCloseTag.index) {
    var foundTag = new FoundTag(infoOpenTag, findOpenTag.lastIndex);
  }
  else { // find a close tag first
    var foundTag = new FoundTag(infoCurrentCloseTag,
        findCurrentCloseTag.lastIndex);
  }
  return foundTag;
}

/**
 * Assigns stopTextContent index and calls addTextContent() to add text content
 * to current open tag, assigns new startTextContent index, creates new Element
 * object and adds it conent of current open tag and to top of arrOpenTags.
 *
 * @param {FoundTag} foundTag - open tag with attribute and index information
 */
function openTag(foundTag) {
  // there is a current open tag, add text content to last open element
  // if you are in body, currentOpenTag = "" and will be false
  if (getCurrentOpenTag(arrOpenTags)) {
    stopTextContent = foundTag.matchIndex;
    addTextContent();
  }

  startTextContent = foundTag.lastIndex; // new start copy position

  var newElement = new Element(foundTag);
  // add new element pointer to content of last open tag element
  getCurrentOpenTag().content.push(newElement);

  if (foundTag.isPaired) {
    // add new element pointer to end of arrOpenTags
    arrOpenTags.push(newElement);
  }
}

/**
 * Assigns stopTextContent index and calls addTextContent() to add text content
 * to current open tag, pops current tag from arrOpenTags, and assigns new
 * startTextContent index.
 *
 * @param {FoundTag} foundTag - close tag with index information
 */
function closeTag(foundTag) {
  // add text conent to last open element
  stopTextContent = foundTag.matchIndex;
  addTextContent();

  // remove close tag from end of arrOpenTags
  arrOpenTags.pop();
  startTextContent = foundTag.lastIndex;
}

/**
 * Extracts substring of text based on startTextContent and stopTextContent and
 * adds it to content of current open tag.
 */
function addTextContent() {
  var currentTextContent = postHtml.slice(startTextContent, stopTextContent);
  // trim to remove newline in html, only trims at length less than 3 so it
  // doesn't trim important spaces
  if (currentTextContent.length <= 2) {
    currentTextContent = currentTextContent.trim();
  }
  if (currentTextContent) {
    // only add content if it is not empty
    getCurrentOpenTag().content.push(currentTextContent);
  }
}

/**
 * Contains tag and content of an element. Also includes url for <a> and <img>.
 * <img> also has alt text information.
 *
 * @constructor
 * @param {FoundTag} foundTag - open tag with attribute and index information
 */
function Element(foundTag) {
  this.tag = foundTag.tag;     // elment tag
  // depth of element, 0 is the surface area; for dev purposes
  this.depth = arrOpenTags.length;
  // content within element, should only be strings or other Element objects
  this.content = [];

  if (this.tag === "a") {
    this.url = getUrl(foundTag);
  }

  if (this.tag === "img") {
    this.url = getUrl(foundTag);
    this.content.push(getAltText(foundTag));
  }
}

/**
 * Returns url of an anchor or img tag.
 *
 * @param {FoundTag} foundTag - open tag with attribute and index information
 * @returns {string} url of anchor or img tag
 */
function getUrl(foundTag) {
  if (foundTag.tag === "a") {
    var hrefRegExp = /href\s*=\s*"(.*?)"/;
    var regExpExec = hrefRegExp.exec(foundTag.attributes);
    if (regExpExec) { // in case <a> has no href
      return regExpExec[1];
    }
  }
  else if (foundTag.tag === "img") {
    var srcRegExp = /src\s*=\s*"(.*?)"/;
    var regExpExec = srcRegExp.exec(foundTag.attributes);
    if (regExpExec) { // in case img has no src
      return regExpExec[1];
    }
  }
}

/**
 * Returns alt text of an img tag.
 *
 * @param {FoundTag} foundTag - open tag with attribute and index information
 * @returns {string} alt text of img tag
 */
function getAltText(foundTag) {
  var altRegExp = /alt\s*=\s*"(.*?)"/;
  var regExpExec = altRegExp.exec(foundTag.attributes);
  if (regExpExec) {
    return regExpExec[1];
  }
  else { // no alt text found
    return "";
  }
}



/*
   Convert Element objects to markdown string
*/

var markdownString = "";  // string of converted markdown
var EMPHASIS_CHAR = "*";  // emphasis character, commonly * or _
var DEL_CHAR = "~";       // delete/strikethrough character
var UL_CHAR = "- ";       // unordered list character, commonly *, - or +
// amount of indent for subsequent lists (ie. list within a list)
var LIST_INDENT = "  ";
var HEADING_CHAR = "#";   // character added before and after h3-h6
var HR_CHAR = "-";        // for <hr>, commonly - or "- "
var HR_LENGTH = 3;        // length of <hr>
var OL_CHAR = ". ";       // ordered list characters after the number value
var BLOCKQUOTE_CHAR = "> "; // blockquote character
// array of currently open tags, used when reading Element
var arrReadOpenTags = [];

/**
 * Returns current open tag element when iterating through Element objects
 *
 * @returns {Element} current read open tag element
 */
function getCurrentReadOpenTag() {
  return arrReadOpenTags[arrReadOpenTags.length - 1];
}

/**
 * Iterate through the content of an element. If the content is text, it will
 * eventually be added to markdownString. Otherwise, the content is an Element
 * object and element specific content will be added to markdown and then the
 * element will be called with iterateElementContent() recursively. After
 * iterating through the content of an element, clsoe tag content will be added.
 *
 * @param {Element} element - Element object with tag and content properties
 */
function iterateElementContent(element) {
  arrReadOpenTags.push(element);
  element.content.forEach(function(contentItem, index) {
    // encounter a string value
    if (typeof contentItem === "string") {
      addStringContent(contentItem);
    }
    else {  // encounter another element
      addOpenTagContent(contentItem, index);
      iterateElementContent(contentItem);
    }
  });
  arrReadOpenTags.pop();
  addCloseTagContent(element);
}

/**
 * Add string content to markdownString.
 *
 * @param {string} stringContent - string content of an Element object
 */
function addStringContent(stringContent) {
  // necessary for use with RES; &nbsp in <a> tags and some <p> tags
  if (stringContent !== "&nbsp;") {
    markdownString += stringContent;
  }
}

/**
 * Add open tag content to markdownString.
 *
 * @param {Element} element - Element object with tag and content properties
 * @param {number} index - index of element within parentElement.content
 */
function addOpenTagContent(element, index) {
  switch (element.tag) {
    case "p":
      // when <p> is not the first paragraph in an <li>, ie. most cases
      if (getCurrentReadOpenTag().tag !== "li" ||
          index > 0) {
        markdownString += "\n\n";
        // if inside at least 1 list
        if (getListCount() > 0) {
          // add leading spaces based on number of ancestor lists and place of
          // bullets
          markdownString += Array(getListCount()).join(LIST_INDENT) +
            Array(UL_CHAR.length + 1).join(" ");
        }
      }
      break;
    case "strong":
      markdownString += EMPHASIS_CHAR + EMPHASIS_CHAR;
      break;
    case "em":
      markdownString += EMPHASIS_CHAR;
      break;
    case "del":
    case "s":
      markdownString += DEL_CHAR + DEL_CHAR;
      break;
    case "ol":
      // create a value to keep track of <li> value
      element.orderedListValue = 1;
      markdownString += "\n";
      break;
    case "ul":
      markdownString += "\n";
      break;
    case "li":
      // add leading spaces based on number of ancestor lists
      markdownString += "\n" + Array(getListCount()).join(LIST_INDENT);
      // ordered list
      if (getCurrentReadOpenTag().tag === "ol") {
        markdownString += getCurrentReadOpenTag().orderedListValue + OL_CHAR;
        // increase value for next list item
        getCurrentReadOpenTag().orderedListValue++;
      }
      else { // unordered list
        markdownString += UL_CHAR;
      }
      break;
    case "pre":
      markdownString += "\n\n";
      break;
    case "h1":
    case "h2":
      markdownString += "\n\n";
      // store beginning of h1-2 stringContent
      element.startIndex = markdownString.length;
      break;
    case "h3":
      // add leading heading characters
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
    case "a":
      markdownString += "[";
      break;
    // reddit doesn't use images, but I included it here for completion
    case "img":
      markdownString += "\n\n![";
      break;
    case "blockquote":
      markdownString += "\n";
      // store start index of blockquote
      element.startIndex = markdownString.length;
      break;
    case "code":
      markdownString += "`";
      // if within a <pre> assumes the <code> is a block of code
      if (getCurrentReadOpenTag().tag === "pre") {
        markdownString += "``\n";
      }
      break;
  }
}

/**
 * Add close tag content to markdownString.
 *
 * @param {Element} element - Element object with tag and content properties
 */
function addCloseTagContent(element) {
  switch (element.tag) {
    case "h1":
    case "h2":
      addUnderline(element);
      break;
    case "h3":
      markdownString += " " + Array(4).join(HEADING_CHAR);
      break;
    case "h4":
      markdownString += " " + Array(5).join(HEADING_CHAR);
      break;
    case "h5":
      markdownString += " " + Array(6).join(HEADING_CHAR);
      break;
    case "h6":
      markdownString += " " + Array(7).join(HEADING_CHAR);
      break;
    case "strong":
      markdownString += EMPHASIS_CHAR + EMPHASIS_CHAR;
      break;
    case "em":
      markdownString += EMPHASIS_CHAR;
      break;
    case "del":
    case "s":
      markdownString += DEL_CHAR + DEL_CHAR;
      break;
    case "a":
    case "img":
      markdownString += "](" + element.url + ")";
      break;
    case "ol":
    case "ul":
    // add \n when <ol> or <ul> within a <li>
      if (getCurrentReadOpenTag().tag === "li") {
        markdownString += "\n";
      }
      break;
    case "blockquote":
      addBlockquote(element);
      break;
    case "code":
      if (getCurrentReadOpenTag().tag === "pre") {
        markdownString += "\n``";
      }
      markdownString += "`";
      break;
  }
}

/**
 * Add blockquote character before all newlines for all text within the
 * blockquote element.
 *
 * @param {element} blockquoteElement - blockquote element with a
 * startIndex property containing the index where the blockquote starts
 */
function addBlockquote(blockquoteElement) {
  // slice blockquote portion
  var blockquoteText = markdownString.slice(blockquoteElement.startIndex);
  // recreate markdownString with new blockquote modifications
  markdownString = markdownString.slice(0, blockquoteElement.startIndex) +
    blockquoteText.replace(/\n/g, "\n" + BLOCKQUOTE_CHAR);
}

/**
 * Add underline characters under text within h1 and h2 elements.
 *
 * @param {element} hElement - h1 or h2 element with a startIndex property
 * containing the index where the h1 or h2 tag starts
 */
function addUnderline(hElement) {
  var stringLength = markdownString.length - hElement.startIndex;
  if (hElement.tag === "h1") {
    markdownString += "\n" + Array(stringLength + 1).join("=");
  }
  else if (hElement.tag === "h2") {
    markdownString += "\n" + Array(stringLength + 1).join("-");
  }
}

/**
 * Returns number of ul and ol tags in array of current open tag when
 * iterating through Element objects.
 *
 * @returns {number} number of open list elements
 */
function getListCount() {
  var listCount = 0;
  arrReadOpenTags.forEach(function(currentValue){
    if (currentValue.tag === "ul" || currentValue.tag === "ol") {
      listCount++;
    }
  });
  return listCount;
}

/**
 * Converts html character entities to regular characters and removes blank
 * anchor tag results (necessary for use with RES).
 */
function markdownCleanUp() {
  var htmlCleanUp = /&lt;|&gt;|&amp;/g;
  markdownString = markdownString.replace(htmlCleanUp, function(match) {
    if (match === "&lt;") {
      return "<";
    }
    else if (match === "&gt;") {
      return ">";
    }
    else if (match === "&amp;") {
      return "&";
    }
  });

  // removes blank anchor markdown conversions: []() and &nbsp;
  var resCleanUp = /\n&nbsp;|\[\]\(undefined\)|\[\[RES.+?\]\]\(.*?\)/g;
  markdownString = markdownString.replace(resCleanUp, "");
  markdownString = markdownString.trim();
}

//Tests

// var body = scanHtml();
// iterateElementContent(body);
// markdownCleanUp();
// console.log(markdownString);

function runMarkdownConvertion(pageHtml) {
  postHtml = getPostHtml(pageHtml);
  var body = scanHtml();
  console.log(body);
  iterateElementContent(body);
  markdownCleanUp();
}
