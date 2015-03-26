// Generated by CoffeeScript 1.9.1
var BS, BasicOptions, Changes, DEL, DOWN, END, ENTER, EditCore, HOME, LEFT, PAGEDOWN, PAGEUP, RIGHT, TAB, UP, _to_ascii, defaultBindings, getEventChar, keyFuncs, last, maxLastKeys, modifiers, modifyingKey, root, selectRange, shiftKey, shiftUps, specialKeys;

selectRange = window.DOMCursor.selectRange;

maxLastKeys = 4;

BS = 8;

ENTER = 13;

DEL = 46;

TAB = 9;

LEFT = 37;

UP = 38;

RIGHT = 39;

DOWN = 40;

HOME = 36;

END = 35;

PAGEUP = 33;

PAGEDOWN = 34;

specialKeys = {};

specialKeys[TAB] = 'TAB';

specialKeys[ENTER] = 'ENTER';

specialKeys[BS] = 'BS';

specialKeys[DEL] = 'DEL';

specialKeys[LEFT] = 'LEFT';

specialKeys[RIGHT] = 'RIGHT';

specialKeys[UP] = 'UP';

specialKeys[DOWN] = 'DOWN';

specialKeys[PAGEUP] = 'PAGEUP';

specialKeys[PAGEDOWN] = 'PAGEDOWN';

specialKeys[HOME] = 'HOME';

specialKeys[END] = 'END';

keyFuncs = {
  backwardChar: function(editor, e, r) {
    e.preventDefault();
    editor.moveSelectionBackward(r);
    return false;
  },
  forwardChar: function(editor, e, r) {
    e.preventDefault();
    editor.moveSelectionForward(r);
    return false;
  },
  previousLine: function(editor, e, r) {
    e.preventDefault();
    editor.moveSelectionUp(r);
    return false;
  },
  nextLine: function(editor, e, r) {
    e.preventDefault();
    editor.moveSelectionDown(r);
    return false;
  }
};

defaultBindings = {
  'UP': keyFuncs.previousLine,
  'DOWN': keyFuncs.nextLine,
  'LEFT': keyFuncs.backwardChar,
  'RIGHT': keyFuncs.forwardChar
};

