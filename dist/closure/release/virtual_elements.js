/**
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

const assertions = goog.require('incrementaldom.src.assertions');
const attributesModule = goog.require('incrementaldom.src.attributes');
const coreModule = goog.require('incrementaldom.src.core');
const diffModule = goog.require('incrementaldom.src.diff');
const globalModule = goog.require('incrementaldom.src.global');
const nodeDataModule = goog.require('incrementaldom.src.node_data');
const utilModule = goog.require('incrementaldom.src.util');


/**
 * The offset in the virtual element declaration where the attributes are
 * specified.
 */
const ATTRIBUTES_OFFSET = 3;
/**
 * Used to keep track of the previous values when a 2-way diff is necessary.
 * This object is reused.
 * TODO(sparhamI) Scope this to a patch so you can call patch from an attribute
 * update.
 */
const prevAttrsMap = utilModule.createMap();
/**
 * @param element The Element to diff the attrs for.
 * @param data The NodeData associated with the Element.
 */
function diffAttrs(element, data) {
    const attrsBuilder = coreModule.getAttrsBuilder();
    const prevAttrsArr = data.getAttrsArr(attrsBuilder.length);
    diffModule.calculateDiff(prevAttrsArr, attrsBuilder, element, attributesModule.updateAttribute);
    utilModule.truncateArray(attrsBuilder, 0);
}
/**
 * Applies the statics. When importing an Element, any existing attributes that
 * match a static are converted into a static attribute.
 * @param node The Element to apply statics for.
 * @param data The NodeData associated with the Element.
 * @param statics The statics array.
 */
function diffStatics(node, data, statics) {
    if (data.staticsApplied) {
        return;
    }
    data.staticsApplied = true;
    if (!statics || !statics.length) {
        return;
    }
    if (data.hasEmptyAttrsArr()) {
        for (let i = 0; i < statics.length; i += 2) {
            attributesModule.updateAttribute(node, statics[i], statics[i + 1]);
        }
        return;
    }
    for (let i = 0; i < statics.length; i += 2) {
        prevAttrsMap[statics[i]] = i + 1;
    }
    const attrsArr = data.getAttrsArr(0);
    let j = 0;
    for (let i = 0; i < attrsArr.length; i += 2) {
        const name = attrsArr[i];
        const value = attrsArr[i + 1];
        const staticsIndex = prevAttrsMap[name];
        if (staticsIndex) {
            // For any attrs that are static and have the same value, make sure we do
            // not set them again.
            if (statics[staticsIndex] === value) {
                delete prevAttrsMap[name];
            }
            continue;
        }
        // For any attrs that are dynamic, move them up to the right place.
        attrsArr[j] = name;
        attrsArr[j + 1] = value;
        j += 2;
    }
    // Anything after `j` was either moved up already or static.
    utilModule.truncateArray(attrsArr, j);
    for (const name in prevAttrsMap) {
        attributesModule.updateAttribute(node, name, statics[prevAttrsMap[name]]);
        delete prevAttrsMap[name];
    }
}
/**
 * Declares a virtual Element at the current location in the document. This
 * corresponds to an opening tag and a elementClose tag is required. This is
 * like elementOpen, but the attributes are defined using the attr function
 * rather than being passed as arguments. Must be folllowed by 0 or more calls
 * to attr, then a call to elementOpenEnd.
 * @param nameOrCtor The Element's tag or constructor.
 * @param key The key used to identify this element. This can be an
 *     empty string, but performance may be better if a unique value is used
 *     when iterating over an array of items.
 * @param statics An array of attribute name/value pairs of the static
 *     attributes for the Element. Attributes will only be set once when the
 *     Element is created.
 */
function elementOpenStart(nameOrCtor, key, statics) {
    const argsBuilder = coreModule.getArgsBuilder();
    if (globalModule.DEBUG) {
        assertions.assertNotInAttributes("elementOpenStart");
        assertions.setInAttributes(true);
    }
    argsBuilder[0] = nameOrCtor;
    argsBuilder[1] = key;
    argsBuilder[2] = statics;
}
/**
 * Allows you to define a key after an elementOpenStart. This is useful in
 * templates that define key after an element has been opened ie
 * `<div key('foo')></div>`.
 * @param key The key to use for the next call.
 */
function key(key) {
    const argsBuilder = coreModule.getArgsBuilder();
    if (globalModule.DEBUG) {
        assertions.assertInAttributes("key");
        assertions.assert(argsBuilder);
    }
    argsBuilder[1] = key;
}
/**
 * Buffers an attribute, which will get applied during the next call to
 * `elementOpen`, `elementOpenEnd` or `applyAttrs`.
 * @param name The of the attribute to buffer.
 * @param value The value of the attribute to buffer.
 */
