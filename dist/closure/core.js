/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright 2018 The Incremental DOM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
goog.module('incrementaldom.src.core');
var module = module || { id: 'src/core.ts' };
var assertions_1 = goog.require('incrementaldom.src.assertions');
var tsickle_forward_declare_1 = goog.forwardDeclare("incrementaldom.src.assertions");
var context_1 = goog.require('incrementaldom.src.context');
var tsickle_forward_declare_2 = goog.forwardDeclare("incrementaldom.src.context");
var dom_util_1 = goog.require('incrementaldom.src.dom_util');
var tsickle_forward_declare_3 = goog.forwardDeclare("incrementaldom.src.dom_util");
var global_1 = goog.require('incrementaldom.src.global');
var tsickle_forward_declare_4 = goog.forwardDeclare("incrementaldom.src.global");
var node_data_1 = goog.require('incrementaldom.src.node_data');
var tsickle_forward_declare_5 = goog.forwardDeclare("incrementaldom.src.node_data");
var nodes_1 = goog.require('incrementaldom.src.nodes');
var tsickle_forward_declare_6 = goog.forwardDeclare("incrementaldom.src.nodes");
var tsickle_forward_declare_7 = goog.forwardDeclare("incrementaldom.src.types");
goog.require("incrementaldom.src.types"); // force type-only module to be loaded
/** @type {(null|!tsickle_forward_declare_2.Context)} */
var context = null;
/** @type {(null|!Node)} */
var currentNode = null;
/** @type {(null|!Node)} */
var currentParent = null;
/** @type {(null|!Document)} */
var doc = null;
/** @type {!Array<!Node>} */
var focusPath = [];
/** @type {tsickle_forward_declare_7.MatchFnDef} */
var matchFn = defaultMatchFn;
/** *
 * Used to build up call arguments. Each patch call gets a separate copy, so
 * this works with nested calls to patch.
  @type {!Array<(undefined|null|!Object)>} */
var argsBuilder = [];
/**
 * TODO(sparhami) We should just export argsBuilder directly when Closure
 * Compiler supports ES6 directly.
 * @return {!Array<(undefined|null|!Object)>}
 */
function getArgsBuilder() {
    return argsBuilder;
}
exports.getArgsBuilder = getArgsBuilder;
/**
 * Returns a patcher function that sets up and restores a patch context,
 * running the run function with the provided data.
 * @template T, R
 * @param {tsickle_forward_declare_7.PatchFunction} run
 * @param {tsickle_forward_declare_7.PatchConfig=} patchConfig
 * @return {tsickle_forward_declare_7.PatchFunction}
 */
function createPatcher(run, patchConfig) {
    if (patchConfig === void 0) { patchConfig = {}; }
    var _a = patchConfig.matches, matches = _a === void 0 ? defaultMatchFn : _a;
    /** @type {tsickle_forward_declare_7.PatchFunction} */
    var f = function (node, fn, data) {
        /** @type {(null|!tsickle_forward_declare_2.Context)} */
        var prevContext = context;
        /** @type {(null|!Document)} */
        var prevDoc = doc;
        /** @type {!Array<!Node>} */
        var prevFocusPath = focusPath;
        /** @type {!Array<(undefined|null|!Object)>} */
        var prevArgsBuilder = argsBuilder;
        /** @type {(null|!Node)} */
        var prevCurrentNode = currentNode;
        /** @type {(null|!Node)} */
        var prevCurrentParent = currentParent;
        /** @type {tsickle_forward_declare_7.MatchFnDef} */
        var prevMatchFn = matchFn;
        /** @type {boolean} */
        var previousInAttributes = false;
        /** @type {boolean} */
        var previousInSkip = false;
        doc = node.ownerDocument;
        context = new context_1.Context();
        matchFn = matches;
        argsBuilder = [];
        currentNode = null;
        currentParent = node.parentNode;
        focusPath = dom_util_1.getFocusedPath(node, currentParent);
        if (global_1.DEBUG) {
            previousInAttributes = assertions_1.setInAttributes(false);
            previousInSkip = assertions_1.setInSkip(false);
        }
        try {
            /** @type {?} */
            var retVal = run(node, fn, data);
            if (global_1.DEBUG) {
                assertions_1.assertVirtualAttributesClosed();
            }
            return retVal;
        }
        finally {
            argsBuilder = prevArgsBuilder;
            currentNode = prevCurrentNode;
            currentParent = prevCurrentParent;
            focusPath = prevFocusPath;
            context.notifyChanges();
            // Needs to be done after assertions because assertions rely on state
            // from these methods.
            // Needs to be done after assertions because assertions rely on state
            // from these methods.
            assertions_1.setInAttributes(previousInAttributes);
            assertions_1.setInSkip(previousInSkip);
            doc = prevDoc;
            context = prevContext;
            matchFn = prevMatchFn;
        }
    };
    return f;
}
/**
 * Creates a patcher that patches the document starting at node with a
 * provided function. This function may be called during an existing patch operation.
 * @template T
 * @param {(undefined|tsickle_forward_declare_7.PatchConfig)=} patchConfig
 * @return {tsickle_forward_declare_7.PatchFunction}
 */
