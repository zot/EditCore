// Generated by CoffeeScript 1.9.1

/*
Copyright (C) 2013, Bill Burdick, Tiny Concepts: https://github.com/zot/Leisure

(licensed with ZLIB license)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not
claim that you wrote the original software. If you use this software
in a product, an acknowledgment in the product documentation would be
appreciated but is not required.

2. Altered source versions must be plainly marked as such, and must not be
misrepresented as being the original software.

3. This notice may not be removed or altered from any source distribution.
 */
var ATTR_NAME, AttrHtml, DRAWER_NAME, Drawer, END_NAME, Fragment, HL_LEVEL, HL_PRIORITY, HL_TAGS, HL_TODO, HTML, HTML_INFO, HTML_START_NAME, Headline, KW_BOILERPLATE, KW_INFO, KW_NAME, Keyword, LINK_DESCRIPTION, LINK_HEAD, LINK_INFO, LIST_BOILERPLATE, LIST_CHECK, LIST_CHECK_VALUE, LIST_INFO, LIST_LEVEL, Link, ListItem, Meat, MeatParser, Node, PROPERTY_KEY, PROPERTY_VALUE, RES_NAME, Results, SRC_BOILERPLATE, SRC_INFO, SRC_NAME, SimpleMarkup, Source, _, attrHtmlLineRE, attrHtmlRE, buildHeadlineRE, checkMatch, drawerRE, endRE, fullLine, headlineRE, htmlEndRE, htmlStartRE, imagePathRE, inListItem, keywordPropertyRE, keywordRE, leisurePathRE, lineBreakPat, linkRE, listContentOffset, listRE, markupText, markupTypes, matchLine, meatStart, nextOrgNode, parseAttr, parseDrawer, parseHeadline, parseHtmlBlock, parseKeyword, parseList, parseMeat, parseOrgChunk, parseOrgMode, parseRestOfMeat, parseResults, parseSrcBlock, parseTags, propertyRE, ref, resultsLineRE, resultsRE, root, simpleRE, srcEndRE, srcStartRE, tagsRE, todoKeywords, todoRE,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

(typeof window !== "undefined" && window !== null ? window : global).Org = root = (ref = typeof require === "function" ? require('./preamble') : void 0) != null ? ref : (typeof Org !== "undefined" && Org !== null ? Org : {});

_ = typeof Lazy !== "undefined" && Lazy !== null ? Lazy : typeof require === "function" ? require('./lazy') : void 0;

todoKeywords = ['TODO', 'DONE'];

buildHeadlineRE = function() {
  return new RegExp('^(\\*+) *(' + todoKeywords.join('|') + ')?(?: *(?:\\[#(A|B|C)\\]))?[^\\n]*?((?:[\\w@%#]*:[\\w@%#:]*)? *)$', 'm');
};

HL_LEVEL = 1;

HL_TODO = 2;

HL_PRIORITY = 3;

HL_TAGS = 4;

headlineRE = buildHeadlineRE();

todoRE = /^(\*+) *(TODO|DONE)/;

tagsRE = /:[^:]*/;

KW_BOILERPLATE = 1;

KW_NAME = 2;

KW_INFO = 3;

keywordRE = /^(#\+([^:\n]+): *)([^\n]*)$/im;

SRC_BOILERPLATE = 1;

SRC_NAME = 2;

SRC_INFO = 3;

srcStartRE = /^(#\+(BEGIN_SRC) *)([^\n]*)$/im;

END_NAME = 1;

srcEndRE = /^#\+(END_SRC)( *)$/im;

RES_NAME = 1;

resultsRE = /^#\+(RESULTS): *$/im;

resultsLineRE = /^([:|] .*)(?:\n|$)/i;

DRAWER_NAME = 1;

drawerRE = /^:([^\n:]*): *$/im;

endRE = /^:END: *$/im;

PROPERTY_KEY = 1;

PROPERTY_VALUE = 2;

propertyRE = /^:([^\n:]+): *([^\n]*)$/img;

LIST_LEVEL = 1;

LIST_BOILERPLATE = 2;

LIST_CHECK = 3;

LIST_CHECK_VALUE = 4;

LIST_INFO = 5;

listRE = /^( *)(- *)(\[( |X)\] +)?(.*)$/m;

simpleRE = /\B(\*[\/+=~\w](.*?[\/+=~\w])?\*|\/[*+=~\w](.*?[*+=~\w])?\/|\+[*\/=~\w](.*?[*\/=~\w])?\+|=[+*\/~\w](.*?[+*\/~\w])?=|~[=+*\/\w](.*?[=+*\/\w])?~)(\B|$)|\b_[^_]*\B_(\b|$)/;

LINK_HEAD = 1;

LINK_INFO = 2;

LINK_DESCRIPTION = 3;

linkRE = /(\[\[([^\]]*)\])(?:\[([^\]]*)\])?\]/;

htmlStartRE = /^#\+(BEGIN_HTML\b)(.*)$/im;

HTML_START_NAME = 1;

HTML_INFO = 2;

htmlEndRE = /^#\+END_HTML *$/im;

ATTR_NAME = 1;

attrHtmlRE = /^#\+(ATTR_HTML): *$/im;

attrHtmlLineRE = /^([:|] .*)(?:\n|$)/i;

