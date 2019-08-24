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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9yZWxlYXNlL25vZGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7OztHQWNHO0FBRUgsT0FBTyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFHaEQ7Ozs7O0dBS0c7QUFDSCxTQUFTLGtCQUFrQixDQUFDLEdBQVcsRUFBRSxNQUFtQjtJQUMxRCxJQUFJLEdBQUcsS0FBSyxLQUFLLEVBQUU7UUFDakIsT0FBTyw0QkFBNEIsQ0FBQztLQUNyQztJQUVELElBQUksR0FBRyxLQUFLLE1BQU0sRUFBRTtRQUNsQixPQUFPLG9DQUFvQyxDQUFDO0tBQzdDO0lBRUQsSUFBSSxNQUFNLElBQUksSUFBSSxFQUFFO1FBQ2xCLE9BQU8sSUFBSSxDQUFDO0tBQ2I7SUFFRCxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxVQUFVLEtBQUssZUFBZSxFQUFFO1FBQ2xELE9BQU8sSUFBSSxDQUFDO0tBQ2I7SUFFRCxPQUFPLE1BQU0sQ0FBQyxZQUFZLENBQUM7QUFDN0IsQ0FBQztBQUVEOzs7Ozs7O0dBT0c7QUFDSCxTQUFTLGFBQWEsQ0FDcEIsR0FBYSxFQUNiLE1BQW1CLEVBQ25CLFVBQXlCLEVBQ3pCLEdBQVE7SUFFUixJQUFJLEVBQUUsQ0FBQztJQUVQLElBQUksT0FBTyxVQUFVLEtBQUssVUFBVSxFQUFFO1FBQ3BDLEVBQUUsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO0tBQ3ZCO1NBQU07UUFDTCxNQUFNLFNBQVMsR0FBRyxrQkFBa0IsQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFekQsSUFBSSxTQUFTLEVBQUU7WUFDYixFQUFFLEdBQUcsR0FBRyxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7U0FDakQ7YUFBTTtZQUNMLEVBQUUsR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQ3BDO0tBQ0Y7SUFFRCxRQUFRLENBQUMsRUFBRSxFQUFFLFVBQVUsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUU5QixPQUFPLEVBQUUsQ0FBQztBQUNaLENBQUM7QUFFRDs7OztHQUlHO0FBQ0gsU0FBUyxVQUFVLENBQUMsR0FBYTtJQUMvQixNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3BDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzlCLE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVELE9BQU8sRUFBRSxhQUFhLEVBQUUsVUFBVSxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE4IFRoZSBJbmNyZW1lbnRhbCBET00gQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7IGdldERhdGEsIGluaXREYXRhIH0gZnJvbSBcIi4vbm9kZV9kYXRhXCI7XG5pbXBvcnQgeyBLZXksIE5hbWVPckN0b3JEZWYgfSBmcm9tIFwiLi90eXBlc1wiO1xuXG4vKipcbiAqIEdldHMgdGhlIG5hbWVzcGFjZSB0byBjcmVhdGUgYW4gZWxlbWVudCAob2YgYSBnaXZlbiB0YWcpIGluLlxuICogQHBhcmFtIHRhZyBUaGUgdGFnIHRvIGdldCB0aGUgbmFtZXNwYWNlIGZvci5cbiAqIEBwYXJhbSBwYXJlbnQgVGhlIGN1cnJlbnQgcGFyZW50IE5vZGUsIGlmIGFueS5cbiAqIEByZXR1cm5zIFRoZSBuYW1lc3BhY2UgdG8gdXNlLFxuICovXG5mdW5jdGlvbiBnZXROYW1lc3BhY2VGb3JUYWcodGFnOiBzdHJpbmcsIHBhcmVudDogTm9kZSB8IG51bGwpIHtcbiAgaWYgKHRhZyA9PT0gXCJzdmdcIikge1xuICAgIHJldHVybiBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI7XG4gIH1cblxuICBpZiAodGFnID09PSBcIm1hdGhcIikge1xuICAgIHJldHVybiBcImh0dHA6Ly93d3cudzMub3JnLzE5OTgvTWF0aC9NYXRoTUxcIjtcbiAgfVxuXG4gIGlmIChwYXJlbnQgPT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgaWYgKGdldERhdGEocGFyZW50KS5uYW1lT3JDdG9yID09PSBcImZvcmVpZ25PYmplY3RcIikge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuIHBhcmVudC5uYW1lc3BhY2VVUkk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBFbGVtZW50IGFuZCBpbml0aWFsaXplcyB0aGUgTm9kZURhdGEuXG4gKiBAcGFyYW0gZG9jIFRoZSBkb2N1bWVudCB3aXRoIHdoaWNoIHRvIGNyZWF0ZSB0aGUgRWxlbWVudC5cbiAqIEBwYXJhbSBwYXJlbnQgVGhlIHBhcmVudCBvZiBuZXcgRWxlbWVudC5cbiAqIEBwYXJhbSBuYW1lT3JDdG9yIFRoZSB0YWcgb3IgY29uc3RydWN0b3IgZm9yIHRoZSBFbGVtZW50LlxuICogQHBhcmFtIGtleSBBIGtleSB0byBpZGVudGlmeSB0aGUgRWxlbWVudC5cbiAqIEByZXR1cm5zIFRoZSBuZXdseSBjcmVhdGVkIEVsZW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQoXG4gIGRvYzogRG9jdW1lbnQsXG4gIHBhcmVudDogTm9kZSB8IG51bGwsXG4gIG5hbWVPckN0b3I6IE5hbWVPckN0b3JEZWYsXG4gIGtleTogS2V5XG4pOiBFbGVtZW50IHtcbiAgbGV0IGVsO1xuXG4gIGlmICh0eXBlb2YgbmFtZU9yQ3RvciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgZWwgPSBuZXcgbmFtZU9yQ3RvcigpO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IG5hbWVzcGFjZSA9IGdldE5hbWVzcGFjZUZvclRhZyhuYW1lT3JDdG9yLCBwYXJlbnQpO1xuXG4gICAgaWYgKG5hbWVzcGFjZSkge1xuICAgICAgZWwgPSBkb2MuY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZSwgbmFtZU9yQ3Rvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsID0gZG9jLmNyZWF0ZUVsZW1lbnQobmFtZU9yQ3Rvcik7XG4gICAgfVxuICB9XG5cbiAgaW5pdERhdGEoZWwsIG5hbWVPckN0b3IsIGtleSk7XG5cbiAgcmV0dXJuIGVsO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBUZXh0IE5vZGUuXG4gKiBAcGFyYW0gZG9jIFRoZSBkb2N1bWVudCB3aXRoIHdoaWNoIHRvIGNyZWF0ZSB0aGUgRWxlbWVudC5cbiAqIEByZXR1cm5zIFRoZSBuZXdseSBjcmVhdGVkIFRleHQuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVRleHQoZG9jOiBEb2N1bWVudCk6IFRleHQge1xuICBjb25zdCBub2RlID0gZG9jLmNyZWF0ZVRleHROb2RlKFwiXCIpO1xuICBpbml0RGF0YShub2RlLCBcIiN0ZXh0XCIsIG51bGwpO1xuICByZXR1cm4gbm9kZTtcbn1cblxuZXhwb3J0IHsgY3JlYXRlRWxlbWVudCwgY3JlYXRlVGV4dCB9O1xuIl19