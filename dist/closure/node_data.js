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
goog.module('incrementaldom.src.node_data');
var module = module || { id: 'src/node_data.ts' };
var assertions_1 = goog.require('incrementaldom.src.assertions');
var tsickle_forward_declare_1 = goog.forwardDeclare("incrementaldom.src.assertions");
var dom_util_1 = goog.require('incrementaldom.src.dom_util');
var tsickle_forward_declare_2 = goog.forwardDeclare("incrementaldom.src.dom_util");
var global_1 = goog.require('incrementaldom.src.global');
var tsickle_forward_declare_3 = goog.forwardDeclare("incrementaldom.src.global");
var tsickle_forward_declare_4 = goog.forwardDeclare("incrementaldom.src.types");
goog.require("incrementaldom.src.types"); // force type-only module to be loaded
/**
 * Keeps track of information needed to perform diffs for a given DOM node.
 */
var /**
 * Keeps track of information needed to perform diffs for a given DOM node.
 */
NodeData = /** @class */ (function () {
    function NodeData(nameOrCtor, key, text) {
        /**
         * An array of attribute name/value pairs, used for quickly diffing the
         * incomming attributes to see if the DOM node's attributes need to be
         * updated.
         */
        this._attrsArr = null;
        /**
         * Whether or not the statics have been applied for the node yet.
         */
        this.staticsApplied = false;
        this.nameOrCtor = nameOrCtor;
        this.key = key;
        this.text = text;
    }
    /**
     * @return {boolean}
     */
    NodeData.prototype.hasEmptyAttrsArr = /**
     * @return {boolean}
     */
    function () {
        /** @type {(null|!Array<?>)} */
        var attrs = this._attrsArr;
        return !attrs || !attrs.length;
    };
    /**
     * @param {number} length
     * @return {!Array<?>}
     */
    NodeData.prototype.getAttrsArr = /**
     * @param {number} length
     * @return {!Array<?>}
     */
    function (length) {
        return this._attrsArr || (this._attrsArr = new Array(length));
    };
    return NodeData;
}());
exports.NodeData = NodeData;
if (false) {
    /**
     * An array of attribute name/value pairs, used for quickly diffing the
     * incomming attributes to see if the DOM node's attributes need to be
     * updated.
     * @type {(null|!Array<?>)}
     */
    NodeData.prototype._attrsArr;
    /**
     * Whether or not the statics have been applied for the node yet.
     * @type {boolean}
     */
    NodeData.prototype.staticsApplied;
    /**
     * The key used to identify this node, used to preserve DOM nodes when they
     * move within their parent.
     * @type {tsickle_forward_declare_4.Key}
     */
    NodeData.prototype.key;
    /** @type {(undefined|string)} */
    NodeData.prototype.text;
    /**
     * The nodeName or contructor for the Node.
     * @type {tsickle_forward_declare_4.NameOrCtorDef}
     */
    NodeData.prototype.nameOrCtor;
}
/**
 * Initializes a NodeData object for a Node.
 * @param {!Node} node
 * @param {tsickle_forward_declare_4.NameOrCtorDef} nameOrCtor
 * @param {tsickle_forward_declare_4.Key} key
 * @param {(undefined|string)=} text
 * @return {!NodeData}
 */
function initData(node, nameOrCtor, key, text) {
    /** @type {!NodeData} */
    var data = new NodeData(nameOrCtor, key, text);
    node['__incrementalDOMData'] = data;
    return data;
}
exports.initData = initData;
/**
 * Retrieves the NodeData object for a Node, creating it if necessary.
 * @param {!Node} node
 * @param {tsickle_forward_declare_4.Key=} key
 * @return {!NodeData}
 */
function getData(node, key) {
    return importSingleNode(node, key);
}
exports.getData = getData;
/**
 * @param {!Node} node
 * @return {boolean}
 */
function isDataInitialized(node) {
    return Boolean(node['__incrementalDOMData']);
}
exports.isDataInitialized = isDataInitialized;
/**
 * @param {!Node} node
 * @return {tsickle_forward_declare_4.Key}
 */
function getKey(node) {
    assertions_1.assert(node['__incrementalDOMData']);
    return getData(node).key;
}
exports.getKey = getKey;
/**
 * Imports single node and its subtree, initializing caches.
 * @param {!Node} node
 * @param {tsickle_forward_declare_4.Key=} fallbackKey
 * @return {!NodeData}
 */
function importSingleNode(node, fallbackKey) {
    if (node['__incrementalDOMData']) {
        return /** @type {!NodeData} */ ((node['__incrementalDOMData']));
    }
    /** @type {(null|string)} */
    var nodeName = dom_util_1.isElement(node) ? node.localName : node.nodeName;
    /** @type {(null|string)} */
    var keyAttrName = global_1.getKeyAttributeName();
    /** @type {(null|string)} */
    var keyAttr = dom_util_1.isElement(node) && keyAttrName != null ?
        node.getAttribute(keyAttrName) :
        null;
    /** @type {tsickle_forward_declare_4.Key} */
    var key = dom_util_1.isElement(node) ? keyAttr || fallbackKey : null;
    /** @type {!NodeData} */
    var data = initData(node, /** @type {string} */ ((nodeName)), key);
    if (dom_util_1.isElement(node)) {
        recordAttributes(node, data);
    }
    return data;
}
/**
 * Imports node and its subtree, initializing caches.
 * @param {!Node} node
 * @return {void}
 */
function importNode(node) {
    importSingleNode(node);
    for (var child = node.firstChild; child; child = child.nextSibling) {
        importNode(child);
    }
}
exports.importNode = importNode;
/**
 * Clears all caches from a node and all of its children.
 * @param {!Node} node
 * @return {void}
 */
function clearCache(node) {
    node['__incrementalDOMData'] = null;
    for (var child = node.firstChild; child; child = child.nextSibling) {
        clearCache(child);
    }
}
exports.clearCache = clearCache;
/**
 * Records the element's attributes.
 * @param {!Element} node The Element that may have attributes
 * @param {!NodeData} data The Element's data
 * @return {void}
 */
function recordAttributes(node, data) {
    /** @type {!NamedNodeMap} */
    var attributes = node.attributes;
    /** @type {number} */
    var length = attributes.length;
    if (!length) {
        return;
    }
    /** @type {!Array<?>} */
    var attrsArr = data.getAttrsArr(length);
    // Use a cached length. The attributes array is really a live NamedNodeMap,
    // which exists as a DOM "Host Object" (probably as C++ code). This makes the
    // usual constant length iteration very difficult to optimize in JITs.
    // Use a cached length. The attributes array is really a live NamedNodeMap,
    // which exists as a DOM "Host Object" (probably as C++ code). This makes the
    // usual constant length iteration very difficult to optimize in JITs.
    for (var i = 0, j = 0; i < length; i += 1, j += 2) {
        /** @type {!Attr} */
        var attr = attributes[i];
        /** @type {string} */
        var name_1 = attr.name;
        /** @type {string} */
        var value = attr.value;
        attrsArr[j] = name_1;
        attrsArr[j + 1] = value;
    }
}
//# sourceMappingURL=node_data.js.map