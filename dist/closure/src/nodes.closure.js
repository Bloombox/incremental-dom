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
import { getData, initData } from "./node_data";
/**
 * Gets the namespace to create an element (of a given tag) in.
 * @param tag The tag to get the namespace for.
 * @param parent The current parent Node, if any.
 * @returns The namespace to use,
 */
function getNamespaceForTag(tag, parent) {
    if (tag === "svg") {
        return "http://www.w3.org/2000/svg";
    }
    if (tag === "math") {
        return "http://www.w3.org/1998/Math/MathML";
    }
    if (parent == null) {
        return null;
    }
    if (getData(parent).nameOrCtor === "foreignObject") {
        return null;
    }
    return parent.namespaceURI;
}
/**
 * Creates an Element and initializes the NodeData.
 * @param doc The document with which to create the Element.
 * @param parent The parent of new Element.
 * @param nameOrCtor The tag or constructor for the Element.
 * @param key A key to identify the Element.
 * @returns The newly created Element.
 */
function createElement(doc, parent, nameOrCtor, key) {
    let el;
    if (typeof nameOrCtor === "function") {
        el = new nameOrCtor();
    }
    else {
        const namespace = getNamespaceForTag(nameOrCtor, parent);
        if (namespace) {
            el = doc.createElementNS(namespace, nameOrCtor);
        }
        else {
            el = doc.createElement(nameOrCtor);
        }
    }
    initData(el, nameOrCtor, key);
    return el;
}
/**
 * Creates a Text Node.
 * @param doc The document with which to create the Element.
 * @returns The newly created Text.
 */