EditCore = (function() {
  function EditCore(node1, options) {
    this.node = node1;
    this.options = options;
    this.node.attr('contenteditable', 'true');
    this.curKeyBinding = this.prevKeybinding = null;
    this.bind();
    this.lastKeys = [];
    this.modCancelled = false;
    this.clipboardKey = null;
    this.ignoreModCheck = 0;
    this.movementGoal = null;
    this.options.setEditor(this);
  }

  EditCore.prototype.getCopy = function(id) {
    var bl, k, old, v;
    if (old = this.options.getBlock(id)) {
      bl = {};
      for (k in old) {
        v = old[k];
        bl[k] = v;
      }
      return bl;
    }
  };

  EditCore.prototype.getBlockLocation = function() {
    var holder, s;
    s = getSelection();
    if (s.type !== 'None' && (holder = this.options.getContainer(s.anchorNode))) {
      return {
        blockId: holder.id,
        offset: this.getTextPosition(holder, s.anchorNode, s.anchorOffset)
      };
    } else {
      return {};
    }
  };

  EditCore.prototype.domCursor = function(node, pos) {
    if (node instanceof jQuery) {
      node = node[0];
      pos = pos != null ? pos : 0;
    }
    return this.options.domCursor(node, pos);
  };

  EditCore.prototype.domCursorForText = function(node, pos, parent) {
    var c;
    c = this.domCursor(node, pos).filterTextNodes().firstText();
    if (parent != null) {
      return c.filterParent(parent);
    } else {
      return c;
    }
  };

  EditCore.prototype.domCursorForTextPosition = function(parent, pos, contain) {
    return this.domCursorForText(parent, 0, (contain ? parent : void 0)).mutable().forwardChars(pos, contain).adjustForNewline();
  };

  EditCore.prototype.domCursorForCaret = function() {
    var n, sel;
    sel = getSelection();
    n = this.domCursor(sel.focusNode, sel.focusOffset).mutable().filterVisibleTextNodes().filterParent(this.node[0]).firstText();
    if (n.isEmpty() || n.pos <= n.node.length) {
      return n;
    } else {
      return n.next();
    }
  };

  EditCore.prototype.getTextPosition = function(parent, target, pos) {
    var targ;
    if (parent) {
      targ = this.domCursorForText(target, pos);
      if (!this.options.getContainer(targ.node)) {
        targ = targ.prev();
      }
      return this.domCursorForText(parent, 0, parent).mutable().countChars(targ.node, targ.pos);
    } else {
      return -1;
    }
  };

  EditCore.prototype.loadURL = function(url) {
    return $.get(url, (function(_this) {
      return function(text) {
        return _this.options.load(_this.node, text);
      };
    })(this));
  };

  EditCore.prototype.handleInsert = function(e, s, text) {
    var block, blocks, holder, pos;
    if (s.type === 'Caret') {
      e.preventDefault();
      holder = this.options.getContainer(s.anchorNode);
      block = this.getCopy(holder.id);
      blocks = [block];
      pos = this.getTextPosition(holder, s.anchorNode, s.anchorOffset);
      if (pos === block.text.length && block.next) {
        blocks.push(this.getCopy(block.next));
      }
      this.ignoreModCheck = this.ignoreModCheck || 1;
      return this.editBlock(blocks, pos, pos, text != null ? text : getEventChar(e), pos + 1);
    }
  };

  EditCore.prototype.backspace = function(event, sel, r) {
    var holderId;
    holderId = this.options.getContainer(sel.anchorNode).id;
    this.currentBlockIds = [(this.getCopy(holderId))._id];
    return this.handleDelete(event, sel, false, function(text, pos) {
      return true;
    });
  };

  EditCore.prototype.del = function(event, sel, r) {
    var holderId;
    holderId = this.options.getContainer(sel.anchorNode).id;
    this.currentBlockIds = [(this.getCopy(holderId))._id];
    return this.handleDelete(event, sel, true, function(text, pos) {
      return true;
    });
  };

  EditCore.prototype.handleDelete = function(e, s, forward, delFunc) {
    var bl, block, blocks, c, cont, pos, result, stop;
    e.preventDefault();
    if (s.type === 'Caret') {
      c = this.domCursorForCaret().firstText();
      cont = this.options.getContainer(c.node);
      block = this.getCopy(cont.id);
      pos = this.getTextPosition(cont, c.node, c.pos);
      result = delFunc(block.text, pos);
      blocks = [];
      if (!result) {
        return this.ignoreModCheck = this.ignoreModCheck || 1;
      } else {
        if (result instanceof Array) {
          pos = result[0], stop = result[1];
        } else {
          pos += forward ? 0 : -1;
          stop = pos + 1;
        }
        if (pos < 0) {
          if (blocks.prev) {
            blocks.push(bl = this.getCopy(block.prev));
            pos += bl.text.length;
            stop += bl.text.length;
          } else {
            return;
          }
        }
        blocks.push(block);
        if (pos === block.text.length - 1 && block.text[block.text.length - 1] === '\n') {
          if (block.next) {
            blocks.push(this.getCopy(block.next));
          } else {
            return;
          }
        }
        return this.editBlock(blocks, pos, stop, '', pos);
      }
    }
  };

  EditCore.prototype.editBlock = function(blocks, start, end, newContent, caret) {
    var bl, block, i, j, newPrev, newText, oldText, prev, prevHolder, save, saveC;
    oldText = ((function() {
      var j, len, results;
      results = [];
      for (j = 0, len = blocks.length; j < len; j++) {
        block = blocks[j];
        results.push(block.text);
      }
      return results;
    })()).join('');
    newText = oldText.substring(0, start) + newContent + oldText.substring(end);
    if (caret != null) {
      bl = blocks.slice();
      prev = bl[0];
      for (i = j = 0; j < 2; i = ++j) {
        if (newPrev = this.getCopy(prev.prev)) {
          prev = newPrev;
          caret += prev.text.length;
        }
      }
      prevHolder = $("#" + prev._id)[0];
      saveC = this.domCursor(prevHolder, 0).firstText();
      save = this.getTextPosition(prevHolder, saveC.node, saveC.pos) + caret;
    }
    this.options.edit((function(_this) {
      return function() {
        return _this.changeStructure(blocks, newText);
      };
    })(this));
    this.changes = null;
    if (caret != null) {
      if (prevHolder.ownerDocument.compareDocumentPosition(prevHolder) & Element.DOCUMENT_POSITION_DISCONNECTED) {
        prevHolder = $("#" + prev._id)[0];
      }
      return this.domCursorForTextPosition(prevHolder, save).moveCaret();
    }
  };

  EditCore.prototype.changeStructure = function(oldBlocks, newText) {
    var bl, newBlocks;
    this.changes = new Changes(this);
    if (bl = this.changes.getUpdateBlock(oldBlocks[0].prev)) {
      oldBlocks.unshift(bl);
      newText = bl.text + newText;
    }
    if (bl = this.changes.getUpdateBlock(last(oldBlocks).next)) {
      oldBlocks.push(bl);
      newText += bl.text;
    }
    newBlocks = this.options.parseBlocks(newText);
    this.remapBlocks(oldBlocks, newBlocks);
    return this.changes;
  };

  EditCore.prototype.checkMerge = function(oldBlock, newBlock, neighbor, oldBlocks, newBlocks, func) {
    var nb, txt;
    if (this.options.isMergeable(newBlock, neighbor, oldBlock)) {
      txt = func(neighbor.text);
      nb = this.options.parseBlocks(neighbor.text);
      if (nb.length === 1) {
        neighbor.text = txt;
        this.changes.updateBlock(neighbor, true);
      } else {

      }
      return neighbor._id;
    } else {
      return newBlock._id;
    }
  };

  EditCore.prototype.remapBlocks = function(oldBlocks, newBlocks) {
    var block, deleteCount, diff, diffs, i, insertCount, j, l, len, m, newTypes, offset, oldTypes, prevId, ref, ref1, updateCount;
    oldTypes = (function() {
      var j, len, results;
      results = [];
      for (j = 0, len = oldBlocks.length; j < len; j++) {
        block = oldBlocks[j];
        results.push(block.type);
      }
      return results;
    })();
    newTypes = (function() {
      var j, len, results;
      results = [];
      for (j = 0, len = newBlocks.length; j < len; j++) {
        block = newBlocks[j];
        results.push(block.type);
      }
      return results;
    })();
    prevId = oldBlocks[0].prev;
    oldBlocks.reverse();
    newBlocks.reverse();
    offset = 0;
    diffs = Adiff.diff(oldTypes, newTypes);
    for (j = 0, len = diffs.length; j < len; j++) {
      diff = diffs[j];
      if (diff[0] > offset) {
        prevId = this.changes.updateBlocks(diff[0] - offset, oldBlocks, newBlocks, prevId);
      }
      offset = diff[0] + diff[1];
      insertCount = diff.length - 2;
      deleteCount = diff[1];
      updateCount = Math.min(deleteCount, insertCount);
      insertCount -= updateCount;
      deleteCount -= updateCount;
      if (updateCount > 0) {
        prevId = this.changes.updateBlocks(updateCount, oldBlocks, newBlocks, prevId);
      }
      for (i = l = 0, ref = deleteCount; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
        this.changes.removeBlock(oldBlocks.pop());
      }
      for (i = m = 0, ref1 = insertCount; 0 <= ref1 ? m < ref1 : m > ref1; i = 0 <= ref1 ? ++m : --m) {
        prevId = this.changes.insertBlock(newBlocks.pop(), prevId);
      }
    }
    if (oldBlocks.length !== newBlocks.length) {
      console.log("WARNING -- inconsistent block count after diff processing");
    }
    return prevId = this.changes.updateBlocks(newBlocks.length, oldBlocks, newBlocks, prevId);
  };

  EditCore.prototype.bind = function() {
    this.node.on('mousedown', (function(_this) {
      return function(e) {
        _this.options.moved(_this);
        return _this.setCurKeyBinding(null);
      };
    })(this));
    this.node.on('mouseup', (function(_this) {
      return function(e) {
        _this.adjustSelection(e);
        return _this.options.moved(_this);
      };
    })(this));
    this.node.on('keyup', (function(_this) {
      return function(e) {
        return _this.handleKeyup(e);
      };
    })(this));
    return this.node.on('keydown', (function(_this) {
      return function(e) {
        var bound, c, checkMod, r, ref, s;
        _this.modCancelled = false;
        c = e.charCode || e.keyCode || e.which;
        if (!_this.addKeyPress(e, c)) {
          return;
        }
        s = getSelection();
        r = s.rangeCount > 0 && s.getRangeAt(0);
        _this.currentBlockIds = _this.blockIdsForSelection(s, r);
        ref = _this.findKeyBinding(e, r), bound = ref[0], checkMod = ref[1];
        if (bound) {
          return _this.modCancelled = !checkMod;
        } else {
          _this.modCancelled = false;
          if (c === ENTER) {
            return _this.handleInsert(e, s, '\n');
          } else if (c === BS) {
            return _this.backspace(e, s, r);
          } else if (c === DEL) {
            return _this.del(e, s, r);
          } else if (modifyingKey(c, e)) {
            return _this.handleInsert(e, s);
          }
        }
      };
    })(this));
  };

  EditCore.prototype.blockIdsForSelection = function(sel, r) {
    var blocks, cont, cur, end;
    if (!sel) {
      sel = getSelection();
    }
    if (sel.rangeCount === 1) {
      if (!r) {
        r = sel.getRangeAt(0);
      }
      blocks = (cont = this.options.getContainer(r.startContainer)) ? [cont.id] : [];
      if (!(r != null ? r.collapsed : void 0)) {
        cur = blocks[0];
        end = this.options.getContainer(r.endContainer).id;
        while (cur && cur !== end) {
          if (cur = (this.getCopy(cur)).next) {
            blocks.push(cur);
          }
        }
      }
      return blocks;
    }
  };

  EditCore.prototype.setCurKeyBinding = function(f) {
    this.prevKeybinding = this.curKeyBinding;
    return this.curKeyBinding = f;
  };

  EditCore.prototype.addKeyPress = function(e, c) {
    var i, j, notShift, ref;
    if (notShift = !shiftKey(c)) {
      e.DE_editorShiftkey = true;
      this.lastKeys.push(modifiers(e, c));
      while (this.lastKeys.length > maxLastKeys) {
        this.lastKeys.shift();
      }
      this.keyCombos = new Array(maxLastKeys);
      for (i = j = 0, ref = Math.min(this.lastKeys.length, maxLastKeys); 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        this.keyCombos[i] = this.lastKeys.slice(this.lastKeys.length - i - 1, this.lastKeys.length).join(' ');
      }
      this.keyCombos.reverse();
    }
    return notShift;
  };

  EditCore.prototype.findKeyBinding = function(e, r) {
    var f, j, k, len, ref;
    ref = this.keyCombos;
    for (j = 0, len = ref.length; j < len; j++) {
      k = ref[j];
      if (f = this.options.bindings[k]) {
        this.lastKeys = [];
        this.keyCombos = [];
        this.setCurKeyBinding(f);
        return [true, f(this, e, r)];
      }
    }
    this.setCurKeyBinding(null);
    return [false];
  };

  EditCore.prototype.handleKeyup = function(e) {
    if (this.ignoreModCheck = this.ignoreModCheck) {
      this.ignoreModCheck--;
    }
    if (this.clipboardKey || (!e.DE_shiftkey && !this.modCancelled && modifyingKey(e.charCode || e.keyCode || e.which, e))) {
      this.options.keyUp(this);
      return this.clipboardKey = null;
    }
  };

  EditCore.prototype.adjustSelection = function(e) {
    var pos, r, s;
    if (e.detail === 1) {
      return;
    }
    s = getSelection();
    if (s.type === 'Range') {
      r = s.getRangeAt(0);
      pos = this.domCursor(r.endContainer, r.endOffset).mutable().filterVisibleTextNodes().firstText();
      while (pos.node !== r.startContainer && pos.node.data.trim() === '') {
        pos === pos.prev();
      }
      while (pos.pos > 0 && pos.node.data[pos.pos - 1] === ' ') {
        pos.pos--;
      }
      if ((pos.node !== r.startContainer || pos.pos > r.startOffset) && (pos.node !== r.endContainer || pos.pos < r.endOffset)) {
        r.setEnd(pos.node, pos.pos);
        return selectRange(r);
      }
    }
  };

  EditCore.prototype.moveSelectionForward = function() {
    return this.showCaret(this.moveForward());
  };

  EditCore.prototype.moveSelectionDown = function() {
    return this.showCaret(this.moveDown());
  };

  EditCore.prototype.moveSelectionBackward = function() {
    return this.showCaret(this.moveBackward());
  };

  EditCore.prototype.moveSelectionUp = function() {
    return this.showCaret(this.moveUp());
  };

  EditCore.prototype.showCaret = function(pos) {
    return pos.show(this.options.topRect());
  };

  EditCore.prototype.moveForward = function() {
    var pos, start;
    start = pos = this.domCursorForCaret().firstText().save();
    while (!pos.isEmpty() && this.domCursorForCaret().firstText().equals(start)) {
      pos = pos.forwardChar();
      pos.moveCaret();
    }
    this.options.moved(this);
    return pos;
  };

  EditCore.prototype.moveBackward = function() {
    var pos, start;
    start = pos = this.domCursorForCaret().firstText().save();
    while (!pos.isEmpty() && this.domCursorForCaret().firstText().equals(start)) {
      pos = pos.backwardChar();
      pos.moveCaret();
    }
    this.options.moved(this);
    return pos;
  };

  EditCore.prototype.moveDown = function() {
    var line, linePos, pos, prev, ref;
    linePos = prev = pos = this.domCursorForCaret().save();
    if (!((ref = this.prevKeybinding) === keyFuncs.nextLine || ref === keyFuncs.previousLine)) {
      this.movementGoal = this.options.blockColumn(pos);
    }
    line = 0;
    while (!(pos = this.moveSelectionForward()).isEmpty()) {
      if (linePos.differentLines(pos)) {
        line++;
        linePos = pos;
      }
      if (line === 2) {
        return prev.moveCaret();
      }
      if (line === 1 && this.options.blockColumn(pos) >= this.movementGoal) {
        return this.moveToBestPosition(pos, prev, linePos);
      }
      prev = pos;
    }
    this.options.moved(this);
    return pos;
  };

  EditCore.prototype.moveUp = function() {
    var line, linePos, pos, prev, ref;
    linePos = prev = pos = this.domCursorForCaret().save();
    if (!((ref = this.prevKeybinding) === keyFuncs.nextLine || ref === keyFuncs.previousLine)) {
      this.movementGoal = this.options.blockColumn(pos);
    }
    line = 0;
    while (!(pos = this.moveBackward()).isEmpty()) {
      if (linePos.differentLines(pos)) {
        line++;
        linePos = pos;
      }
      if (line === 2) {
        return prev.moveCaret();
      }
      if (line === 1 && this.options.blockColumn(pos) <= this.movementGoal) {
        return this.moveToBestPosition(pos, prev, linePos);
      }
      prev = pos;
    }
    this.options.moved(this);
    return pos;
  };

  EditCore.prototype.moveToBestPosition = function(pos, prev, linePos) {
    if (linePos === pos || Math.abs(this.options.blockColumn(pos) - this.movementGoal) < Math.abs(this.options.blockColumn(prev) - this.movementGoal)) {
      return pos;
    } else {
      return prev.moveCaret();
    }
  };

  return EditCore;

})();

