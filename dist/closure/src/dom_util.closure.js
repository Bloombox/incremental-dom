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
/**
 * Checks if the node is the root of a document. This is either a Document
 * or ShadowRoot. DocumentFragments are included for simplicity of the
 * implementation, though we only want to consider Documents or ShadowRoots.
 * @param node The node to check.
 * @return True if the node the root of a document, false otherwise.
 */
function isDocumentRoot(node) {
    return node.nodeType === 11 || node.nodeType === 9;
}
/**
 * Checks if the node is an Element. This is faster than an instanceof check.
 * @param node The node to check.
 * @return Whether or not the node is an Element.
 */
function isElement(node) {
    return node.nodeType === 1;
}
/**
 * Checks if the node is a text node. This is faster than an instanceof check.
 * @param node The node to check.
 * @return Whether or not the node is a Text.
 */
function isText(node) {
    return node.nodeType === 3;
}
/**
 * @param  node The node to start at, inclusive.
 * @param  root The root ancestor to get until, exclusive.
 * @return The ancestry of DOM nodes.
 */
function getAncestry(node, root) {
    const ancestry = [];
    let cur = node;
    while (cur !== root) {
        const n = assert(cur);
        ancestry.push(n);
        cur = n.parentNode;
    }
    return ancestry;
}
/**
 * @param this
 * @returns The root node of the DOM tree that contains this node.
 */
const getRootNode = Node.prototype.getRootNode ||
    function () {
        let cur = this;
        let prev = cur;
        while (cur) {
            prev = cur;
            cur = cur.parentNode;
        }
        return prev;
    };
/**
 * @param node The node to get the activeElement for.
 * @returns The activeElement in the Document or ShadowRoot
 *     corresponding to node, if present.
 */
function getActiveElement(node) {
    const root = getRootNode.call(node);
    return isDocumentRoot(root) ? root.activeElement : null;
}
/**
 * Gets the path of nodes that contain the focused node in the same document as
 * a reference node, up until the root.
 * @param node The reference node to get the activeElement for.
 * @param root The root to get the focused path until.
 * @returns The path of focused parents, if any exist.
 */
function getFocusedPath(node, root) {
    const activeElement = getActiveElement(node);
    if (!activeElement || !node.contains(activeElement)) {
        return [];
    }
    return getAncestry(activeElement, root);
}
/**
 * Like insertBefore, but instead instead of moving the desired node, instead
 * moves all the other nodes after.
 * @param parentNode
 * @param node
 * @param referenceNode
 */