imagePathRE = /\.(png|jpg|jpeg|gif|svg|tiff|bmp)$/i;

leisurePathRE = /^leisure:([^\/]*)\/?(.*)$/;

keywordPropertyRE = /:([^ ]+)/;

matchLine = function(txt) {
  var ref1;
  if (((ref1 = txt.match(simpleRE)) != null ? ref1.index : void 0) === 0) {
    return false;
  } else {
    return checkMatch(txt, srcStartRE, 'srcStart') || checkMatch(txt, srcEndRE, 'srcEnd') || checkMatch(txt, resultsRE, 'results') || checkMatch(txt, attrHtmlRE, 'attr') || checkMatch(txt, keywordRE, 'keyword') || checkMatch(txt, headlineRE, function(m) {
      return "headline-" + m[HL_LEVEL].length;
    }) || checkMatch(txt, listRE, 'list') || checkMatch(txt, htmlStartRE, 'htmlStart') || checkMatch(txt, htmlEndRE, 'htmlEnd');
  }
};

checkMatch = function(txt, pat, result) {
  var m;
  m = txt.match(pat);
  if ((m != null ? m.index : void 0) === 0) {
    if (typeof result === 'string') {
      return result;
    } else {
      return result(m);
    }
  } else {
    return false;
  }
};

Node = (function() {
  function Node() {
    this.markup = markupText(this.text);
  }

  Node.prototype.count = function() {
    return 1;
  };

  Node.prototype.length = function() {
    return this.text.length;
  };

  Node.prototype.end = function() {
    return this.offset + this.text.length;
  };

  Node.prototype.toJson = function() {
    return JSON.stringify(this.toJsonObject(), null, "  ");
  };

  Node.prototype.toJsonObject = function() {
    var obj;
    obj = this.jsonDef();
    obj.nodeId = this.nodeId;
    return obj;
  };

  Node.prototype.allText = function() {
    return this.text;
  };

  Node.prototype.block = false;

  Node.prototype.findNodeAt = function(pos) {
    if (this.offset <= pos && pos < this.offset + this.text.length) {
      return this;
    } else {
      return null;
    }
  };

  Node.prototype.scan = function(func) {
    return func(this);
  };

  Node.prototype.scanWithChildren = function(func) {
    var c, i, len, ref1, results;
    func(this);
    ref1 = this.children;
    results = [];
    for (i = 0, len = ref1.length; i < len; i++) {
      c = ref1[i];
      results.push(c.scan(func));
    }
    return results;
  };

  Node.prototype.linkNodes = function() {
    return this;
  };

  Node.prototype.linkChild = function(child) {
    child.linkNodes();
    return child.linkTo(this);
  };

  Node.prototype.linkChildren = function() {
    var c, i, len, prev, ref1;
    prev = null;
    ref1 = this.children;
    for (i = 0, len = ref1.length; i < len; i++) {
      c = ref1[i];
      if (prev) {
        prev.next = c;
      }
      prev = c;
      this.linkChild(c);
    }
    return this;
  };

  Node.prototype.contains = function(node) {
    var ref1;
    while (node) {
      if (node === this) {
        return true;
      }
      node = (ref1 = node.fragment) != null ? ref1 : node.parent;
    }
    return false;
  };

  Node.prototype.next = null;

  Node.prototype.prev = null;

  Node.prototype.top = function() {
    if (!this.parent) {
      return this;
    } else {
      return this.parent.top();
    }
  };

  Node.prototype.toString = function() {
    return this.toJson();
  };

  Node.prototype.allTags = function() {
    var ref1, ref2;
    return (ref1 = (ref2 = this.parent) != null ? ref2.allTags() : void 0) != null ? ref1 : [];
  };

  Node.prototype.allProperties = function() {
    var ref1, ref2;
    return (ref1 = (ref2 = this.parent) != null ? ref2.allProperties() : void 0) != null ? ref1 : {};
  };

  Node.prototype.linkTo = function(parent1) {
    this.parent = parent1;
  };

  Node.prototype.fixOffsets = function(newOff) {
    this.offset = newOff;
    if (this.children) {
      return this.fixChildrenOffsets();
    } else {
      return newOff + this.allText().length;
    }
  };

  Node.prototype.fixChildrenOffsets = function() {
    var child, i, len, offset, ref1;
    offset = this.offset + this.text.length;
    ref1 = this.children;
    for (i = 0, len = ref1.length; i < len; i++) {
      child = ref1[i];
      offset = child.fixOffsets(offset);
    }
    return offset;
  };

  Node.prototype.inNewMeat = function() {
    return false;
  };

  Node.prototype.getRightmostDescendent = function() {
    var child, ref1;
    child = this;
    while ((ref1 = child.children) != null ? ref1.length : void 0) {
      child = child.children[child.children.length - 1];
    }
    return child;
  };

  Node.prototype.getLeftmostDescendent = function() {
    var child, ref1;
    child = this;
    while ((ref1 = child.children) != null ? ref1.length : void 0) {
      child = child.children[0];
    }
    return child;
  };

  Node.prototype.getPrecedingNode = function() {
    var parent, ref1;
    if (this.prev) {
      return this.prev.getRightmostDescendent();
    } else if (parent = (ref1 = this.fragment) != null ? ref1 : this.parent) {
      if (parent.children[0] === this) {
        return parent;
      }
      return parent.children[parent.children.indexOf(this) - 1].getRightmostDescendent();
    }
  };

  Node.prototype.getFollowingNode = function() {
    var parent, ref1;
    if (this.next) {
      return this.next.getLeftmostDescendent();
    } else if (parent = (ref1 = this.fragment) != null ? ref1 : this.parent) {
      if (parent.children[parent.children.length - 1] === this) {
        return parent;
      }
      return parent.children[parent.children.indexOf(this) + 1].getLeftmostDescendent();
    }
  };

  return Node;

})();

