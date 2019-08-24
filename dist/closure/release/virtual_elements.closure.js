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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbF9lbGVtZW50cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3JlbGVhc2UvdmlydHVhbF9lbGVtZW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7R0FjRztBQUVILE9BQU8sRUFDTCxNQUFNLEVBQ04seUJBQXlCLEVBQ3pCLGtCQUFrQixFQUNsQixhQUFhLEVBQ2IscUJBQXFCLEVBQ3JCLGVBQWUsRUFDZixlQUFlLEVBQ2hCLE1BQU0sY0FBYyxDQUFDO0FBQ3RCLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDL0MsT0FBTyxFQUNMLGNBQWMsRUFDZCxlQUFlLEVBQ2YsS0FBSyxFQUNMLElBQUksRUFDSixJQUFJLElBQUksUUFBUSxFQUNoQixjQUFjLEVBQ2YsTUFBTSxRQUFRLENBQUM7QUFDaEIsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUNqQyxPQUFPLEVBQUUsT0FBTyxFQUFZLE1BQU0sYUFBYSxDQUFDO0FBRWhELE9BQU8sRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBQ2xELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFFdkM7OztHQUdHO0FBQ0gsTUFBTSxpQkFBaUIsR0FBRyxDQUFDLENBQUM7QUFFNUI7Ozs7O0dBS0c7QUFDSCxNQUFNLFlBQVksR0FBRyxTQUFTLEVBQUUsQ0FBQztBQUVqQzs7O0dBR0c7QUFDSCxTQUFTLFNBQVMsQ0FBQyxPQUFnQixFQUFFLElBQWM7SUFDakQsTUFBTSxZQUFZLEdBQUcsZUFBZSxFQUFFLENBQUM7SUFDdkMsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFM0QsYUFBYSxDQUFDLFlBQVksRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLGVBQWUsQ0FBQyxDQUFDO0lBQ3BFLGFB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RyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDM0I7UUFFRCxrREFBa0Q7UUFDbEQsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtZQUMzQixJQUFJLENBQUMsSUFBSSxHQUFHLFNBQW1CLENBQUM7U0FDakM7S0FDRjtJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVELE1BQU07QUFDTixPQUFPLEVBQ0wsVUFBVSxFQUNWLFlBQVksRUFDWixnQkFBZ0IsRUFDaEIsY0FBYyxFQUNkLFdBQVcsRUFDWCxXQUFXLEVBQ1gsWUFBWSxFQUNaLElBQUksRUFDSixJQUFJLEVBQ0osR0FBRyxFQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE4IFRoZSBJbmNyZW1lbnRhbCBET00gQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7XG4gIGFzc2VydCxcbiAgYXNzZXJ0Q2xvc2VNYXRjaGVzT3BlblRhZyxcbiAgYXNzZXJ0SW5BdHRyaWJ1dGVzLFxuICBhc3NlcnRJblBhdGNoLFxuICBhc3NlcnROb3RJbkF0dHJpYnV0ZXMsXG4gIGFzc2VydE5vdEluU2tpcCxcbiAgc2V0SW5BdHRyaWJ1dGVzXG59IGZyb20gXCIuL2Fzc2VydGlvbnNcIjtcbmltcG9ydCB7IHVwZGF0ZUF0dHJpYnV0ZSB9IGZyb20gXCIuL2F0dHJpYnV0ZXNcIjtcbmltcG9ydCB7XG4gIGdldEFyZ3NCdWlsZGVyLFxuICBnZXRBdHRyc0J1aWxkZXIsXG4gIGNsb3NlLFxuICBvcGVuLFxuICB0ZXh0IGFzIGNvcmVUZXh0LFxuICBjdXJyZW50RWxlbWVudFxufSBmcm9tIFwiLi9jb3JlXCI7XG5pbXBvcnQgeyBERUJVRyB9IGZyb20gXCIuL2dsb2JhbFwiO1xuaW1wb3J0IHsgZ2V0RGF0YSwgTm9kZURhdGEgfSBmcm9tIFwiLi9ub2RlX2RhdGFcIjtcbmltcG9ydCB7IEtleSwgTmFtZU9yQ3RvckRlZiwgU3RhdGljcyB9IGZyb20gXCIuL3R5cGVzXCI7XG5pbXBvcnQgeyBjcmVhdGVNYXAsIHRydW5jYXRlQXJyYXkgfSBmcm9tIFwiLi91dGlsXCI7XG5pbXBvcnQgeyBjYWxjdWxhdGVEaWZmIH0gZnJvbSBcIi4vZGlmZlwiO1xuXG4vKipcbiAqIFRoZSBvZmZzZXQgaW4gdGhlIHZpcnR1YWwgZWxlbWVudCBkZWNsYXJhdGlvbiB3aGVyZSB0aGUgYXR0cmlidXRlcyBhcmVcbiAqIHNwZWNpZmllZC5cbiAqL1xuY29uc3QgQVRUUklCVVRFU19PRkZTRVQgPSAzO1xuXG4vKipcbiAqIFVzZWQgdG8ga2VlcCB0cmFjayBvZiB0aGUgcHJldmlvdXMgdmFsdWVzIHdoZW4gYSAyLXdheSBkaWZmIGlzIG5lY2Vzc2FyeS5cbiAqIFRoaXMgb2JqZWN0IGlzIHJldXNlZC5cbiAqIFRPRE8oc3BhcmhhbUkpIFNjb3BlIHRoaXMgdG8gYSBwYXRjaCBzbyB5b3UgY2FuIGNhbGwgcGF0Y2ggZnJvbSBhbiBhdHRyaWJ1dGVcbiAqIHVwZGF0ZS5cbiAqL1xuY29uc3QgcHJldkF0dHJzTWFwID0gY3JlYXRlTWFwKCk7XG5cbi8qKlxuICogQHBhcmFtIGVsZW1lbnQgVGhlIEVsZW1lbnQgdG8gZGlmZiB0aGUgYXR0cnMgZm9yLlxuICogQHBhcmFtIGRhdGEgVGhlIE5vZGVEYXRhIGFzc29jaWF0ZWQgd2l0aCB0aGUgRWxlbWVudC5cbiAqL1xuZnVuY3Rpb24gZGlmZkF0dHJzKGVsZW1lbnQ6IEVsZW1lbnQsIGRhdGE6IE5vZGVEYXRhKSB7XG4gIGNvbnN0IGF0dHJzQnVpbGRlciA9IGdldEF0dHJzQnVpbGRlcigpO1xuICBjb25zdCBwcmV2QXR0cnNBcnIgPSBkYXRhLmdldEF0dHJzQXJyKGF0dHJzQnVpbGRlci5sZW5ndGgpO1xuXG4gIGNhbGN1bGF0ZURpZmYocHJldkF0dHJzQXJyLCBhdHRyc0J1aWxkZXIsIGVsZW1lbnQsIHVwZGF0ZUF0dHJpYnV0ZSk7XG4gIHRydW5jYXRlQXJyYXkoYXR0cnNCdWlsZGVyLCAwKTtcbn1cblxuLyoqXG4gKiBBcHBsaWVzIHRoZSBzdGF0aWNzLiBXaGVuIGltcG9ydGluZyBhbiBFbGVtZW50LCBhbnkgZXhpc3RpbmcgYXR0cmlidXRlcyB0aGF0XG4gKiBtYXRjaCBhIHN0YXRpYyBhcmUgY29udmVydGVkIGludG8gYSBzdGF0aWMgYXR0cmlidXRlLlxuICogQHBhcmFtIG5vZGUgVGhlIEVsZW1lbnQgdG8gYXBwbHkgc3RhdGljcyBmb3IuXG4gKiBAcGFyYW0gZGF0YSBUaGUgTm9kZURhdGEgYXNzb2NpYXRlZCB3aXRoIHRoZSBFbGVtZW50LlxuICogQHBhcmFtIHN0YXRpY3MgVGhlIHN0YXRpY3MgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGRpZmZTdGF0aWNzKG5vZGU6IEVsZW1lbnQsIGRhdGE6IE5vZGVEYXRhLCBzdGF0aWNzOiBTdGF0aWNzKSB7XG4gIGlmIChkYXRhLnN0YXRpY3NBcHBsaWVkKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZGF0YS5zdGF0aWNzQXBwbGllZCA9IHRydWU7XG5cbiAgaWYgKCFzdGF0aWNzIHx8ICFzdGF0aWNzLmxlbmd0aCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChkYXRhLmhhc0VtcHR5QXR0cnNBcnIoKSkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RhdGljcy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgdXBkYXRlQXR0cmlidXRlKG5vZGUsIHN0YXRpY3NbaV0gYXMgc3RyaW5nLCBzdGF0aWNzW2kgKyAxXSk7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc3RhdGljcy5sZW5ndGg7IGkgKz0gMikge1xuICAgIHByZXZBdHRyc01hcFtzdGF0aWNzW2ldIGFzIHN0cmluZ10gPSBpICsgMTtcbiAgfVxuXG4gIGNvbnN0IGF0dHJzQXJyID0gZGF0YS5nZXRBdHRyc0FycigwKTtcbiAgbGV0IGogPSAwO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGF0dHJzQXJyLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgY29uc3QgbmFtZSA9IGF0dHJzQXJyW2ldO1xuICAgIGNvbnN0IHZhbHVlID0gYXR0cnNBcnJbaSArIDFdO1xuICAgIGNvbnN0IHN0YXRpY3NJbmRleCA9IHByZXZBdHRyc01hcFtuYW1lXTtcblxuICAgIGlmIChzdGF0aWNzSW5kZXgpIHtcbiAgICAgIC8vIEZvciBhbnkgYXR0cnMgdGhhdCBhcmUgc3RhdGljIGFuZCBoYXZlIHRoZSBzYW1lIHZhbHVlLCBtYWtlIHN1cmUgd2UgZG9cbiAgICAgIC8vIG5vdCBzZXQgdGhlbSBhZ2Fpbi5cbiAgICAgIGlmIChzdGF0aWNzW3N0YXRpY3NJbmRleF0gPT09IHZhbHVlKSB7XG4gICAgICAgIGRlbGV0ZSBwcmV2QXR0cnNNYXBbbmFtZV07XG4gICAgICB9XG5cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIEZvciBhbnkgYXR0cnMgdGhhdCBhcmUgZHluYW1pYywgbW92ZSB0aGVtIHVwIHRvIHRoZSByaWdodCBwbGFjZS5cbiAgICBhdHRyc0FycltqXSA9IG5hbWU7XG4gICAgYXR0cnNBcnJbaiArIDFdID0gdmFsdWU7XG4gICAgaiArPSAyO1xuICB9XG4gIC8vIEFueXRoaW5nIGFmdGVyIGBqYCB3YXMgZWl0aGVyIG1vdmVkIHVwIGFscmVhZHkgb3Igc3RhdGljLlxuICB0cnVuY2F0ZUFycmF5KGF0dHJzQXJyLCBqKTtcblxuICBmb3IgKGNvbnN0IG5hbWUgaW4gcHJldkF0dHJzTWFwKSB7XG4gICAgdXBkYXRlQXR0cmlidXRlKG5vZGUsIG5hbWUsIHN0YXRpY3NbcHJldkF0dHJzTWFwW25hbWVdXSk7XG4gICAgZGVsZXRlIHByZXZBdHRyc01hcFtuYW1lXTtcbiAgfVxufVxuXG4vKipcbiAqIERlY2xhcmVzIGEgdmlydHVhbCBFbGVtZW50IGF0IHRoZSBjdXJyZW50IGxvY2F0aW9uIGluIHRoZSBkb2N1bWVudC4gVGhpc1xuICogY29ycmVzcG9uZHMgdG8gYW4gb3BlbmluZyB0YWcgYW5kIGEgZWxlbWVudENsb3NlIHRhZyBpcyByZXF1aXJlZC4gVGhpcyBpc1xuICogbGlrZSBlbGVtZW50T3BlbiwgYnV0IHRoZSBhdHRyaWJ1dGVzIGFyZSBkZWZpbmVkIHVzaW5nIHRoZSBhdHRyIGZ1bmN0aW9uXG4gKiByYXRoZXIgdGhhbiBiZWluZyBwYXNzZWQgYXMgYXJndW1lbnRzLiBNdXN0IGJlIGZvbGxsb3dlZCBieSAwIG9yIG1vcmUgY2FsbHNcbiAqIHRvIGF0dHIsIHRoZW4gYSBjYWxsIHRvIGVsZW1lbnRPcGVuRW5kLlxuICogQHBhcmFtIG5hbWVPckN0b3IgVGhlIEVsZW1lbnQncyB0YWcgb3IgY29uc3RydWN0b3IuXG4gKiBAcGFyYW0ga2V5IFRoZSBrZXkgdXNlZCB0byBpZGVudGlmeSB0aGlzIGVsZW1lbnQuIFRoaXMgY2FuIGJlIGFuXG4gKiAgICAgZW1wdHkgc3RyaW5nLCBidXQgcGVyZm9ybWFuY2UgbWF5IGJlIGJldHRlciBpZiBhIHVuaXF1ZSB2YWx1ZSBpcyB1c2VkXG4gKiAgICAgd2hlbiBpdGVyYXRpbmcgb3ZlciBhbiBhcnJheSBvZiBpdGVtcy5cbiAqIEBwYXJhbSBzdGF0aWNzIEFuIGFycmF5IG9mIGF0dHJpYnV0ZSBuYW1lL3ZhbHVlIHBhaXJzIG9mIHRoZSBzdGF0aWNcbiAqICAgICBhdHRyaWJ1dGVzIGZvciB0aGUgRWxlbWVudC4gQXR0cmlidXRlcyB3aWxsIG9ubHkgYmUgc2V0IG9uY2Ugd2hlbiB0aGVcbiAqICAgICBFbGVtZW50IGlzIGNyZWF0ZWQuXG4gKi9cbmZ1bmN0aW9uIGVsZW1lbnRPcGVuU3RhcnQoXG4gIG5hbWVPckN0b3I6IE5hbWVPckN0b3JEZWYsXG4gIGtleT86IEtleSxcbiAgc3RhdGljcz86IFN0YXRpY3Ncbikge1xuICBjb25zdCBhcmdzQnVpbGRlciA9IGdldEFyZ3NCdWlsZGVyKCk7XG5cbiAgaWYgKERFQlVHKSB7XG4gICAgYXNzZXJ0Tm90SW5BdHRyaWJ1dGVzKFwiZWxlbWVudE9wZW5TdGFydFwiKTtcbiAgICBzZXRJbkF0dHJpYnV0ZXModHJ1ZSk7XG4gIH1cblxuICBhcmdzQnVpbGRlclswXSA9IG5hbWVPckN0b3I7XG4gIGFyZ3NCdWlsZGVyWzFdID0ga2V5O1xuICBhcmdzQnVpbGRlclsyXSA9IHN0YXRpY3M7XG59XG5cbi8qKlxuICogQWxsb3dzIHlvdSB0byBkZWZpbmUgYSBrZXkgYWZ0ZXIgYW4gZWxlbWVudE9wZW5TdGFydC4gVGhpcyBpcyB1c2VmdWwgaW5cbiAqIHRlbXBsYXRlcyB0aGF0IGRlZmluZSBrZXkgYWZ0ZXIgYW4gZWxlbWVudCBoYXMgYmVlbiBvcGVuZWQgaWVcbiAqIGA8ZGl2IGtleSgnZm9vJyk+PC9kaXY+YC5cbiAqIEBwYXJhbSBrZXkgVGhlIGtleSB0byB1c2UgZm9yIHRoZSBuZXh0IGNhbGwuXG4gKi9cbmZ1bmN0aW9uIGtleShrZXk6IHN0cmluZykge1xuICBjb25zdCBhcmdzQnVpbGRlciA9IGdldEFyZ3NCdWlsZGVyKCk7XG5cbiAgaWYgKERFQlVHKSB7XG4gICAgYXNzZXJ0SW5BdHRyaWJ1dGVzKFwia2V5XCIpO1xuICAgIGFzc2VydChhcmdzQnVpbGRlcik7XG4gIH1cbiAgYXJnc0J1aWxkZXJbMV0gPSBrZXk7XG59XG5cbi8qKlxuICogQnVmZmVycyBhbiBhdHRyaWJ1dGUsIHdoaWNoIHdpbGwgZ2V0IGFwcGxpZWQgZHVyaW5nIHRoZSBuZXh0IGNhbGwgdG9cbiAqIGBlbGVtZW50T3BlbmAsIGBlbGVtZW50T3BlbkVuZGAgb3IgYGFwcGx5QXR0cnNgLlxuICogQHBhcmFtIG5hbWUgVGhlIG9mIHRoZSBhdHRyaWJ1dGUgdG8gYnVmZmVyLlxuICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSBvZiB0aGUgYXR0cmlidXRlIHRvIGJ1ZmZlci5cbiAqL1xuZnVuY3Rpb24gYXR0cihuYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgY29uc3QgYXR0cnNCdWlsZGVyID0gZ2V0QXR0cnNCdWlsZGVyKCk7XG5cbiAgaWYgKERFQlVHKSB7XG4gICAgYXNzZXJ0SW5QYXRjaChcImF0dHJcIik7XG4gIH1cblxuICBhdHRyc0J1aWxkZXIucHVzaChuYW1lKTtcbiAgYXR0cnNCdWlsZGVyLnB1c2godmFsdWUpO1xufVxuXG4vKipcbiAqIENsb3NlcyBhbiBvcGVuIHRhZyBzdGFydGVkIHdpdGggZWxlbWVudE9wZW5TdGFydC5cbiAqIEByZXR1cm4gVGhlIGNvcnJlc3BvbmRpbmcgRWxlbWVudC5cbiAqL1xuZnVuY3Rpb24gZWxlbWVudE9wZW5FbmQoKTogSFRNTEVsZW1lbnQge1xuICBjb25zdCBhcmdzQnVpbGRlciA9IGdldEFyZ3NCdWlsZGVyKCk7XG5cbiAgaWYgKERFQlVHKSB7XG4gICAgYXNzZXJ0SW5BdHRyaWJ1dGVzKFwiZWxlbWVudE9wZW5FbmRcIik7XG4gICAgc2V0SW5BdHRyaWJ1dGVzKGZhbHNlKTtcbiAgfVxuXG4gIGNvbnN0IG5vZGUgPSBvcGVuKDxOYW1lT3JDdG9yRGVmPmFyZ3NCdWlsZGVyWzBdLCA8S2V5PmFyZ3NCdWlsZGVyWzFdKTtcbiAgY29uc3QgZGF0YSA9IGdldERhdGEobm9kZSk7XG5cbiAgZGlmZlN0YXRpY3Mobm9kZSwgZGF0YSwgPFN0YXRpY3M+YXJnc0J1aWxkZXJbMl0pO1xuICBkaWZmQXR0cnMobm9kZSwgZGF0YSk7XG4gIHRydW5jYXRlQXJyYXkoYXJnc0J1aWxkZXIsIDApO1xuXG4gIHJldHVybiBub2RlO1xufVxuXG4vKipcbiAqIEBwYXJhbSAgbmFtZU9yQ3RvciBUaGUgRWxlbWVudCdzIHRhZyBvciBjb25zdHJ1Y3Rvci5cbiAqIEBwYXJhbSAga2V5IFRoZSBrZXkgdXNlZCB0byBpZGVudGlmeSB0aGlzIGVsZW1lbnQuIFRoaXMgY2FuIGJlIGFuXG4gKiAgICAgZW1wdHkgc3RyaW5nLCBidXQgcGVyZm9ybWFuY2UgbWF5IGJlIGJldHRlciBpZiBhIHVuaXF1ZSB2YWx1ZSBpcyB1c2VkXG4gKiAgICAgd2hlbiBpdGVyYXRpbmcgb3ZlciBhbiBhcnJheSBvZiBpdGVtcy5cbiAqIEBwYXJhbSBzdGF0aWNzIEFuIGFycmF5IG9mIGF0dHJpYnV0ZSBuYW1lL3ZhbHVlIHBhaXJzIG9mIHRoZSBzdGF0aWNcbiAqICAgICBhdHRyaWJ1dGVzIGZvciB0aGUgRWxlbWVudC4gQXR0cmlidXRlcyB3aWxsIG9ubHkgYmUgc2V0IG9uY2Ugd2hlbiB0aGVcbiAqICAgICBFbGVtZW50IGlzIGNyZWF0ZWQuXG4gKiBAcGFyYW0gdmFyQXJncywgQXR0cmlidXRlIG5hbWUvdmFsdWUgcGFpcnMgb2YgdGhlIGR5bmFtaWMgYXR0cmlidXRlc1xuICogICAgIGZvciB0aGUgRWxlbWVudC5cbiAqIEByZXR1cm4gVGhlIGNvcnJlc3BvbmRpbmcgRWxlbWVudC5cbiAqL1xuZnVuY3Rpb24gZWxlbWVudE9wZW4oXG4gIG5hbWVPckN0b3I6IE5hbWVPckN0b3JEZWYsXG4gIGtleT86IEtleSxcbiAgLy8gSWRlYWxseSB3ZSBjb3VsZCB0YWcgc3RhdGljcyBhbmQgdmFyQXJncyBhcyBhbiBhcnJheSB3aGVyZSBldmVyeSBvZGRcbiAgLy8gZWxlbWVudCBpcyBhIHN0cmluZyBhbmQgZXZlcnkgZXZlbiBlbGVtZW50IGlzIGFueSwgYnV0IHRoaXMgaXMgaGFyZC5cbiAgc3RhdGljcz86IFN0YXRpY3MsXG4gIC4uLnZhckFyZ3M6IEFycmF5PGFueT5cbikge1xuICBpZiAoREVCVUcpIHtcbiAgICBhc3NlcnROb3RJbkF0dHJpYnV0ZXMoXCJlbGVtZW50T3BlblwiKTtcbiAgICBhc3NlcnROb3RJblNraXAoXCJlbGVtZW50T3BlblwiKTtcbiAgfVxuXG4gIGVsZW1lbnRPcGVuU3RhcnQobmFtZU9yQ3Rvciwga2V5LCBzdGF0aWNzKTtcblxuICBmb3IgKGxldCBpID0gQVRUUklCVVRFU19PRkZTRVQ7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICBhdHRyKGFyZ3VtZW50c1tpXSwgYXJndW1lbnRzW2kgKyAxXSk7XG4gIH1cblxuICByZXR1cm4gZWxlbWVudE9wZW5FbmQoKTtcbn1cblxuLyoqXG4gKiBBcHBsaWVzIHRoZSBjdXJyZW50bHkgYnVmZmVyZWQgYXR0cnMgdG8gdGhlIGN1cnJlbnRseSBvcGVuIGVsZW1lbnQuIFRoaXNcbiAqIGNsZWFycyB0aGUgYnVmZmVyZWQgYXR0cmlidXRlcy5cbiAqL1xuZnVuY3Rpb24gYXBwbHlBdHRycygpIHtcbiAgY29uc3Qgbm9kZSA9IGN1cnJlbnRFbGVtZW50KCk7XG4gIGNvbnN0IGRhdGEgPSBnZXREYXRhKG5vZGUpO1xuXG4gIGRpZmZBdHRycyhub2RlLCBkYXRhKTtcbn1cblxuLyoqXG4gKiBBcHBsaWVzIHRoZSBjdXJyZW50IHN0YXRpYyBhdHRyaWJ1dGVzIHRvIHRoZSBjdXJyZW50bHkgb3BlbiBlbGVtZW50LiBOb3RlOlxuICogc3RhdGljcyBzaG91bGQgYmUgYXBwbGllZCBiZWZvcmUgY2FsbGluZyBgYXBwbHlBdHJzYC5cbiAqIEBwYXJhbSBzdGF0aWNzIFRoZSBzdGF0aWNzIHRvIGFwcGx5IHRvIHRoZSBjdXJyZW50IGVsZW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGFwcGx5U3RhdGljcyhzdGF0aWNzOiBTdGF0aWNzKSB7XG4gIGNvbnN0IG5vZGUgPSBjdXJyZW50RWxlbWVudCgpO1xuICBjb25zdCBkYXRhID0gZ2V0RGF0YShub2RlKTtcblxuICBkaWZmU3RhdGljcyhub2RlLCBkYXRhLCBzdGF0aWNzKTtcbn1cblxuLyoqXG4gKiBDbG9zZXMgYW4gb3BlbiB2aXJ0dWFsIEVsZW1lbnQuXG4gKlxuICogQHBhcmFtIG5hbWVPckN0b3IgVGhlIEVsZW1lbnQncyB0YWcgb3IgY29uc3RydWN0b3IuXG4gKiBAcmV0dXJuIFRoZSBjb3JyZXNwb25kaW5nIEVsZW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGVsZW1lbnRDbG9zZShuYW1lT3JDdG9yOiBOYW1lT3JDdG9yRGVmKTogRWxlbWVudCB7XG4gIGlmIChERUJVRykge1xuICAgIGFzc2VydE5vdEluQXR0cmlidXRlcyhcImVsZW1lbnRDbG9zZVwiKTtcbiAgfVxuXG4gIGNvbnN0IG5vZGUgPSBjbG9zZSgpO1xuXG4gIGlmIChERUJVRykge1xuICAgIGFzc2VydENsb3NlTWF0Y2hlc09wZW5UYWcoZ2V0RGF0YShub2RlKS5uYW1lT3JDdG9yLCBuYW1lT3JDdG9yKTtcbiAgfVxuXG4gIHJldHVybiBub2RlO1xufVxuXG4vKipcbiAqIERlY2xhcmVzIGEgdmlydHVhbCBFbGVtZW50IGF0IHRoZSBjdXJyZW50IGxvY2F0aW9uIGluIHRoZSBkb2N1bWVudCB0aGF0IGhhc1xuICogbm8gY2hpbGRyZW4uXG4gKiBAcGFyYW0gbmFtZU9yQ3RvciBUaGUgRWxlbWVudCdzIHRhZyBvciBjb25zdHJ1Y3Rvci5cbiAqIEBwYXJhbSBrZXkgVGhlIGtleSB1c2VkIHRvIGlkZW50aWZ5IHRoaXMgZWxlbWVudC4gVGhpcyBjYW4gYmUgYW5cbiAqICAgICBlbXB0eSBzdHJpbmcsIGJ1dCBwZXJmb3JtYW5jZSBtYXkgYmUgYmV0dGVyIGlmIGEgdW5pcXVlIHZhbHVlIGlzIHVzZWRcbiAqICAgICB3aGVuIGl0ZXJhdGluZyBvdmVyIGFuIGFycmF5IG9mIGl0ZW1zLlxuICogQHBhcmFtIHN0YXRpY3MgQW4gYXJyYXkgb2YgYXR0cmlidXRlIG5hbWUvdmFsdWUgcGFpcnMgb2YgdGhlIHN0YXRpY1xuICogICAgIGF0dHJpYnV0ZXMgZm9yIHRoZSBFbGVtZW50LiBBdHRyaWJ1dGVzIHdpbGwgb25seSBiZSBzZXQgb25jZSB3aGVuIHRoZVxuICogICAgIEVsZW1lbnQgaXMgY3JlYXRlZC5cbiAqIEBwYXJhbSB2YXJBcmdzIEF0dHJpYnV0ZSBuYW1lL3ZhbHVlIHBhaXJzIG9mIHRoZSBkeW5hbWljIGF0dHJpYnV0ZXNcbiAqICAgICBmb3IgdGhlIEVsZW1lbnQuXG4gKiBAcmV0dXJuIFRoZSBjb3JyZXNwb25kaW5nIEVsZW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGVsZW1lbnRWb2lkKFxuICBuYW1lT3JDdG9yOiBOYW1lT3JDdG9yRGVmLFxuICBrZXk/OiBLZXksXG4gIC8vIElkZWFsbHkgd2UgY291bGQgdGFnIHN0YXRpY3MgYW5kIHZhckFyZ3MgYXMgYW4gYXJyYXkgd2hlcmUgZXZlcnkgb2RkXG4gIC8vIGVsZW1lbnQgaXMgYSBzdHJpbmcgYW5kIGV2ZXJ5IGV2ZW4gZWxlbWVudCBpcyBhbnksIGJ1dCB0aGlzIGlzIGhhcmQuXG4gIHN0YXRpY3M/OiBTdGF0aWNzLFxuICAuLi52YXJBcmdzOiBBcnJheTxhbnk+XG4pIHtcbiAgZWxlbWVudE9wZW4uYXBwbHkobnVsbCwgYXJndW1lbnRzIGFzIGFueSk7XG4gIHJldHVybiBlbGVtZW50Q2xvc2UobmFtZU9yQ3Rvcik7XG59XG5cbi8qKlxuICogRGVjbGFyZXMgYSB2aXJ0dWFsIFRleHQgYXQgdGhpcyBwb2ludCBpbiB0aGUgZG9jdW1lbnQuXG4gKlxuICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSBvZiB0aGUgVGV4dC5cbiAqIEBwYXJhbSB2YXJBcmdzXG4gKiAgICAgRnVuY3Rpb25zIHRvIGZvcm1hdCB0aGUgdmFsdWUgd2hpY2ggYXJlIGNhbGxlZCBvbmx5IHdoZW4gdGhlIHZhbHVlIGhhc1xuICogICAgIGNoYW5nZWQuXG4gKiBAcmV0dXJuIFRoZSBjb3JyZXNwb25kaW5nIHRleHQgbm9kZS5cbiAqL1xuZnVuY3Rpb24gdGV4dChcbiAgdmFsdWU6IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4sXG4gIC4uLnZhckFyZ3M6IEFycmF5PChhOiB7fSkgPT4gc3RyaW5nPlxuKSB7XG4gIGlmIChERUJVRykge1xuICAgIGFzc2VydE5vdEluQXR0cmlidXRlcyhcInRleHRcIik7XG4gICAgYXNzZXJ0Tm90SW5Ta2lwKFwidGV4dFwiKTtcbiAgfVxuXG4gIGNvbnN0IG5vZGUgPSBjb3JlVGV4dCgpO1xuICBjb25zdCBkYXRhID0gZ2V0RGF0YShub2RlKTtcblxuICBpZiAoZGF0YS50ZXh0ICE9PSB2YWx1ZSkge1xuICAgIGRhdGEudGV4dCA9IHZhbHVlIGFzIHN0cmluZztcblxuICAgIGxldCBmb3JtYXR0ZWQgPSB2YWx1ZTtcbiAgICBmb3IgKGxldCBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgLypcbiAgICAgICAqIENhbGwgdGhlIGZvcm1hdHRlciBmdW5jdGlvbiBkaXJlY3RseSB0byBwcmV2ZW50IGxlYWtpbmcgYXJndW1lbnRzLlxuICAgICAgICogaHR0cHM6Ly9naXRodWIuY29tL2dvb2dsZS9pbmNyZW1lbnRhbC1kb20vcHVsbC8yMDQjaXNzdWVjb21tZW50LTE3ODIyMzU3NFxuICAgICAgICovXG4gICAgICBjb25zdCBmbiA9IGFyZ3VtZW50c1tpXTtcbiAgICAgIGZvcm1hdHRlZCA9IGZuKGZvcm1hdHRlZCk7XG4gICAgfVxuXG4gICAgLy8gU2V0dGluZyBub2RlLmRhdGEgcmVzZXRzIHRoZSBjdXJzb3IgaW4gSUUvRWRnZS5cbiAgICBpZiAobm9kZS5kYXRhICE9PSBmb3JtYXR0ZWQpIHtcbiAgICAgIG5vZGUuZGF0YSA9IGZvcm1hdHRlZCBhcyBzdHJpbmc7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5vZGU7XG59XG5cbi8qKiAqL1xuZXhwb3J0IHtcbiAgYXBwbHlBdHRycyxcbiAgYXBwbHlTdGF0aWNzLFxuICBlbGVtZW50T3BlblN0YXJ0LFxuICBlbGVtZW50T3BlbkVuZCxcbiAgZWxlbWVudE9wZW4sXG4gIGVsZW1lbnRWb2lkLFxuICBlbGVtZW50Q2xvc2UsXG4gIHRleHQsXG4gIGF0dHIsXG4gIGtleVxufTtcbiJdfQ==