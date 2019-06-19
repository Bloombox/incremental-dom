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
goog.module('incrementaldom.src.assertions');
var module = module || { id: 'src/assertions.ts' };
var global_1 = goog.require('incrementaldom.src.global');
var tsickle_forward_declare_1 = goog.forwardDeclare("incrementaldom.src.global");
var tsickle_forward_declare_2 = goog.forwardDeclare("incrementaldom.src.types");
goog.require("incrementaldom.src.types"); // force type-only module to be loaded
/** *
 * Keeps track whether or not we are in an attributes declaration (after
 * elementOpenStart, but before elementOpenEnd).
  @type {boolean} */
var inAttributes = false;
/** *
 * Keeps track whether or not we are in an element that should not have its
 * children cleared.
  @type {boolean} */
var inSkip = false;
/**
 * Makes sure that there is a current patch context.
 * @param {string} functionName
 * @param {!Document} context
 * @return {void}
 */
function assertInPatch(functionName, context) {
    if (!context) {
        throw new Error('Cannot call ' + functionName + '() unless in patch.');
    }
}
exports.assertInPatch = assertInPatch;
/**
 * Makes sure that a patch closes every node that it opened.
 * @param {(null|!Node)} openElement
 * @param {(!Node|!DocumentFragment)} root
 * @return {void}
 */
function assertNoUnclosedTags(openElement, root) {
    if (openElement === root) {
        return;
    }
    /** @type {(null|!Node)} */
    var currentElement = openElement;
    /** @type {!Array<string>} */
    var openTags = [];
    while (currentElement && currentElement !== root) {
        openTags.push(currentElement.nodeName.toLowerCase());
        currentElement = currentElement.parentNode;
    }
    throw new Error('One or more tags were not closed:\n' + openTags.join('\n'));
}
exports.assertNoUnclosedTags = assertNoUnclosedTags;
/**
 * Makes sure that node being outer patched has a parent node.
 * @param {(null|!Node)} parent
 * @return {void}
 */
function assertPatchOuterHasParentNode(parent) {
    if (!parent) {
        console.warn('patchOuter requires the node have a parent if there is a key.');
    }
}
exports.assertPatchOuterHasParentNode = assertPatchOuterHasParentNode;
/**
 * Makes sure that the caller is not where attributes are expected.
 * @param {string} functionName
 * @return {void}
 */
function assertNotInAttributes(functionName) {
    if (inAttributes) {
        throw new Error(functionName + '() can not be called between ' +
            'elementOpenStart() and elementOpenEnd().');
    }
}
exports.assertNotInAttributes = assertNotInAttributes;
/**
 * Makes sure that the caller is not inside an element that has declared skip.
 * @param {string} functionName
 * @return {void}
 */
function assertNotInSkip(functionName) {
    if (inSkip) {
        throw new Error(functionName + '() may not be called inside an element ' +
            'that has called skip().');
    }
}
exports.assertNotInSkip = assertNotInSkip;
/**
 * Makes sure that the caller is where attributes are expected.
 * @param {string} functionName
 * @return {void}
 */
function assertInAttributes(functionName) {
    if (!inAttributes) {
        throw new Error(functionName + '() can only be called after calling ' +
            'elementOpenStart().');
    }
}
exports.assertInAttributes = assertInAttributes;
/**
 * Makes sure the patch closes virtual attributes call
 * @return {void}
 */
function assertVirtualAttributesClosed() {
    if (inAttributes) {
        throw new Error('elementOpenEnd() must be called after calling ' +
            'elementOpenStart().');
    }
}
exports.assertVirtualAttributesClosed = assertVirtualAttributesClosed;
/**
 * Makes sure that tags are correctly nested.
 * @param {tsickle_forward_declare_2.NameOrCtorDef} currentNameOrCtor
 * @param {tsickle_forward_declare_2.NameOrCtorDef} nameOrCtor
 * @return {void}
 */
function assertCloseMatchesOpenTag(currentNameOrCtor, nameOrCtor) {
    if (currentNameOrCtor !== nameOrCtor) {
        throw new Error('Received a call to close "' + nameOrCtor + '" but "' +
            currentNameOrCtor + '" was open.');
    }
}
exports.assertCloseMatchesOpenTag = assertCloseMatchesOpenTag;
/**
 * Makes sure that no children elements have been declared yet in the current
 * element.
 * @param {string} functionName
 * @param {(null|!Node)} previousNode
 * @return {void}
 */
function assertNoChildrenDeclaredYet(functionName, previousNode) {
    if (previousNode !== null) {
        throw new Error(functionName + '() must come before any child ' +
            'declarations inside the current element.');
    }
}
exports.assertNoChildrenDeclaredYet = assertNoChildrenDeclaredYet;
/**
 * Checks that a call to patchOuter actually patched the element.
 * @param {(null|!Node)} maybeStartNode The value for the currentNode when the patch
 *     started.
 * @param {(null|!Node)} maybeCurrentNode
 * @param {(null|!Node)} expectedNextNode The Node that is expected to follow the
 *    currentNode after the patch;
 * @param {(null|!Node)} expectedPrevNode The Node that is expected to preceed the
 *    currentNode after the patch.
 * @return {void}
 */
function assertPatchElementNoExtras(maybeStartNode, maybeCurrentNode, expectedNextNode, expectedPrevNode) {
    assert(maybeStartNode);
    /** @type {!Node} */
    var startNode = /** @type {!Node} */ ((maybeStartNode));
    /** @type {!Node} */
    var currentNode = /** @type {!Node} */ ((maybeCurrentNode));
    /** @type {boolean} */
    var wasUpdated = currentNode.nextSibling === expectedNextNode &&
        currentNode.previousSibling === expectedPrevNode;
    /** @type {boolean} */
    var wasChanged = currentNode.nextSibling === startNode.nextSibling &&
        currentNode.previousSibling === expectedPrevNode;
    /** @type {boolean} */
    var wasRemoved = currentNode === startNode;
    if (!wasUpdated && !wasChanged && !wasRemoved) {
        throw new Error('There must be exactly one top level call corresponding ' +
            'to the patched element.');
    }
}
exports.assertPatchElementNoExtras = assertPatchElementNoExtras;
/**
 * Updates the state of being in an attribute declaration.
 * @param {boolean} value
 * @return {boolean} the previous value.
 */
function setInAttributes(value) {
    /** @type {boolean} */
    var previous = inAttributes;
    inAttributes = value;
    return previous;
}
exports.setInAttributes = setInAttributes;
/**
 * Updates the state of being in a skip element.
 * @param {boolean} value
 * @return {boolean} the previous value.
 */
function setInSkip(value) {
    /** @type {boolean} */
    var previous = inSkip;
    inSkip = value;
    return previous;
}
exports.setInSkip = setInSkip;
/**
 * Asserts that a value exists and is not null or undefined. goog.asserts
 * is not used in order to avoid dependencies on external code.
 * @template T
 * @param {(undefined|null|T)} val
 * @return {T}
 */
function assert(val) {
    if (global_1.DEBUG && !val) {
        throw new Error('Expected value to be defined');
    }
    return /** @type {?} */ ((val));
}
exports.assert = assert;
//# sourceMappingURL=assertions.js.map