Headline = (function(superClass) {
  extend(Headline, superClass);

  function Headline(text1, level1, todo1, priority1, tags1, children1, offset1) {
    this.text = text1;
    this.level = level1;
    this.todo = todo1;
    this.priority = priority1;
    this.tags = tags1;
    this.children = children1;
    this.offset = offset1;
    Headline.__super__.constructor.call(this);
    this.properties = {};
  }

  Headline.prototype.count = function() {
    var count, i, len, node, ref1;
    count = 1;
    ref1 = this.children;
    for (i = 0, len = ref1.length; i < len; i++) {
      node = ref1[i];
      count += node.count();
    }
    return count;
  };

  Headline.prototype.block = true;

  Headline.prototype.lowerThan = function(l) {
    return l < this.level;
  };

  Headline.prototype.length = function() {
    return this.end() - this.offset;
  };

  Headline.prototype.end = function() {
    var lastChild;
    if (this.children.length) {
      lastChild = this.children[this.children.length - 1];
      return lastChild.offset + lastChild.length();
    } else {
      return Headline.__super__.end.call(this);
    }
  };

  Headline.prototype.type = 'headline';

  Headline.prototype.jsonDef = function() {
    var c;
    return {
      type: this.type,
      text: this.text,
      offset: this.offset,
      level: this.level,
      todo: this.todo,
      priority: this.priority,
      tags: this.tags,
      children: (function() {
        var i, len, ref1, results;
        ref1 = this.children;
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
          c = ref1[i];
          results.push(c.toJsonObject());
        }
        return results;
      }).call(this),
      properties: this.properties
    };
  };

  Headline.prototype.allText = function() {
    var c;
    return this.text + ((function() {
      var i, len, ref1, results;
      ref1 = this.children;
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        c = ref1[i];
        results.push(c.allText());
      }
      return results;
    }).call(this)).join('');
  };

  Headline.prototype.findNodeAt = function(pos) {
    var child, i, len, ref1, res;
    if (pos < this.offset || this.offset + this.length() < pos) {
      return null;
    } else if (pos < this.offset + this.text.length) {
      return this;
    } else {
      ref1 = this.children;
      for (i = 0, len = ref1.length; i < len; i++) {
        child = ref1[i];
        if (res = child.findNodeAt(pos)) {
          return res;
        }
      }
      return null;
    }
  };

  Headline.prototype.scan = Node.prototype.scanWithChildren;

  Headline.prototype.linkNodes = function() {
    return this.linkChildren();
  };

  Headline.prototype.addTags = function(set) {
    var i, len, ref1, tag;
    ref1 = parseTags(this.tags);
    for (i = 0, len = ref1.length; i < len; i++) {
      tag = ref1[i];
      set[tag] = true;
    }
    return set;
  };

  Headline.prototype.addProperties = function(props) {
    var k, ref1, v;
    ref1 = this.properties;
    for (k in ref1) {
      v = ref1[k];
      props[k] = v;
    }
    return props;
  };

  Headline.prototype.addAllTags = function() {
    var ref1;
    return this.addTags(((ref1 = this.parent) != null ? ref1.addAllTags() : void 0) || {});
  };

  Headline.prototype.allProperties = function() {
    var ref1;
    return this.addProperties(((ref1 = this.parent) != null ? ref1.allProperties() : void 0) || {});
  };

  Headline.prototype.allTags = function() {
    var k, results;
    results = [];
    for (k in this.addAllTags()) {
      results.push(k);
    }
    return results;
  };

  return Headline;

})(Node);

