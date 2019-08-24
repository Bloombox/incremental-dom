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
import { assert } from "./assertions";
import { createMap, has } from "./util";
import { symbols } from "./symbols";
/**
 * @param name The name of the attribute. For example "tabindex" or
 *    "xlink:href".
 * @returns The namespace to use for the attribute, or null if there is
 * no namespace.
 */
function getNamespace(name) {
    if (name.lastIndexOf("xml:", 0) === 0) {
        return "http://www.w3.org/XML/1998/namespace";
    }
    if (name.lastIndexOf("xlink:", 0) === 0) {
        return "http://www.w3.org/1999/xlink";
    }
    return null;
}
/**
 * Applies an attribute or property to a given Element. If the value is null
 * or undefined, it is removed from the Element. Otherwise, the value is set
 * as an attribute.
 * @param el The element to apply the attribute to.
 * @param name The attribute's name.
 * @param value The attribute's value.
 */
function applyAttr(el, name, value) {
    if (value == null) {
        el.removeAttribute(name);
    }
    else {
        const attrNS = getNamespace(name);
        if (attrNS) {
            el.setAttributeNS(attrNS, name, String(value));
        }
        else {
            el.setAttribute(name, String(value));
        }
    }
}
/**
 * Applies a property to a given Element.
 * @param el The element to apply the property to.
 * @param name The property's name.
 * @param value The property's value.
 */
function applyProp(el, name, value) {
    el[name] = value;
}
/**
 * Applies a value to a style declaration. Supports CSS custom properties by
 * setting properties containing a dash using CSSStyleDeclaration.setProperty.
 * @param style A style declaration.
 * @param prop The property to apply. This can be either camelcase or dash
 *    separated. For example: "backgroundColor" and "background-color" are both
 *    supported.
 * @param value The value of the property.
 */
function setStyleValue(style, prop, value) {
    if (prop.indexOf("-") >= 0) {
        style.setProperty(prop, value);
    }
    else {
        style[prop] = value;
    }
}
/**
 * Applies a style to an Element. No vendor prefix expansion is done for
 * property names/values.
 * @param el The Element to apply the style for.
 * @param name The attribute's name.
 * @param  style The style to set. Either a string of css or an object
 *     containing property-value pairs.
 */
function applyStyle(el, name, style) {
    // MathML elements inherit from Element, which does not have style. We cannot
    // do `instanceof HTMLElement` / `instanceof SVGElement`, since el can belong
    // to a different document, so just check that it has a style.
    assert("style" in el);
    const elStyle = el.style;
    if (typeof style === "string") {
        elStyle.cssText = style;
    }
    else {
        elStyle.cssText = "";
        for (const prop in style) {
            if (has(style, prop)) {
                setStyleValue(elStyle, prop, style[prop]);
            }
        }
    }
}
/**
 * Updates a single attribute on an Element.
 * @param el The Element to apply the attribute to.
 * @param name The attribute's name.
 * @param value The attribute's value. If the value is an object or
 *     function it is set on the Element, otherwise, it is set as an HTML
 *     attribute.
 */
function applyAttributeTyped(el, name, value) {
    const type = typeof value;
    if (type === "object" || type === "function") {
        applyProp(el, name, value);
    }
    else {
        applyAttr(el, name, value);
    }
}
/**
 * A publicly mutable object to provide custom mutators for attributes.
 * NB: The result of createMap() has to be recast since closure compiler
 * will just assume attributes is "any" otherwise and throws away
 * the type annotation set by tsickle.
 */
const attributes = createMap();
// Special generic mutator that's called for any attribute that does not
// have a specific mutator.
attributes[symbols.default] = applyAttributeTyped;
attributes["style"] = applyStyle;
/**
 * Calls the appropriate attribute mutator for this attribute.
 * @param el The Element to apply the attribute to.
 * @param name The attribute's name.
 * @param value The attribute's value. If the value is an object or
 *     function it is set on the Element, otherwise, it is set as an HTML
 *     attribute.
 */