Changes = (function() {
  function Changes(editor1) {
    this.editor = editor1;
    this.options = this.editor.options;
    this.first = this.options.getFirst();
    this.updates = {};
    this.removes = {};
    this.oldBlocks = {};
  }

  Changes.prototype.getCopy = function(id) {
    return this.editor.getCopy(id);
  };

  Changes.prototype.getChangedBlock = function(id) {
    var ref;
    return (ref = this.updates[id]) != null ? ref : this.options.getBlock(id);
  };

  Changes.prototype.getUpdateBlock = function(id) {
    var ref;
    return (ref = this.updates[id]) != null ? ref : (this.updates[id] = this.getCopy(id));
  };

  Changes.prototype.getOldBlock = function(id) {
    var ref;
    return (ref = this.oldBlocks[id]) != null ? ref : this.options.getBlock(id);
  };

  Changes.prototype.insertBlock = function(newBlock, prevId) {
    var next, nextId, prev;
    if (!newBlock._id) {
      newBlock._id = this.options.newId();
    }
    this.updates[newBlock._id] = newBlock;
    if (prevId) {
      newBlock.prev = prevId;
      if (prev = this.getUpdateBlock(prevId)) {
        nextId = prev.next;
        prev.next = newBlock._id;
        this.updates[prevId] = prev;
      }
    } else {
      nextId = this.first;
      this.first = newBlock._id;
    }
    if (newBlock.next = nextId) {
      next = this.getUpdateBlock(nextId);
      next.prev = newBlock._id;
      this.updates[nextId] = next;
    }
    return newBlock._id;
  };

  Changes.prototype.removeBlock = function(block) {
    var id, item, next, prev;
    id = block._id;
    item = this.getChangedBlock(id);
    prev = this.getUpdateBlock(block.prev);
    next = this.getUpdateBlock(block.next);
    if (!prev) {
      if (this.first !== id) {
        console.log("Error, removing item with non prev, but it is not the head");
      } else {
        this.first = item.next;
      }
    }
    delete this.updates[id];
    this.removes[id] = true;
    if (prev && prev.next === id) {
      prev.next = item.next;
    }
    if (next && next.prev === id) {
      return next.prev = item.prev;
    }
  };

  Changes.prototype.updateBlock = function(block, link) {
    var old;
    if (link) {
      old = this.getChangedBlock(block._id);
      block.prev = old.prev;
      block.next = old.next;
    }
    return this.updates[block._id] = block;
  };

  Changes.prototype.updateBlocks = function(num, oldBlocks, newBlocks, prevId) {
    var b, i, j, n, ref;
    for (i = j = 0, ref = num; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      b = oldBlocks.pop();
      n = newBlocks.pop();
      prevId = n._id = b._id;
      if (n.text !== b.text) {
        this.updateBlock(n, true);
      }
    }
    return prevId;
  };

  Changes.prototype.applyChanges = function() {
    var block, id, ref;
    for (id in this.removes) {
      $("#" + id).remove();
      if (this.saveBlock(id)) {
        delete this.options.blocks[id];
      }
    }
    ref = this.updates;
    for (id in ref) {
      block = ref[id];
      this.saveBlock(id);
      this.options.blocks[id] = block;
    }
    return this.options.first = this.first;
  };

  Changes.prototype.saveBlock = function(id) {
    return this.oldBlocks[id] = this.options.getBlock(id);
  };

  return Changes;

})();