Fragment = (function(superClass) {
  extend(Fragment, superClass);

  function Fragment(offset1, children1) {
    this.offset = offset1;
    this.children = children1;
    this.text = '';
  }

  Fragment.prototype.count = function() {
    var count, i, len, node, ref1;
    count = 1;
    ref1 = this.children;
    for (i = 0, len = ref1.length; i < len; i++) {
      node = ref1[i];
      count += node.count();
    }
    return count;
  };

  Fragment.prototype.end = function() {
    var lastChild;
    if (this.children.length) {
      lastChild = this.children[this.children.length - 1];
      return lastChild.offset + lastChild.length();
    } else {
      return Fragment.__super__.end.call(this);
    }
  };

  Fragment.prototype.block = true;

  Fragment.prototype.length = function() {
    return this.end() - this.offset;
  };

  Fragment.prototype.type = 'fragment';

  Fragment.prototype.jsonDef = function() {
    var c;
    return {
      type: this.type,
      offset: this.offset,
      children: (function() {
        var i, len, ref1, results;
        ref1 = this.children;
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
          c = ref1[i];
          results.push(c.toJsonObject());
        }
        return results;
      }).call(this)
    };
  };

  Fragment.prototype.allText = function() {
    var c;
    return this.text + ((function() {
      var i, len, ref1, results;
      ref1 = this.children;
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        c = ref1[i];
        results.push(c.allText());
      }
      return results;
    }).call(this)).join('');
  };

  Fragment.prototype.findNodeAt = function(pos) {
    var child, i, len, ref1, res;
    if (pos < this.offset || this.offset + this.length() < pos) {
      return null;
    } else if (pos < this.offset + this.text.length) {
      return this;
    } else {
      ref1 = this.children;
      for (i = 0, len = ref1.length; i < len; i++) {
        child = ref1[i];
        if (res = child.findNodeAt(pos)) {
          return res;
        }
      }
      return null;
    }
  };

  Fragment.prototype.linkNodes = function() {
    return this.linkChildren();
  };

  Fragment.prototype.linkChild = function(child) {
    child.fragment = this;
    return Fragment.__super__.linkChild.call(this, child);
  };

  Fragment.prototype.linkTo = function(parent) {
    var c, i, len, ref1, results;
    if (this.children.length) {
      this.children[0].prev = this.prev;
      this.children[this.children.length - 1].next = this.next;
      ref1 = this.children;
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        c = ref1[i];
        results.push(c.linkTo(parent));
      }
      return results;
    }
  };

  return Fragment;

})(Node);

Meat = (function(superClass) {
  extend(Meat, superClass);

  function Meat(text1, offset1) {
    this.text = text1;
    this.offset = offset1;
    Meat.__super__.constructor.call(this);
  }

  Meat.prototype.lowerThan = function(l) {
    return true;
  };

  Meat.prototype.type = 'meat';

  Meat.prototype.jsonDef = function() {
    return {
      type: this.type,
      text: this.text,
      offset: this.offset
    };
  };

  Meat.prototype.inNewMeat = function() {
    var cur, i, len, m, meat, t;
    meat = [];
    cur = this;
    while (cur && !(cur instanceof Headline || inListItem(cur))) {
      meat.push(cur);
      cur = cur.getPrecedingNode();
    }
    meat.reverse();
    t = '';
    for (i = 0, len = meat.length; i < len; i++) {
      m = meat[i];
      t += m.allText();
    }
    return t.match(meatStart);
  };

  return Meat;

})(Node);

inListItem = function(org) {
  var ref1;
  return org && (org instanceof ListItem || inListItem((ref1 = org.fragment) != null ? ref1 : org.parent));
};

meatStart = /^\S|\n\n\S/;

markupTypes = {
  "*": 'bold',
  "/": 'italic',
  "_": 'underline',
  "=": 'verbatim',
  "~": 'code',
  "+": 'strikethrough'
};

SimpleMarkup = (function(superClass) {
  extend(SimpleMarkup, superClass);

  function SimpleMarkup(text1, offset1, children1) {
    this.text = text1;
    this.offset = offset1;
    this.children = children1;
    this.markupType = markupTypes[this.text[0]];
  }

  SimpleMarkup.prototype.count = function() {
    var count, i, len, node, ref1;
    count = 1;
    ref1 = this.children;
    for (i = 0, len = ref1.length; i < len; i++) {
      node = ref1[i];
      count += node.count();
    }
    return count;
  };

  SimpleMarkup.prototype.type = 'simple';

  SimpleMarkup.prototype.linkNodes = function() {
    return this.linkChildren();
  };

  SimpleMarkup.prototype.jsonDef = function() {
    var c;
    return {
      type: this.type,
      text: this.text,
      offset: this.offset,
      markupType: this.markupType,
      children: (function() {
        var i, len, ref1, results;
        ref1 = this.children;
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
          c = ref1[i];
          results.push(c.toJsonObject());
        }
        return results;
      }).call(this)
    };
  };

  SimpleMarkup.prototype.scan = Node.prototype.scanWithChildren;

  return SimpleMarkup;

})(Meat);

Link = (function(superClass) {
  extend(Link, superClass);

  function Link(text1, offset1, path, children1) {
    this.text = text1;
    this.offset = offset1;
    this.path = path;
    this.children = children1;
  }

  Link.prototype.count = function() {
    var count, i, len, node, ref1;
    count = 1;
    ref1 = this.children;
    for (i = 0, len = ref1.length; i < len; i++) {
      node = ref1[i];
      count += node.count();
    }
    return count;
  };

  Link.prototype.type = 'link';

  Link.prototype.jsonDef = function() {
    var c;
    return {
      type: this.type,
      text: this.text,
      offset: this.offset,
      path: this.path,
      children: (function() {
        var i, len, ref1, results;
        ref1 = this.children;
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
          c = ref1[i];
          results.push(c.toJsonObject());
        }
        return results;
      }).call(this)
    };
  };

  Link.prototype.scan = Node.prototype.scanWithChildren;

  Link.prototype.isImage = function() {
    return this.path.match(imagePathRE);
  };

  Link.prototype.isLeisure = function() {
    return this.path.match(leisurePathRE);
  };

  Link.prototype.descriptionText = function() {
    var child;
    return ((function() {
      var i, len, ref1, results;
      ref1 = this.children;
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        child = ref1[i];
        results.push(child.allText());
      }
      return results;
    }).call(this)).join(' ');
  };

  return Link;

})(Meat);

