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
import { DEBUG } from "./global";
/**
 * Keeps track whether or not we are in an attributes declaration (after
 * elementOpenStart, but before elementOpenEnd).
 */
let inAttributes = false;
/**
 * Keeps track whether or not we are in an element that should not have its
 * children cleared.
 */
let inSkip = false;
/**
 * Keeps track of whether or not we are in a patch.
 */
let inPatch = false;
/**
 * Asserts that a value exists and is not null or undefined. goog.asserts
 * is not used in order to avoid dependencies on external code.
 * @param val The value to assert is truthy.
 * @returns The value.
 */
function assert(val) {
    if (DEBUG && !val) {
        throw new Error("Expected value to be defined");
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return val;
}
/**
 * Makes sure that there is a current patch context.
 * @param functionName The name of the caller, for the error message.
 */
function assertInPatch(functionName) {
    if (!inPatch) {
        throw new Error("Cannot call " + functionName + "() unless in patch.");
    }
}
/**
 * Makes sure that a patch closes every node that it opened.
 * @param openElement
 * @param root
 */
function assertNoUnclosedTags(openElement, root) {
    if (openElement === root) {
        return;
    }
    let currentElement = openElement;
    const openTags = [];
    while (currentElement && currentElement !== root) {
        openTags.push(currentElement.nodeName.toLowerCase());
        currentElement = currentElement.parentNode;
    }
    throw new Error("One or more tags were not closed:\n" + openTags.join("\n"));
}
/**
 * Makes sure that node being outer patched has a parent node.
 * @param parent
 */
function assertPatchOuterHasParentNode(parent) {
    if (!parent) {
        console.warn("patchOuter requires the node have a parent if there is a key.");
    }
}
/**
 * Makes sure that the caller is not where attributes are expected.
 * @param functionName The name of the caller, for the error message.
 */
function assertNotInAttributes(functionName) {
    if (inAttributes) {
        throw new Error(functionName +
            "() can not be called between " +
            "elementOpenStart() and elementOpenEnd().");
    }
}
/**
 * Makes sure that the caller is not inside an element that has declared skip.
 * @param functionName The name of the caller, for the error message.
 */
function assertNotInSkip(functionName) {
    if (inSkip) {
        throw new Error(functionName +
            "() may not be called inside an element " +
            "that has called skip().");
    }
}
/**
 * Makes sure that the caller is where attributes are expected.
 * @param functionName The name of the caller, for the error message.
 */
function assertInAttributes(functionName) {
    if (!inAttributes) {
        throw new Error(functionName +
            "() can only be called after calling " +
            "elementOpenStart().");
    }
}
/**
 * Makes sure the patch closes virtual attributes call
 */
function assertVirtualAttributesClosed() {
    if (inAttributes) {
        throw new Error("elementOpenEnd() must be called after calling " + "elementOpenStart().");
    }
}
/**
 * Makes sure that tags are correctly nested.
 * @param currentNameOrCtor
 * @param nameOrCtor
 */
function assertCloseMatchesOpenTag(currentNameOrCtor, nameOrCtor) {
    if (currentNameOrCtor !== nameOrCtor) {
        throw new Error('Received a call to close "' +
            nameOrCtor +
            '" but "' +
            currentNameOrCtor +
            '" was open.');
    }
}
/**
 * Makes sure that no children elements have been declared yet in the current
 * element.
 * @param functionName The name of the caller, for the error message.
 * @param previousNode
 */
function assertNoChildrenDeclaredYet(functionName, previousNode) {
    if (previousNode !== null) {
        throw new Error(functionName +
            "() must come before any child " +
            "declarations inside the current element.");
    }
}
/**
 * Checks that a call to patchOuter actually patched the element.
 * @param maybeStartNode The value for the currentNode when the patch
 *     started.
 * @param maybeCurrentNode The currentNode when the patch finished.
 * @param expectedNextNode The Node that is expected to follow the
 *    currentNode after the patch;
 * @param expectedPrevNode The Node that is expected to preceed the
 *    currentNode after the patch.
 */
function assertPatchElementNoExtras(maybeStartNode, maybeCurrentNode, expectedNextNode, expectedPrevNode) {
    const startNode = assert(maybeStartNode);
    const currentNode = assert(maybeCurrentNode);
    const wasUpdated = currentNode.nextSibling === expectedNextNode &&
        currentNode.previousSibling === expectedPrevNode;
    const wasChanged = currentNode.nextSibling === startNode.nextSibling &&
        currentNode.previousSibling === expectedPrevNode;
    const wasRemoved = currentNode === startNode;
    if (!wasUpdated && !wasChanged && !wasRemoved) {
        throw new Error("There must be exactly one top level call corresponding " +
            "to the patched element.");
    }
}
/**
 * @param newContext The current patch context.
 */
function updatePatchContext(newContext) {
    inPatch = newContext != null;
}
/**
 * Updates the state of being in an attribute declaration.
 * @param value Whether or not the patch is in an attribute declaration.
 * @return the previous value.
 */
function setInAttributes(value) {
    const previous = inAttributes;
    inAttributes = value;
    return previous;
}
/**
 * Updates the state of being in a skip element.
 * @param value Whether or not the patch is skipping the children of a
 *    parent node.
 * @return the previous value.
 */
function setInSkip(value) {
    const previous = inSkip;
    inSkip = value;
    return previous;
}
export { assert, assertInPatch, assertNoUnclosedTags, assertNotInAttributes, assertInAttributes, assertCloseMatchesOpenTag, assertVirtualAttributesClosed, assertNoChildrenDeclaredYet, assertNotInSkip, assertPatchElementNoExtras, assertPatchOuterHasParentNode, setInAttributes, setInSkip, updatePatchContext };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXJ0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3JlbGVhc2UvYXNzZXJ0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7R0FjRztBQUVILE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFHakM7OztHQUdHO0FBQ0gsSUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDO0FBRXpCOzs7R0FHRztBQUNILElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQztBQUVuQjs7R0FFRztBQUNILElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQztBQUVwQjs7Ozs7R0FLRztBQUNILFNBQVMsTUFBTSxDQUFlLEdBQXlCO0lBQ3JELElBQUksS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFO1FBQ2pCLE1BQU0sSUFBSSxLQUFLLENBQUMsOEJBQThCLENBQUMsQ0FBQztLQUNqRDtJQUNELG9FQUFvRTtJQUNwRSxPQUFPLEdBQUksQ0FBQztBQUNkLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLGFBQWEsQ0FBQyxZQUFvQjtJQUN6QyxJQUFJLENBQUMsT0FBTyxFQUFFO1FBQ1osTUFBTSxJQUFJLEtBQUssQ0FBQyxjQUFjLEdBQUcsWUFBWSxHQUFHLHFCQUFxQixDQUFDLENBQUM7S0FDeEU7QUFDSCxDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQVMsb0JBQW9CLENBQzNCLFdBQXdCLEVBQ3hCLElBQTZCO0lBRTdCLElBQUksV0FBVyxLQUFLLElBQUksRUFBRTtRQUN4QixPQUFPO0tBQ1I7SUFFRCxJQUFJLGNBQWMsR0FBRyxXQUFXLENBQUM7SUFDakMsTUFBTSxRQUFRLEdBQWtCLEVBQUUsQ0FBQztJQUNuQyxPQUFPLGNBQWMsSUFBSSxjQUFjLEtBQUssSUFBSSxFQUFFO1FBQ2hELFFBQVEsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBQ3JE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ZSxDQUFDLEtBQWM7SUFDckMsTUFBTSxRQUFRLEdBQUcsWUFBWSxDQUFDO0lBQzlCLFlBQVksR0FBRyxLQUFLLENBQUM7SUFDckIsT0FBTyxRQUFRLENBQUM7QUFDbEIsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsU0FBUyxTQUFTLENBQUMsS0FBYztJQUMvQixNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUM7SUFDeEIsTUFBTSxHQUFHLEtBQUssQ0FBQztJQUNmLE9BQU8sUUFBUSxDQUFDO0FBQ2xCLENBQUM7QUFFRCxPQUFPLEVBQ0wsTUFBTSxFQUNOLGFBQWEsRUFDYixvQkFBb0IsRUFDcEIscUJBQXFCLEVBQ3JCLGtCQUFrQixFQUNsQix5QkFBeUIsRUFDekIsNkJBQTZCLEVBQzdCLDJCQUEyQixFQUMzQixlQUFlLEVBQ2YsMEJBQTBCLEVBQzFCLDZCQUE2QixFQUM3QixlQUFlLEVBQ2YsU0FBUyxFQUNULGtCQUFrQixFQUNuQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxOCBUaGUgSW5jcmVtZW50YWwgRE9NIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQgeyBERUJVRyB9IGZyb20gXCIuL2dsb2JhbFwiO1xuaW1wb3J0IHsgTmFtZU9yQ3RvckRlZiB9IGZyb20gXCIuL3R5cGVzXCI7XG5cbi8qKlxuICogS2VlcHMgdHJhY2sgd2hldGhlciBvciBub3Qgd2UgYXJlIGluIGFuIGF0dHJpYnV0ZXMgZGVjbGFyYXRpb24gKGFmdGVyXG4gKiBlbGVtZW50T3BlblN0YXJ0LCBidXQgYmVmb3JlIGVsZW1lbnRPcGVuRW5kKS5cbiAqL1xubGV0IGluQXR0cmlidXRlcyA9IGZhbHNlO1xuXG4vKipcbiAqIEtlZXBzIHRyYWNrIHdoZXRoZXIgb3Igbm90IHdlIGFyZSBpbiBhbiBlbGVtZW50IHRoYXQgc2hvdWxkIG5vdCBoYXZlIGl0c1xuICogY2hpbGRyZW4gY2xlYXJlZC5cbiAqL1xubGV0IGluU2tpcCA9IGZhbHNlO1xuXG4vKipcbiAqIEtlZXBzIHRyYWNrIG9mIHdoZXRoZXIgb3Igbm90IHdlIGFyZSBpbiBhIHBhdGNoLlxuICovXG5sZXQgaW5QYXRjaCA9IGZhbHNlO1xuXG4vKipcbiAqIEFzc2VydHMgdGhhdCBhIHZhbHVlIGV4aXN0cyBhbmQgaXMgbm90IG51bGwgb3IgdW5kZWZpbmVkLiBnb29nLmFzc2VydHNcbiAqIGlzIG5vdCB1c2VkIGluIG9yZGVyIHRvIGF2b2lkIGRlcGVuZGVuY2llcyBvbiBleHRlcm5hbCBjb2RlLlxuICogQHBhcmFtIHZhbCBUaGUgdmFsdWUgdG8gYXNzZXJ0IGlzIHRydXRoeS5cbiAqIEByZXR1cm5zIFRoZSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0PFQgZXh0ZW5kcyB7fT4odmFsOiBUIHwgbnVsbCB8IHVuZGVmaW5lZCk6IFQge1xuICBpZiAoREVCVUcgJiYgIXZhbCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkV4cGVjdGVkIHZhbHVlIHRvIGJlIGRlZmluZWRcIik7XG4gIH1cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1ub24tbnVsbC1hc3NlcnRpb25cbiAgcmV0dXJuIHZhbCE7XG59XG5cbi8qKlxuICogTWFrZXMgc3VyZSB0aGF0IHRoZXJlIGlzIGEgY3VycmVudCBwYXRjaCBjb250ZXh0LlxuICogQHBhcmFtIGZ1bmN0aW9uTmFtZSBUaGUgbmFtZSBvZiB0aGUgY2FsbGVyLCBmb3IgdGhlIGVycm9yIG1lc3NhZ2UuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydEluUGF0Y2goZnVuY3Rpb25OYW1lOiBzdHJpbmcpIHtcbiAgaWYgKCFpblBhdGNoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGNhbGwgXCIgKyBmdW5jdGlvbk5hbWUgKyBcIigpIHVubGVzcyBpbiBwYXRjaC5cIik7XG4gIH1cbn1cblxuLyoqXG4gKiBNYWtlcyBzdXJlIHRoYXQgYSBwYXRjaCBjbG9zZXMgZXZlcnkgbm9kZSB0aGF0IGl0IG9wZW5lZC5cbiAqIEBwYXJhbSBvcGVuRWxlbWVudFxuICogQHBhcmFtIHJvb3RcbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9VbmNsb3NlZFRhZ3MoXG4gIG9wZW5FbGVtZW50OiBOb2RlIHwgbnVsbCxcbiAgcm9vdDogTm9kZSB8IERvY3VtZW50RnJhZ21lbnRcbikge1xuICBpZiAob3BlbkVsZW1lbnQgPT09IHJvb3QpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBsZXQgY3VycmVudEVsZW1lbnQgPSBvcGVuRWxlbWVudDtcbiAgY29uc3Qgb3BlblRhZ3M6IEFycmF5PHN0cmluZz4gPSBbXTtcbiAgd2hpbGUgKGN1cnJlbnRFbGVtZW50ICYmIGN1cnJlbnRFbGVtZW50ICE9PSByb290KSB7XG4gICAgb3BlblRhZ3MucHVzaChjdXJyZW50RWxlbWVudC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpKTtcbiAgICBjdXJyZW50RWxlbWVudCA9IGN1cnJlbnRFbGVtZW50LnBhcmVudE5vZGU7XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoXCJPbmUgb3IgbW9yZSB0YWdzIHdlcmUgbm90IGNsb3NlZDpcXG5cIiArIG9wZW5UYWdzLmpvaW4oXCJcXG5cIikpO1xufVxuXG4vKipcbiAqIE1ha2VzIHN1cmUgdGhhdCBub2RlIGJlaW5nIG91dGVyIHBhdGNoZWQgaGFzIGEgcGFyZW50IG5vZGUuXG4gKiBAcGFyYW0gcGFyZW50XG4gKi9cbmZ1bmN0aW9uIGFzc2VydFBhdGNoT3V0ZXJIYXNQYXJlbnROb2RlKHBhcmVudDogTm9kZSB8IG51bGwpIHtcbiAgaWYgKCFwYXJlbnQpIHtcbiAgICBjb25zb2xlLndhcm4oXG4gICAgICBcInBhdGNoT3V0ZXIgcmVxdWlyZXMgdGhlIG5vZGUgaGF2ZSBhIHBhcmVudCBpZiB0aGVyZSBpcyBhIGtleS5cIlxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBNYWtlcyBzdXJlIHRoYXQgdGhlIGNhbGxlciBpcyBub3Qgd2hlcmUgYXR0cmlidXRlcyBhcmUgZXhwZWN0ZWQuXG4gKiBAcGFyYW0gZnVuY3Rpb25OYW1lIFRoZSBuYW1lIG9mIHRoZSBjYWxsZXIsIGZvciB0aGUgZXJyb3IgbWVzc2FnZS5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm90SW5BdHRyaWJ1dGVzKGZ1bmN0aW9uTmFtZTogc3RyaW5nKSB7XG4gIGlmIChpbkF0dHJpYnV0ZXMpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBmdW5jdGlvbk5hbWUgK1xuICAgICAgICBcIigpIGNhbiBub3QgYmUgY2FsbGVkIGJldHdlZW4gXCIgK1xuICAgICAgICBcImVsZW1lbnRPcGVuU3RhcnQoKSBhbmQgZWxlbWVudE9wZW5FbmQoKS5cIlxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBNYWtlcyBzdXJlIHRoYXQgdGhlIGNhbGxlciBpcyBub3QgaW5zaWRlIGFuIGVsZW1lbnQgdGhhdCBoYXMgZGVjbGFyZWQgc2tpcC5cbiAqIEBwYXJhbSBmdW5jdGlvbk5hbWUgVGhlIG5hbWUgb2YgdGhlIGNhbGxlciwgZm9yIHRoZSBlcnJvciBtZXNzYWdlLlxuICovXG5mdW5jdGlvbiBhc3NlcnROb3RJblNraXAoZnVuY3Rpb25OYW1lOiBzdHJpbmcpIHtcbiAgaWYgKGluU2tpcCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGZ1bmN0aW9uTmFtZSArXG4gICAgICAgIFwiKCkgbWF5IG5vdCBiZSBjYWxsZWQgaW5zaWRlIGFuIGVsZW1lbnQgXCIgK1xuICAgICAgICBcInRoYXQgaGFzIGNhbGxlZCBza2lwKCkuXCJcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogTWFrZXMgc3VyZSB0aGF0IHRoZSBjYWxsZXIgaXMgd2hlcmUgYXR0cmlidXRlcyBhcmUgZXhwZWN0ZWQuXG4gKiBAcGFyYW0gZnVuY3Rpb25OYW1lIFRoZSBuYW1lIG9mIHRoZSBjYWxsZXIsIGZvciB0aGUgZXJyb3IgbWVzc2FnZS5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0SW5BdHRyaWJ1dGVzKGZ1bmN0aW9uTmFtZTogc3RyaW5nKSB7XG4gIGlmICghaW5BdHRyaWJ1dGVzKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgZnVuY3Rpb25OYW1lICtcbiAgICAgICAgXCIoKSBjYW4gb25seSBiZSBjYWxsZWQgYWZ0ZXIgY2FsbGluZyBcIiArXG4gICAgICAgIFwiZWxlbWVudE9wZW5TdGFydCgpLlwiXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIE1ha2VzIHN1cmUgdGhlIHBhdGNoIGNsb3NlcyB2aXJ0dWFsIGF0dHJpYnV0ZXMgY2FsbFxuICovXG5mdW5jdGlvbiBhc3NlcnRWaXJ0dWFsQXR0cmlidXRlc0Nsb3NlZCgpIHtcbiAgaWYgKGluQXR0cmlidXRlcykge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIFwiZWxlbWVudE9wZW5FbmQoKSBtdXN0IGJlIGNhbGxlZCBhZnRlciBjYWxsaW5nIFwiICsgXCJlbGVtZW50T3BlblN0YXJ0KCkuXCJcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogTWFrZXMgc3VyZSB0aGF0IHRhZ3MgYXJlIGNvcnJlY3RseSBuZXN0ZWQuXG4gKiBAcGFyYW0gY3VycmVudE5hbWVPckN0b3JcbiAqIEBwYXJhbSBuYW1lT3JDdG9yXG4gKi9cbmZ1bmN0aW9uIGFzc2VydENsb3NlTWF0Y2hlc09wZW5UYWcoXG4gIGN1cnJlbnROYW1lT3JDdG9yOiBOYW1lT3JDdG9yRGVmLFxuICBuYW1lT3JDdG9yOiBOYW1lT3JDdG9yRGVmXG4pIHtcbiAgaWYgKGN1cnJlbnROYW1lT3JDdG9yICE9PSBuYW1lT3JDdG9yKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJ1JlY2VpdmVkIGEgY2FsbCB0byBjbG9zZSBcIicgK1xuICAgICAgICBuYW1lT3JDdG9yICtcbiAgICAgICAgJ1wiIGJ1dCBcIicgK1xuICAgICAgICBjdXJyZW50TmFtZU9yQ3RvciArXG4gICAgICAgICdcIiB3YXMgb3Blbi4nXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIE1ha2VzIHN1cmUgdGhhdCBubyBjaGlsZHJlbiBlbGVtZW50cyBoYXZlIGJlZW4gZGVjbGFyZWQgeWV0IGluIHRoZSBjdXJyZW50XG4gKiBlbGVtZW50LlxuICogQHBhcmFtIGZ1bmN0aW9uTmFtZSBUaGUgbmFtZSBvZiB0aGUgY2FsbGVyLCBmb3IgdGhlIGVycm9yIG1lc3NhZ2UuXG4gKiBAcGFyYW0gcHJldmlvdXNOb2RlXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vQ2hpbGRyZW5EZWNsYXJlZFlldChcbiAgZnVuY3Rpb25OYW1lOiBzdHJpbmcsXG4gIHByZXZpb3VzTm9kZTogTm9kZSB8IG51bGxcbikge1xuICBpZiAocHJldmlvdXNOb2RlICE9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgZnVuY3Rpb25OYW1lICtcbiAgICAgICAgXCIoKSBtdXN0IGNvbWUgYmVmb3JlIGFueSBjaGlsZCBcIiArXG4gICAgICAgIFwiZGVjbGFyYXRpb25zIGluc2lkZSB0aGUgY3VycmVudCBlbGVtZW50LlwiXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIENoZWNrcyB0aGF0IGEgY2FsbCB0byBwYXRjaE91dGVyIGFjdHVhbGx5IHBhdGNoZWQgdGhlIGVsZW1lbnQuXG4gKiBAcGFyYW0gbWF5YmVTdGFydE5vZGUgVGhlIHZhbHVlIGZvciB0aGUgY3VycmVudE5vZGUgd2hlbiB0aGUgcGF0Y2hcbiAqICAgICBzdGFydGVkLlxuICogQHBhcmFtIG1heWJlQ3VycmVudE5vZGUgVGhlIGN1cnJlbnROb2RlIHdoZW4gdGhlIHBhdGNoIGZpbmlzaGVkLlxuICogQHBhcmFtIGV4cGVjdGVkTmV4dE5vZGUgVGhlIE5vZGUgdGhhdCBpcyBleHBlY3RlZCB0byBmb2xsb3cgdGhlXG4gKiAgICBjdXJyZW50Tm9kZSBhZnRlciB0aGUgcGF0Y2g7XG4gKiBAcGFyYW0gZXhwZWN0ZWRQcmV2Tm9kZSBUaGUgTm9kZSB0aGF0IGlzIGV4cGVjdGVkIHRvIHByZWNlZWQgdGhlXG4gKiAgICBjdXJyZW50Tm9kZSBhZnRlciB0aGUgcGF0Y2guXG4gKi9cbmZ1bmN0aW9uIGFzc2VydFBhdGNoRWxlbWVudE5vRXh0cmFzKFxuICBtYXliZVN0YXJ0Tm9kZTogTm9kZSB8IG51bGwsXG4gIG1heWJlQ3VycmVudE5vZGU6IE5vZGUgfCBudWxsLFxuICBleHBlY3RlZE5leHROb2RlOiBOb2RlIHwgbnVsbCxcbiAgZXhwZWN0ZWRQcmV2Tm9kZTogTm9kZSB8IG51bGxcbikge1xuICBjb25zdCBzdGFydE5vZGUgPSBhc3NlcnQobWF5YmVTdGFydE5vZGUpO1xuICBjb25zdCBjdXJyZW50Tm9kZSA9IGFzc2VydChtYXliZUN1cnJlbnROb2RlKTtcbiAgY29uc3Qgd2FzVXBkYXRlZCA9XG4gICAgY3VycmVudE5vZGUubmV4dFNpYmxpbmcgPT09IGV4cGVjdGVkTmV4dE5vZGUgJiZcbiAgICBjdXJyZW50Tm9kZS5wcmV2aW91c1NpYmxpbmcgPT09IGV4cGVjdGVkUHJldk5vZGU7XG4gIGNvbnN0IHdhc0NoYW5nZWQgPVxuICAgIGN1cnJlbnROb2RlLm5leHRTaWJsaW5nID09PSBzdGFydE5vZGUubmV4dFNpYmxpbmcgJiZcbiAgICBjdXJyZW50Tm9kZS5wcmV2aW91c1NpYmxpbmcgPT09IGV4cGVjdGVkUHJldk5vZGU7XG4gIGNvbnN0IHdhc1JlbW92ZWQgPSBjdXJyZW50Tm9kZSA9PT0gc3RhcnROb2RlO1xuXG4gIGlmICghd2FzVXBkYXRlZCAmJiAhd2FzQ2hhbmdlZCAmJiAhd2FzUmVtb3ZlZCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIFwiVGhlcmUgbXVzdCBiZSBleGFjdGx5IG9uZSB0b3AgbGV2ZWwgY2FsbCBjb3JyZXNwb25kaW5nIFwiICtcbiAgICAgICAgXCJ0byB0aGUgcGF0Y2hlZCBlbGVtZW50LlwiXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIEBwYXJhbSBuZXdDb250ZXh0IFRoZSBjdXJyZW50IHBhdGNoIGNvbnRleHQuXG4gKi9cbmZ1bmN0aW9uIHVwZGF0ZVBhdGNoQ29udGV4dChuZXdDb250ZXh0OiB7fSB8IG51bGwpIHtcbiAgaW5QYXRjaCA9IG5ld0NvbnRleHQgIT0gbnVsbDtcbn1cblxuLyoqXG4gKiBVcGRhdGVzIHRoZSBzdGF0ZSBvZiBiZWluZyBpbiBhbiBhdHRyaWJ1dGUgZGVjbGFyYXRpb24uXG4gKiBAcGFyYW0gdmFsdWUgV2hldGhlciBvciBub3QgdGhlIHBhdGNoIGlzIGluIGFuIGF0dHJpYnV0ZSBkZWNsYXJhdGlvbi5cbiAqIEByZXR1cm4gdGhlIHByZXZpb3VzIHZhbHVlLlxuICovXG5mdW5jdGlvbiBzZXRJbkF0dHJpYnV0ZXModmFsdWU6IGJvb2xlYW4pIHtcbiAgY29uc3QgcHJldmlvdXMgPSBpbkF0dHJpYnV0ZXM7XG4gIGluQXR0cmlidXRlcyA9IHZhbHVlO1xuICByZXR1cm4gcHJldmlvdXM7XG59XG5cbi8qKlxuICogVXBkYXRlcyB0aGUgc3RhdGUgb2YgYmVpbmcgaW4gYSBza2lwIGVsZW1lbnQuXG4gKiBAcGFyYW0gdmFsdWUgV2hldGhlciBvciBub3QgdGhlIHBhdGNoIGlzIHNraXBwaW5nIHRoZSBjaGlsZHJlbiBvZiBhXG4gKiAgICBwYXJlbnQgbm9kZS5cbiAqIEByZXR1cm4gdGhlIHByZXZpb3VzIHZhbHVlLlxuICovXG5mdW5jdGlvbiBzZXRJblNraXAodmFsdWU6IGJvb2xlYW4pIHtcbiAgY29uc3QgcHJldmlvdXMgPSBpblNraXA7XG4gIGluU2tpcCA9IHZhbHVlO1xuICByZXR1cm4gcHJldmlvdXM7XG59XG5cbmV4cG9ydCB7XG4gIGFzc2VydCxcbiAgYXNzZXJ0SW5QYXRjaCxcbiAgYXNzZXJ0Tm9VbmNsb3NlZFRhZ3MsXG4gIGFzc2VydE5vdEluQXR0cmlidXRlcyxcbiAgYXNzZXJ0SW5BdHRyaWJ1dGVzLFxuICBhc3NlcnRDbG9zZU1hdGNoZXNPcGVuVGFnLFxuICBhc3NlcnRWaXJ0dWFsQXR0cmlidXRlc0Nsb3NlZCxcbiAgYXNzZXJ0Tm9DaGlsZHJlbkRlY2xhcmVkWWV0LFxuICBhc3NlcnROb3RJblNraXAsXG4gIGFzc2VydFBhdGNoRWxlbWVudE5vRXh0cmFzLFxuICBhc3NlcnRQYXRjaE91dGVySGFzUGFyZW50Tm9kZSxcbiAgc2V0SW5BdHRyaWJ1dGVzLFxuICBzZXRJblNraXAsXG4gIHVwZGF0ZVBhdGNoQ29udGV4dFxufTtcbiJdfQ==