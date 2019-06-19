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
goog.module('incrementaldom.src.virtual_elements');
var module = module || { id: 'src/virtual_elements.ts' };
var assertions_1 = goog.require('incrementaldom.src.assertions');
var tsickle_forward_declare_1 = goog.forwardDeclare("incrementaldom.src.assertions");
var attributes_1 = goog.require('incrementaldom.src.attributes');
var tsickle_forward_declare_2 = goog.forwardDeclare("incrementaldom.src.attributes");
var core_1 = goog.require('incrementaldom.src.core');
var tsickle_forward_declare_3 = goog.forwardDeclare("incrementaldom.src.core");
var global_1 = goog.require('incrementaldom.src.global');
var tsickle_forward_declare_4 = goog.forwardDeclare("incrementaldom.src.global");
var node_data_1 = goog.require('incrementaldom.src.node_data');
var tsickle_forward_declare_5 = goog.forwardDeclare("incrementaldom.src.node_data");
var tsickle_forward_declare_6 = goog.forwardDeclare("incrementaldom.src.types");
goog.require("incrementaldom.src.types"); // force type-only module to be loaded
var util_1 = goog.require('incrementaldom.src.util');
var tsickle_forward_declare_7 = goog.forwardDeclare("incrementaldom.src.util");
/** *
 * The offset in the virtual element declaration where the attributes are
 * specified.
  @type {number} */
var ATTRIBUTES_OFFSET = 3;
/** *
 * Used to keep track of the previous values when a 2-way diff is necessary.
 * This object is reused.
 * TODO(sparhamI) Scope this to a patch so you can call patch from an attribute
 * update.
  @type {?} */
var prevAttrsMap = util_1.createMap();
/**
 * Applies the statics. When importing an Element, any existing attributes that
 * match a static are converted into a static attribute.
 * @param {!HTMLElement} node The Element to apply statics for.
 * @param {!tsickle_forward_declare_5.NodeData} data The Element's data
 * @param {tsickle_forward_declare_6.Statics} statics The statics array,
 * @return {void}
 */
function applyStatics(node, data, statics) {
    data.staticsApplied = true;
    if (!statics || !statics.length) {
        return;
    }
    if (data.hasEmptyAttrsArr()) {
        for (var i = 0; i < statics.length; i += 2) {
            attributes_1.updateAttribute(node, /** @type {string} */ (statics[i]), statics[i + 1]);
        }
        return;
    }
    for (var i = 0; i < statics.length; i += 2) {
        prevAttrsMap[/** @type {string} */ (statics[i])] = i + 1;
    }
    /** @type {!Array<?>} */
    var attrsArr = data.getAttrsArr(0);
    /** @type {number} */
    var j = 0;
    for (var i = 0; i < attrsArr.length; i += 2) {
        /** @type {?} */
        var name_1 = attrsArr[i];
        /** @type {?} */
        var value = attrsArr[i + 1];
        /** @type {?} */
        var staticsIndex = prevAttrsMap[name_1];
        if (staticsIndex) {
            // For any attrs that are static and have the same value, make sure we do
            // not set them again.
            // For any attrs that are static and have the same value, make sure we do
            // not set them again.
            if (statics[staticsIndex] === value) {
                delete prevAttrsMap[name_1];
            }
            continue;
        }
        // For any attrs that are dynamic, move them up to the right place.
        attrsArr[j] = name_1;
        attrsArr[j + 1] = value;
        j += 2;
    }
    // Anything after `j` was either moved up already or static.
    // Anything after `j` was either moved up already or static.
    util_1.truncateArray(attrsArr, j);
    for (var name_2 in prevAttrsMap) {
        attributes_1.updateAttribute(node, name_2, statics[prevAttrsMap[name_2]]);
        delete prevAttrsMap[name_2];
    }
}
/**
 * @param {tsickle_forward_declare_6.NameOrCtorDef} nameOrCtor The Element's tag or constructor.
 * @param {tsickle_forward_declare_6.Key=} key The key used to identify this element. This can be an
 *     empty string, but performance may be better if a unique value is used
 *     when iterating over an array of items.
 * @param {tsickle_forward_declare_6.Statics=} statics An array of attribute name/value pairs of the static
 *     attributes for the Element. Attributes will only be set once when the
 *     Element is created.
 * @param {...?} varArgs
 * @return {!HTMLElement} The corresponding Element.
 */