function createPatchInner(patchConfig) {
    return createPatcher(function (node, fn, data) {
        currentNode = node;
        enterNode();
        fn(data);
        exitNode();
        if (global_1.DEBUG) {
            assertions_1.assertNoUnclosedTags(currentNode, node);
        }
        return node;
    }, patchConfig);
}
exports.createPatchInner = createPatchInner;
/**
 * Patches an Element with the the provided function. Exactly one top level
 * element call should be made corresponding to `node`.
 * @template T
 * @param {(undefined|tsickle_forward_declare_7.PatchConfig)=} patchConfig
 * @return {tsickle_forward_declare_7.PatchFunction}
 */
function createPatchOuter(patchConfig) {
    return createPatcher(function (node, fn, data) {
        /** @type {!Element} */
        var startNode = /** @type {!Element} */ ((/** @type {?} */ (({ nextSibling: node }))));
        /** @type {(null|!Node)} */
        var expectedNextNode = null;
        /** @type {(null|!Node)} */
        var expectedPrevNode = null;
        if (global_1.DEBUG) {
            expectedNextNode = node.nextSibling;
            expectedPrevNode = node.previousSibling;
        }
        currentNode = startNode;
        fn(data);
        if (global_1.DEBUG) {
            assertions_1.assertPatchOuterHasParentNode(currentParent);
            assertions_1.assertPatchElementNoExtras(startNode, currentNode, expectedNextNode, expectedPrevNode);
        }
        if (currentParent) {
            clearUnvisitedDOM(currentParent, getNextNode(), node.nextSibling);
        }
        return (startNode === currentNode) ? null : currentNode;
    }, patchConfig);
}
exports.createPatchOuter = createPatchOuter;
/**
 * Checks whether or not the current node matches the specified nameOrCtor and
 * key. This uses the specified match function when creating the patcher.
 * @param {!Node} matchNode A node to match the data to.
 * @param {tsickle_forward_declare_7.NameOrCtorDef} nameOrCtor The name or constructor to check for.
 * @param {tsickle_forward_declare_7.Key} key The key used to identify the Node.
 * @return {boolean} True if the node matches, false otherwise.
 */
function matches(matchNode, nameOrCtor, key) {
    /** @type {!tsickle_forward_declare_5.NodeData} */
    var data = node_data_1.getData(matchNode, key);
    return matchFn(matchNode, nameOrCtor, data.nameOrCtor, key, data.key);
}
/**
 * The default match function to use, if one was not specified when creating
 * the patcher.
 * @param {!Node} matchNode The node to match against, unused.
 * @param {tsickle_forward_declare_7.NameOrCtorDef} nameOrCtor The name or constructor as declared.
 * @param {tsickle_forward_declare_7.NameOrCtorDef} expectedNameOrCtor The name or constructor of the existing node.
 * @param {tsickle_forward_declare_7.Key} key The key as declared.
 * @param {tsickle_forward_declare_7.Key} expectedKey The key of the existing node.
 * @return {boolean}
 */
