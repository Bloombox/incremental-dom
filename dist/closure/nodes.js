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
goog.module('incrementaldom.src.nodes');
var module = module || { id: 'src/nodes.ts' };
var node_data_1 = goog.require('incrementaldom.src.node_data');
var tsickle_forward_declare_1 = goog.forwardDeclare("incrementaldom.src.node_data");
var tsickle_forward_declare_2 = goog.forwardDeclare("incrementaldom.src.types");
goog.require("incrementaldom.src.types"); // force type-only module to be loaded
/**
 * Gets the namespace to create an element (of a given tag) in.
 * @param {string} tag
 * @param {(null|!Node)} parent
 * @return {(null|string)}
 */
function getNamespaceForTag(tag, parent) {
    if (tag === 'svg') {
        return 'http://www.w3.org/2000/svg';
    }
    if (tag === 'math') {
        return 'http://www.w3.org/1998/Math/MathML';
    }
    if (parent == null) {
        return null;
    }
    if (node_data_1.getData(parent).nameOrCtor === 'foreignObject') {
        return null;
    }
    return parent.namespaceURI;
}
/**
 * Creates an Element.
 * @param {!Document} doc The document with which to create the Element.
 * @param {(null|!Node)} parent
 * @param {tsickle_forward_declare_2.NameOrCtorDef} nameOrCtor The tag or constructor for the Element.
 * @param {tsickle_forward_declare_2.Key} key A key to identify the Element.
 * @return {!Element}
 */
function createElement(doc, parent, nameOrCtor, key) {
    /** @type {?} */
    var el;
    if (typeof nameOrCtor === 'function') {
        el = new nameOrCtor();
    }
    else {
        /** @type {(null|string)} */
        var namespace = getNamespaceForTag(nameOrCtor, parent);
        if (namespace) {
            el = doc.createElementNS(namespace, nameOrCtor);
        }
        else {
            el = doc.createElement(nameOrCtor);
        }
    }
    node_data_1.initData(el, nameOrCtor, key);
    return el;
}
exports.createElement = createElement;
/**
 * Creates a Text Node.
 * @param {!Document} doc The document with which to create the Element.
 * @return {!Text}
 */
function createText(doc) {
    /** @type {!Text} */
    var node = doc.createTextNode('');
    node_data_1.initData(node, '#text', null);
    return node;
}
exports.createText = createText;
//# sourceMappingURL=nodes.js.map