ListItem = (function(superClass) {
  extend(ListItem, superClass);

  function ListItem(text1, offset1, level1, checked, contentOffset1, children1) {
    this.text = text1;
    this.offset = offset1;
    this.level = level1;
    this.checked = checked;
    this.contentOffset = contentOffset1;
    this.children = children1;
    ListItem.__super__.constructor.call(this, this.text, this.offset);
  }

  ListItem.prototype.count = function() {
    var count, i, len, node, ref1;
    count = 1;
    ref1 = this.children;
    for (i = 0, len = ref1.length; i < len; i++) {
      node = ref1[i];
      count += node.count();
    }
    return count;
  };

  ListItem.prototype.type = 'list';

  ListItem.prototype.linkNodes = function() {
    return this.linkChildren();
  };

  ListItem.prototype.jsonDef = function() {
    var child, obj;
    obj = {
      type: this.type,
      text: this.text,
      level: this.level,
      offset: this.offset,
      contentOffset: this.contentOffset,
      children: (function() {
        var i, len, ref1, results;
        ref1 = this.children;
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
          child = ref1[i];
          results.push(child.toJsonObject());
        }
        return results;
      }).call(this)
    };
    if (this.checked != null) {
      obj.checked = this.checked;
    }
    return obj;
  };

  ListItem.prototype.getParent = function() {
    var li;
    if (this.level === 0) {
      null;
    }
    li = this;
    while (li = li.getPreviousListItem()) {
      if (li.level < this.level) {
        return li;
      }
    }
  };

  ListItem.prototype.getPreviousListItem = function() {
    var cur, parent, ref1;
    parent = this.fragment || this.parent;
    cur = this;
    while (cur = cur.getPrecedingNode()) {
      if (!(parent.contains(cur)) || cur.inNewMeat()) {
        return null;
      }
      if (((ref1 = cur.fragment) != null ? ref1 : cur.parent) === parent && cur instanceof ListItem) {
        return cur;
      }
    }
    return null;
  };

  ListItem.prototype.getNextListItem = function() {
    var cur, parent, ref1;
    parent = this.fragment || this.parent;
    cur = this;
    while (cur = cur.getFollowingNode()) {
      if (!(parent.contains(cur)) || cur.inNewMeat()) {
        return null;
      }
      if (((ref1 = cur.fragment) != null ? ref1 : cur.parent) === parent && cur instanceof ListItem) {
        return cur;
      }
    }
    return null;
  };

  ListItem.prototype.scan = Node.prototype.scanWithChildren;

  ListItem.prototype.inNewMeat = function() {
    return true;
  };

  return ListItem;

})(Meat);

Drawer = (function(superClass) {
  extend(Drawer, superClass);

  function Drawer(text1, offset1, name1, contentPos, endPos) {
    this.text = text1;
    this.offset = offset1;
    this.name = name1;
    this.contentPos = contentPos;
    this.endPos = endPos;
    Drawer.__super__.constructor.call(this, this.text, this.offset);
  }

  Drawer.prototype.type = 'drawer';

  Drawer.prototype.jsonDef = function() {
    return {
      type: this.type,
      name: this.name,
      text: this.text,
      offset: this.offset,
      contentPos: this.contentPos,
      endPos: this.endPos
    };
  };

  Drawer.prototype.leading = function() {
    return this.text.substring(0, this.contentPos);
  };

  Drawer.prototype.content = function() {
    return this.text.substring(this.contentPos, this.endPos);
  };

  Drawer.prototype.trailing = function() {
    return this.text.substring(this.endPos);
  };

  Drawer.prototype.linkTo = function(node) {
    var m, ref1, results, t;
    Drawer.__super__.linkTo.call(this, node);
    if (this.name.toLowerCase() === 'properties') {
      if (!(node instanceof Headline)) {
        return console.log("WARNING: Drawer's parent is not a Headline'");
      } else {
        t = this.text.substring(this.contentPos, this.endPos);
        results = [];
        while (m = propertyRE.exec(t)) {
          results.push(node.properties[m[PROPERTY_KEY]] = ((ref1 = m[PROPERTY_VALUE]) != null ? ref1 : '').trim());
        }
        return results;
      }
    }
  };

  return Drawer;

})(Meat);

Keyword = (function(superClass) {
  extend(Keyword, superClass);

  function Keyword(text1, offset1, name1, info1) {
    this.text = text1;
    this.offset = offset1;
    this.name = name1;
    this.info = info1;
    Keyword.__super__.constructor.call(this, this.text, this.offset);
  }

  Keyword.prototype.block = true;

  Keyword.prototype.type = 'keyword';

  Keyword.prototype.jsonDef = function() {
    return {
      type: this.type,
      text: this.text,
      offset: this.offset,
      name: this.name,
      info: this.info
    };
  };

  Keyword.prototype.attributes = function() {
    var o;
    o = _(this.info.split(keywordPropertyRE)).drop(1).map(function(str) {
      return str.trim();
    }).chunk(2);
    if (o.isEmpty()) {
      return null;
    } else {
      return o.toObject();
    }
  };

  Keyword.prototype.lead = function() {
    return _(this.info.split(keywordPropertyRE)).first();
  };

  return Keyword;

})(Meat);

