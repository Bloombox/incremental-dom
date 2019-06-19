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
goog.module('incrementaldom.src.dom_util');
var module = module || { id: 'src/dom_util.ts' };
/**
 * Checks if the node is the root of a document. This is either a Document
 * or ShadowRoot. DocumentFragments are included for simplicity of the
 * implementation, though we only want to consider Documents or ShadowRoots.
 * @param {!Node} node The node to check.
 * @return {boolean} True if the node the root of a document, false otherwise.
 */
function isDocumentRoot(node) {
    return node.nodeType === 11 || node.nodeType === 9;
}
/**
 * Checks if the node is an Element. This is faster than an instanceof check.
 * @param {!Node} node The node to check.
 * @return {boolean} Whether or not the node is an Element.
 */
function isElement(node) {
    return node.nodeType === 1;
}
exports.isElement = isElement;
/**
 * Checks if the node is a text node. This is faster than an instanceof check.
 * @param {!Node} node The node to check.
 * @return {boolean} Whether or not the node is a Text.
 */
function isText(node) {
    return node.nodeType === 3;
}
exports.isText = isText;
/**
 * @param {!Node} node The node to start at, inclusive.
 * @param {(null|!Node)} root The root ancestor to get until, exclusive.
 * @return {!Array<!Node>} The ancestry of DOM nodes.
 */
function getAncestry(node, root) {
    /** @type {!Array<!Node>} */
    var ancestry = [];
    /** @type {(null|!Node)} */
    var cur = node;
    while (cur !== root) {
        /** @type {!Node} */
        var n = /** @type {!Node} */ ((cur));
        ancestry.push(n);
        cur = n.parentNode;
    }
    return ancestry;
}
/** *
 * return The root node of the DOM tree that contains this node.
  @type {?} */
var getRootNode = 
// tslint:disable-next-line:no-any b/79476176
// tslint:disable-next-line:no-any b/79476176
(/** @type {?} */ (Node)).prototype.getRootNode || function () {
    /** @type {(null|!Node)} */
    var cur = /** @type {!Node} */ (this);
    /** @type {!Node} */
    var prev = cur;
    while (cur) {
        prev = cur;
        cur = cur.parentNode;
    }
    return prev;
};
/**
 * @param {!Node} node The node to get the activeElement for.
 * @return {(null|!Element)} The activeElement in the Document or ShadowRoot
 *     corresponding to node, if present.
 */
function getActiveElement(node) {
    /** @type {?} */
    var root = getRootNode.call(node);
    return isDocumentRoot(root) ? root.activeElement : null;
}
/**
 * Gets the path of nodes that contain the focused node in the same document as
 * a reference node, up until the root.
 * @param {!Node} node The reference node to get the activeElement for.
 * @param {(null|!Node)} root The root to get the focused path until.
 * @return {!Array<!Node>}
 */
function getFocusedPath(node, root) {
    /** @type {(null|!Element)} */
    var activeElement = getActiveElement(node);
    if (!activeElement || !node.contains(activeElement)) {
        return [];
    }
    return getAncestry(activeElement, root);
}
exports.getFocusedPath = getFocusedPath;
/**
 * Like insertBefore, but instead instead of moving the desired node, instead
 * moves all the other nodes after.
 * @param {!Node} parentNode
 * @param {!Node} node
 * @param {(null|!Node)} referenceNode
 * @return {void}
 */
function moveBefore(parentNode, node, referenceNode) {
    /** @type {(null|!Node)} */
    var insertReferenceNode = node.nextSibling;
    /** @type {(null|!Node)} */
    var cur = referenceNode;
    while (cur !== null && cur !== node) {
        /** @type {(null|!Node)} */
        var next = cur.nextSibling;
        parentNode.insertBefore(cur, insertReferenceNode);
        cur = next;
    }
}
exports.moveBefore = moveBefore;
//# sourceMappingURL=dom_util.js.map