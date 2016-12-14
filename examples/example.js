// Generated by CoffeeScript 1.10.0
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  requirejs.config({
    paths: {
      immutable: '../build/immutable-3.8.1.min',
      fingertree: '../build/fingertree',
      jquery: 'jquery-2.1.3.min',
      lodash: '../build/lodash.full-4.14.1'
    }
  });

  require(['./org', './docOrg', '../build/editor', 'jquery'], function(Org, DocOrg, Editor, $) {
    var DataStore, DataStoreEditingOptions, FancyEditing, Fragment, Headline, LeisureEditCore, OrgData, OrgEditing, ParsedCodeBlock, PlainEditing, Results, SimpleMarkup, Source, addChange, blockAttrs, blockLabel, blockSource, blockText, checkStructure, contentSpan, copy, data, displayStructure, docBlockOrg, escapeAttr, escapeHtml, getCodeItems, getId, greduce, last, numSpan, orgDoc, orgEditing, parent, parseOrgDoc, parseOrgMode, parseYaml, plainEditing, posFor, set$, siblings;
    parseOrgMode = Org.parseOrgMode, orgDoc = Org.orgDoc, Source = Org.Source, Results = Org.Results, Headline = Org.Headline, SimpleMarkup = Org.SimpleMarkup, Fragment = Org.Fragment;
    orgDoc = DocOrg.orgDoc, getCodeItems = DocOrg.getCodeItems, blockSource = DocOrg.blockSource, docBlockOrg = DocOrg.blockOrg, ParsedCodeBlock = DocOrg.ParsedCodeBlock, parseYaml = DocOrg.parseYaml;
    last = Editor.last, DataStore = Editor.DataStore, DataStoreEditingOptions = Editor.DataStoreEditingOptions, blockText = Editor.blockText, posFor = Editor.posFor, escapeHtml = Editor.escapeHtml, copy = Editor.copy, LeisureEditCore = Editor.LeisureEditCore, set$ = Editor.set$;
    orgEditing = null;
    plainEditing = null;
    data = null;
    OrgData = (function(superClass) {
      extend(OrgData, superClass);

      function OrgData() {
        return OrgData.__super__.constructor.apply(this, arguments);
      }

      OrgData.prototype.getBlock = function(thing, changes) {
        var ref;
        if (typeof thing === 'object') {
          return thing;
        } else {
          return (ref = changes != null ? changes.sets[thing] : void 0) != null ? ref : OrgData.__super__.getBlock.call(this, thing);
        }
      };

      OrgData.prototype.changesFor = function(first, oldBlocks, newBlocks) {
        var changes;
        changes = OrgData.__super__.changesFor.call(this, first, oldBlocks, newBlocks);
        this.linkAllSiblings(changes);
        return changes;
      };

      OrgData.prototype.load = function(name, text) {
        return this.makeChanges((function(_this) {
          return function() {
            _this.suppressTriggers(function() {
              return OrgData.__super__.load.call(_this, name, text);
            });
            _this.linkAllSiblings({
              first: _this.first,
              sets: _this.blocks,
              oldBlocks: [],
              newBlocks: _this.blockList()
            });
            return _this.trigger('load');
          };
        })(this));
      };

      OrgData.prototype.parseBlocks = function(text) {
        return parseOrgDoc(text);
      };

      OrgData.prototype.nextSibling = function(thing, changes) {
        var ref;
        return this.getBlock((ref = this.getBlock(thing, changes)) != null ? ref.nextSibling : void 0, changes);
      };

      OrgData.prototype.previousSibling = function(thing, changes) {
        return this.getBlock(this.getBlock(thing, changes).previousSibling, changes);
      };

      OrgData.prototype.reducePreviousSiblings = function(thing, changes, func, arg) {
        return greduce(this.getBlock(thing, changes), changes, func, arg, (function(_this) {
          return function(b) {
            return _this.getBlock(b.previousSibling, changes);
          };
        })(this));
      };

      OrgData.prototype.reduceNextSiblings = function(thing, changes, func, arg) {
        return greduce(this.getBlock(thing, changes), changes, func, arg, (function(_this) {
          return function(b) {
            return _this.getBlock(b.nextSibling, changes);
          };
        })(this));
      };

      OrgData.prototype.lastSibling = function(thing, changes) {
        return this.reduceNextSiblings(thing, changes, (function(x, y) {
          return y;
        }), null);
      };

      OrgData.prototype.firstSibling = function(thing, changes) {
        return this.reducePreviousSiblings(thing, changes, (function(x, y) {
          return y;
        }), null);
      };

      OrgData.prototype.parent = function(thing, changes) {
        var ref;
        return this.getBlock((ref = this.firstSibling(thing, changes)) != null ? ref.prev : void 0, changes);
      };

      OrgData.prototype.properties = function(thing) {
        var bl, props;
        props = {};
        bl = this.getBlock(thing);
        if (bl.type !== 'headline') {
          if (bl.type === 'code') {
            _.defaults(props, bl.codeAttributes);
            _.defaults(props, bl.properties);
          } else if (bl.type === 'chunk') {
            _.defaults(props, bl.properties);
          }
          bl = this.parent(bl);
        }
        while (bl) {
          this.scrapePropertiesInto(bl, props);
          bl = this.parent(bl);
        }
        return props;
      };

      OrgData.prototype.scrapePropertiesInto = function(block, props) {
        var child, j, len, ref, results;
        ref = this.children(block);
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          child = ref[j];
          if (child.type === 'chunk' && child.properties && !_.isEmpty(child.properties)) {
            results.push(_.defaults(props, child.properties));
          } else {
            results.push(void 0);
          }
        }
        return results;
      };

      OrgData.prototype.firstChild = function(thing, changes) {
        var block, n;
        if ((block = this.getBlock(thing, changes)) && (n = this.getBlock(block.next, changes)) && !n.previousSibling) {
          return n;
        }
      };

      OrgData.prototype.lastChild = function(thing, changes) {
        return this.lastSibling(this.firstChild(thing, changes), changes);
      };

      OrgData.prototype.children = function(thing, changes) {
        var c;
        c = [];
        this.reduceNextSiblings(this.firstChild(thing, changes), changes, (function(x, y) {
          return c.push(y);
        }), null);
        return c;
      };

      OrgData.prototype.nextRight = function(thing, changes) {
        var sib;
        while (thing) {
          if (sib = this.nextSibling(thing, changes)) {
            return sib;
          }
          thing = this.parent(thing, changes);
        }
        return null;
      };

      OrgData.prototype.linkAllSiblings = function(changes) {
        var block, cur, emptyNexts, id, parent, ref, results, sibling, stack;
        stack = [];
        parent = null;
        sibling = null;
        emptyNexts = {};
        cur = this.getBlock(changes.first, changes);
        while (cur) {
          if (cur.nextSibling) {
            emptyNexts[cur._id] = cur;
          }
          if (cur.type === 'headline') {
            while (parent && cur.level <= parent.level) {
              ref = stack.pop(), parent = ref[0], sibling = ref[1];
            }
          } else if (cur.type === 'chunk' && (cur.properties != null) && parent && !_(parent.propertiesBlocks).includes(cur._id)) {
            if (!parent.propertiesBlocks) {
              parent.propertiesBlocks = [];
            }
            parent.propertiesBlocks.push(cur._id);
          }
          if (sibling) {
            delete emptyNexts[sibling._id];
            if (sibling.nextSibling !== cur._id) {
              addChange(sibling, changes).nextSibling = cur._id;
            }
            if (cur.previousSibling !== sibling._id) {
              addChange(cur, changes).previousSibling = sibling._id;
            }
          } else if (cur.previousSibling) {
            delete addChange(cur, changes).previousSibling;
          }
          sibling = cur;
          if (cur.type === 'headline') {
            stack.push([parent, sibling]);
            parent = cur;
            sibling = null;
          }
          cur = this.getBlock(cur.next, changes);
        }
        results = [];
        for (id in emptyNexts) {
          block = emptyNexts[id];
          results.push(delete addChange(block, changes).nextSibling);
        }
        return results;
      };

      return OrgData;

    })(DataStore);
    parseOrgDoc = function(text) {
      if (text === '') {
        return [];
      } else {
        return orgDoc(parseOrgMode(text.replace(/\r\n/g, '\n')), true);
      }
    };
    addChange = function(block, changes) {
      if (!changes.sets[block._id]) {
        changes.oldBlocks.push(block);
        changes.newBlocks.push(changes.sets[block._id] = copyBlock(block));
      }
      return changes.sets[block._id];
    };
    greduce = function(thing, changes, func, arg, next) {
      if (typeof changes === 'function') {
        next = arg;
        arg = func;
        func = changes;
      }
      if (thing && typeof arg === 'undefined') {
        arg = thing;
        thing = next(thing);
      }
      while (thing) {
        arg = func(arg, thing);
        thing = next(thing);
      }
      return arg;
    };
    getId = function(thing) {
      if (typeof thing === 'string') {
        return thing;
      } else {
        return thing._id;
      }
    };
    OrgEditing = (function(superClass) {
      extend(OrgEditing, superClass);

      function OrgEditing(data) {
        OrgEditing.__super__.constructor.call(this, data);
        data.on('load', (function(_this) {
          return function() {
            return _this.editor.setHtml(_this.editor.node[0], _this.renderBlocks());
          };
        })(this));
      }

      OrgEditing.prototype.blockLineFor = function(node, offset) {
        var block, ref;
        ref = this.editor.blockOffset(node, offset), block = ref.block, offset = ref.offset;
        return this.blockLine(block, offset);
      };

      OrgEditing.prototype.blockLine = function(block, offset) {
        var lines, text;
        text = block.text.substring(0, offset);
        lines = text.split('\n');
        return {
          line: lines.length,
          col: last(lines).length
        };
      };

      OrgEditing.prototype.lineInfo = function(block, offset) {
        var col, docLine, holder, line, p, ref, startBlock;
        if (block) {
          ref = this.blockLine(block, offset), line = ref.line, col = ref.col;
          startBlock = block;
          docLine = line;
          while (block.prev) {
            block = this.getBlock(block.prev);
            docLine += block.text.split('\n').length - 1;
          }
          holder = this.nodeForId(startBlock._id);
          p = posFor(this.editor.domCursorForTextPosition(holder, offset));
          return {
            line: docLine,
            col: col,
            blockLine: line,
            top: Math.round(p.top),
            left: Math.round(p.left)
          };
        } else {
          return {};
        }
      };

      OrgEditing.prototype.setEditor = function(editor1) {
        this.editor = editor1;
        return this.editor.on('moved', (function(_this) {
          return function() {
            var block, blockLine, col, left, line, offset, ref, ref1, top;
            ref = _this.editor.getSelectedBlockRange(), block = ref.block, offset = ref.offset;
            if (block) {
              ref1 = _this.lineInfo(block, offset), line = ref1.line, col = ref1.col, blockLine = ref1.blockLine, top = ref1.top, left = ref1.left;
              if (line) {
                return _this.updateStatus("line: " + (numSpan(line)) + " col: " + (numSpan(col)) + " block: " + block._id + ":" + (numSpan(blockLine)) + " top: " + (numSpan(top)) + " left: " + (numSpan(left)));
              }
            }
            return _this.updateStatus("No selection");
          };
        })(this));
      };

      return OrgEditing;

    })(DataStoreEditingOptions);
    parent = function(prev, next) {
      return prev.type === 'headline' && (next.type !== 'headline' || prev.level < next.level);
    };
    siblings = function(prev, next) {
      var ref;
      return (prev.type !== 'headline' && next.type !== 'headline') || ((prev.type === (ref = next.type) && ref === 'headline') && prev.level === next.level);
    };
    PlainEditing = (function(superClass) {
      extend(PlainEditing, superClass);

      function PlainEditing() {
        return PlainEditing.__super__.constructor.apply(this, arguments);
      }

      PlainEditing.prototype.nodeForId = function(id) {
        return $("#plain-" + id);
      };

      PlainEditing.prototype.idForNode = function(node) {
        var ref;
        return (ref = node.id.match(/^plain-(.*)$/)) != null ? ref[1] : void 0;
      };

      PlainEditing.prototype.parseBlocks = function(text) {
        return this.data.parseBlocks(text);
      };

      PlainEditing.prototype.renderBlock = function(block) {
        return ["<span id='plain-" + block._id + "' data-block>" + (escapeHtml(block.text)) + "</span>", block.next];
      };

      PlainEditing.prototype.updateStatus = function(line) {
        return $("#plainStatus").html(line);
      };

      return PlainEditing;

    })(OrgEditing);
    FancyEditing = (function(superClass) {
      extend(FancyEditing, superClass);

      function FancyEditing() {
        return FancyEditing.__super__.constructor.apply(this, arguments);
      }

      FancyEditing.prototype.changed = function(changes) {
        var block, id, j, len, ref, ref1, ref2, rendered, results;
        rendered = {};
        ref = changes.removes;
        for (id in ref) {
          block = ref[id];
          this.removeBlock(block);
        }
        ref1 = changes.newBlocks;
        for (j = 0, len = ref1.length; j < len; j++) {
          block = ref1[j];
          rendered[block._id] = true;
          this.updateBlock(block, changes.old[block._id]);
        }
        ref2 = changes.sets;
        results = [];
        for (id in ref2) {
          block = ref2[id];
          if (!rendered[id]) {
            results.push(this.updateBlock(block, changes.old[block._id]));
          } else {
            results.push(void 0);
          }
        }
        return results;
      };

      FancyEditing.prototype.nodeForId = function(id) {
        return id && $("#fancy-" + (getId(id)));
      };

      FancyEditing.prototype.idForNode = function(node) {
        var ref;
        return (ref = node.id.match(/^fancy-(.*)$/)) != null ? ref[1] : void 0;
      };

      FancyEditing.prototype.parseBlocks = function(text) {
        return this.data.parseBlocks(text);
      };

      FancyEditing.prototype.removeBlock = function(block) {
        var content, node;
        if ((node = this.nodeForId(block._id)).length) {
          if (block.type === 'headline') {
            content = node.children().filter('[data-content]');
            content.children().filter('[data-block]').insertAfter(node);
          }
          return node.remove();
        }
      };

      FancyEditing.prototype.updateBlock = function(block, old) {
        var child, content, html, j, len, node, ref, results;
        if ((node = this.nodeForId(block._id)).length) {
          content = node.children().filter('[data-content]');
          if (block.type !== (old != null ? old.type : void 0) || block.nextSibling !== (old != null ? old.nextSibling : void 0) || block.previousSibling !== (old != null ? old.previousSibling : void 0) || block.prev !== (old != null ? old.prev : void 0)) {
            if (block.type !== 'headline' && old.type === 'headline') {
              content.children().filter('[data-block]').insertAfter(node);
            }
            this.insertUpdateNode(block, node);
          }
          if (block.text !== (old != null ? old.text : void 0)) {
            if (node.is('[data-headline]')) {
              content.children().filter('[data-block]').insertAfter(node);
            }
            html = this.renderBlock(block, true)[0];
            node = $(this.editor.setHtml(node[0], html, true));
            content = node.children().filter('[data-content]');
            if (block.type === 'headline') {
              ref = this.data.children(block);
              results = [];
              for (j = 0, len = ref.length; j < len; j++) {
                child = ref[j];
                results.push(content.append(this.nodeForId(child._id)));
              }
              return results;
            }
          }
        } else {
          node = $("<div></div>");
          this.insertUpdateNode(block, node);
          html = this.renderBlock(block, true)[0];
          return this.editor.setHtml(node[0], html, true);
        }
      };

      FancyEditing.prototype.insertUpdateNode = function(block, node) {
        var next, parentNode, prev, ref, ref1, ref2;
        if ((ref = (prev = this.nodeForId(this.data.previousSibling(block)))) != null ? ref.length : void 0) {
          return prev.after(node);
        } else if (!block.prev) {
          return this.editor.node.prepend(node);
        } else if (!block.previousSibling && ((ref1 = (parentNode = this.nodeForId(block.prev))) != null ? ref1.is("[data-headline]") : void 0)) {
          return parentNode.children().filter("[data-content]").children().first().after(node);
        } else if ((ref2 = (next = this.nodeForId(this.data.nextSibling(block)))) != null ? ref2.length : void 0) {
          return next.before(node);
        } else {
          return this.editor.node.append(node);
        }
      };

      FancyEditing.prototype.renderBlock = function(block, skipChildren) {
        var child, html, ref;
        html = block.type === 'headline' ? "<div " + (blockAttrs(block)) + " contenteditable='false'>" + (blockLabel(block)) + "<div contenteditable='true' data-content>" + (contentSpan(block.text, 'text')) + (!skipChildren ? ((function() {
          var j, len, ref, ref1, results;
          ref1 = (ref = this.data.children(block)) != null ? ref : [];
          results = [];
          for (j = 0, len = ref1.length; j < len; j++) {
            child = ref1[j];
            results.push(this.renderBlock(child)[0]);
          }
          return results;
        }).call(this)).join('') : '') + "</div></div>" : block.type === 'code' ? "<span " + (blockAttrs(block)) + ">" + (blockLabel(block)) + (escapeHtml(block.text)) + "</span>" : "<span " + (blockAttrs(block)) + ">" + (blockLabel(block)) + (escapeHtml(block.text)) + "</span>";
        return [html, ((ref = this.data.nextSibling(block)) != null ? ref._id : void 0) || !this.data.firstChild(block) && block.next];
      };

      FancyEditing.prototype.updateStatus = function(line) {
        return $("#orgStatus").html(line);
      };

      return FancyEditing;

    })(OrgEditing);
    numSpan = function(n) {
      return "<span class='status-num'>" + n + "</span>";
    };
    blockLabel = function(block) {
      return "<span class='blockLabel' contenteditable='false' data-noncontent>[" + block.type + " " + block._id + "]</span>";
    };
    blockAttrs = function(block) {
      var extra;
      extra = '';
      if (block.type === 'headline') {
        extra += " data-headline='" + (escapeAttr(block.level)) + "'";
      }
      return "id='fancy-" + (escapeAttr(block._id)) + "' data-block='" + (escapeAttr(block._id)) + "' data-type='" + (escapeAttr(block.type)) + "'" + extra;
    };
    contentSpan = function(str, type) {
      str = escapeHtml(str);
      if (str) {
        return "<span" + (type ? " data-org-type='" + (escapeAttr(type)) + "'" : '') + ">" + str + "</span>";
      } else {
        return '';
      }
    };
    escapeAttr = function(str) {
      if (typeof str === 'string') {
        return str.replace(/['"&]/g, function(c) {
          switch (c) {
            case '"':
              return '&quot;';
            case "'":
              return '&#39;';
            case '&':
              return '&amp;';
          }
        });
      } else {
        return str;
      }
    };
    displayStructure = function(data) {
      var bad, check, checks, cur, i, info, level, p, parentStack, prev, prevParent;
      parentStack = [];
      info = "";
      level = 0;
      cur = data.getBlock(data.first);
      prevParent = null;
      checks = {
        nextSibling: {},
        previousSibling: {},
        prev: {}
      };
      check = cur;
      prev = null;
      while (check) {
        checks.nextSibling[check.previousSibling] = check._id;
        checks.previousSibling[check.nextSibling] = check._id;
        checks.prev[check.next] = check._id;
        prev = check;
        check = data.getBlock(check.next);
      }
      while (cur) {
        bad = [];
        if (cur.nextSibling !== checks.nextSibling[cur._id]) {
          bad.push('nextSibling');
        }
        if (cur.previousSibling !== checks.previousSibling[cur._id]) {
          bad.push('previousSibling');
        }
        if (cur.prev !== checks.prev[cur._id]) {
          bad.push('prev');
        }
        if (!cur.previousSibling) {
          p = cur;
          while (p = data.parent(p)) {
            level++;
          }
        }
        info += "" + (((function() {
          var j, ref, results;
          results = [];
          for (i = j = 0, ref = level; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
            results.push('   ');
          }
          return results;
        })()).join('')) + cur._id + (checkStructure(cur, bad)) + ": " + (JSON.stringify(cur.text)) + "\n";
        if (!cur.nextSibling) {
          level = 0;
        }
        cur = data.getBlock(cur.next);
      }
      return $("#blocks").html(info);
    };
    checkStructure = function(block, bad) {
      var err;
      if (bad.length) {
        return ' <span class="err">[' + ((function() {
          var j, len, results;
          results = [];
          for (j = 0, len = bad.length; j < len; j++) {
            err = bad[j];
            results.push(err + ": " + block[err]);
          }
          return results;
        })()).join(', ') + ']</span>';
      } else {
        return '';
      }
    };
    set$($, function(o) {
      return o instanceof $;
    });
    return $(document).ready(function() {
      var editor;
      window.DATA = data = new OrgData();
      data.on('change', function(changes) {
        return displayStructure(data);
      }).on('load', function() {
        return displayStructure(data);
      });
      window.ED = editor = new LeisureEditCore($("#fancyEditor"), new FancyEditing(data));
      window.ED2 = new LeisureEditCore($("#plainEditor"), new PlainEditing(data));
      return setTimeout((function() {
        return editor.loadURL("example.lorg");
      }), 1);
    });
  });

}).call(this);

//# sourceMappingURL=example.js.map