Source = (function(superClass) {
  extend(Source, superClass);

  function Source(text1, offset1, name1, info1, infoPos1, content, contentPos) {
    this.text = text1;
    this.offset = offset1;
    this.name = name1;
    this.info = info1;
    this.infoPos = infoPos1;
    this.content = content;
    this.contentPos = contentPos;
    Source.__super__.constructor.call(this, this.text, this.offset, this.name, this.info);
  }

  Source.prototype.type = 'source';

  Source.prototype.getLanguage = function() {
    var ref1;
    return (ref1 = this.lead()) != null ? ref1.trim().toLowerCase() : void 0;
  };

  Source.prototype.jsonDef = function() {
    return {
      type: this.type,
      text: this.text,
      offset: this.offset,
      name: this.name,
      info: this.info,
      infoPos: this.infoPos,
      content: this.content,
      contentPos: this.contentPos,
      contentLength: this.content.length
    };
  };

  return Source;

})(Keyword);

HTML = (function(superClass) {
  extend(HTML, superClass);

  function HTML(text1, offset1, name1, contentPos, contentLength, info1) {
    this.text = text1;
    this.offset = offset1;
    this.name = name1;
    this.contentPos = contentPos;
    this.contentLength = contentLength;
    this.info = info1;
    HTML.__super__.constructor.call(this, this.text, this.offset, this.name, this.info);
  }

  HTML.prototype.type = 'html';

  HTML.prototype.leading = function() {
    return this.text.substring(0, this.contentPos);
  };

  HTML.prototype.trailing = function() {
    return this.text.substring(this.contentPos + this.contentLength);
  };

  HTML.prototype.content = function() {
    return this.text.substring(this.contentPos, this.contentPos + this.contentLength);
  };

  HTML.prototype.jsonDef = function() {
    return {
      type: this.type,
      info: this.info || '',
      text: this.text,
      offset: this.offset,
      contentPos: this.contentPos,
      contentLength: this.contentLength
    };
  };

  return HTML;

})(Keyword);

Results = (function(superClass) {
  extend(Results, superClass);

  function Results(text1, offset1, name1, contentPos) {
    this.text = text1;
    this.offset = offset1;
    this.name = name1;
    this.contentPos = contentPos;
    Results.__super__.constructor.call(this, this.text, this.offset, this.name);
  }

  Results.prototype.type = 'results';

  Results.prototype.content = function() {
    return this.text.substring(this.contentPos);
  };

  Results.prototype.jsonDef = function() {
    return {
      type: this.type,
      text: this.text,
      offset: this.offset,
      name: this.name,
      contentPos: this.contentPos
    };
  };

  return Results;

})(Keyword);

AttrHtml = (function(superClass) {
  extend(AttrHtml, superClass);

  function AttrHtml(text1, offset1, name1, contentPos) {
    this.text = text1;
    this.offset = offset1;
    this.name = name1;
    this.contentPos = contentPos;
    AttrHtml.__super__.constructor.call(this, this.text, this.offset, this.name);
  }

  AttrHtml.prototype.type = 'attr';

  AttrHtml.prototype.jsonDef = function() {
    return {
      type: this.type,
      text: this.text,
      offset: this.offset,
      name: this.name,
      contentPos: this.contentPos
    };
  };

  return AttrHtml;

})(Keyword);

nextOrgNode = function(node) {
  var up;
  up = false;
  while (node) {
    if (node.children && !up && node.children.length) {
      return node.children[0];
    } else if (node.next) {
      return node.next;
    } else {
      up = true;
      node = node.parent;
    }
  }
  return null;
};

parseOrgMode = function(text, offset, useFragment) {
  var ref1, res, rest;
  if (text instanceof Node) {
    return text;
  } else {
    ref1 = parseHeadline('', offset != null ? offset : 0, 0, void 0, void 0, void 0, text, text.length), res = ref1[0], rest = ref1[1];
    if (rest.length) {
      throw new Error("Text left after parsing: " + rest);
    }
    if (useFragment) {
      if (res.children.length === 1) {
        res = res.children[0];
      } else if (res.children.length > 1) {
        res = new Fragment(res.offset, res.children);
      }
    }
    return res.linkNodes();
  }
};

parseHeadline = function(text, offset, level, todo, priority, tags, rest, totalLen) {
  var child, children, oldRest, originalRest, ref1;
  children = [];
  originalRest = rest;
  while (true) {
    oldRest = rest;
    ref1 = parseOrgChunk(rest, originalRest.length - rest.length + offset, level), child = ref1[0], rest = ref1[1];
    if (!child) {
      break;
    }
    if (child.lowerThan(level)) {
      while (child) {
        children.push(child);
        child = child.next;
      }
    } else {
      rest = oldRest;
    }
  }
  return [new Headline(text, level, todo, priority, tags || '', children, offset), rest];
};

parseTags = function(text) {
  var i, len, ref1, t, tagArray;
  tagArray = [];
  ref1 = (text ? text.split(':') : []);
  for (i = 0, len = ref1.length; i < len; i++) {
    t = ref1[i];
    if (t) {
      tagArray.push(t);
    }
  }
  return tagArray;
};