function attr(name, value) {
    const attrsBuilder = coreModule.getAttrsBuilder();
    if (globalModule.DEBUG) {
        assertions.assertInPatch("attr");
    }
    attrsBuilder.push(name);
    attrsBuilder.push(value);
}
/**
 * Closes an open tag started with elementOpenStart.
 * @return The corresponding Element.
 */
function elementOpenEnd() {
    const argsBuilder = coreModule.getArgsBuilder();
    if (globalModule.DEBUG) {
        assertions.assertInAttributes("elementOpenEnd");
        assertions.setInAttributes(false);
    }
    const node = coreModule.open(argsBuilder[0], argsBuilder[1]);
    const data = nodeDataModule.getData(node);
    diffStatics(node, data, argsBuilder[2]);
    diffAttrs(node, data);
    utilModule.truncateArray(argsBuilder, 0);
    return node;
}
/**
 * @param  nameOrCtor The Element's tag or constructor.
 * @param  key The key used to identify this element. This can be an
 *     empty string, but performance may be better if a unique value is used
 *     when iterating over an array of items.
 * @param statics An array of attribute name/value pairs of the static
 *     attributes for the Element. Attributes will only be set once when the
 *     Element is created.
 * @param varArgs, Attribute name/value pairs of the dynamic attributes
 *     for the Element.
 * @return The corresponding Element.
 */
function elementOpen(nameOrCtor, key, 
// Ideally we could tag statics and varArgs as an array where every odd
// element is a string and every even element is any, but this is hard.
statics, ...varArgs) {
    if (globalModule.DEBUG) {
        assertions.assertNotInAttributes("elementOpen");
        assertions.assertNotInSkip("elementOpen");
    }
    elementOpenStart(nameOrCtor, key, statics);
    for (let i = ATTRIBUTES_OFFSET; i < arguments.length; i += 2) {
        attr(arguments[i], arguments[i + 1]);
    }
    return elementOpenEnd();
}
/**
 * Applies the currently buffered attrs to the currently open element. This
 * clears the buffered attributes.
 */
function applyAttrs() {
    const node = coreModule.currentElement();
    const data = nodeDataModule.getData(node);
    diffAttrs(node, data);
}
/**
 * Applies the current static attributes to the currently open element. Note:
 * statics should be applied before calling `applyAtrs`.
 * @param statics The statics to apply to the current element.
 */
function applyStatics(statics) {
    const node = coreModule.currentElement();
    const data = nodeDataModule.getData(node);
    diffStatics(node, data, statics);
}
/**
 * Closes an open virtual Element.
 *
 * @param nameOrCtor The Element's tag or constructor.
 * @return The corresponding Element.
 */
function elementClose(nameOrCtor) {
    if (globalModule.DEBUG) {
        assertions.assertNotInAttributes("elementClose");
    }
    const node = coreModule.close();
    if (globalModule.DEBUG) {
        assertions.assertCloseMatchesOpenTag(nodeDataModule.getData(node).nameOrCtor, nameOrCtor);
    }
    return node;
}
/**
 * Declares a virtual Element at the current location in the document that has
 * no children.
 * @param nameOrCtor The Element's tag or constructor.
 * @param key The key used to identify this element. This can be an
 *     empty string, but performance may be better if a unique value is used
 *     when iterating over an array of items.
 * @param statics An array of attribute name/value pairs of the static
 *     attributes for the Element. Attributes will only be set once when the
 *     Element is created.
 * @param varArgs Attribute name/value pairs of the dynamic attributes
 *     for the Element.
 * @return The corresponding Element.
 */
function elementVoid(nameOrCtor, key, 
// Ideally we could tag statics and varArgs as an array where every odd
// element is a string and every even element is any, but this is hard.
statics, ...varArgs) {
    elementOpen.apply(null, arguments);
    return elementClose(nameOrCtor);
}
/**
 * Declares a virtual Text at this point in the document.
 *
 * @param value The value of the Text.
 * @param varArgs
 *     Functions to format the value which are called only when the value has
 *     changed.
 * @return The corresponding text node.
 */
function text(value, ...varArgs) {
    if (globalModule.DEBUG) {
        assertions.assertNotInAttributes("text");
        assertions.assertNotInSkip("text");
    }
    const node = coreModule.text();
    const data = nodeDataModule.getData(node);
    if (data.text !== value) {
        data.text = value;
        let formatted = value;
        for (let i = 1; i < arguments.length; i += 1) {
            /*
             * Call the formatter function directly to prevent leaking arguments.
             * https://github.com/google/incremental-dom/pull/204#issuecomment-178223574
             */
            const fn = arguments[i];
            formatted = fn(formatted);
        }
        // Setting node.data resets the cursor in IE/Edge.
        if (node.data !== formatted) {
            node.data = formatted;
        }
    }
    return node;
}
/** */
