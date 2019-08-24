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
import { assert, assertCloseMatchesOpenTag, assertInAttributes, assertInPatch, assertNotInAttributes, assertNotInSkip, setInAttributes } from "./assertions";
import { updateAttribute } from "./attributes";
import { getArgsBuilder, getAttrsBuilder, close, open, text as coreText, currentElement } from "./core";
import { DEBUG } from "./global";
import { getData } from "./node_data";
import { createMap, truncateArray } from "./util";
import { calculateDiff } from "./diff";
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
const prevAttrsMap = createMap();
/**
 * @param element The Element to diff the attrs for.
 * @param data The NodeData associated with the Element.
 */
function diffAttrs(element, data) {
    const attrsBuilder = getAttrsBuilder();
    const prevAttrsArr = data.getAttrsArr(attrsBuilder.length);
    calculateDiff(prevAttrsArr, attrsBuilder, element, updateAttribute);
    truncateArray(attrsBuilder, 0);
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
            updateAttribute(node, statics[i], statics[i + 1]);
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
    truncateArray(attrsArr, j);
    for (const name in prevAttrsMap) {
        updateAttribute(node, name, statics[prevAttrsMap[name]]);
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
    const argsBuilder = getArgsBuilder();
    if (DEBUG) {
        assertNotInAttributes("elementOpenStart");
        setInAttributes(true);
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
    const argsBuilder = getArgsBuilder();
    if (DEBUG) {
        assertInAttributes("key");
        assert(argsBuilder);
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
    const attrsBuilder = getAttrsBuilder();
    if (DEBUG) {
        assertInPatch("attr");
    }
    attrsBuilder.push(name);
    attrsBuilder.push(value);
}
/**
 * Closes an open tag started with elementOpenStart.
 * @return The corresponding Element.
 */
function elementOpenEnd() {
    const argsBuilder = getArgsBuilder();
    if (DEBUG) {
        assertInAttributes("elementOpenEnd");
        setInAttributes(false);
    }
    const node = open(argsBuilder[0], argsBuilder[1]);
    const data = getData(node);
    diffStatics(node, data, argsBuilder[2]);
    diffAttrs(node, data);
    truncateArray(argsBuilder, 0);
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
    if (DEBUG) {
        assertNotInAttributes("elementOpen");
        assertNotInSkip("elementOpen");
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
    const node = currentElement();
    const data = getData(node);
    diffAttrs(node, data);
}
/**
 * Applies the current static attributes to the currently open element. Note:
 * statics should be applied before calling `applyAtrs`.
 * @param statics The statics to apply to the current element.
 */
function applyStatics(statics) {
    const node = currentElement();
    const data = getData(node);
    diffStatics(node, data, statics);
}
/**
 * Closes an open virtual Element.
 *
 * @param nameOrCtor The Element's tag or constructor.
 * @return The corresponding Element.
 */
function elementClose(nameOrCtor) {
    if (DEBUG) {
        assertNotInAttributes("elementClose");
    }
    const node = close();
    if (DEBUG) {
        assertCloseMatchesOpenTag(getData(node).nameOrCtor, nameOrCtor);
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
    if (DEBUG) {
        assertNotInAttributes("text");
        assertNotInSkip("text");
    }
    const node = coreText();
    const data = getData(node);
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
export { applyAttrs, applyStatics, elementOpenStart, elementOpenEnd, elementOpen, elementVoid, elementClose, text, attr, key };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbF9lbGVtZW50cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy92aXJ0dWFsX2VsZW1lbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7OztHQWNHO0FBRUgsT0FBTyxFQUNMLE1BQU0sRUFDTix5QkFBeUIsRUFDekIsa0JBQWtCLEVBQ2xCLGFBQWEsRUFDYixxQkFBcUIsRUFDckIsZUFBZSxFQUNmLGVBQWUsRUFDaEIsTUFBTSxjQUFjLENBQUM7QUFDdEIsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUMvQyxPQUFPLEVBQ0wsY0FBYyxFQUNkLGVBQWUsRUFDZixLQUFLLEVBQ0wsSUFBSSxFQUNKLElBQUksSUFBSSxRQUFRLEVBQ2hCLGNBQWMsRUFDZixNQUFNLFFBQVEsQ0FBQztBQUNoQixPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ2pDLE9BQU8sRUFBRSxPQUFPLEVBQVksTUFBTSxhQUFhLENBQUM7QUFFaEQsT0FBTyxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFDbEQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLFFBQVEsQ0FBQztBQUV2Qzs7O0dBR0c7QUFDSCxNQUFNLGlCQUFpQixHQUFHLENBQUMsQ0FBQztBQUU1Qjs7Ozs7R0FLRztBQUNILE1BQU0sWUFBWSxHQUFHLFNBQVMsRUFBRSxDQUFDO0FBRWpDOzs7R0FHRztBQUNILFNBQVMsU0FBUyxDQUFDLE9BQWdCLEVBQUUsSUFBYztJQUNqRCxNQUFNLFlBQVksR0FBRyxlQUFlLEVBQUUsQ0FBQztJQUN2QyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUUzRCxhQUFhLENBQUMsWUFBWSxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsZUFBZSxDQUFDLENBQUM7SUFDcEUsYUFBYSxD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QUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUMzQjtRQUVELGtEQUFrRDtRQUNsRCxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO1lBQzNCLElBQUksQ0FBQyxJQUFJLEdBQUcsU0FBbUIsQ0FBQztTQUNqQztLQUNGO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBRUQsTUFBTTtBQUNOLE9BQU8sRUFDTCxVQUFVLEVBQ1YsWUFBWSxFQUNaLGdCQUFnQixFQUNoQixjQUFjLEVBQ2QsV0FBVyxFQUNYLFdBQVcsRUFDWCxZQUFZLEVBQ1osSUFBSSxFQUNKLElBQUksRUFDSixHQUFHLEVBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTggVGhlIEluY3JlbWVudGFsIERPTSBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtcbiAgYXNzZXJ0LFxuICBhc3NlcnRDbG9zZU1hdGNoZXNPcGVuVGFnLFxuICBhc3NlcnRJbkF0dHJpYnV0ZXMsXG4gIGFzc2VydEluUGF0Y2gsXG4gIGFzc2VydE5vdEluQXR0cmlidXRlcyxcbiAgYXNzZXJ0Tm90SW5Ta2lwLFxuICBzZXRJbkF0dHJpYnV0ZXNcbn0gZnJvbSBcIi4vYXNzZXJ0aW9uc1wiO1xuaW1wb3J0IHsgdXBkYXRlQXR0cmlidXRlIH0gZnJvbSBcIi4vYXR0cmlidXRlc1wiO1xuaW1wb3J0IHtcbiAgZ2V0QXJnc0J1aWxkZXIsXG4gIGdldEF0dHJzQnVpbGRlcixcbiAgY2xvc2UsXG4gIG9wZW4sXG4gIHRleHQgYXMgY29yZVRleHQsXG4gIGN1cnJlbnRFbGVtZW50XG59IGZyb20gXCIuL2NvcmVcIjtcbmltcG9ydCB7IERFQlVHIH0gZnJvbSBcIi4vZ2xvYmFsXCI7XG5pbXBvcnQgeyBnZXREYXRhLCBOb2RlRGF0YSB9IGZyb20gXCIuL25vZGVfZGF0YVwiO1xuaW1wb3J0IHsgS2V5LCBOYW1lT3JDdG9yRGVmLCBTdGF0aWNzIH0gZnJvbSBcIi4vdHlwZXNcIjtcbmltcG9ydCB7IGNyZWF0ZU1hcCwgdHJ1bmNhdGVBcnJheSB9IGZyb20gXCIuL3V0aWxcIjtcbmltcG9ydCB7IGNhbGN1bGF0ZURpZmYgfSBmcm9tIFwiLi9kaWZmXCI7XG5cbi8qKlxuICogVGhlIG9mZnNldCBpbiB0aGUgdmlydHVhbCBlbGVtZW50IGRlY2xhcmF0aW9uIHdoZXJlIHRoZSBhdHRyaWJ1dGVzIGFyZVxuICogc3BlY2lmaWVkLlxuICovXG5jb25zdCBBVFRSSUJVVEVTX09GRlNFVCA9IDM7XG5cbi8qKlxuICogVXNlZCB0byBrZWVwIHRyYWNrIG9mIHRoZSBwcmV2aW91cyB2YWx1ZXMgd2hlbiBhIDItd2F5IGRpZmYgaXMgbmVjZXNzYXJ5LlxuICogVGhpcyBvYmplY3QgaXMgcmV1c2VkLlxuICogVE9ETyhzcGFyaGFtSSkgU2NvcGUgdGhpcyB0byBhIHBhdGNoIHNvIHlvdSBjYW4gY2FsbCBwYXRjaCBmcm9tIGFuIGF0dHJpYnV0ZVxuICogdXBkYXRlLlxuICovXG5jb25zdCBwcmV2QXR0cnNNYXAgPSBjcmVhdGVNYXAoKTtcblxuLyoqXG4gKiBAcGFyYW0gZWxlbWVudCBUaGUgRWxlbWVudCB0byBkaWZmIHRoZSBhdHRycyBmb3IuXG4gKiBAcGFyYW0gZGF0YSBUaGUgTm9kZURhdGEgYXNzb2NpYXRlZCB3aXRoIHRoZSBFbGVtZW50LlxuICovXG5mdW5jdGlvbiBkaWZmQXR0cnMoZWxlbWVudDogRWxlbWVudCwgZGF0YTogTm9kZURhdGEpIHtcbiAgY29uc3QgYXR0cnNCdWlsZGVyID0gZ2V0QXR0cnNCdWlsZGVyKCk7XG4gIGNvbnN0IHByZXZBdHRyc0FyciA9IGRhdGEuZ2V0QXR0cnNBcnIoYXR0cnNCdWlsZGVyLmxlbmd0aCk7XG5cbiAgY2FsY3VsYXRlRGlmZihwcmV2QXR0cnNBcnIsIGF0dHJzQnVpbGRlciwgZWxlbWVudCwgdXBkYXRlQXR0cmlidXRlKTtcbiAgdHJ1bmNhdGVBcnJheShhdHRyc0J1aWxkZXIsIDApO1xufVxuXG4vKipcbiAqIEFwcGxpZXMgdGhlIHN0YXRpY3MuIFdoZW4gaW1wb3J0aW5nIGFuIEVsZW1lbnQsIGFueSBleGlzdGluZyBhdHRyaWJ1dGVzIHRoYXRcbiAqIG1hdGNoIGEgc3RhdGljIGFyZSBjb252ZXJ0ZWQgaW50byBhIHN0YXRpYyBhdHRyaWJ1dGUuXG4gKiBAcGFyYW0gbm9kZSBUaGUgRWxlbWVudCB0byBhcHBseSBzdGF0aWNzIGZvci5cbiAqIEBwYXJhbSBkYXRhIFRoZSBOb2RlRGF0YSBhc3NvY2lhdGVkIHdpdGggdGhlIEVsZW1lbnQuXG4gKiBAcGFyYW0gc3RhdGljcyBUaGUgc3RhdGljcyBhcnJheS5cbiAqL1xuZnVuY3Rpb24gZGlmZlN0YXRpY3Mobm9kZTogRWxlbWVudCwgZGF0YTogTm9kZURhdGEsIHN0YXRpY3M6IFN0YXRpY3MpIHtcbiAgaWYgKGRhdGEuc3RhdGljc0FwcGxpZWQpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBkYXRhLnN0YXRpY3NBcHBsaWVkID0gdHJ1ZTtcblxuICBpZiAoIXN0YXRpY3MgfHwgIXN0YXRpY3MubGVuZ3RoKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKGRhdGEuaGFzRW1wdHlBdHRyc0FycigpKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdGF0aWNzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICB1cGRhdGVBdHRyaWJ1dGUobm9kZSwgc3RhdGljc1tpXSBhcyBzdHJpbmcsIHN0YXRpY3NbaSArIDFdKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdGF0aWNzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgcHJldkF0dHJzTWFwW3N0YXRpY3NbaV0gYXMgc3RyaW5nXSA9IGkgKyAxO1xuICB9XG5cbiAgY29uc3QgYXR0cnNBcnIgPSBkYXRhLmdldEF0dHJzQXJyKDApO1xuICBsZXQgaiA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYXR0cnNBcnIubGVuZ3RoOyBpICs9IDIpIHtcbiAgICBjb25zdCBuYW1lID0gYXR0cnNBcnJbaV07XG4gICAgY29uc3QgdmFsdWUgPSBhdHRyc0FycltpICsgMV07XG4gICAgY29uc3Qgc3RhdGljc0luZGV4ID0gcHJldkF0dHJzTWFwW25hbWVdO1xuXG4gICAgaWYgKHN0YXRpY3NJbmRleCkge1xuICAgICAgLy8gRm9yIGFueSBhdHRycyB0aGF0IGFyZSBzdGF0aWMgYW5kIGhhdmUgdGhlIHNhbWUgdmFsdWUsIG1ha2Ugc3VyZSB3ZSBkb1xuICAgICAgLy8gbm90IHNldCB0aGVtIGFnYWluLlxuICAgICAgaWYgKHN0YXRpY3Nbc3RhdGljc0luZGV4XSA9PT0gdmFsdWUpIHtcbiAgICAgICAgZGVsZXRlIHByZXZBdHRyc01hcFtuYW1lXTtcbiAgICAgIH1cblxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gRm9yIGFueSBhdHRycyB0aGF0IGFyZSBkeW5hbWljLCBtb3ZlIHRoZW0gdXAgdG8gdGhlIHJpZ2h0IHBsYWNlLlxuICAgIGF0dHJzQXJyW2pdID0gbmFtZTtcbiAgICBhdHRyc0FycltqICsgMV0gPSB2YWx1ZTtcbiAgICBqICs9IDI7XG4gIH1cbiAgLy8gQW55dGhpbmcgYWZ0ZXIgYGpgIHdhcyBlaXRoZXIgbW92ZWQgdXAgYWxyZWFkeSBvciBzdGF0aWMuXG4gIHRydW5jYXRlQXJyYXkoYXR0cnNBcnIsIGopO1xuXG4gIGZvciAoY29uc3QgbmFtZSBpbiBwcmV2QXR0cnNNYXApIHtcbiAgICB1cGRhdGVBdHRyaWJ1dGUobm9kZSwgbmFtZSwgc3RhdGljc1twcmV2QXR0cnNNYXBbbmFtZV1dKTtcbiAgICBkZWxldGUgcHJldkF0dHJzTWFwW25hbWVdO1xuICB9XG59XG5cbi8qKlxuICogRGVjbGFyZXMgYSB2aXJ0dWFsIEVsZW1lbnQgYXQgdGhlIGN1cnJlbnQgbG9jYXRpb24gaW4gdGhlIGRvY3VtZW50LiBUaGlzXG4gKiBjb3JyZXNwb25kcyB0byBhbiBvcGVuaW5nIHRhZyBhbmQgYSBlbGVtZW50Q2xvc2UgdGFnIGlzIHJlcXVpcmVkLiBUaGlzIGlzXG4gKiBsaWtlIGVsZW1lbnRPcGVuLCBidXQgdGhlIGF0dHJpYnV0ZXMgYXJlIGRlZmluZWQgdXNpbmcgdGhlIGF0dHIgZnVuY3Rpb25cbiAqIHJhdGhlciB0aGFuIGJlaW5nIHBhc3NlZCBhcyBhcmd1bWVudHMuIE11c3QgYmUgZm9sbGxvd2VkIGJ5IDAgb3IgbW9yZSBjYWxsc1xuICogdG8gYXR0ciwgdGhlbiBhIGNhbGwgdG8gZWxlbWVudE9wZW5FbmQuXG4gKiBAcGFyYW0gbmFtZU9yQ3RvciBUaGUgRWxlbWVudCdzIHRhZyBvciBjb25zdHJ1Y3Rvci5cbiAqIEBwYXJhbSBrZXkgVGhlIGtleSB1c2VkIHRvIGlkZW50aWZ5IHRoaXMgZWxlbWVudC4gVGhpcyBjYW4gYmUgYW5cbiAqICAgICBlbXB0eSBzdHJpbmcsIGJ1dCBwZXJmb3JtYW5jZSBtYXkgYmUgYmV0dGVyIGlmIGEgdW5pcXVlIHZhbHVlIGlzIHVzZWRcbiAqICAgICB3aGVuIGl0ZXJhdGluZyBvdmVyIGFuIGFycmF5IG9mIGl0ZW1zLlxuICogQHBhcmFtIHN0YXRpY3MgQW4gYXJyYXkgb2YgYXR0cmlidXRlIG5hbWUvdmFsdWUgcGFpcnMgb2YgdGhlIHN0YXRpY1xuICogICAgIGF0dHJpYnV0ZXMgZm9yIHRoZSBFbGVtZW50LiBBdHRyaWJ1dGVzIHdpbGwgb25seSBiZSBzZXQgb25jZSB3aGVuIHRoZVxuICogICAgIEVsZW1lbnQgaXMgY3JlYXRlZC5cbiAqL1xuZnVuY3Rpb24gZWxlbWVudE9wZW5TdGFydChcbiAgbmFtZU9yQ3RvcjogTmFtZU9yQ3RvckRlZixcbiAga2V5PzogS2V5LFxuICBzdGF0aWNzPzogU3RhdGljc1xuKSB7XG4gIGNvbnN0IGFyZ3NCdWlsZGVyID0gZ2V0QXJnc0J1aWxkZXIoKTtcblxuICBpZiAoREVCVUcpIHtcbiAgICBhc3NlcnROb3RJbkF0dHJpYnV0ZXMoXCJlbGVtZW50T3BlblN0YXJ0XCIpO1xuICAgIHNldEluQXR0cmlidXRlcyh0cnVlKTtcbiAgfVxuXG4gIGFyZ3NCdWlsZGVyWzBdID0gbmFtZU9yQ3RvcjtcbiAgYXJnc0J1aWxkZXJbMV0gPSBrZXk7XG4gIGFyZ3NCdWlsZGVyWzJdID0gc3RhdGljcztcbn1cblxuLyoqXG4gKiBBbGxvd3MgeW91IHRvIGRlZmluZSBhIGtleSBhZnRlciBhbiBlbGVtZW50T3BlblN0YXJ0LiBUaGlzIGlzIHVzZWZ1bCBpblxuICogdGVtcGxhdGVzIHRoYXQgZGVmaW5lIGtleSBhZnRlciBhbiBlbGVtZW50IGhhcyBiZWVuIG9wZW5lZCBpZVxuICogYDxkaXYga2V5KCdmb28nKT48L2Rpdj5gLlxuICogQHBhcmFtIGtleSBUaGUga2V5IHRvIHVzZSBmb3IgdGhlIG5leHQgY2FsbC5cbiAqL1xuZnVuY3Rpb24ga2V5KGtleTogc3RyaW5nKSB7XG4gIGNvbnN0IGFyZ3NCdWlsZGVyID0gZ2V0QXJnc0J1aWxkZXIoKTtcblxuICBpZiAoREVCVUcpIHtcbiAgICBhc3NlcnRJbkF0dHJpYnV0ZXMoXCJrZXlcIik7XG4gICAgYXNzZXJ0KGFyZ3NCdWlsZGVyKTtcbiAgfVxuICBhcmdzQnVpbGRlclsxXSA9IGtleTtcbn1cblxuLyoqXG4gKiBCdWZmZXJzIGFuIGF0dHJpYnV0ZSwgd2hpY2ggd2lsbCBnZXQgYXBwbGllZCBkdXJpbmcgdGhlIG5leHQgY2FsbCB0b1xuICogYGVsZW1lbnRPcGVuYCwgYGVsZW1lbnRPcGVuRW5kYCBvciBgYXBwbHlBdHRyc2AuXG4gKiBAcGFyYW0gbmFtZSBUaGUgb2YgdGhlIGF0dHJpYnV0ZSB0byBidWZmZXIuXG4gKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIG9mIHRoZSBhdHRyaWJ1dGUgdG8gYnVmZmVyLlxuICovXG5mdW5jdGlvbiBhdHRyKG5hbWU6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICBjb25zdCBhdHRyc0J1aWxkZXIgPSBnZXRBdHRyc0J1aWxkZXIoKTtcblxuICBpZiAoREVCVUcpIHtcbiAgICBhc3NlcnRJblBhdGNoKFwiYXR0clwiKTtcbiAgfVxuXG4gIGF0dHJzQnVpbGRlci5wdXNoKG5hbWUpO1xuICBhdHRyc0J1aWxkZXIucHVzaCh2YWx1ZSk7XG59XG5cbi8qKlxuICogQ2xvc2VzIGFuIG9wZW4gdGFnIHN0YXJ0ZWQgd2l0aCBlbGVtZW50T3BlblN0YXJ0LlxuICogQHJldHVybiBUaGUgY29ycmVzcG9uZGluZyBFbGVtZW50LlxuICovXG5mdW5jdGlvbiBlbGVtZW50T3BlbkVuZCgpOiBIVE1MRWxlbWVudCB7XG4gIGNvbnN0IGFyZ3NCdWlsZGVyID0gZ2V0QXJnc0J1aWxkZXIoKTtcblxuICBpZiAoREVCVUcpIHtcbiAgICBhc3NlcnRJbkF0dHJpYnV0ZXMoXCJlbGVtZW50T3BlbkVuZFwiKTtcbiAgICBzZXRJbkF0dHJpYnV0ZXMoZmFsc2UpO1xuICB9XG5cbiAgY29uc3Qgbm9kZSA9IG9wZW4oPE5hbWVPckN0b3JEZWY+YXJnc0J1aWxkZXJbMF0sIDxLZXk+YXJnc0J1aWxkZXJbMV0pO1xuICBjb25zdCBkYXRhID0gZ2V0RGF0YShub2RlKTtcblxuICBkaWZmU3RhdGljcyhub2RlLCBkYXRhLCA8U3RhdGljcz5hcmdzQnVpbGRlclsyXSk7XG4gIGRpZmZBdHRycyhub2RlLCBkYXRhKTtcbiAgdHJ1bmNhdGVBcnJheShhcmdzQnVpbGRlciwgMCk7XG5cbiAgcmV0dXJuIG5vZGU7XG59XG5cbi8qKlxuICogQHBhcmFtICBuYW1lT3JDdG9yIFRoZSBFbGVtZW50J3MgdGFnIG9yIGNvbnN0cnVjdG9yLlxuICogQHBhcmFtICBrZXkgVGhlIGtleSB1c2VkIHRvIGlkZW50aWZ5IHRoaXMgZWxlbWVudC4gVGhpcyBjYW4gYmUgYW5cbiAqICAgICBlbXB0eSBzdHJpbmcsIGJ1dCBwZXJmb3JtYW5jZSBtYXkgYmUgYmV0dGVyIGlmIGEgdW5pcXVlIHZhbHVlIGlzIHVzZWRcbiAqICAgICB3aGVuIGl0ZXJhdGluZyBvdmVyIGFuIGFycmF5IG9mIGl0ZW1zLlxuICogQHBhcmFtIHN0YXRpY3MgQW4gYXJyYXkgb2YgYXR0cmlidXRlIG5hbWUvdmFsdWUgcGFpcnMgb2YgdGhlIHN0YXRpY1xuICogICAgIGF0dHJpYnV0ZXMgZm9yIHRoZSBFbGVtZW50LiBBdHRyaWJ1dGVzIHdpbGwgb25seSBiZSBzZXQgb25jZSB3aGVuIHRoZVxuICogICAgIEVsZW1lbnQgaXMgY3JlYXRlZC5cbiAqIEBwYXJhbSB2YXJBcmdzLCBBdHRyaWJ1dGUgbmFtZS92YWx1ZSBwYWlycyBvZiB0aGUgZHluYW1pYyBhdHRyaWJ1dGVzXG4gKiAgICAgZm9yIHRoZSBFbGVtZW50LlxuICogQHJldHVybiBUaGUgY29ycmVzcG9uZGluZyBFbGVtZW50LlxuICovXG5mdW5jdGlvbiBlbGVtZW50T3BlbihcbiAgbmFtZU9yQ3RvcjogTmFtZU9yQ3RvckRlZixcbiAga2V5PzogS2V5LFxuICAvLyBJZGVhbGx5IHdlIGNvdWxkIHRhZyBzdGF0aWNzIGFuZCB2YXJBcmdzIGFzIGFuIGFycmF5IHdoZXJlIGV2ZXJ5IG9kZFxuICAvLyBlbGVtZW50IGlzIGEgc3RyaW5nIGFuZCBldmVyeSBldmVuIGVsZW1lbnQgaXMgYW55LCBidXQgdGhpcyBpcyBoYXJkLlxuICBzdGF0aWNzPzogU3RhdGljcyxcbiAgLi4udmFyQXJnczogQXJyYXk8YW55PlxuKSB7XG4gIGlmIChERUJVRykge1xuICAgIGFzc2VydE5vdEluQXR0cmlidXRlcyhcImVsZW1lbnRPcGVuXCIpO1xuICAgIGFzc2VydE5vdEluU2tpcChcImVsZW1lbnRPcGVuXCIpO1xuICB9XG5cbiAgZWxlbWVudE9wZW5TdGFydChuYW1lT3JDdG9yLCBrZXksIHN0YXRpY3MpO1xuXG4gIGZvciAobGV0IGkgPSBBVFRSSUJVVEVTX09GRlNFVDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkgKz0gMikge1xuICAgIGF0dHIoYXJndW1lbnRzW2ldLCBhcmd1bWVudHNbaSArIDFdKTtcbiAgfVxuXG4gIHJldHVybiBlbGVtZW50T3BlbkVuZCgpO1xufVxuXG4vKipcbiAqIEFwcGxpZXMgdGhlIGN1cnJlbnRseSBidWZmZXJlZCBhdHRycyB0byB0aGUgY3VycmVudGx5IG9wZW4gZWxlbWVudC4gVGhpc1xuICogY2xlYXJzIHRoZSBidWZmZXJlZCBhdHRyaWJ1dGVzLlxuICovXG5mdW5jdGlvbiBhcHBseUF0dHJzKCkge1xuICBjb25zdCBub2RlID0gY3VycmVudEVsZW1lbnQoKTtcbiAgY29uc3QgZGF0YSA9IGdldERhdGEobm9kZSk7XG5cbiAgZGlmZkF0dHJzKG5vZGUsIGRhdGEpO1xufVxuXG4vKipcbiAqIEFwcGxpZXMgdGhlIGN1cnJlbnQgc3RhdGljIGF0dHJpYnV0ZXMgdG8gdGhlIGN1cnJlbnRseSBvcGVuIGVsZW1lbnQuIE5vdGU6XG4gKiBzdGF0aWNzIHNob3VsZCBiZSBhcHBsaWVkIGJlZm9yZSBjYWxsaW5nIGBhcHBseUF0cnNgLlxuICogQHBhcmFtIHN0YXRpY3MgVGhlIHN0YXRpY3MgdG8gYXBwbHkgdG8gdGhlIGN1cnJlbnQgZWxlbWVudC5cbiAqL1xuZnVuY3Rpb24gYXBwbHlTdGF0aWNzKHN0YXRpY3M6IFN0YXRpY3MpIHtcbiAgY29uc3Qgbm9kZSA9IGN1cnJlbnRFbGVtZW50KCk7XG4gIGNvbnN0IGRhdGEgPSBnZXREYXRhKG5vZGUpO1xuXG4gIGRpZmZTdGF0aWNzKG5vZGUsIGRhdGEsIHN0YXRpY3MpO1xufVxuXG4vKipcbiAqIENsb3NlcyBhbiBvcGVuIHZpcnR1YWwgRWxlbWVudC5cbiAqXG4gKiBAcGFyYW0gbmFtZU9yQ3RvciBUaGUgRWxlbWVudCdzIHRhZyBvciBjb25zdHJ1Y3Rvci5cbiAqIEByZXR1cm4gVGhlIGNvcnJlc3BvbmRpbmcgRWxlbWVudC5cbiAqL1xuZnVuY3Rpb24gZWxlbWVudENsb3NlKG5hbWVPckN0b3I6IE5hbWVPckN0b3JEZWYpOiBFbGVtZW50IHtcbiAgaWYgKERFQlVHKSB7XG4gICAgYXNzZXJ0Tm90SW5BdHRyaWJ1dGVzKFwiZWxlbWVudENsb3NlXCIpO1xuICB9XG5cbiAgY29uc3Qgbm9kZSA9IGNsb3NlKCk7XG5cbiAgaWYgKERFQlVHKSB7XG4gICAgYXNzZXJ0Q2xvc2VNYXRjaGVzT3BlblRhZyhnZXREYXRhKG5vZGUpLm5hbWVPckN0b3IsIG5hbWVPckN0b3IpO1xuICB9XG5cbiAgcmV0dXJuIG5vZGU7XG59XG5cbi8qKlxuICogRGVjbGFyZXMgYSB2aXJ0dWFsIEVsZW1lbnQgYXQgdGhlIGN1cnJlbnQgbG9jYXRpb24gaW4gdGhlIGRvY3VtZW50IHRoYXQgaGFzXG4gKiBubyBjaGlsZHJlbi5cbiAqIEBwYXJhbSBuYW1lT3JDdG9yIFRoZSBFbGVtZW50J3MgdGFnIG9yIGNvbnN0cnVjdG9yLlxuICogQHBhcmFtIGtleSBUaGUga2V5IHVzZWQgdG8gaWRlbnRpZnkgdGhpcyBlbGVtZW50LiBUaGlzIGNhbiBiZSBhblxuICogICAgIGVtcHR5IHN0cmluZywgYnV0IHBlcmZvcm1hbmNlIG1heSBiZSBiZXR0ZXIgaWYgYSB1bmlxdWUgdmFsdWUgaXMgdXNlZFxuICogICAgIHdoZW4gaXRlcmF0aW5nIG92ZXIgYW4gYXJyYXkgb2YgaXRlbXMuXG4gKiBAcGFyYW0gc3RhdGljcyBBbiBhcnJheSBvZiBhdHRyaWJ1dGUgbmFtZS92YWx1ZSBwYWlycyBvZiB0aGUgc3RhdGljXG4gKiAgICAgYXR0cmlidXRlcyBmb3IgdGhlIEVsZW1lbnQuIEF0dHJpYnV0ZXMgd2lsbCBvbmx5IGJlIHNldCBvbmNlIHdoZW4gdGhlXG4gKiAgICAgRWxlbWVudCBpcyBjcmVhdGVkLlxuICogQHBhcmFtIHZhckFyZ3MgQXR0cmlidXRlIG5hbWUvdmFsdWUgcGFpcnMgb2YgdGhlIGR5bmFtaWMgYXR0cmlidXRlc1xuICogICAgIGZvciB0aGUgRWxlbWVudC5cbiAqIEByZXR1cm4gVGhlIGNvcnJlc3BvbmRpbmcgRWxlbWVudC5cbiAqL1xuZnVuY3Rpb24gZWxlbWVudFZvaWQoXG4gIG5hbWVPckN0b3I6IE5hbWVPckN0b3JEZWYsXG4gIGtleT86IEtleSxcbiAgLy8gSWRlYWxseSB3ZSBjb3VsZCB0YWcgc3RhdGljcyBhbmQgdmFyQXJncyBhcyBhbiBhcnJheSB3aGVyZSBldmVyeSBvZGRcbiAgLy8gZWxlbWVudCBpcyBhIHN0cmluZyBhbmQgZXZlcnkgZXZlbiBlbGVtZW50IGlzIGFueSwgYnV0IHRoaXMgaXMgaGFyZC5cbiAgc3RhdGljcz86IFN0YXRpY3MsXG4gIC4uLnZhckFyZ3M6IEFycmF5PGFueT5cbikge1xuICBlbGVtZW50T3Blbi5hcHBseShudWxsLCBhcmd1bWVudHMgYXMgYW55KTtcbiAgcmV0dXJuIGVsZW1lbnRDbG9zZShuYW1lT3JDdG9yKTtcbn1cblxuLyoqXG4gKiBEZWNsYXJlcyBhIHZpcnR1YWwgVGV4dCBhdCB0aGlzIHBvaW50IGluIHRoZSBkb2N1bWVudC5cbiAqXG4gKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIG9mIHRoZSBUZXh0LlxuICogQHBhcmFtIHZhckFyZ3NcbiAqICAgICBGdW5jdGlvbnMgdG8gZm9ybWF0IHRoZSB2YWx1ZSB3aGljaCBhcmUgY2FsbGVkIG9ubHkgd2hlbiB0aGUgdmFsdWUgaGFzXG4gKiAgICAgY2hhbmdlZC5cbiAqIEByZXR1cm4gVGhlIGNvcnJlc3BvbmRpbmcgdGV4dCBub2RlLlxuICovXG5mdW5jdGlvbiB0ZXh0KFxuICB2YWx1ZTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbixcbiAgLi4udmFyQXJnczogQXJyYXk8KGE6IHt9KSA9PiBzdHJpbmc+XG4pIHtcbiAgaWYgKERFQlVHKSB7XG4gICAgYXNzZXJ0Tm90SW5BdHRyaWJ1dGVzKFwidGV4dFwiKTtcbiAgICBhc3NlcnROb3RJblNraXAoXCJ0ZXh0XCIpO1xuICB9XG5cbiAgY29uc3Qgbm9kZSA9IGNvcmVUZXh0KCk7XG4gIGNvbnN0IGRhdGEgPSBnZXREYXRhKG5vZGUpO1xuXG4gIGlmIChkYXRhLnRleHQgIT09IHZhbHVlKSB7XG4gICAgZGF0YS50ZXh0ID0gdmFsdWUgYXMgc3RyaW5nO1xuXG4gICAgbGV0IGZvcm1hdHRlZCA9IHZhbHVlO1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAvKlxuICAgICAgICogQ2FsbCB0aGUgZm9ybWF0dGVyIGZ1bmN0aW9uIGRpcmVjdGx5IHRvIHByZXZlbnQgbGVha2luZyBhcmd1bWVudHMuXG4gICAgICAgKiBodHRwczovL2dpdGh1Yi5jb20vZ29vZ2xlL2luY3JlbWVudGFsLWRvbS9wdWxsLzIwNCNpc3N1ZWNvbW1lbnQtMTc4MjIzNTc0XG4gICAgICAgKi9cbiAgICAgIGNvbnN0IGZuID0gYXJndW1lbnRzW2ldO1xuICAgICAgZm9ybWF0dGVkID0gZm4oZm9ybWF0dGVkKTtcbiAgICB9XG5cbiAgICAvLyBTZXR0aW5nIG5vZGUuZGF0YSByZXNldHMgdGhlIGN1cnNvciBpbiBJRS9FZGdlLlxuICAgIGlmIChub2RlLmRhdGEgIT09IGZvcm1hdHRlZCkge1xuICAgICAgbm9kZS5kYXRhID0gZm9ybWF0dGVkIGFzIHN0cmluZztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbm9kZTtcbn1cblxuLyoqICovXG5leHBvcnQge1xuICBhcHBseUF0dHJzLFxuICBhcHBseVN0YXRpY3MsXG4gIGVsZW1lbnRPcGVuU3RhcnQsXG4gIGVsZW1lbnRPcGVuRW5kLFxuICBlbGVtZW50T3BlbixcbiAgZWxlbWVudFZvaWQsXG4gIGVsZW1lbnRDbG9zZSxcbiAgdGV4dCxcbiAgYXR0cixcbiAga2V5XG59O1xuIl19