function defaultMatchFn(matchNode, nameOrCtor, expectedNameOrCtor, key, expectedKey) {
    // Key check is done using double equals as we want to treat a null key the
    // same as undefined. This should be okay as the only values allowed are
    // strings, null and undefined so the == semantics are not too weird.
    // tslint:disable-next-line:triple-equals
    // Key check is done using double equals as we want to treat a null key the
    // same as undefined. This should be okay as the only values allowed are
    // strings, null and undefined so the == semantics are not too weird.
    // tslint:disable-next-line:triple-equals
    return nameOrCtor == expectedNameOrCtor && key == expectedKey;
}
/**
 * Finds the matching node, starting at `node` and looking at the subsequent
 * siblings if a key is used.
 * @param {(null|!Node)} matchNode
 * @param {tsickle_forward_declare_7.NameOrCtorDef} nameOrCtor The name or constructor for the Node.
 * @param {tsickle_forward_declare_7.Key} key The key used to identify the Node.
 * @return {(null|!Node)}
 */
function getMatchingNode(matchNode, nameOrCtor, key) {
    if (!matchNode) {
        return null;
    }
    if (matches(matchNode, nameOrCtor, key)) {
        return matchNode;
    }
    if (key) {
        while ((matchNode = matchNode.nextSibling)) {
            if (matches(matchNode, nameOrCtor, key)) {
                return matchNode;
            }
        }
    }
    return null;
}
/**
 * Creates a Node and marking it as created.
 * @param {tsickle_forward_declare_7.NameOrCtorDef} nameOrCtor The name or constructor for the Node.
 * @param {tsickle_forward_declare_7.Key} key The key used to identify the Node.
 * @return {!Node} The newly created node.
 */
function createNode(nameOrCtor, key) {
    /** @type {?} */
    var node;
    if (nameOrCtor === '#text') {
        node = nodes_1.createText(/** @type {!Document} */ ((doc)));
    }
    else {
        node = nodes_1.createElement(/** @type {!Document} */ ((doc)), /** @type {!Node} */ ((currentParent)), nameOrCtor, key);
    } /** @type {!tsickle_forward_declare_2.Context} */
    ((context)).markCreated(node);
    return node;
}
/**
 * Aligns the virtual Node definition with the actual DOM, moving the
 * corresponding DOM node to the correct location or creating it if necessary.
 * @param {tsickle_forward_declare_7.NameOrCtorDef} nameOrCtor The name or constructor for the Node.
 * @param {tsickle_forward_declare_7.Key} key The key used to identify the Node.
 * @return {void}
 */
function alignWithDOM(nameOrCtor, key) {
    nextNode();
    /** @type {(null|!Node)} */
    var existingNode = getMatchingNode(currentNode, nameOrCtor, key);
    /** @type {!Node} */
    var node = existingNode || createNode(nameOrCtor, key);
    // If we are at the matching node, then we are done.
    // If we are at the matching node, then we are done.
    if (node === currentNode) {
        return;
    }
    // Re-order the node into the right position, preserving focus if either
    // node or currentNode are focused by making sure that they are not detached
    // from the DOM.
    // Re-order the node into the right position, preserving focus if either
    // node or currentNode are focused by making sure that they are not detached
    // from the DOM.
    if (focusPath.indexOf(node) >= 0) {
        // Move everything else before the node.
        // Move everything else before the node.
        dom_util_1.moveBefore(/** @type {!Node} */ ((currentParent)), node, currentNode);
    }
    else {
        /** @type {!Node} */ ((currentParent)).insertBefore(node, currentNode);
    }
    currentNode = node;
}
exports.alignWithDOM = alignWithDOM;
/**
 * Clears out any unvisited Nodes in a given range.
 * @param {(null|!Node)} maybeParentNode
 * @param {(null|!Node)} startNode The node to start clearing from, inclusive.
 * @param {(null|!Node)} endNode The node to clear until, exclusive.
 * @return {void}
 */