function elementOpen(nameOrCtor, key, 
// Ideally we could tag statics and varArgs as an array where every odd
// element is a string and every even element is any, but this is hard.
// tslint:disable-next-line:no-any
// Ideally we could tag statics and varArgs as an array where every odd
// element is a string and every even element is any, but this is hard.
// tslint:disable-next-line:no-any
statics) {
    var varArgs = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        varArgs[_i - 3] = arguments[_i];
    }
    if (global_1.DEBUG) {
        assertions_1.assertNotInAttributes('elementOpen');
        assertions_1.assertNotInSkip('elementOpen');
    }
    /** @type {!HTMLElement} */
    var node = core_1.open(nameOrCtor, key);
    /** @type {!tsickle_forward_declare_5.NodeData} */
    var data = node_data_1.getData(node);
    if (!data.staticsApplied) {
        applyStatics(node, data, statics);
    }
    /** @type {number} */
    var attrsLength = Math.max(0, arguments.length - ATTRIBUTES_OFFSET);
    /** @type {boolean} */
    var hadNoAttrs = data.hasEmptyAttrsArr();
    if (!attrsLength && hadNoAttrs) {
        return node;
    }
    /** @type {!Array<?>} */
    var attrsArr = data.getAttrsArr(attrsLength);
    /** @type {number} */
    var i = ATTRIBUTES_OFFSET;
    /** @type {number} */
    var j = 0;
    for (; i < arguments.length; i += 2, j += 2) {
        /** @type {?} */
        var name_3 = arguments[i];
        if (hadNoAttrs) {
            attrsArr[j] = name_3;
        }
        else if (attrsArr[j] !== name_3) {
            break;
        }
        /** @type {?} */
        var value = arguments[i + 1];
        if (hadNoAttrs || attrsArr[j + 1] !== value) {
            attrsArr[j + 1] = value;
            attributes_1.updateAttribute(node, name_3, value);
        }
    }
    /*
       * Items did not line up exactly as before, need to make sure old items are
       * removed. This can happen if using conditional logic when declaring
       * attrs through the elementOpenStart flow or if one element is reused in
       * the place of another.
       */
    /*
     * Items did not line up exactly as before, need to make sure old items are
     * removed. This can happen if using conditional logic when declaring
     * attrs through the elementOpenStart flow or if one element is reused in
     * the place of another.
     */
    if (i < arguments.length || j < attrsArr.length) {
        /** @type {number} */
        var attrsStart = j;
        for (; j < attrsArr.length; j += 2) {
            prevAttrsMap[attrsArr[j]] = attrsArr[j + 1];
        }
        for (j = attrsStart; i < arguments.length; i += 2, j += 2) {
            /** @type {?} */
            var name_4 = arguments[i];
            /** @type {?} */
            var value = arguments[i + 1];
            if (prevAttrsMap[name_4] !== value) {
                attributes_1.updateAttribute(node, name_4, value);
            }
            attrsArr[j] = name_4;
            attrsArr[j + 1] = value;
            delete prevAttrsMap[name_4];
        }
        util_1.truncateArray(attrsArr, j);
        /*
             * At this point, only have attributes that were present before, but have
             * been removed.
             */
        /*
         * At this point, only have attributes that were present before, but have
         * been removed.
         */
        for (var name_5 in prevAttrsMap) {
            attributes_1.updateAttribute(node, name_5, undefined);
            delete prevAttrsMap[name_5];
        }
    }
    return node;
}
exports.elementOpen = elementOpen;
/**
 * Declares a virtual Element at the current location in the document. This
 * corresponds to an opening tag and a elementClose tag is required. This is
 * like elementOpen, but the attributes are defined using the attr function
 * rather than being passed as arguments. Must be folllowed by 0 or more calls
 * to attr, then a call to elementOpenEnd.
 * @param {tsickle_forward_declare_6.NameOrCtorDef} nameOrCtor The Element's tag or constructor.
 * @param {tsickle_forward_declare_6.Key=} key The key used to identify this element. This can be an
 *     empty string, but performance may be better if a unique value is used
 *     when iterating over an array of items.
 * @param {tsickle_forward_declare_6.Statics=} statics An array of attribute name/value pairs of the static
 *     attributes for the Element. Attributes will only be set once when the
 *     Element is created.
 * @return {void}
 */
function elementOpenStart(nameOrCtor, key, statics) {
    /** @type {!Array<(undefined|null|!Object)>} */
    var argsBuilder = core_1.getArgsBuilder();
    if (global_1.DEBUG) {
        assertions_1.assertNotInAttributes('elementOpenStart');
        assertions_1.setInAttributes(true);
    }
    argsBuilder[0] = nameOrCtor;
    argsBuilder[1] = key;
    argsBuilder[2] = statics;
}
exports.elementOpenStart = elementOpenStart;
/**
 * Allows you to define a key after an elementOpenStart. This is useful in
 * templates that define key after an element has been opened ie
 * `<div key('foo')></div>`.
 * @param {string} key
 * @return {void}
 */
