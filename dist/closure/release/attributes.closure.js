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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXR0cmlidXRlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3JlbGVhc2UvYXR0cmlidXRlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7R0FjRztBQUdILE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDdEMsT0FBTyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFDeEMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUVwQzs7Ozs7R0FLRztBQUNILFNBQVMsWUFBWSxDQUFDLElBQVk7SUFDaEMsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDckMsT0FBTyxzQ0FBc0MsQ0FBQztLQUMvQztJQUVELElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ3ZDLE9BQU8sOEJBQThCLENBQUM7S0FDdkM7SUFFRCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUM7QUFFRDs7Ozs7OztHQU9HO0FBQ0gsU0FBUyxTQUFTLENBQUMsRUFBVyxFQUFFLElBQVksRUFBRSxLQUFjO0lBQzFELElBQUksS0FBSyxJQUFJLElBQUksRUFBRTtRQUNqQixFQUFFLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQzFCO1NBQU07UUFDTCxNQUFNLE1BQU0sR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEMsSUFBSSxNQUFNLEVBQUU7WUFDVixFQUFFLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7U0FDaEQ7YUFBTTtZQUNMLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1NBQ3RDO0tBQ0Y7QUFDSCxDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxTQUFTLFNBQVMsQ0FBQyxFQUFXLEVBQUUsSUFBWSxFQUFFLEtBQWM7SUFDekQsRUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQztBQUM1QixDQUFDO0FBRUQ7Ozs7Ozs7O0dBUUc7QUFDSCxTQUFTLGFBQWEsQ0FDcEIsS0FBMEIsRUFDMUIsSUFBWSxFQUNaLEtBQWE7SUFFYixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQzFCLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQ2hDO1NBQU07UUFDSixLQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDO0tBQzlCO0FBQ0gsQ0FBQztBQUVEOzs7Ozs7O0dBT0c7QUFDSCxTQUFTLFVBQVUsQ0FDakIsRUFBVyxFQUNYLElBQVksRUFDWixLQUF1QztJQUV2Qyw2RUFBNkU7SUFDN0UsNkVBQTZFO0lBQzdFLDhEQUE4RDtJQUM5RCxNQUFNLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ3RCLE1BQU0sT0FBTyxHQUE4QixFQUFHLENBQUMsS0FBSyxDQUFDO0lBRXJELElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO1FBQzdCLE9BQU8sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0tBQ3pCO1NBQU07UUFDTCxPQUFPLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUVyQixLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtZQUN4QixJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUU7Z0JBQ3BCLGFBQWEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2FBQzNDO1NBQ0Y7S0FDRjtBQUNILENBQUM7QUFFRDs7Ozs7OztHQU9HO0FBQ0gsU0FBUyxtQkFBbUIsQ0FBQyxFQUFXLEVBQUUsSUFBWSxFQUFFLEtBQWM7SUFDcEUsTUFBTSxJQUFJLEdBQUcsT0FBTyxLQUFLLENBQUM7SUFFMUIsSUFBSSxJQUFJLEtBQUssUUFBUSxJQUFJLElBQUksS0FBSyxVQUFVLEVBQUU7UUFDNUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDNUI7U0FBTTtRQUNMLFNBQVMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQzVCO0FBQ0gsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsTUFBTSxVQUFVLEdBQXNCLFNBQVMsRUFBdUIsQ0FBQztBQUV2RSx3RUFBd0U7QUFDeEUsMkJBQTJCO0FBQzNCLFVBQVUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsbUJBQW1CLENBQUM7QUFFbEQsVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLFVBQVUsQ0FBQztBQUVqQzs7Ozs7OztHQU9HO0FBQ0gsU0FBUyxlQUFlLENBQUMsRUFBVyxFQUFFLElBQVksRUFBRSxLQUFjO0lBQ2hFLE1BQU0sT0FBTyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2hFLE9BQU8sQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzNCLENBQUM7QUFFRCxPQUFPLEVBQUUsZUFBZSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE4IFRoZSBJbmNyZW1lbnRhbCBET00gQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7IEF0dHJNdXRhdG9yQ29uZmlnIH0gZnJvbSBcIi4vdHlwZXNcIjtcbmltcG9ydCB7IGFzc2VydCB9IGZyb20gXCIuL2Fzc2VydGlvbnNcIjtcbmltcG9ydCB7IGNyZWF0ZU1hcCwgaGFzIH0gZnJvbSBcIi4vdXRpbFwiO1xuaW1wb3J0IHsgc3ltYm9scyB9IGZyb20gXCIuL3N5bWJvbHNcIjtcblxuLyoqXG4gKiBAcGFyYW0gbmFtZSBUaGUgbmFtZSBvZiB0aGUgYXR0cmlidXRlLiBGb3IgZXhhbXBsZSBcInRhYmluZGV4XCIgb3JcbiAqICAgIFwieGxpbms6aHJlZlwiLlxuICogQHJldHVybnMgVGhlIG5hbWVzcGFjZSB0byB1c2UgZm9yIHRoZSBhdHRyaWJ1dGUsIG9yIG51bGwgaWYgdGhlcmUgaXNcbiAqIG5vIG5hbWVzcGFjZS5cbiAqL1xuZnVuY3Rpb24gZ2V0TmFtZXNwYWNlKG5hbWU6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICBpZiAobmFtZS5sYXN0SW5kZXhPZihcInhtbDpcIiwgMCkgPT09IDApIHtcbiAgICByZXR1cm4gXCJodHRwOi8vd3d3LnczLm9yZy9YTUwvMTk5OC9uYW1lc3BhY2VcIjtcbiAgfVxuXG4gIGlmIChuYW1lLmxhc3RJbmRleE9mKFwieGxpbms6XCIsIDApID09PSAwKSB7XG4gICAgcmV0dXJuIFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiO1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogQXBwbGllcyBhbiBhdHRyaWJ1dGUgb3IgcHJvcGVydHkgdG8gYSBnaXZlbiBFbGVtZW50LiBJZiB0aGUgdmFsdWUgaXMgbnVsbFxuICogb3IgdW5kZWZpbmVkLCBpdCBpcyByZW1vdmVkIGZyb20gdGhlIEVsZW1lbnQuIE90aGVyd2lzZSwgdGhlIHZhbHVlIGlzIHNldFxuICogYXMgYW4gYXR0cmlidXRlLlxuICogQHBhcmFtIGVsIFRoZSBlbGVtZW50IHRvIGFwcGx5IHRoZSBhdHRyaWJ1dGUgdG8uXG4gKiBAcGFyYW0gbmFtZSBUaGUgYXR0cmlidXRlJ3MgbmFtZS5cbiAqIEBwYXJhbSB2YWx1ZSBUaGUgYXR0cmlidXRlJ3MgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGFwcGx5QXR0cihlbDogRWxlbWVudCwgbmFtZTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bikge1xuICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgIGVsLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBhdHRyTlMgPSBnZXROYW1lc3BhY2UobmFtZSk7XG4gICAgaWYgKGF0dHJOUykge1xuICAgICAgZWwuc2V0QXR0cmlidXRlTlMoYXR0ck5TLCBuYW1lLCBTdHJpbmcodmFsdWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWwuc2V0QXR0cmlidXRlKG5hbWUsIFN0cmluZyh2YWx1ZSkpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFwcGxpZXMgYSBwcm9wZXJ0eSB0byBhIGdpdmVuIEVsZW1lbnQuXG4gKiBAcGFyYW0gZWwgVGhlIGVsZW1lbnQgdG8gYXBwbHkgdGhlIHByb3BlcnR5IHRvLlxuICogQHBhcmFtIG5hbWUgVGhlIHByb3BlcnR5J3MgbmFtZS5cbiAqIEBwYXJhbSB2YWx1ZSBUaGUgcHJvcGVydHkncyB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gYXBwbHlQcm9wKGVsOiBFbGVtZW50LCBuYW1lOiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKSB7XG4gIChlbCBhcyBhbnkpW25hbWVdID0gdmFsdWU7XG59XG5cbi8qKlxuICogQXBwbGllcyBhIHZhbHVlIHRvIGEgc3R5bGUgZGVjbGFyYXRpb24uIFN1cHBvcnRzIENTUyBjdXN0b20gcHJvcGVydGllcyBieVxuICogc2V0dGluZyBwcm9wZXJ0aWVzIGNvbnRhaW5pbmcgYSBkYXNoIHVzaW5nIENTU1N0eWxlRGVjbGFyYXRpb24uc2V0UHJvcGVydHkuXG4gKiBAcGFyYW0gc3R5bGUgQSBzdHlsZSBkZWNsYXJhdGlvbi5cbiAqIEBwYXJhbSBwcm9wIFRoZSBwcm9wZXJ0eSB0byBhcHBseS4gVGhpcyBjYW4gYmUgZWl0aGVyIGNhbWVsY2FzZSBvciBkYXNoXG4gKiAgICBzZXBhcmF0ZWQuIEZvciBleGFtcGxlOiBcImJhY2tncm91bmRDb2xvclwiIGFuZCBcImJhY2tncm91bmQtY29sb3JcIiBhcmUgYm90aFxuICogICAgc3VwcG9ydGVkLlxuICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSBvZiB0aGUgcHJvcGVydHkuXG4gKi9cbmZ1bmN0aW9uIHNldFN0eWxlVmFsdWUoXG4gIHN0eWxlOiBDU1NTdHlsZURlY2xhcmF0aW9uLFxuICBwcm9wOiBzdHJpbmcsXG4gIHZhbHVlOiBzdHJpbmdcbikge1xuICBpZiAocHJvcC5pbmRleE9mKFwiLVwiKSA+PSAwKSB7XG4gICAgc3R5bGUuc2V0UHJvcGVydHkocHJvcCwgdmFsdWUpO1xuICB9IGVsc2Uge1xuICAgIChzdHlsZSBhcyBhbnkpW3Byb3BdID0gdmFsdWU7XG4gIH1cbn1cblxuLyoqXG4gKiBBcHBsaWVzIGEgc3R5bGUgdG8gYW4gRWxlbWVudC4gTm8gdmVuZG9yIHByZWZpeCBleHBhbnNpb24gaXMgZG9uZSBmb3JcbiAqIHByb3BlcnR5IG5hbWVzL3ZhbHVlcy5cbiAqIEBwYXJhbSBlbCBUaGUgRWxlbWVudCB0byBhcHBseSB0aGUgc3R5bGUgZm9yLlxuICogQHBhcmFtIG5hbWUgVGhlIGF0dHJpYnV0ZSdzIG5hbWUuXG4gKiBAcGFyYW0gIHN0eWxlIFRoZSBzdHlsZSB0byBzZXQuIEVpdGhlciBhIHN0cmluZyBvZiBjc3Mgb3IgYW4gb2JqZWN0XG4gKiAgICAgY29udGFpbmluZyBwcm9wZXJ0eS12YWx1ZSBwYWlycy5cbiAqL1xuZnVuY3Rpb24gYXBwbHlTdHlsZShcbiAgZWw6IEVsZW1lbnQsXG4gIG5hbWU6IHN0cmluZyxcbiAgc3R5bGU6IHN0cmluZyB8IHsgW2s6IHN0cmluZ106IHN0cmluZyB9XG4pIHtcbiAgLy8gTWF0aE1MIGVsZW1lbnRzIGluaGVyaXQgZnJvbSBFbGVtZW50LCB3aGljaCBkb2VzIG5vdCBoYXZlIHN0eWxlLiBXZSBjYW5ub3RcbiAgLy8gZG8gYGluc3RhbmNlb2YgSFRNTEVsZW1lbnRgIC8gYGluc3RhbmNlb2YgU1ZHRWxlbWVudGAsIHNpbmNlIGVsIGNhbiBiZWxvbmdcbiAgLy8gdG8gYSBkaWZmZXJlbnQgZG9jdW1lbnQsIHNvIGp1c3QgY2hlY2sgdGhhdCBpdCBoYXMgYSBzdHlsZS5cbiAgYXNzZXJ0KFwic3R5bGVcIiBpbiBlbCk7XG4gIGNvbnN0IGVsU3R5bGUgPSAoPEhUTUxFbGVtZW50IHwgU1ZHRWxlbWVudD5lbCkuc3R5bGU7XG5cbiAgaWYgKHR5cGVvZiBzdHlsZSA9PT0gXCJzdHJpbmdcIikge1xuICAgIGVsU3R5bGUuY3NzVGV4dCA9IHN0eWxlO1xuICB9IGVsc2Uge1xuICAgIGVsU3R5bGUuY3NzVGV4dCA9IFwiXCI7XG5cbiAgICBmb3IgKGNvbnN0IHByb3AgaW4gc3R5bGUpIHtcbiAgICAgIGlmIChoYXMoc3R5bGUsIHByb3ApKSB7XG4gICAgICAgIHNldFN0eWxlVmFsdWUoZWxTdHlsZSwgcHJvcCwgc3R5bGVbcHJvcF0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFVwZGF0ZXMgYSBzaW5nbGUgYXR0cmlidXRlIG9uIGFuIEVsZW1lbnQuXG4gKiBAcGFyYW0gZWwgVGhlIEVsZW1lbnQgdG8gYXBwbHkgdGhlIGF0dHJpYnV0ZSB0by5cbiAqIEBwYXJhbSBuYW1lIFRoZSBhdHRyaWJ1dGUncyBuYW1lLlxuICogQHBhcmFtIHZhbHVlIFRoZSBhdHRyaWJ1dGUncyB2YWx1ZS4gSWYgdGhlIHZhbHVlIGlzIGFuIG9iamVjdCBvclxuICogICAgIGZ1bmN0aW9uIGl0IGlzIHNldCBvbiB0aGUgRWxlbWVudCwgb3RoZXJ3aXNlLCBpdCBpcyBzZXQgYXMgYW4gSFRNTFxuICogICAgIGF0dHJpYnV0ZS5cbiAqL1xuZnVuY3Rpb24gYXBwbHlBdHRyaWJ1dGVUeXBlZChlbDogRWxlbWVudCwgbmFtZTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bikge1xuICBjb25zdCB0eXBlID0gdHlwZW9mIHZhbHVlO1xuXG4gIGlmICh0eXBlID09PSBcIm9iamVjdFwiIHx8IHR5cGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIGFwcGx5UHJvcChlbCwgbmFtZSwgdmFsdWUpO1xuICB9IGVsc2Uge1xuICAgIGFwcGx5QXR0cihlbCwgbmFtZSwgdmFsdWUpO1xuICB9XG59XG5cbi8qKlxuICogQSBwdWJsaWNseSBtdXRhYmxlIG9iamVjdCB0byBwcm92aWRlIGN1c3RvbSBtdXRhdG9ycyBmb3IgYXR0cmlidXRlcy5cbiAqIE5COiBUaGUgcmVzdWx0IG9mIGNyZWF0ZU1hcCgpIGhhcyB0byBiZSByZWNhc3Qgc2luY2UgY2xvc3VyZSBjb21waWxlclxuICogd2lsbCBqdXN0IGFzc3VtZSBhdHRyaWJ1dGVzIGlzIFwiYW55XCIgb3RoZXJ3aXNlIGFuZCB0aHJvd3MgYXdheVxuICogdGhlIHR5cGUgYW5ub3RhdGlvbiBzZXQgYnkgdHNpY2tsZS5cbiAqL1xuY29uc3QgYXR0cmlidXRlczogQXR0ck11dGF0b3JDb25maWcgPSBjcmVhdGVNYXAoKSBhcyBBdHRyTXV0YXRvckNvbmZpZztcblxuLy8gU3BlY2lhbCBnZW5lcmljIG11dGF0b3IgdGhhdCdzIGNhbGxlZCBmb3IgYW55IGF0dHJpYnV0ZSB0aGF0IGRvZXMgbm90XG4vLyBoYXZlIGEgc3BlY2lmaWMgbXV0YXRvci5cbmF0dHJpYnV0ZXNbc3ltYm9scy5kZWZhdWx0XSA9IGFwcGx5QXR0cmlidXRlVHlwZWQ7XG5cbmF0dHJpYnV0ZXNbXCJzdHlsZVwiXSA9IGFwcGx5U3R5bGU7XG5cbi8qKlxuICogQ2FsbHMgdGhlIGFwcHJvcHJpYXRlIGF0dHJpYnV0ZSBtdXRhdG9yIGZvciB0aGlzIGF0dHJpYnV0ZS5cbiAqIEBwYXJhbSBlbCBUaGUgRWxlbWVudCB0byBhcHBseSB0aGUgYXR0cmlidXRlIHRvLlxuICogQHBhcmFtIG5hbWUgVGhlIGF0dHJpYnV0ZSdzIG5hbWUuXG4gKiBAcGFyYW0gdmFsdWUgVGhlIGF0dHJpYnV0ZSdzIHZhbHVlLiBJZiB0aGUgdmFsdWUgaXMgYW4gb2JqZWN0IG9yXG4gKiAgICAgZnVuY3Rpb24gaXQgaXMgc2V0IG9uIHRoZSBFbGVtZW50LCBvdGhlcndpc2UsIGl0IGlzIHNldCBhcyBhbiBIVE1MXG4gKiAgICAgYXR0cmlidXRlLlxuICovXG5mdW5jdGlvbiB1cGRhdGVBdHRyaWJ1dGUoZWw6IEVsZW1lbnQsIG5hbWU6IHN0cmluZywgdmFsdWU6IHVua25vd24pIHtcbiAgY29uc3QgbXV0YXRvciA9IGF0dHJpYnV0ZXNbbmFtZV0gfHwgYXR0cmlidXRlc1tzeW1ib2xzLmRlZmF1bHRdO1xuICBtdXRhdG9yKGVsLCBuYW1lLCB2YWx1ZSk7XG59XG5cbmV4cG9ydCB7IHVwZGF0ZUF0dHJpYnV0ZSwgYXBwbHlQcm9wLCBhcHBseUF0dHIsIGF0dHJpYnV0ZXMgfTtcbiJdfQ==