function updateAttribute(el, name, value) {
    const mutator = attributes[name] || attributes[symbols.default];
    mutator(el, name, value);
}
export { updateAttribute, applyProp, applyAttr, attributes };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXR0cmlidXRlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9hdHRyaWJ1dGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7OztHQWNHO0FBR0gsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUN0QyxPQUFPLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxNQUFNLFFBQVEsQ0FBQztBQUN4QyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRXBDOzs7OztHQUtHO0FBQ0gsU0FBUyxZQUFZLENBQUMsSUFBWTtJQUNoQyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUNyQyxPQUFPLHNDQUFzQyxDQUFDO0tBQy9DO0lBRUQsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDdkMsT0FBTyw4QkFBOEIsQ0FBQztLQUN2QztJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVEOzs7Ozs7O0dBT0c7QUFDSCxTQUFTLFNBQVMsQ0FBQyxFQUFXLEVBQUUsSUFBWSxFQUFFLEtBQWM7SUFDMUQsSUFBSSxLQUFLLElBQUksSUFBSSxFQUFFO1FBQ2pCLEVBQUUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDMUI7U0FBTTtRQUNMLE1BQU0sTUFBTSxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsQyxJQUFJLE1BQU0sRUFBRTtZQUNWLEVBQUUsQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztTQUNoRDthQUFNO1lBQ0wsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7U0FDdEM7S0FDRjtBQUNILENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILFNBQVMsU0FBUyxDQUFDLEVBQVcsRUFBRSxJQUFZLEVBQUUsS0FBYztJQUN6RCxFQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDO0FBQzVCLENBQUM7QUFFRDs7Ozs7Ozs7R0FRRztBQUNILFNBQVMsYUFBYSxDQUNwQixLQUEwQixFQUMxQixJQUFZLEVBQ1osS0FBYTtJQUViLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDMUIsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDaEM7U0FBTTtRQUNKLEtBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUM7S0FDOUI7QUFDSCxDQUFDO0FBRUQ7Ozs7Ozs7R0FPRztBQUNILFNBQVMsVUFBVSxDQUNqQixFQUFXLEVBQ1gsSUFBWSxFQUNaLEtBQXVDO0lBRXZDLDZFQUE2RTtJQUM3RSw2RUFBNkU7SUFDN0UsOERBQThEO0lBQzlELE1BQU0sQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLENBQUM7SUFDdEIsTUFBTSxPQUFPLEdBQThCLEVBQUcsQ0FBQyxLQUFLLENBQUM7SUFFckQsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7UUFDN0IsT0FBTyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7S0FDekI7U0FBTTtRQUNMLE9BQU8sQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBRXJCLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO1lBQ3hCLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRTtnQkFDcEIsYUFBYSxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDM0M7U0FDRjtLQUNGO0FBQ0gsQ0FBQztBQUVEOzs7Ozs7O0dBT0c7QUFDSCxTQUFTLG1CQUFtQixDQUFDLEVBQVcsRUFBRSxJQUFZLEVBQUUsS0FBYztJQUNwRSxNQUFNLElBQUksR0FBRyxPQUFPLEtBQUssQ0FBQztJQUUxQixJQUFJLElBQUksS0FBSyxRQUFRLElBQUksSUFBSSxLQUFLLFVBQVUsRUFBRTtRQUM1QyxTQUFTLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztLQUM1QjtTQUFNO1FBQ0wsU0FBUyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDNUI7QUFDSCxDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxNQUFNLFVBQVUsR0FBc0IsU0FBUyxFQUF1QixDQUFDO0FBRXZFLHdFQUF3RTtBQUN4RSwyQkFBMkI7QUFDM0IsVUFBVSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxtQkFBbUIsQ0FBQztBQUVsRCxVQUFVLENBQUMsT0FBTyxDQUFDLEdBQUcsVUFBVSxDQUFDO0FBRWpDOzs7Ozs7O0dBT0c7QUFDSCxTQUFTLGVBQWUsQ0FBQyxFQUFXLEVBQUUsSUFBWSxFQUFFLEtBQWM7SUFDaEUsTUFBTSxPQUFPLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDaEUsT0FBTyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDM0IsQ0FBQztBQUVELE9BQU8sRUFBRSxlQUFlLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTggVGhlIEluY3JlbWVudGFsIERPTSBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHsgQXR0ck11dGF0b3JDb25maWcgfSBmcm9tIFwiLi90eXBlc1wiO1xuaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSBcIi4vYXNzZXJ0aW9uc1wiO1xuaW1wb3J0IHsgY3JlYXRlTWFwLCBoYXMgfSBmcm9tIFwiLi91dGlsXCI7XG5pbXBvcnQgeyBzeW1ib2xzIH0gZnJvbSBcIi4vc3ltYm9sc1wiO1xuXG4vKipcbiAqIEBwYXJhbSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBhdHRyaWJ1dGUuIEZvciBleGFtcGxlIFwidGFiaW5kZXhcIiBvclxuICogICAgXCJ4bGluazpocmVmXCIuXG4gKiBAcmV0dXJucyBUaGUgbmFtZXNwYWNlIHRvIHVzZSBmb3IgdGhlIGF0dHJpYnV0ZSwgb3IgbnVsbCBpZiB0aGVyZSBpc1xuICogbm8gbmFtZXNwYWNlLlxuICovXG5mdW5jdGlvbiBnZXROYW1lc3BhY2UobmFtZTogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIGlmIChuYW1lLmxhc3RJbmRleE9mKFwieG1sOlwiLCAwKSA9PT0gMCkge1xuICAgIHJldHVybiBcImh0dHA6Ly93d3cudzMub3JnL1hNTC8xOTk4L25hbWVzcGFjZVwiO1xuICB9XG5cbiAgaWYgKG5hbWUubGFzdEluZGV4T2YoXCJ4bGluazpcIiwgMCkgPT09IDApIHtcbiAgICByZXR1cm4gXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCI7XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiBBcHBsaWVzIGFuIGF0dHJpYnV0ZSBvciBwcm9wZXJ0eSB0byBhIGdpdmVuIEVsZW1lbnQuIElmIHRoZSB2YWx1ZSBpcyBudWxsXG4gKiBvciB1bmRlZmluZWQsIGl0IGlzIHJlbW92ZWQgZnJvbSB0aGUgRWxlbWVudC4gT3RoZXJ3aXNlLCB0aGUgdmFsdWUgaXMgc2V0XG4gKiBhcyBhbiBhdHRyaWJ1dGUuXG4gKiBAcGFyYW0gZWwgVGhlIGVsZW1lbnQgdG8gYXBwbHkgdGhlIGF0dHJpYnV0ZSB0by5cbiAqIEBwYXJhbSBuYW1lIFRoZSBhdHRyaWJ1dGUncyBuYW1lLlxuICogQHBhcmFtIHZhbHVlIFRoZSBhdHRyaWJ1dGUncyB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gYXBwbHlBdHRyKGVsOiBFbGVtZW50LCBuYW1lOiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKSB7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgZWwucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGF0dHJOUyA9IGdldE5hbWVzcGFjZShuYW1lKTtcbiAgICBpZiAoYXR0ck5TKSB7XG4gICAgICBlbC5zZXRBdHRyaWJ1dGVOUyhhdHRyTlMsIG5hbWUsIFN0cmluZyh2YWx1ZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbC5zZXRBdHRyaWJ1dGUobmFtZSwgU3RyaW5nKHZhbHVlKSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQXBwbGllcyBhIHByb3BlcnR5IHRvIGEgZ2l2ZW4gRWxlbWVudC5cbiAqIEBwYXJhbSBlbCBUaGUgZWxlbWVudCB0byBhcHBseSB0aGUgcHJvcGVydHkgdG8uXG4gKiBAcGFyYW0gbmFtZSBUaGUgcHJvcGVydHkncyBuYW1lLlxuICogQHBhcmFtIHZhbHVlIFRoZSBwcm9wZXJ0eSdzIHZhbHVlLlxuICovXG5mdW5jdGlvbiBhcHBseVByb3AoZWw6IEVsZW1lbnQsIG5hbWU6IHN0cmluZywgdmFsdWU6IHVua25vd24pIHtcbiAgKGVsIGFzIGFueSlbbmFtZV0gPSB2YWx1ZTtcbn1cblxuLyoqXG4gKiBBcHBsaWVzIGEgdmFsdWUgdG8gYSBzdHlsZSBkZWNsYXJhdGlvbi4gU3VwcG9ydHMgQ1NTIGN1c3RvbSBwcm9wZXJ0aWVzIGJ5XG4gKiBzZXR0aW5nIHByb3BlcnRpZXMgY29udGFpbmluZyBhIGRhc2ggdXNpbmcgQ1NTU3R5bGVEZWNsYXJhdGlvbi5zZXRQcm9wZXJ0eS5cbiAqIEBwYXJhbSBzdHlsZSBBIHN0eWxlIGRlY2xhcmF0aW9uLlxuICogQHBhcmFtIHByb3AgVGhlIHByb3BlcnR5IHRvIGFwcGx5LiBUaGlzIGNhbiBiZSBlaXRoZXIgY2FtZWxjYXNlIG9yIGRhc2hcbiAqICAgIHNlcGFyYXRlZC4gRm9yIGV4YW1wbGU6IFwiYmFja2dyb3VuZENvbG9yXCIgYW5kIFwiYmFja2dyb3VuZC1jb2xvclwiIGFyZSBib3RoXG4gKiAgICBzdXBwb3J0ZWQuXG4gKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIG9mIHRoZSBwcm9wZXJ0eS5cbiAqL1xuZnVuY3Rpb24gc2V0U3R5bGVWYWx1ZShcbiAgc3R5bGU6IENTU1N0eWxlRGVjbGFyYXRpb24sXG4gIHByb3A6IHN0cmluZyxcbiAgdmFsdWU6IHN0cmluZ1xuKSB7XG4gIGlmIChwcm9wLmluZGV4T2YoXCItXCIpID49IDApIHtcbiAgICBzdHlsZS5zZXRQcm9wZXJ0eShwcm9wLCB2YWx1ZSk7XG4gIH0gZWxzZSB7XG4gICAgKHN0eWxlIGFzIGFueSlbcHJvcF0gPSB2YWx1ZTtcbiAgfVxufVxuXG4vKipcbiAqIEFwcGxpZXMgYSBzdHlsZSB0byBhbiBFbGVtZW50LiBObyB2ZW5kb3IgcHJlZml4IGV4cGFuc2lvbiBpcyBkb25lIGZvclxuICogcHJvcGVydHkgbmFtZXMvdmFsdWVzLlxuICogQHBhcmFtIGVsIFRoZSBFbGVtZW50IHRvIGFwcGx5IHRoZSBzdHlsZSBmb3IuXG4gKiBAcGFyYW0gbmFtZSBUaGUgYXR0cmlidXRlJ3MgbmFtZS5cbiAqIEBwYXJhbSAgc3R5bGUgVGhlIHN0eWxlIHRvIHNldC4gRWl0aGVyIGEgc3RyaW5nIG9mIGNzcyBvciBhbiBvYmplY3RcbiAqICAgICBjb250YWluaW5nIHByb3BlcnR5LXZhbHVlIHBhaXJzLlxuICovXG5mdW5jdGlvbiBhcHBseVN0eWxlKFxuICBlbDogRWxlbWVudCxcbiAgbmFtZTogc3RyaW5nLFxuICBzdHlsZTogc3RyaW5nIHwgeyBbazogc3RyaW5nXTogc3RyaW5nIH1cbikge1xuICAvLyBNYXRoTUwgZWxlbWVudHMgaW5oZXJpdCBmcm9tIEVsZW1lbnQsIHdoaWNoIGRvZXMgbm90IGhhdmUgc3R5bGUuIFdlIGNhbm5vdFxuICAvLyBkbyBgaW5zdGFuY2VvZiBIVE1MRWxlbWVudGAgLyBgaW5zdGFuY2VvZiBTVkdFbGVtZW50YCwgc2luY2UgZWwgY2FuIGJlbG9uZ1xuICAvLyB0byBhIGRpZmZlcmVudCBkb2N1bWVudCwgc28ganVzdCBjaGVjayB0aGF0IGl0IGhhcyBhIHN0eWxlLlxuICBhc3NlcnQoXCJzdHlsZVwiIGluIGVsKTtcbiAgY29uc3QgZWxTdHlsZSA9ICg8SFRNTEVsZW1lbnQgfCBTVkdFbGVtZW50PmVsKS5zdHlsZTtcblxuICBpZiAodHlwZW9mIHN0eWxlID09PSBcInN0cmluZ1wiKSB7XG4gICAgZWxTdHlsZS5jc3NUZXh0ID0gc3R5bGU7XG4gIH0gZWxzZSB7XG4gICAgZWxTdHlsZS5jc3NUZXh0ID0gXCJcIjtcblxuICAgIGZvciAoY29uc3QgcHJvcCBpbiBzdHlsZSkge1xuICAgICAgaWYgKGhhcyhzdHlsZSwgcHJvcCkpIHtcbiAgICAgICAgc2V0U3R5bGVWYWx1ZShlbFN0eWxlLCBwcm9wLCBzdHlsZVtwcm9wXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogVXBkYXRlcyBhIHNpbmdsZSBhdHRyaWJ1dGUgb24gYW4gRWxlbWVudC5cbiAqIEBwYXJhbSBlbCBUaGUgRWxlbWVudCB0byBhcHBseSB0aGUgYXR0cmlidXRlIHRvLlxuICogQHBhcmFtIG5hbWUgVGhlIGF0dHJpYnV0ZSdzIG5hbWUuXG4gKiBAcGFyYW0gdmFsdWUgVGhlIGF0dHJpYnV0ZSdzIHZhbHVlLiBJZiB0aGUgdmFsdWUgaXMgYW4gb2JqZWN0IG9yXG4gKiAgICAgZnVuY3Rpb24gaXQgaXMgc2V0IG9uIHRoZSBFbGVtZW50LCBvdGhlcndpc2UsIGl0IGlzIHNldCBhcyBhbiBIVE1MXG4gKiAgICAgYXR0cmlidXRlLlxuICovXG5mdW5jdGlvbiBhcHBseUF0dHJpYnV0ZVR5cGVkKGVsOiBFbGVtZW50LCBuYW1lOiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKSB7XG4gIGNvbnN0IHR5cGUgPSB0eXBlb2YgdmFsdWU7XG5cbiAgaWYgKHR5cGUgPT09IFwib2JqZWN0XCIgfHwgdHlwZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgYXBwbHlQcm9wKGVsLCBuYW1lLCB2YWx1ZSk7XG4gIH0gZWxzZSB7XG4gICAgYXBwbHlBdHRyKGVsLCBuYW1lLCB2YWx1ZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBBIHB1YmxpY2x5IG11dGFibGUgb2JqZWN0IHRvIHByb3ZpZGUgY3VzdG9tIG11dGF0b3JzIGZvciBhdHRyaWJ1dGVzLlxuICogTkI6IFRoZSByZXN1bHQgb2YgY3JlYXRlTWFwKCkgaGFzIHRvIGJlIHJlY2FzdCBzaW5jZSBjbG9zdXJlIGNvbXBpbGVyXG4gKiB3aWxsIGp1c3QgYXNzdW1lIGF0dHJpYnV0ZXMgaXMgXCJhbnlcIiBvdGhlcndpc2UgYW5kIHRocm93cyBhd2F5XG4gKiB0aGUgdHlwZSBhbm5vdGF0aW9uIHNldCBieSB0c2lja2xlLlxuICovXG5jb25zdCBhdHRyaWJ1dGVzOiBBdHRyTXV0YXRvckNvbmZpZyA9IGNyZWF0ZU1hcCgpIGFzIEF0dHJNdXRhdG9yQ29uZmlnO1xuXG4vLyBTcGVjaWFsIGdlbmVyaWMgbXV0YXRvciB0aGF0J3MgY2FsbGVkIGZvciBhbnkgYXR0cmlidXRlIHRoYXQgZG9lcyBub3Rcbi8vIGhhdmUgYSBzcGVjaWZpYyBtdXRhdG9yLlxuYXR0cmlidXRlc1tzeW1ib2xzLmRlZmF1bHRdID0gYXBwbHlBdHRyaWJ1dGVUeXBlZDtcblxuYXR0cmlidXRlc1tcInN0eWxlXCJdID0gYXBwbHlTdHlsZTtcblxuLyoqXG4gKiBDYWxscyB0aGUgYXBwcm9wcmlhdGUgYXR0cmlidXRlIG11dGF0b3IgZm9yIHRoaXMgYXR0cmlidXRlLlxuICogQHBhcmFtIGVsIFRoZSBFbGVtZW50IHRvIGFwcGx5IHRoZSBhdHRyaWJ1dGUgdG8uXG4gKiBAcGFyYW0gbmFtZSBUaGUgYXR0cmlidXRlJ3MgbmFtZS5cbiAqIEBwYXJhbSB2YWx1ZSBUaGUgYXR0cmlidXRlJ3MgdmFsdWUuIElmIHRoZSB2YWx1ZSBpcyBhbiBvYmplY3Qgb3JcbiAqICAgICBmdW5jdGlvbiBpdCBpcyBzZXQgb24gdGhlIEVsZW1lbnQsIG90aGVyd2lzZSwgaXQgaXMgc2V0IGFzIGFuIEhUTUxcbiAqICAgICBhdHRyaWJ1dGUuXG4gKi9cbmZ1bmN0aW9uIHVwZGF0ZUF0dHJpYnV0ZShlbDogRWxlbWVudCwgbmFtZTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bikge1xuICBjb25zdCBtdXRhdG9yID0gYXR0cmlidXRlc1tuYW1lXSB8fCBhdHRyaWJ1dGVzW3N5bWJvbHMuZGVmYXVsdF07XG4gIG11dGF0b3IoZWwsIG5hbWUsIHZhbHVlKTtcbn1cblxuZXhwb3J0IHsgdXBkYXRlQXR0cmlidXRlLCBhcHBseVByb3AsIGFwcGx5QXR0ciwgYXR0cmlidXRlcyB9O1xuIl19