function clearUnvisitedDOM(maybeParentNode, startNode, endNode) {
    /** @type {!Node} */
    var parentNode = /** @type {!Node} */ ((maybeParentNode));
    /** @type {(null|!Node)} */
    var child = startNode;
    while (child !== endNode) {
        /** @type {(null|!Node)} */
        var next = /** @type {!Node} */ ((child)).nextSibling;
        parentNode.removeChild(/** @type {!Node} */ ((child))); /** @type {!tsickle_forward_declare_2.Context} */
        ((context)).markDeleted(/** @type {!Node} */ ((child)));
        child = next;
    }
}
/**
 * Changes to the first child of the current node.
 * @return {void}
 */
function enterNode() {
    currentParent = currentNode;
    currentNode = null;
}
/**
 * @return {(null|!Node)} The next Node to be patched.
 */
function getNextNode() {
    if (currentNode) {
        return currentNode.nextSibling;
    }
    else {
        return /** @type {!Node} */ ((currentParent)).firstChild;
    }
}
/**
 * Changes to the next sibling of the current node.
 * @return {void}
 */
function nextNode() {
    currentNode = getNextNode();
}
exports.skipNode = nextNode;
/**
 * Changes to the parent of the current node, removing any unvisited children.
 * @return {void}
 */
function exitNode() {
    clearUnvisitedDOM(currentParent, getNextNode(), null);
    currentNode = currentParent;
    currentParent = /** @type {!Node} */ ((currentParent)).parentNode;
}
/**
 * Makes sure that the current node is an Element with a matching nameOrCtor and
 * key.
 *
 * @param {tsickle_forward_declare_7.NameOrCtorDef} nameOrCtor The tag or constructor for the Element.
 * @param {tsickle_forward_declare_7.Key=} key The key used to identify this element. This can be an
 *     empty string, but performance may be better if a unique value is used
 *     when iterating over an array of items.
 * @return {!HTMLElement} The corresponding Element.
 */
function open(nameOrCtor, key) {
    alignWithDOM(nameOrCtor, key);
    enterNode();
    return (/** @type {!HTMLElement} */ (currentParent));
}
exports.open = open;
/**
 * Closes the currently open Element, removing any unvisited children if
 * necessary.
 * @return {!Element}
 */
function close() {
    if (global_1.DEBUG) {
        assertions_1.setInSkip(false);
    }
    exitNode();
    return /** @type {!Element} */ ((currentNode));
}
exports.close = close;
/**
 * Makes sure the current node is a Text node and creates a Text node if it is
 * not.
 * @return {!Text}
 */
function text() {
    alignWithDOM('#text', null);
    return /** @type {!Text} */ ((currentNode));
}
exports.text = text;
/**
 * Gets the current Element being patched.
 * @return {!HTMLElement}
 */
function currentElement() {
    if (global_1.DEBUG) {
        assertions_1.assertInPatch('currentElement', /** @type {!Document} */ ((doc)));
        assertions_1.assertNotInAttributes('currentElement');
    }
    return /** @type {!HTMLElement} */ ((currentParent));
}
exports.currentElement = currentElement;
/**
 * @return {!Node} The Node that will be evaluated for the next instruction.
 */
function currentPointer() {
    if (global_1.DEBUG) {
        assertions_1.assertInPatch('currentPointer', /** @type {!Document} */ ((doc)));
        assertions_1.assertNotInAttributes('currentPointer');
    }
    // TODO(tomnguyen): assert that this is not null
    // TODO(tomnguyen): assert that this is not null
    return /** @type {!Node} */ ((getNextNode()));
}
exports.currentPointer = currentPointer;
/**
 * Skips the children in a subtree, allowing an Element to be closed without
 * clearing out the children.
 * @return {void}
 */
function skip() {
    if (global_1.DEBUG) {
        assertions_1.assertNoChildrenDeclaredYet('skip', currentNode);
        assertions_1.setInSkip(true);
    }
    currentNode = /** @type {!Node} */ ((currentParent)).lastChild;
}
exports.skip = skip;
/** @type {tsickle_forward_declare_7.PatchFunction} */
var patchInner = createPatchInner();
exports.patchInner = patchInner;
/** @type {tsickle_forward_declare_7.PatchFunction} */
var patchOuter = createPatchOuter();
exports.patchOuter = patchOuter;
//# sourceMappingURL=core.js.map