fullLine = function(match, text) {
  return text.substring(match.index, match.index + match[0].length + (text[match.index + match[0].length] === '\n' ? 1 : 0));
};

parseOrgChunk = function(text, offset, level) {
  var l, line, m, meat, meatLen, ref1, simple;
  if (!text) {
    return [null, text];
  } else {
    m = text.match(headlineRE);
    simple = ((ref1 = text.match(simpleRE)) != null ? ref1.index : void 0) === 0;
    if ((m != null ? m.index : void 0) === 0 && !simple) {
      if (m[HL_LEVEL].length <= level) {
        return [null, text];
      } else {
        line = fullLine(m, text);
        return parseHeadline(line, offset, m[HL_LEVEL].length, m[HL_TODO], m[HL_PRIORITY], m[HL_TAGS], text.substring(line.length), offset + text.length);
      }
    } else {
      if ((m != null ? m.index : void 0) === 0 && simple && (l = text.indexOf('\n')) > -1 && (m = text.substring(l).match(headlineRE))) {
        meatLen = m.index + l;
      } else {
        meatLen = m && (m.index > 0 || !simple) ? m.index : text.length;
      }
      meat = text.substring(0, meatLen);
      return parseMeat(meat, offset, text.substring(meatLen), false);
    }
  }
};

MeatParser = (function() {
  function MeatParser() {}

  MeatParser.prototype.checkPat = function(pattern, cont) {
    var line, match;
    if (!this.result && (match = this.meat.match(pattern))) {
      if (match.index === 0) {
        line = fullLine(match, this.meat);
        return this.result = cont(line, this.meat.substring(line.length) + this.rest, match);
      } else {
        return this.minLen = Math.min(this.minLen, match.index);
      }
    }
  };

  MeatParser.prototype.parse = function(meat, offset, rest, singleLine) {
    var m, meatText, newline;
    this.meat = meat;
    this.rest = rest;
    this.minLen = meat.length + offset;
    this.result = null;
    if (!this.singleLine) {
      this.checkPat(resultsRE, function(line, newRest) {
        return parseResults(line, offset, newRest);
      });
      this.checkPat(attrHtmlRE, function(line, newRest) {
        return parseAttr(line, offset, newRest);
      });
      this.checkPat(srcStartRE, function(line, newRest, srcStart) {
        return parseSrcBlock(line, offset, srcStart[SRC_INFO], srcStart[SRC_BOILERPLATE].length, newRest);
      });
      this.checkPat(htmlStartRE, function(line, newRest, html) {
        return parseHtmlBlock(line, offset, newRest, html);
      });
      this.checkPat(keywordRE, function(line, newRest, keyword) {
        return parseKeyword(keyword, line, offset, keyword[KW_NAME], keyword[KW_INFO], newRest);
      });
      this.checkPat(listRE, function(line, newRest, list) {
        var ref1, ref2;
        return parseList(list, line, offset, (ref1 = (ref2 = list[LIST_LEVEL]) != null ? ref2.length : void 0) != null ? ref1 : 0, list[LIST_CHECK_VALUE], list[LIST_INFO], newRest);
      });
      this.checkPat(drawerRE, function(line, newRest, drawer) {
        var end;
        if (end = newRest.match(endRE)) {
          return parseDrawer(line, drawer[DRAWER_NAME], offset, end, newRest);
        }
      });
    }
    if (this.result) {
      return this.result;
    } else {
      this.checkPat(simpleRE, function(line, newRest, simple) {
        var child, children, inside, insideOffset, ref1;
        inside = simple[0].substring(1, simple[0].length - 1);
        insideOffset = offset + 1;
        children = [];
        while (inside) {
          ref1 = parseMeat(inside, insideOffset, '', true), child = ref1[0], inside = ref1[1];
          while (child) {
            children.push(child);
            insideOffset = child.offset + child.text.length;
            child = child.next;
          }
        }
        return new SimpleMarkup(simple[0], offset, children);
      });
      this.checkPat(linkRE, function(line, newRest, link) {
        var child, children, inside, insideOffset, ref1;
        inside = link[LINK_DESCRIPTION];
        insideOffset = offset + link[LINK_HEAD].length;
        children = [];
        while (inside) {
          ref1 = parseMeat(inside, insideOffset, '', true), child = ref1[0], inside = ref1[1];
          while (child) {
            children.push(child);
            insideOffset = child.offset + child.text.length;
            child = child.next;
          }
        }
        return new Link(link[0], offset, link[LINK_INFO], children);
      });
      if (!this.result) {
        if (newline = meat.substring(0, 2) === '\n\n') {
          meatText = meat.substring(2);
        }
        meatText = meat.substring(0, this.minLen);
        if (m = meatText.match(lineBreakPat)) {
          meatText = meat.substring(0, m.index);
        }
        if (newline) {
          meatText = '\n\n' + meatText;
        }
        this.result = new Meat(meatText, offset);
      }
      return parseRestOfMeat(this.result, meat.substring(this.result.text.length), rest);
    }
  };

  return MeatParser;

})();

lineBreakPat = /\n\n/;

parseMeat = function(meat, offset, rest, singleLine) {
  return new MeatParser().parse(meat, offset, rest, singleLine);
};

