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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tX3V0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9yZWxlYXNlL2RvbV91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7OztHQWNHO0FBRUgsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUV0Qzs7Ozs7O0dBTUc7QUFDSCxTQUFTLGNBQWMsQ0FBQyxJQUFVO0lBQ2hDLE9BQU8sSUFBSSxDQUFDLFFBQVEsS0FBSyxFQUFFLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxDQUFDLENBQUM7QUFDckQsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFTLFNBQVMsQ0FBQyxJQUFVO0lBQzNCLE9BQU8sSUFBSSxDQUFDLFFBQVEsS0FBSyxDQUFDLENBQUM7QUFDN0IsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFTLE1BQU0sQ0FBQyxJQUFVO0lBQ3hCLE9BQU8sSUFBSSxDQUFDLFFBQVEsS0FBSyxDQUFDLENBQUM7QUFDN0IsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFTLFdBQVcsQ0FBQyxJQUFVLEVBQUUsSUFBaUI7SUFDaEQsTUFBTSxRQUFRLEdBQWdCLEVBQUUsQ0FBQztJQUNqQyxJQUFJLEdBQUcsR0FBZ0IsSUFBSSxDQUFDO0lBRTVCLE9BQU8sR0FBRyxLQUFLLElBQUksRUFBRTtRQUNuQixNQUFNLENBQUMsR0FBUyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDNUIsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqQixHQUFHLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQztLQUNwQjtJQUVELE9BQU8sUUFBUSxDQUFDO0FBQ2xCLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLFdBQVcsR0FDZCxJQUFZLENBQUMsU0FBUyxDQUFDLFdBQVc7SUFDbkM7UUFDRSxJQUFJLEdBQUcsR0FBZ0IsSUFBWSxDQUFDO1FBQ3BDLElBQUksSUFBSSxHQUFHLEdBQUcsQ0FBQztRQUVmLE9BQU8sR0FBRyxFQUFFO1lBQ1YsSUFBSSxHQUFHLEdBQUcsQ0FBQztZQUNYLEdBQUcsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDO1NBQ3RCO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDLENBQUM7QUFFSjs7OztHQUlHO0FBQ0gsU0FBUyxnQkFBZ0IsQ0FBQyxJQUFVO0lBQ2xDLE1BQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDcEMsT0FBTyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUMxRCxDQUFDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsU0FBUyxjQUFjLENBQUMsSUFBVSxFQUFFLElBQWlCO0lBQ25ELE1BQU0sYUFBYSxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBRTdDLElBQUksQ0FBQyxhQUFhLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxFQUFFO1FBQ25ELE9BQU8sRUFBRSxDQUFDO0tBQ1g7SUFFRCxPQUFPLFdBQVcsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDMUMsQ0FBQztBQUVEOzs7Ozs7R0FNRztBQUNILFNBQVMsVUFBVSxDQUFDLFVBQWdCLEVBQUUsSUFBVSxFQUFFLGFBQTBCO0lBQzFFLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUM3QyxJQUFJLEdBQUcsR0FBRyxhQUFhLENBQUM7SUFFeEIsT0FBTyxHQUFHLEtBQUssSUFBSSxJQUFJLEdBQUcsS0FBSyxJQUFJLEVBQUU7UUFDbkMsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQztRQUM3QixVQUFVLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1FBQ2xELEdBQUcsR0FBRyxJQUFJLENBQUM7S0FDWjtBQUNILENBQUM7QUFFRCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE4IFRoZSBJbmNyZW1lbnRhbCBET00gQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7IGFzc2VydCB9IGZyb20gXCIuL2Fzc2VydGlvbnNcIjtcblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIG5vZGUgaXMgdGhlIHJvb3Qgb2YgYSBkb2N1bWVudC4gVGhpcyBpcyBlaXRoZXIgYSBEb2N1bWVudFxuICogb3IgU2hhZG93Um9vdC4gRG9jdW1lbnRGcmFnbWVudHMgYXJlIGluY2x1ZGVkIGZvciBzaW1wbGljaXR5IG9mIHRoZVxuICogaW1wbGVtZW50YXRpb24sIHRob3VnaCB3ZSBvbmx5IHdhbnQgdG8gY29uc2lkZXIgRG9jdW1lbnRzIG9yIFNoYWRvd1Jvb3RzLlxuICogQHBhcmFtIG5vZGUgVGhlIG5vZGUgdG8gY2hlY2suXG4gKiBAcmV0dXJuIFRydWUgaWYgdGhlIG5vZGUgdGhlIHJvb3Qgb2YgYSBkb2N1bWVudCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5mdW5jdGlvbiBpc0RvY3VtZW50Um9vdChub2RlOiBOb2RlKTogbm9kZSBpcyBEb2N1bWVudCB8IFNoYWRvd1Jvb3Qge1xuICByZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gMTEgfHwgbm9kZS5ub2RlVHlwZSA9PT0gOTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIG5vZGUgaXMgYW4gRWxlbWVudC4gVGhpcyBpcyBmYXN0ZXIgdGhhbiBhbiBpbnN0YW5jZW9mIGNoZWNrLlxuICogQHBhcmFtIG5vZGUgVGhlIG5vZGUgdG8gY2hlY2suXG4gKiBAcmV0dXJuIFdoZXRoZXIgb3Igbm90IHRoZSBub2RlIGlzIGFuIEVsZW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGlzRWxlbWVudChub2RlOiBOb2RlKTogbm9kZSBpcyBFbGVtZW50IHtcbiAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IDE7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBub2RlIGlzIGEgdGV4dCBub2RlLiBUaGlzIGlzIGZhc3RlciB0aGFuIGFuIGluc3RhbmNlb2YgY2hlY2suXG4gKiBAcGFyYW0gbm9kZSBUaGUgbm9kZSB0byBjaGVjay5cbiAqIEByZXR1cm4gV2hldGhlciBvciBub3QgdGhlIG5vZGUgaXMgYSBUZXh0LlxuICovXG5mdW5jdGlvbiBpc1RleHQobm9kZTogTm9kZSk6IG5vZGUgaXMgVGV4dCB7XG4gIHJldHVybiBub2RlLm5vZGVUeXBlID09PSAzO1xufVxuXG4vKipcbiAqIEBwYXJhbSAgbm9kZSBUaGUgbm9kZSB0byBzdGFydCBhdCwgaW5jbHVzaXZlLlxuICogQHBhcmFtICByb290IFRoZSByb290IGFuY2VzdG9yIHRvIGdldCB1bnRpbCwgZXhjbHVzaXZlLlxuICogQHJldHVybiBUaGUgYW5jZXN0cnkgb2YgRE9NIG5vZGVzLlxuICovXG5mdW5jdGlvbiBnZXRBbmNlc3RyeShub2RlOiBOb2RlLCByb290OiBOb2RlIHwgbnVsbCkge1xuICBjb25zdCBhbmNlc3RyeTogQXJyYXk8Tm9kZT4gPSBbXTtcbiAgbGV0IGN1cjogTm9kZSB8IG51bGwgPSBub2RlO1xuXG4gIHdoaWxlIChjdXIgIT09IHJvb3QpIHtcbiAgICBjb25zdCBuOiBOb2RlID0gYXNzZXJ0KGN1cik7XG4gICAgYW5jZXN0cnkucHVzaChuKTtcbiAgICBjdXIgPSBuLnBhcmVudE5vZGU7XG4gIH1cblxuICByZXR1cm4gYW5jZXN0cnk7XG59XG5cbi8qKlxuICogQHBhcmFtIHRoaXNcbiAqIEByZXR1cm5zIFRoZSByb290IG5vZGUgb2YgdGhlIERPTSB0cmVlIHRoYXQgY29udGFpbnMgdGhpcyBub2RlLlxuICovXG5jb25zdCBnZXRSb290Tm9kZSA9XG4gIChOb2RlIGFzIGFueSkucHJvdG90eXBlLmdldFJvb3ROb2RlIHx8XG4gIGZ1bmN0aW9uKHRoaXM6IE5vZGUpIHtcbiAgICBsZXQgY3VyOiBOb2RlIHwgbnVsbCA9IHRoaXMgYXMgTm9kZTtcbiAgICBsZXQgcHJldiA9IGN1cjtcblxuICAgIHdoaWxlIChjdXIpIHtcbiAgICAgIHByZXYgPSBjdXI7XG4gICAgICBjdXIgPSBjdXIucGFyZW50Tm9kZTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJldjtcbiAgfTtcblxuLyoqXG4gKiBAcGFyYW0gbm9kZSBUaGUgbm9kZSB0byBnZXQgdGhlIGFjdGl2ZUVsZW1lbnQgZm9yLlxuICogQHJldHVybnMgVGhlIGFjdGl2ZUVsZW1lbnQgaW4gdGhlIERvY3VtZW50IG9yIFNoYWRvd1Jvb3RcbiAqICAgICBjb3JyZXNwb25kaW5nIHRvIG5vZGUsIGlmIHByZXNlbnQuXG4gKi9cbmZ1bmN0aW9uIGdldEFjdGl2ZUVsZW1lbnQobm9kZTogTm9kZSk6IEVsZW1lbnQgfCBudWxsIHtcbiAgY29uc3Qgcm9vdCA9IGdldFJvb3ROb2RlLmNhbGwobm9kZSk7XG4gIHJldHVybiBpc0RvY3VtZW50Um9vdChyb290KSA/IHJvb3QuYWN0aXZlRWxlbWVudCA6IG51bGw7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgcGF0aCBvZiBub2RlcyB0aGF0IGNvbnRhaW4gdGhlIGZvY3VzZWQgbm9kZSBpbiB0aGUgc2FtZSBkb2N1bWVudCBhc1xuICogYSByZWZlcmVuY2Ugbm9kZSwgdXAgdW50aWwgdGhlIHJvb3QuXG4gKiBAcGFyYW0gbm9kZSBUaGUgcmVmZXJlbmNlIG5vZGUgdG8gZ2V0IHRoZSBhY3RpdmVFbGVtZW50IGZvci5cbiAqIEBwYXJhbSByb290IFRoZSByb290IHRvIGdldCB0aGUgZm9jdXNlZCBwYXRoIHVudGlsLlxuICogQHJldHVybnMgVGhlIHBhdGggb2YgZm9jdXNlZCBwYXJlbnRzLCBpZiBhbnkgZXhpc3QuXG4gKi9cbmZ1bmN0aW9uIGdldEZvY3VzZWRQYXRoKG5vZGU6IE5vZGUsIHJvb3Q6IE5vZGUgfCBudWxsKTogQXJyYXk8Tm9kZT4ge1xuICBjb25zdCBhY3RpdmVFbGVtZW50ID0gZ2V0QWN0aXZlRWxlbWVudChub2RlKTtcblxuICBpZiAoIWFjdGl2ZUVsZW1lbnQgfHwgIW5vZGUuY29udGFpbnMoYWN0aXZlRWxlbWVudCkpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICByZXR1cm4gZ2V0QW5jZXN0cnkoYWN0aXZlRWxlbWVudCwgcm9vdCk7XG59XG5cbi8qKlxuICogTGlrZSBpbnNlcnRCZWZvcmUsIGJ1dCBpbnN0ZWFkIGluc3RlYWQgb2YgbW92aW5nIHRoZSBkZXNpcmVkIG5vZGUsIGluc3RlYWRcbiAqIG1vdmVzIGFsbCB0aGUgb3RoZXIgbm9kZXMgYWZ0ZXIuXG4gKiBAcGFyYW0gcGFyZW50Tm9kZVxuICogQHBhcmFtIG5vZGVcbiAqIEBwYXJhbSByZWZlcmVuY2VOb2RlXG4gKi9cbmZ1bmN0aW9uIG1vdmVCZWZvcmUocGFyZW50Tm9kZTogTm9kZSwgbm9kZTogTm9kZSwgcmVmZXJlbmNlTm9kZTogTm9kZSB8IG51bGwpIHtcbiAgY29uc3QgaW5zZXJ0UmVmZXJlbmNlTm9kZSA9IG5vZGUubmV4dFNpYmxpbmc7XG4gIGxldCBjdXIgPSByZWZlcmVuY2VOb2RlO1xuXG4gIHdoaWxlIChjdXIgIT09IG51bGwgJiYgY3VyICE9PSBub2RlKSB7XG4gICAgY29uc3QgbmV4dCA9IGN1ci5uZXh0U2libGluZztcbiAgICBwYXJlbnROb2RlLmluc2VydEJlZm9yZShjdXIsIGluc2VydFJlZmVyZW5jZU5vZGUpO1xuICAgIGN1ciA9IG5leHQ7XG4gIH1cbn1cblxuZXhwb3J0IHsgaXNFbGVtZW50LCBpc1RleHQsIGdldEZvY3VzZWRQYXRoLCBtb3ZlQmVmb3JlIH07XG4iXX0=