function moveBefore(parentNode, node, referenceNode) {
    const insertReferenceNode = node.nextSibling;
    let cur = referenceNode;
    while (cur !== null && cur !== node) {
        const next = cur.nextSibling;
        parentNode.insertBefore(cur, insertReferenceNode);
        cur = next;
    }
}
export { isElement, isText, getFocusedPath, moveBefore };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tX3V0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvZG9tX3V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7O0dBY0c7QUFFSCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBRXRDOzs7Ozs7R0FNRztBQUNILFNBQVMsY0FBYyxDQUFDLElBQVU7SUFDaEMsT0FBTyxJQUFJLENBQUMsUUFBUSxLQUFLLEVBQUUsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLENBQUMsQ0FBQztBQUNyRCxDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQVMsU0FBUyxDQUFDLElBQVU7SUFDM0IsT0FBTyxJQUFJLENBQUMsUUFBUSxLQUFLLENBQUMsQ0FBQztBQUM3QixDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQVMsTUFBTSxDQUFDLElBQVU7SUFDeEIsT0FBTyxJQUFJLENBQUMsUUFBUSxLQUFLLENBQUMsQ0FBQztBQUM3QixDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQVMsV0FBVyxDQUFDLElBQVUsRUFBRSxJQUFpQjtJQUNoRCxNQUFNLFFBQVEsR0FBZ0IsRUFBRSxDQUFDO0lBQ2pDLElBQUksR0FBRyxHQUFnQixJQUFJLENBQUM7SUFFNUIsT0FBTyxHQUFHLEtBQUssSUFBSSxFQUFFO1FBQ25CLE1BQU0sQ0FBQyxHQUFTLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM1QixRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLEdBQUcsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDO0tBQ3BCO0lBRUQsT0FBTyxRQUFRLENBQUM7QUFDbEIsQ0FBQztBQUVEOzs7R0FHRztBQUNILE1BQU0sV0FBVyxHQUNkLElBQVksQ0FBQyxTQUFTLENBQUMsV0FBVztJQUNuQztRQUNFLElBQUksR0FBRyxHQUFnQixJQUFZLENBQUM7UUFDcEMsSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDO1FBRWYsT0FBTyxHQUFHLEVBQUU7WUFDVixJQUFJLEdBQUcsR0FBRyxDQUFDO1lBQ1gsR0FBRyxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUM7U0FDdEI7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUMsQ0FBQztBQUVKOzs7O0dBSUc7QUFDSCxTQUFTLGdCQUFnQixDQUFDLElBQVU7SUFDbEMsTUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNwQyxPQUFPLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQzFELENBQUM7QUFFRDs7Ozs7O0dBTUc7QUFDSCxTQUFTLGNBQWMsQ0FBQyxJQUFVLEVBQUUsSUFBaUI7SUFDbkQsTUFBTSxhQUFhLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFN0MsSUFBSSxDQUFDLGFBQWEsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEVBQUU7UUFDbkQsT0FBTyxFQUFFLENBQUM7S0FDWDtJQUVELE9BQU8sV0FBVyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUMxQyxDQUFDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsU0FBUyxVQUFVLENBQUMsVUFBZ0IsRUFBRSxJQUFVLEVBQUUsYUFBMEI7SUFDMUUsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO0lBQzdDLElBQUksR0FBRyxHQUFHLGFBQWEsQ0FBQztJQUV4QixPQUFPLEdBQUcsS0FBSyxJQUFJLElBQUksR0FBRyxLQUFLLElBQUksRUFBRTtRQUNuQyxNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDO1FBQzdCLFVBQVUsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLG1CQUFtQixDQUFDLENBQUM7UUFDbEQsR0FBRyxHQUFHLElBQUksQ0FBQztLQUNaO0FBQ0gsQ0FBQztBQUVELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTggVGhlIEluY3JlbWVudGFsIERPTSBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSBcIi4vYXNzZXJ0aW9uc1wiO1xuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgbm9kZSBpcyB0aGUgcm9vdCBvZiBhIGRvY3VtZW50LiBUaGlzIGlzIGVpdGhlciBhIERvY3VtZW50XG4gKiBvciBTaGFkb3dSb290LiBEb2N1bWVudEZyYWdtZW50cyBhcmUgaW5jbHVkZWQgZm9yIHNpbXBsaWNpdHkgb2YgdGhlXG4gKiBpbXBsZW1lbnRhdGlvbiwgdGhvdWdoIHdlIG9ubHkgd2FudCB0byBjb25zaWRlciBEb2N1bWVudHMgb3IgU2hhZG93Um9vdHMuXG4gKiBAcGFyYW0gbm9kZSBUaGUgbm9kZSB0byBjaGVjay5cbiAqIEByZXR1cm4gVHJ1ZSBpZiB0aGUgbm9kZSB0aGUgcm9vdCBvZiBhIGRvY3VtZW50LCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmZ1bmN0aW9uIGlzRG9jdW1lbnRSb290KG5vZGU6IE5vZGUpOiBub2RlIGlzIERvY3VtZW50IHwgU2hhZG93Um9vdCB7XG4gIHJldHVybiBub2RlLm5vZGVUeXBlID09PSAxMSB8fCBub2RlLm5vZGVUeXBlID09PSA5O1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgbm9kZSBpcyBhbiBFbGVtZW50LiBUaGlzIGlzIGZhc3RlciB0aGFuIGFuIGluc3RhbmNlb2YgY2hlY2suXG4gKiBAcGFyYW0gbm9kZSBUaGUgbm9kZSB0byBjaGVjay5cbiAqIEByZXR1cm4gV2hldGhlciBvciBub3QgdGhlIG5vZGUgaXMgYW4gRWxlbWVudC5cbiAqL1xuZnVuY3Rpb24gaXNFbGVtZW50KG5vZGU6IE5vZGUpOiBub2RlIGlzIEVsZW1lbnQge1xuICByZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gMTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIG5vZGUgaXMgYSB0ZXh0IG5vZGUuIFRoaXMgaXMgZmFzdGVyIHRoYW4gYW4gaW5zdGFuY2VvZiBjaGVjay5cbiAqIEBwYXJhbSBub2RlIFRoZSBub2RlIHRvIGNoZWNrLlxuICogQHJldHVybiBXaGV0aGVyIG9yIG5vdCB0aGUgbm9kZSBpcyBhIFRleHQuXG4gKi9cbmZ1bmN0aW9uIGlzVGV4dChub2RlOiBOb2RlKTogbm9kZSBpcyBUZXh0IHtcbiAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IDM7XG59XG5cbi8qKlxuICogQHBhcmFtICBub2RlIFRoZSBub2RlIHRvIHN0YXJ0IGF0LCBpbmNsdXNpdmUuXG4gKiBAcGFyYW0gIHJvb3QgVGhlIHJvb3QgYW5jZXN0b3IgdG8gZ2V0IHVudGlsLCBleGNsdXNpdmUuXG4gKiBAcmV0dXJuIFRoZSBhbmNlc3RyeSBvZiBET00gbm9kZXMuXG4gKi9cbmZ1bmN0aW9uIGdldEFuY2VzdHJ5KG5vZGU6IE5vZGUsIHJvb3Q6IE5vZGUgfCBudWxsKSB7XG4gIGNvbnN0IGFuY2VzdHJ5OiBBcnJheTxOb2RlPiA9IFtdO1xuICBsZXQgY3VyOiBOb2RlIHwgbnVsbCA9IG5vZGU7XG5cbiAgd2hpbGUgKGN1ciAhPT0gcm9vdCkge1xuICAgIGNvbnN0IG46IE5vZGUgPSBhc3NlcnQoY3VyKTtcbiAgICBhbmNlc3RyeS5wdXNoKG4pO1xuICAgIGN1ciA9IG4ucGFyZW50Tm9kZTtcbiAgfVxuXG4gIHJldHVybiBhbmNlc3RyeTtcbn1cblxuLyoqXG4gKiBAcGFyYW0gdGhpc1xuICogQHJldHVybnMgVGhlIHJvb3Qgbm9kZSBvZiB0aGUgRE9NIHRyZWUgdGhhdCBjb250YWlucyB0aGlzIG5vZGUuXG4gKi9cbmNvbnN0IGdldFJvb3ROb2RlID1cbiAgKE5vZGUgYXMgYW55KS5wcm90b3R5cGUuZ2V0Um9vdE5vZGUgfHxcbiAgZnVuY3Rpb24odGhpczogTm9kZSkge1xuICAgIGxldCBjdXI6IE5vZGUgfCBudWxsID0gdGhpcyBhcyBOb2RlO1xuICAgIGxldCBwcmV2ID0gY3VyO1xuXG4gICAgd2hpbGUgKGN1cikge1xuICAgICAgcHJldiA9IGN1cjtcbiAgICAgIGN1ciA9IGN1ci5wYXJlbnROb2RlO1xuICAgIH1cblxuICAgIHJldHVybiBwcmV2O1xuICB9O1xuXG4vKipcbiAqIEBwYXJhbSBub2RlIFRoZSBub2RlIHRvIGdldCB0aGUgYWN0aXZlRWxlbWVudCBmb3IuXG4gKiBAcmV0dXJucyBUaGUgYWN0aXZlRWxlbWVudCBpbiB0aGUgRG9jdW1lbnQgb3IgU2hhZG93Um9vdFxuICogICAgIGNvcnJlc3BvbmRpbmcgdG8gbm9kZSwgaWYgcHJlc2VudC5cbiAqL1xuZnVuY3Rpb24gZ2V0QWN0aXZlRWxlbWVudChub2RlOiBOb2RlKTogRWxlbWVudCB8IG51bGwge1xuICBjb25zdCByb290ID0gZ2V0Um9vdE5vZGUuY2FsbChub2RlKTtcbiAgcmV0dXJuIGlzRG9jdW1lbnRSb290KHJvb3QpID8gcm9vdC5hY3RpdmVFbGVtZW50IDogbnVsbDtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBwYXRoIG9mIG5vZGVzIHRoYXQgY29udGFpbiB0aGUgZm9jdXNlZCBub2RlIGluIHRoZSBzYW1lIGRvY3VtZW50IGFzXG4gKiBhIHJlZmVyZW5jZSBub2RlLCB1cCB1bnRpbCB0aGUgcm9vdC5cbiAqIEBwYXJhbSBub2RlIFRoZSByZWZlcmVuY2Ugbm9kZSB0byBnZXQgdGhlIGFjdGl2ZUVsZW1lbnQgZm9yLlxuICogQHBhcmFtIHJvb3QgVGhlIHJvb3QgdG8gZ2V0IHRoZSBmb2N1c2VkIHBhdGggdW50aWwuXG4gKiBAcmV0dXJucyBUaGUgcGF0aCBvZiBmb2N1c2VkIHBhcmVudHMsIGlmIGFueSBleGlzdC5cbiAqL1xuZnVuY3Rpb24gZ2V0Rm9jdXNlZFBhdGgobm9kZTogTm9kZSwgcm9vdDogTm9kZSB8IG51bGwpOiBBcnJheTxOb2RlPiB7XG4gIGNvbnN0IGFjdGl2ZUVsZW1lbnQgPSBnZXRBY3RpdmVFbGVtZW50KG5vZGUpO1xuXG4gIGlmICghYWN0aXZlRWxlbWVudCB8fCAhbm9kZS5jb250YWlucyhhY3RpdmVFbGVtZW50KSkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIHJldHVybiBnZXRBbmNlc3RyeShhY3RpdmVFbGVtZW50LCByb290KTtcbn1cblxuLyoqXG4gKiBMaWtlIGluc2VydEJlZm9yZSwgYnV0IGluc3RlYWQgaW5zdGVhZCBvZiBtb3ZpbmcgdGhlIGRlc2lyZWQgbm9kZSwgaW5zdGVhZFxuICogbW92ZXMgYWxsIHRoZSBvdGhlciBub2RlcyBhZnRlci5cbiAqIEBwYXJhbSBwYXJlbnROb2RlXG4gKiBAcGFyYW0gbm9kZVxuICogQHBhcmFtIHJlZmVyZW5jZU5vZGVcbiAqL1xuZnVuY3Rpb24gbW92ZUJlZm9yZShwYXJlbnROb2RlOiBOb2RlLCBub2RlOiBOb2RlLCByZWZlcmVuY2VOb2RlOiBOb2RlIHwgbnVsbCkge1xuICBjb25zdCBpbnNlcnRSZWZlcmVuY2VOb2RlID0gbm9kZS5uZXh0U2libGluZztcbiAgbGV0IGN1ciA9IHJlZmVyZW5jZU5vZGU7XG5cbiAgd2hpbGUgKGN1ciAhPT0gbnVsbCAmJiBjdXIgIT09IG5vZGUpIHtcbiAgICBjb25zdCBuZXh0ID0gY3VyLm5leHRTaWJsaW5nO1xuICAgIHBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGN1ciwgaW5zZXJ0UmVmZXJlbmNlTm9kZSk7XG4gICAgY3VyID0gbmV4dDtcbiAgfVxufVxuXG5leHBvcnQgeyBpc0VsZW1lbnQsIGlzVGV4dCwgZ2V0Rm9jdXNlZFBhdGgsIG1vdmVCZWZvcmUgfTtcbiJdfQ==