parseRestOfMeat = function(node, meat, rest) {
  var node2, ref1;
  if (meat && node.text[node.text.length - 1] !== '\n') {
    ref1 = parseMeat(meat, node.offset + node.allText().length, rest, true), node2 = ref1[0], rest = ref1[1];
    node.next = node2;
    return [node, rest];
  } else {
    return [node, meat + rest];
  }
};

parseResults = function(text, offset, rest) {
  var lines, m, oldRest;
  oldRest = rest;
  while (m = rest.match(resultsLineRE)) {
    rest = rest.substring(m[0].length);
  }
  lines = oldRest.substring(0, oldRest.length - rest.length);
  return [new Results(text + lines, offset, text.match(resultsRE)[RES_NAME], text.length), rest];
};

parseAttr = function(text, offset, rest) {
  var lines, m, oldRest;
  oldRest = rest;
  while (m = rest.match(attrHrmlLineRE)) {
    rest = rest.substring(m[0].length);
  }
  lines = oldRest.substring(0, oldRest.length - rest.length);
  return [new AttrHtml(text + lines, offset, text.match(attrHtmlRE)[ATTR_NAME], text.length), rest];
};

parseDrawer = function(text, name, offset, end, rest) {
  var pos;
  pos = end.index + (fullLine(end, rest)).length;
  return [new Drawer(text + rest.substring(0, pos), offset, name, text.length, text.length + end.index), rest.substring(pos)];
};

parseKeyword = function(match, text, offset, name, info, rest) {
  return [new Keyword(text, offset, name, text.substring(match[KW_BOILERPLATE].length)), rest];
};

parseSrcBlock = function(text, offset, info, infoPos, rest) {
  var end, endLine, line, otherSrcStart;
  end = rest.match(srcEndRE);
  otherSrcStart = rest.match(srcStartRE);
  if (!end || (otherSrcStart && otherSrcStart.index < end.index)) {
    line = text.match(/^.*\n/);
    if (!line) {
      line = [text];
    }
    return [new Meat(line[0]), text.substring(line[0].length) + rest];
  } else {
    endLine = fullLine(end, rest);
    return [new Source(text + rest.substring(0, end.index + endLine.length), offset, text.match(srcStartRE)[SRC_NAME], info, infoPos, rest.substring(0, end.index), text.length), rest.substring(end.index + endLine.length)];
  }
};

parseHtmlBlock = function(text, offset, rest, match) {
  var end, endLine, line, otherHtmlStart;
  end = rest.match(htmlEndRE);
  otherHtmlStart = rest.match(htmlStartRE);
  line = text.match(/^.*\n/);
  if (!line) {
    line = [text];
  }
  if (!end || (otherHtmlStart && otherHtmlStart.index < end.index)) {
    return [new Meat(line[0]), text.substring(line[0].length) + rest];
  } else {
    endLine = fullLine(end, rest);
    return [new HTML(text + rest.substring(0, end.index + endLine.length), offset, match[HTML_START_NAME], line[0].length, text.length + end.index - line[0].length, match[HTML_INFO]), rest.substring(end.index + endLine.length)];
  }
};

parseList = function(match, text, offset, level, check, info, rest) {
  var children, contentOffset, inside, insideOffset, node, ref1;
  contentOffset = listContentOffset(match);
  insideOffset = offset + contentOffset;
  inside = text.substring(contentOffset);
  children = [];
  while (inside) {
    ref1 = parseMeat(inside, insideOffset, '', true), node = ref1[0], inside = ref1[1];
    while (node) {
      children.push(node);
      insideOffset += node.allText().length;
      node = node.next;
    }
  }
  return [new ListItem(text, offset, level, check === 'X' || (check === ' ' ? false : null), contentOffset, children), rest];
};

listContentOffset = function(match) {
  var ref1, ref2;
  return match[LIST_LEVEL].length + match[LIST_BOILERPLATE].length + ((ref1 = (ref2 = match[LIST_CHECK]) != null ? ref2.length : void 0) != null ? ref1 : 0);
};

markupText = function(text) {};

root.parseOrgMode = parseOrgMode;

root.Node = Node;

root.Headline = Headline;

root.Fragment = Fragment;

root.Meat = Meat;

root.Keyword = Keyword;

root.Source = Source;

root.HTML = HTML;

root.Results = Results;

root.resultsRE = resultsRE;

root.ListItem = ListItem;

root.SimpleMarkup = SimpleMarkup;

root.Link = Link;

root.Drawer = Drawer;

root.drawerRE = drawerRE;

root.headlineRE = headlineRE;

root.HL_TAGS = HL_TAGS;

root.parseTags = parseTags;

root.matchLine = matchLine;

root.keywordRE = keywordRE;

root.KW_BOILERPLATE = KW_BOILERPLATE;

root.KW_NAME = KW_NAME;

root.srcStartRE = srcStartRE;

root.SRC_BOILERPLATE = SRC_BOILERPLATE;

root.SRC_INFO = SRC_INFO;

root.nextOrgNode = nextOrgNode;

root.AttrHtml = AttrHtml;

if (typeof module !== "undefined" && module !== null) {
  module.exports = root;
}

//# sourceMappingURL=org.js.map