function key(key) {
    /** @type {!Array<(undefined|null|!Object)>} */
    var argsBuilder = core_1.getArgsBuilder();
    if (global_1.DEBUG) {
        assertions_1.assertInAttributes('key');
        assertions_1.assert(argsBuilder);
    }
    argsBuilder[1] = key;
}
exports.key = key;
/**
 *
 * Defines a virtual attribute at this point of the DOM. This is only valid
 * when called between elementOpenStart and elementOpenEnd.
 * @param {string} name
 * @param {?} value
 * @return {void}
 */
function attr(name, value) {
    /** @type {!Array<(undefined|null|!Object)>} */
    var argsBuilder = core_1.getArgsBuilder();
    if (global_1.DEBUG) {
        assertions_1.assertInAttributes('attr');
    }
    argsBuilder.push(name);
    argsBuilder.push(value);
}
exports.attr = attr;
/**
 * Closes an open tag started with elementOpenStart.
 * @return {!HTMLElement} The corresponding Element.
 */
function elementOpenEnd() {
    /** @type {!Array<(undefined|null|!Object)>} */
    var argsBuilder = core_1.getArgsBuilder();
    if (global_1.DEBUG) {
        assertions_1.assertInAttributes('elementOpenEnd');
        assertions_1.setInAttributes(false);
    }
    assertions_1.assert(argsBuilder);
    /** @type {?} */
    var node = elementOpen.apply(null, /** @type {!Array<(undefined|null|!Object)>} */ ((argsBuilder)));
    util_1.truncateArray(argsBuilder, 0);
    return node;
}
exports.elementOpenEnd = elementOpenEnd;
/**
 * Closes an open virtual Element.
 *
 * @param {tsickle_forward_declare_6.NameOrCtorDef} nameOrCtor The Element's tag or constructor.
 * @return {!Element} The corresponding Element.
 */
function elementClose(nameOrCtor) {
    if (global_1.DEBUG) {
        assertions_1.assertNotInAttributes('elementClose');
    }
    /** @type {!Element} */
    var node = core_1.close();
    if (global_1.DEBUG) {
        assertions_1.assertCloseMatchesOpenTag(node_data_1.getData(node).nameOrCtor, nameOrCtor);
    }
    return node;
}
exports.elementClose = elementClose;
/**
 * Declares a virtual Element at the current location in the document that has
 * no children.
 * @param {tsickle_forward_declare_6.NameOrCtorDef} nameOrCtor The Element's tag or constructor.
 * @param {tsickle_forward_declare_6.Key=} key The key used to identify this element. This can be an
 *     empty string, but performance may be better if a unique value is used
 *     when iterating over an array of items.
 * @param {tsickle_forward_declare_6.Statics=} statics An array of attribute name/value pairs of the static
 *     attributes for the Element. Attributes will only be set once when the
 *     Element is created.
 * @param {...?} varArgs Attribute name/value pairs of the dynamic attributes
 *     for the Element.
 * @return {!Element} The corresponding Element.
 */
function elementVoid(nameOrCtor, key, 
// Ideally we could tag statics and varArgs as an array where every odd
// element is a string and every even element is any, but this is hard.
// tslint:disable-next-line:no-any
// Ideally we could tag statics and varArgs as an array where every odd
// element is a string and every even element is any, but this is hard.
// tslint:disable-next-line:no-any
statics) {
    var varArgs = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        varArgs[_i - 3] = arguments[_i];
    }
    elementOpen.apply(null, arguments);
    return elementClose(nameOrCtor);
}
exports.elementVoid = elementVoid;
/**
 * Declares a virtual Text at this point in the document.
 *
 * @param {(string|number|boolean)} value The value of the Text.
 * @param {...function(!Object): string} varArgs
 *     Functions to format the value which are called only when the value has
 *     changed.
 * @return {!Text} The corresponding text node.
 */
function text(value) {
    var varArgs = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        varArgs[_i - 1] = arguments[_i];
    }
    if (global_1.DEBUG) {
        assertions_1.assertNotInAttributes('text');
        assertions_1.assertNotInSkip('text');
    }
    /** @type {!Text} */
    var node = core_1.text();
    /** @type {!tsickle_forward_declare_5.NodeData} */
    var data = node_data_1.getData(node);
    if (data.text !== value) {
        data.text = /** @type {string} */ ((value));
        /** @type {(string|number|boolean)} */
        var formatted = value;
        for (var i = 1; i < arguments.length; i += 1) {
            /** @type {?} */
            var fn = arguments[i];
            formatted = fn(formatted);
        }
        // Setting node.data resets the cursor in IE/Edge.
        // Setting node.data resets the cursor in IE/Edge.
        if (node.data !== formatted) {
            node.data = /** @type {string} */ (formatted);
        }
    }
    return node;
}
exports.text = text;
//# sourceMappingURL=virtual_elements.js.map