BasicOptions = (function() {
  function BasicOptions() {
    this.blocks = {};
    this.first = null;
    this.idCounter = 0;
    this.removes = {};
    this.updates = {};
  }

  BasicOptions.prototype.setEditor = function(editor1) {
    this.editor = editor1;
  };

  BasicOptions.prototype.newId = function() {
    return "block-" + (this.idCounter++);
  };

  BasicOptions.prototype.newBlocks = function(blockList) {
    var block, j, len, prev;
    this.blocks = {};
    prev = null;
    for (j = 0, len = blockList.length; j < len; j++) {
      block = blockList[j];
      block._id = this.newId();
      if (prev) {
        block.prev = prev._id;
        prev.next = block._id;
      }
      prev = block;
      this.blocks[block._id] = block;
    }
    return this.first = blockList[0]._id;
  };

  BasicOptions.prototype.mousedown = function(e) {};

  BasicOptions.prototype.getFirst = function() {
    return this.first;
  };

  BasicOptions.prototype.getBlock = function(id) {
    return this.blocks[id];
  };

  BasicOptions.prototype.bindings = defaultBindings;

  BasicOptions.prototype.blockColumn = function(pos) {
    return pos.textPosition().left;
  };

  BasicOptions.prototype.topRect = function() {
    return null;
  };

  BasicOptions.prototype.keyUp = function(editor) {};

  BasicOptions.prototype.domCursor = function(node, pos) {
    return new DOMCursor(node, pos).addFilter(function(n) {
      return !n.hasAttribute('data-noncontent') || 'skip';
    });
  };

  BasicOptions.prototype.getContainer = function(node) {
    return $(node).closest('[data-type]')[0];
  };

  BasicOptions.prototype.load = function(el, text) {
    var idCounter;
    idCounter = 0;
    this.newBlocks(this.parseBlocks(text));
    return el.html(this.renderBlocks());
  };

  BasicOptions.prototype.renderBlocks = function() {
    var html, next, ref, result;
    result = '';
    next = this.first;
    while (next && (ref = this.renderBlock(this.getBlock(next)), html = ref[0], next = ref[1], ref)) {
      result += html;
    }
    return result;
  };

  BasicOptions.prototype.isMergeable = function(newBlock, neighbor, oldBlock) {
    throw new Error("options.isMergeable(newBlock, oldBlock, neighbor) is not implemented");
  };

  BasicOptions.prototype.parseBlocks = function(text) {
    throw new Error("options.parseBlocks(text) is not implemented");
  };

  BasicOptions.prototype.renderBlock = function(block) {
    throw new Error("options.renderBlock(block) is not implemented");
  };

  BasicOptions.prototype.edit = function(func) {
    throw new Error("options.edit(func) is not implemented");
  };

  return BasicOptions;

})();