function createText(doc) {
    const node = doc.createTextNode("");
    initData(node, "#text", null);
    return node;
}
export { createElement, createText };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbm9kZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7O0dBY0c7QUFFSCxPQUFPLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUdoRDs7Ozs7R0FLRztBQUNILFNBQVMsa0JBQWtCLENBQUMsR0FBVyxFQUFFLE1BQW1CO0lBQzFELElBQUksR0FBRyxLQUFLLEtBQUssRUFBRTtRQUNqQixPQUFPLDRCQUE0QixDQUFDO0tBQ3JDO0lBRUQsSUFBSSxHQUFHLEtBQUssTUFBTSxFQUFFO1FBQ2xCLE9BQU8sb0NBQW9DLENBQUM7S0FDN0M7SUFFRCxJQUFJLE1BQU0sSUFBSSxJQUFJLEVBQUU7UUFDbEIsT0FBTyxJQUFJLENBQUM7S0FDYjtJQUVELElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFVBQVUsS0FBSyxlQUFlLEVBQUU7UUFDbEQsT0FBTyxJQUFJLENBQUM7S0FDYjtJQUVELE9BQU8sTUFBTSxDQUFDLFlBQVksQ0FBQztBQUM3QixDQUFDO0FBRUQ7Ozs7Ozs7R0FPRztBQUNILFNBQVMsYUFBYSxDQUNwQixHQUFhLEVBQ2IsTUFBbUIsRUFDbkIsVUFBeUIsRUFDekIsR0FBUTtJQUVSLElBQUksRUFBRSxDQUFDO0lBRVAsSUFBSSxPQUFPLFVBQVUsS0FBSyxVQUFVLEVBQUU7UUFDcEMsRUFBRSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7S0FDdkI7U0FBTTtRQUNMLE1BQU0sU0FBUyxHQUFHLGtCQUFrQixDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUV6RCxJQUFJLFNBQVMsRUFBRTtZQUNiLEVBQUUsR0FBRyxHQUFHLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztTQUNqRDthQUFNO1lBQ0wsRUFBRSxHQUFHLEdBQUcsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDcEM7S0FDRjtJQUVELFFBQVEsQ0FBQyxFQUFFLEVBQUUsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBRTlCLE9BQU8sRUFBRSxDQUFDO0FBQ1osQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFTLFVBQVUsQ0FBQyxHQUFhO0lBQy9CLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDcEMsUUFBUSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDOUIsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBRUQsT0FBTyxFQUFFLGFBQWEsRUFBRSxVQUFVLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTggVGhlIEluY3JlbWVudGFsIERPTSBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHsgZ2V0RGF0YSwgaW5pdERhdGEgfSBmcm9tIFwiLi9ub2RlX2RhdGFcIjtcbmltcG9ydCB7IEtleSwgTmFtZU9yQ3RvckRlZiB9IGZyb20gXCIuL3R5cGVzXCI7XG5cbi8qKlxuICogR2V0cyB0aGUgbmFtZXNwYWNlIHRvIGNyZWF0ZSBhbiBlbGVtZW50IChvZiBhIGdpdmVuIHRhZykgaW4uXG4gKiBAcGFyYW0gdGFnIFRoZSB0YWcgdG8gZ2V0IHRoZSBuYW1lc3BhY2UgZm9yLlxuICogQHBhcmFtIHBhcmVudCBUaGUgY3VycmVudCBwYXJlbnQgTm9kZSwgaWYgYW55LlxuICogQHJldHVybnMgVGhlIG5hbWVzcGFjZSB0byB1c2UsXG4gKi9cbmZ1bmN0aW9uIGdldE5hbWVzcGFjZUZvclRhZyh0YWc6IHN0cmluZywgcGFyZW50OiBOb2RlIHwgbnVsbCkge1xuICBpZiAodGFnID09PSBcInN2Z1wiKSB7XG4gICAgcmV0dXJuIFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIjtcbiAgfVxuXG4gIGlmICh0YWcgPT09IFwibWF0aFwiKSB7XG4gICAgcmV0dXJuIFwiaHR0cDovL3d3dy53My5vcmcvMTk5OC9NYXRoL01hdGhNTFwiO1xuICB9XG5cbiAgaWYgKHBhcmVudCA9PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBpZiAoZ2V0RGF0YShwYXJlbnQpLm5hbWVPckN0b3IgPT09IFwiZm9yZWlnbk9iamVjdFwiKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4gcGFyZW50Lm5hbWVzcGFjZVVSSTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGFuIEVsZW1lbnQgYW5kIGluaXRpYWxpemVzIHRoZSBOb2RlRGF0YS5cbiAqIEBwYXJhbSBkb2MgVGhlIGRvY3VtZW50IHdpdGggd2hpY2ggdG8gY3JlYXRlIHRoZSBFbGVtZW50LlxuICogQHBhcmFtIHBhcmVudCBUaGUgcGFyZW50IG9mIG5ldyBFbGVtZW50LlxuICogQHBhcmFtIG5hbWVPckN0b3IgVGhlIHRhZyBvciBjb25zdHJ1Y3RvciBmb3IgdGhlIEVsZW1lbnQuXG4gKiBAcGFyYW0ga2V5IEEga2V5IHRvIGlkZW50aWZ5IHRoZSBFbGVtZW50LlxuICogQHJldHVybnMgVGhlIG5ld2x5IGNyZWF0ZWQgRWxlbWVudC5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlRWxlbWVudChcbiAgZG9jOiBEb2N1bWVudCxcbiAgcGFyZW50OiBOb2RlIHwgbnVsbCxcbiAgbmFtZU9yQ3RvcjogTmFtZU9yQ3RvckRlZixcbiAga2V5OiBLZXlcbik6IEVsZW1lbnQge1xuICBsZXQgZWw7XG5cbiAgaWYgKHR5cGVvZiBuYW1lT3JDdG9yID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBlbCA9IG5ldyBuYW1lT3JDdG9yKCk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgbmFtZXNwYWNlID0gZ2V0TmFtZXNwYWNlRm9yVGFnKG5hbWVPckN0b3IsIHBhcmVudCk7XG5cbiAgICBpZiAobmFtZXNwYWNlKSB7XG4gICAgICBlbCA9IGRvYy5jcmVhdGVFbGVtZW50TlMobmFtZXNwYWNlLCBuYW1lT3JDdG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWwgPSBkb2MuY3JlYXRlRWxlbWVudChuYW1lT3JDdG9yKTtcbiAgICB9XG4gIH1cblxuICBpbml0RGF0YShlbCwgbmFtZU9yQ3Rvciwga2V5KTtcblxuICByZXR1cm4gZWw7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIFRleHQgTm9kZS5cbiAqIEBwYXJhbSBkb2MgVGhlIGRvY3VtZW50IHdpdGggd2hpY2ggdG8gY3JlYXRlIHRoZSBFbGVtZW50LlxuICogQHJldHVybnMgVGhlIG5ld2x5IGNyZWF0ZWQgVGV4dC5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlVGV4dChkb2M6IERvY3VtZW50KTogVGV4dCB7XG4gIGNvbnN0IG5vZGUgPSBkb2MuY3JlYXRlVGV4dE5vZGUoXCJcIik7XG4gIGluaXREYXRhKG5vZGUsIFwiI3RleHRcIiwgbnVsbCk7XG4gIHJldHVybiBub2RlO1xufVxuXG5leHBvcnQgeyBjcmVhdGVFbGVtZW50LCBjcmVhdGVUZXh0IH07XG4iXX0=