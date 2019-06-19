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
goog.module('incrementaldom.src.attributes');
var module = module || { id: 'src/attributes.ts' };
var tsickle_forward_declare_1 = goog.forwardDeclare("incrementaldom.src.types");
goog.require("incrementaldom.src.types"); // force type-only module to be loaded
var symbols_1 = goog.require('incrementaldom.src.symbols');
var tsickle_forward_declare_2 = goog.forwardDeclare("incrementaldom.src.symbols");
var util_1 = goog.require('incrementaldom.src.util');
var tsickle_forward_declare_3 = goog.forwardDeclare("incrementaldom.src.util");
/**
 * Returns the namespace to use for the attribute.
 * @param {string} name
 * @return {(undefined|string)}
 */
function getNamespace(name) {
    if (name.lastIndexOf('xml:', 0) === 0) {
        return 'http://www.w3.org/XML/1998/namespace';
    }
    if (name.lastIndexOf('xlink:', 0) === 0) {
        return 'http://www.w3.org/1999/xlink';
    }
    return undefined;
}
/**
 * Applies an attribute or property to a given Element. If the value is null
 * or undefined, it is removed from the Element. Otherwise, the value is set
 * as an attribute.
 * @param {!Element} el
 * @param {string} name
 * @param {?} value
 * @return {void}
 */
function applyAttr(el, name, value) {
    if (value == null) {
        el.removeAttribute(name);
    }
    else {
        /** @type {(undefined|string)} */
        var attrNS = getNamespace(name);
        if (attrNS) {
            el.setAttributeNS(attrNS, name, String(value));
        }
        else {
            el.setAttribute(name, String(value));
        }
    }
}
exports.applyAttr = applyAttr;
/**
 * Applies a property to a given Element.
 * @param {!Element} el
 * @param {string} name
 * @param {?} value
 * @return {void}
 */
function applyProp(el, name, value) {
    // tslint:disable-next-line:no-any
    // tslint:disable-next-line:no-any
    (/** @type {?} */ (el))[name] = value;
}
exports.applyProp = applyProp;
/**
 * Applies a value to a style declaration. Supports CSS custom properties by
 * setting properties containing a dash using CSSStyleDeclaration.setProperty.
 * @param {!CSSStyleDeclaration} style
 * @param {string} prop
 * @param {string} value
 * @return {void}
 */
function setStyleValue(style, prop, value) {
    if (prop.indexOf('-') >= 0) {
        style.setProperty(prop, value);
    }
    else {
        // TODO(tomnguyen) Figure out why this is necessary.
        // tslint:disable-next-line:no-any
        // TODO(tomnguyen) Figure out why this is necessary.
        // tslint:disable-next-line:no-any
        (/** @type {?} */ (style))[prop] = value;
    }
}
/**
 * Applies a style to an Element. No vendor prefix expansion is done for
 * property names/values.
 * @param {!HTMLElement} el
 * @param {string} name The attribute's name.
 * @param {(string|!Object<string,string>)} style The style to set. Either a string of css or an object
 *     containing property-value pairs.
 * @return {void}
 */
function applyStyle(el, name, style) {
    if (typeof style === 'string') {
        el.style.cssText = style;
    }
    else {
        el.style.cssText = '';
        /** @type {!CSSStyleDeclaration} */
        var elStyle = el.style;
        for (var prop in style) {
            if (util_1.has(style, prop)) {
                setStyleValue(elStyle, prop, style[prop]);
            }
        }
    }
}
/**
 * Updates a single attribute on an Element.
 * @param {!HTMLElement} el
 * @param {string} name The attribute's name.
 * @param {!Object} value The attribute's value. If the value is an object or
 *     function it is set on the Element, otherwise, it is set as an HTML
 *     attribute.
 * @return {void}
 */
function applyAttributeTyped(el, name, value) {
    /** @type {string} */
    var type = typeof value;
    if (type === 'object' || type === 'function') {
        applyProp(el, name, value);
    }
    else {
        applyAttr(el, name, value);
    }
}
/** *
 * A publicly mutable object to provide custom mutators for attributes.
 * NB: The result of createMap() has to be recast since closure compiler
 * will just assume attributes is "any" otherwise and throws away
 * the type annotation set by tsickle.
  @type {tsickle_forward_declare_1.AttrMutatorConfig} */
var attributes = (/** @type {tsickle_forward_declare_1.AttrMutatorConfig} */ (util_1.createMap()));
exports.attributes = attributes;
// Special generic mutator that's called for any attribute that does not
// have a specific mutator.
attributes[symbols_1.symbols.default] = applyAttributeTyped;
attributes['style'] = applyStyle;
/**
 * Calls the appropriate attribute mutator for this attribute.
 * @param {!HTMLElement} el
 * @param {string} name
 * @param {(undefined|null|!Object)} value
 * @return {void}
 */
function updateAttribute(el, name, value) {
    /** @type {tsickle_forward_declare_1.AttrMutator} */
    var mutator = attributes[name] || attributes[symbols_1.symbols.default];
    mutator(el, name, value);
}
exports.updateAttribute = updateAttribute;
//# sourceMappingURL=attributes.js.map