_to_ascii = {
  '188': '44',
  '109': '45',
  '190': '46',
  '191': '47',
  '192': '96',
  '220': '92',
  '222': '39',
  '221': '93',
  '219': '91',
  '173': '45',
  '187': '61',
  '186': '59',
  '189': '45'
};

shiftUps = {
  "96": "~",
  "49": "!",
  "50": "@",
  "51": "#",
  "52": "$",
  "53": "%",
  "54": "^",
  "55": "&",
  "56": "*",
  "57": "(",
  "48": ")",
  "45": "_",
  "61": "+",
  "91": "{",
  "93": "}",
  "92": "|",
  "59": ":",
  "39": "\"",
  "44": "<",
  "46": ">",
  "47": "?"
};

getEventChar = function(e) {
  var c;
  c = e.charCode || e.keyCode || e.which;
  if (_to_ascii.hasOwnProperty(c)) {
    c = _to_ascii[c];
  }
  if (!e.shiftKey && (c >= 65 && c <= 90)) {
    c = String.fromCharCode(c + 32);
  } else if (e.shiftKey && shiftUps.hasOwnProperty(c)) {
    c = shiftUps[c];
  } else {
    c = String.fromCharCode(c);
  }
  return c;
};

shiftKey = function(c) {
  return (15 < c && c < 19);
};

modifiers = function(e, c) {
  var res;
  res = specialKeys[c] || String.fromCharCode(c);
  if (e.altKey) {
    res = "M-" + res;
  }
  if (e.ctrlKey) {
    res = "C-" + res;
  }
  if (e.shiftKey) {
    res = "S-" + res;
  }
  return res;
};

modifyingKey = function(c, e) {
  return !e.altKey && !e.ctrlKey && (((47 < c && c < 58)) || c === 32 || c === ENTER || c === BS || c === DEL || ((64 < c && c < 91)) || ((95 < c && c < 112)) || ((185 < c && c < 193)) || ((218 < c && c < 223)));
};

last = function(array) {
  return array.length && array[array.length - 1];
};

root = EditCore;

root.BasicOptions = BasicOptions;

root.defaultBindings = defaultBindings;

root.last = last;

if (typeof window !== "undefined" && window !== null) {
  window.EditCore = root;
} else {
  module.exports = root;
}

//# sourceMappingURL=editor.js.map
