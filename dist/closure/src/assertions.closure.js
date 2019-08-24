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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXJ0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9hc3NlcnRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7OztHQWNHO0FBRUgsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUdqQzs7O0dBR0c7QUFDSCxJQUFJLFlBQVksR0FBRyxLQUFLLENBQUM7QUFFekI7OztHQUdHO0FBQ0gsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBRW5COztHQUVHO0FBQ0gsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDO0FBRXBCOzs7OztHQUtHO0FBQ0gsU0FBUyxNQUFNLENBQWUsR0FBeUI7SUFDckQsSUFBSSxLQUFLLElBQUksQ0FBQyxHQUFHLEVBQUU7UUFDakIsTUFBTSxJQUFJLEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO0tBQ2pEO0lBQ0Qsb0VBQW9FO0lBQ3BFLE9BQU8sR0FBSSxDQUFDO0FBQ2QsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMsYUFBYSxDQUFDLFlBQW9CO0lBQ3pDLElBQUksQ0FBQyxPQUFPLEVBQUU7UUFDWixNQUFNLElBQUksS0FBSyxDQUFDLGNBQWMsR0FBRyxZQUFZLEdBQUcscUJBQXFCLENBQUMsQ0FBQztLQUN4RTtBQUNILENBQUM7QUFFRDs7OztHQUlHO0FBQ0gsU0FBUyxvQkFBb0IsQ0FDM0IsV0FBd0IsRUFDeEIsSUFBNkI7SUFFN0IsSUFBSSxXQUFXLEtBQUssSUFBSSxFQUFFO1FBQ3hCLE9BQU87S0FDUjtJQUVELElBQUksY0FBYyxHQUFHLFdBQVcsQ0FBQztJQUNqQyxNQUFNLFFBQVEsR0FBa0IsRUFBRSxDQUFDO0lBQ25DLE9BQU8sY0FBYyxJQUFJLGNBQWMsS0FBSyxJQUFJLEVBQUU7UUFDaEQsUUFBUSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDckQsY0FB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QUMsS0FBYztJQUNyQyxNQUFNLFFBQVEsR0FBRyxZQUFZLENBQUM7SUFDOUIsWUFBWSxHQUFHLEtBQUssQ0FBQztJQUNyQixPQUFPLFFBQVEsQ0FBQztBQUNsQixDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxTQUFTLFNBQVMsQ0FBQyxLQUFjO0lBQy9CLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQztJQUN4QixNQUFNLEdBQUcsS0FBSyxDQUFDO0lBQ2YsT0FBTyxRQUFRLENBQUM7QUFDbEIsQ0FBQztBQUVELE9BQU8sRUFDTCxNQUFNLEVBQ04sYUFBYSxFQUNiLG9CQUFvQixFQUNwQixxQkFBcUIsRUFDckIsa0JBQWtCLEVBQ2xCLHlCQUF5QixFQUN6Qiw2QkFBNkIsRUFDN0IsMkJBQTJCLEVBQzNCLGVBQWUsRUFDZiwwQkFBMEIsRUFDMUIsNkJBQTZCLEVBQzdCLGVBQWUsRUFDZixTQUFTLEVBQ1Qsa0JBQWtCLEVBQ25CLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE4IFRoZSBJbmNyZW1lbnRhbCBET00gQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7IERFQlVHIH0gZnJvbSBcIi4vZ2xvYmFsXCI7XG5pbXBvcnQgeyBOYW1lT3JDdG9yRGVmIH0gZnJvbSBcIi4vdHlwZXNcIjtcblxuLyoqXG4gKiBLZWVwcyB0cmFjayB3aGV0aGVyIG9yIG5vdCB3ZSBhcmUgaW4gYW4gYXR0cmlidXRlcyBkZWNsYXJhdGlvbiAoYWZ0ZXJcbiAqIGVsZW1lbnRPcGVuU3RhcnQsIGJ1dCBiZWZvcmUgZWxlbWVudE9wZW5FbmQpLlxuICovXG5sZXQgaW5BdHRyaWJ1dGVzID0gZmFsc2U7XG5cbi8qKlxuICogS2VlcHMgdHJhY2sgd2hldGhlciBvciBub3Qgd2UgYXJlIGluIGFuIGVsZW1lbnQgdGhhdCBzaG91bGQgbm90IGhhdmUgaXRzXG4gKiBjaGlsZHJlbiBjbGVhcmVkLlxuICovXG5sZXQgaW5Ta2lwID0gZmFsc2U7XG5cbi8qKlxuICogS2VlcHMgdHJhY2sgb2Ygd2hldGhlciBvciBub3Qgd2UgYXJlIGluIGEgcGF0Y2guXG4gKi9cbmxldCBpblBhdGNoID0gZmFsc2U7XG5cbi8qKlxuICogQXNzZXJ0cyB0aGF0IGEgdmFsdWUgZXhpc3RzIGFuZCBpcyBub3QgbnVsbCBvciB1bmRlZmluZWQuIGdvb2cuYXNzZXJ0c1xuICogaXMgbm90IHVzZWQgaW4gb3JkZXIgdG8gYXZvaWQgZGVwZW5kZW5jaWVzIG9uIGV4dGVybmFsIGNvZGUuXG4gKiBAcGFyYW0gdmFsIFRoZSB2YWx1ZSB0byBhc3NlcnQgaXMgdHJ1dGh5LlxuICogQHJldHVybnMgVGhlIHZhbHVlLlxuICovXG5mdW5jdGlvbiBhc3NlcnQ8VCBleHRlbmRzIHt9Pih2YWw6IFQgfCBudWxsIHwgdW5kZWZpbmVkKTogVCB7XG4gIGlmIChERUJVRyAmJiAhdmFsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiRXhwZWN0ZWQgdmFsdWUgdG8gYmUgZGVmaW5lZFwiKTtcbiAgfVxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5vbi1udWxsLWFzc2VydGlvblxuICByZXR1cm4gdmFsITtcbn1cblxuLyoqXG4gKiBNYWtlcyBzdXJlIHRoYXQgdGhlcmUgaXMgYSBjdXJyZW50IHBhdGNoIGNvbnRleHQuXG4gKiBAcGFyYW0gZnVuY3Rpb25OYW1lIFRoZSBuYW1lIG9mIHRoZSBjYWxsZXIsIGZvciB0aGUgZXJyb3IgbWVzc2FnZS5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0SW5QYXRjaChmdW5jdGlvbk5hbWU6IHN0cmluZykge1xuICBpZiAoIWluUGF0Y2gpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgY2FsbCBcIiArIGZ1bmN0aW9uTmFtZSArIFwiKCkgdW5sZXNzIGluIHBhdGNoLlwiKTtcbiAgfVxufVxuXG4vKipcbiAqIE1ha2VzIHN1cmUgdGhhdCBhIHBhdGNoIGNsb3NlcyBldmVyeSBub2RlIHRoYXQgaXQgb3BlbmVkLlxuICogQHBhcmFtIG9wZW5FbGVtZW50XG4gKiBAcGFyYW0gcm9vdFxuICovXG5mdW5jdGlvbiBhc3NlcnROb1VuY2xvc2VkVGFncyhcbiAgb3BlbkVsZW1lbnQ6IE5vZGUgfCBudWxsLFxuICByb290OiBOb2RlIHwgRG9jdW1lbnRGcmFnbWVudFxuKSB7XG4gIGlmIChvcGVuRWxlbWVudCA9PT0gcm9vdCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGxldCBjdXJyZW50RWxlbWVudCA9IG9wZW5FbGVtZW50O1xuICBjb25zdCBvcGVuVGFnczogQXJyYXk8c3RyaW5nPiA9IFtdO1xuICB3aGlsZSAoY3VycmVudEVsZW1lbnQgJiYgY3VycmVudEVsZW1lbnQgIT09IHJvb3QpIHtcbiAgICBvcGVuVGFncy5wdXNoKGN1cnJlbnRFbGVtZW50Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkpO1xuICAgIGN1cnJlbnRFbGVtZW50ID0gY3VycmVudEVsZW1lbnQucGFyZW50Tm9kZTtcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcihcIk9uZSBvciBtb3JlIHRhZ3Mgd2VyZSBub3QgY2xvc2VkOlxcblwiICsgb3BlblRhZ3Muam9pbihcIlxcblwiKSk7XG59XG5cbi8qKlxuICogTWFrZXMgc3VyZSB0aGF0IG5vZGUgYmVpbmcgb3V0ZXIgcGF0Y2hlZCBoYXMgYSBwYXJlbnQgbm9kZS5cbiAqIEBwYXJhbSBwYXJlbnRcbiAqL1xuZnVuY3Rpb24gYXNzZXJ0UGF0Y2hPdXRlckhhc1BhcmVudE5vZGUocGFyZW50OiBOb2RlIHwgbnVsbCkge1xuICBpZiAoIXBhcmVudCkge1xuICAgIGNvbnNvbGUud2FybihcbiAgICAgIFwicGF0Y2hPdXRlciByZXF1aXJlcyB0aGUgbm9kZSBoYXZlIGEgcGFyZW50IGlmIHRoZXJlIGlzIGEga2V5LlwiXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIE1ha2VzIHN1cmUgdGhhdCB0aGUgY2FsbGVyIGlzIG5vdCB3aGVyZSBhdHRyaWJ1dGVzIGFyZSBleHBlY3RlZC5cbiAqIEBwYXJhbSBmdW5jdGlvbk5hbWUgVGhlIG5hbWUgb2YgdGhlIGNhbGxlciwgZm9yIHRoZSBlcnJvciBtZXNzYWdlLlxuICovXG5mdW5jdGlvbiBhc3NlcnROb3RJbkF0dHJpYnV0ZXMoZnVuY3Rpb25OYW1lOiBzdHJpbmcpIHtcbiAgaWYgKGluQXR0cmlidXRlcykge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGZ1bmN0aW9uTmFtZSArXG4gICAgICAgIFwiKCkgY2FuIG5vdCBiZSBjYWxsZWQgYmV0d2VlbiBcIiArXG4gICAgICAgIFwiZWxlbWVudE9wZW5TdGFydCgpIGFuZCBlbGVtZW50T3BlbkVuZCgpLlwiXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIE1ha2VzIHN1cmUgdGhhdCB0aGUgY2FsbGVyIGlzIG5vdCBpbnNpZGUgYW4gZWxlbWVudCB0aGF0IGhhcyBkZWNsYXJlZCBza2lwLlxuICogQHBhcmFtIGZ1bmN0aW9uTmFtZSBUaGUgbmFtZSBvZiB0aGUgY2FsbGVyLCBmb3IgdGhlIGVycm9yIG1lc3NhZ2UuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vdEluU2tpcChmdW5jdGlvbk5hbWU6IHN0cmluZykge1xuICBpZiAoaW5Ta2lwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgZnVuY3Rpb25OYW1lICtcbiAgICAgICAgXCIoKSBtYXkgbm90IGJlIGNhbGxlZCBpbnNpZGUgYW4gZWxlbWVudCBcIiArXG4gICAgICAgIFwidGhhdCBoYXMgY2FsbGVkIHNraXAoKS5cIlxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBNYWtlcyBzdXJlIHRoYXQgdGhlIGNhbGxlciBpcyB3aGVyZSBhdHRyaWJ1dGVzIGFyZSBleHBlY3RlZC5cbiAqIEBwYXJhbSBmdW5jdGlvbk5hbWUgVGhlIG5hbWUgb2YgdGhlIGNhbGxlciwgZm9yIHRoZSBlcnJvciBtZXNzYWdlLlxuICovXG5mdW5jdGlvbiBhc3NlcnRJbkF0dHJpYnV0ZXMoZnVuY3Rpb25OYW1lOiBzdHJpbmcpIHtcbiAgaWYgKCFpbkF0dHJpYnV0ZXMpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBmdW5jdGlvbk5hbWUgK1xuICAgICAgICBcIigpIGNhbiBvbmx5IGJlIGNhbGxlZCBhZnRlciBjYWxsaW5nIFwiICtcbiAgICAgICAgXCJlbGVtZW50T3BlblN0YXJ0KCkuXCJcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogTWFrZXMgc3VyZSB0aGUgcGF0Y2ggY2xvc2VzIHZpcnR1YWwgYXR0cmlidXRlcyBjYWxsXG4gKi9cbmZ1bmN0aW9uIGFzc2VydFZpcnR1YWxBdHRyaWJ1dGVzQ2xvc2VkKCkge1xuICBpZiAoaW5BdHRyaWJ1dGVzKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgXCJlbGVtZW50T3BlbkVuZCgpIG11c3QgYmUgY2FsbGVkIGFmdGVyIGNhbGxpbmcgXCIgKyBcImVsZW1lbnRPcGVuU3RhcnQoKS5cIlxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBNYWtlcyBzdXJlIHRoYXQgdGFncyBhcmUgY29ycmVjdGx5IG5lc3RlZC5cbiAqIEBwYXJhbSBjdXJyZW50TmFtZU9yQ3RvclxuICogQHBhcmFtIG5hbWVPckN0b3JcbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Q2xvc2VNYXRjaGVzT3BlblRhZyhcbiAgY3VycmVudE5hbWVPckN0b3I6IE5hbWVPckN0b3JEZWYsXG4gIG5hbWVPckN0b3I6IE5hbWVPckN0b3JEZWZcbikge1xuICBpZiAoY3VycmVudE5hbWVPckN0b3IgIT09IG5hbWVPckN0b3IpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnUmVjZWl2ZWQgYSBjYWxsIHRvIGNsb3NlIFwiJyArXG4gICAgICAgIG5hbWVPckN0b3IgK1xuICAgICAgICAnXCIgYnV0IFwiJyArXG4gICAgICAgIGN1cnJlbnROYW1lT3JDdG9yICtcbiAgICAgICAgJ1wiIHdhcyBvcGVuLidcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogTWFrZXMgc3VyZSB0aGF0IG5vIGNoaWxkcmVuIGVsZW1lbnRzIGhhdmUgYmVlbiBkZWNsYXJlZCB5ZXQgaW4gdGhlIGN1cnJlbnRcbiAqIGVsZW1lbnQuXG4gKiBAcGFyYW0gZnVuY3Rpb25OYW1lIFRoZSBuYW1lIG9mIHRoZSBjYWxsZXIsIGZvciB0aGUgZXJyb3IgbWVzc2FnZS5cbiAqIEBwYXJhbSBwcmV2aW91c05vZGVcbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9DaGlsZHJlbkRlY2xhcmVkWWV0KFxuICBmdW5jdGlvbk5hbWU6IHN0cmluZyxcbiAgcHJldmlvdXNOb2RlOiBOb2RlIHwgbnVsbFxuKSB7XG4gIGlmIChwcmV2aW91c05vZGUgIT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBmdW5jdGlvbk5hbWUgK1xuICAgICAgICBcIigpIG11c3QgY29tZSBiZWZvcmUgYW55IGNoaWxkIFwiICtcbiAgICAgICAgXCJkZWNsYXJhdGlvbnMgaW5zaWRlIHRoZSBjdXJyZW50IGVsZW1lbnQuXCJcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogQ2hlY2tzIHRoYXQgYSBjYWxsIHRvIHBhdGNoT3V0ZXIgYWN0dWFsbHkgcGF0Y2hlZCB0aGUgZWxlbWVudC5cbiAqIEBwYXJhbSBtYXliZVN0YXJ0Tm9kZSBUaGUgdmFsdWUgZm9yIHRoZSBjdXJyZW50Tm9kZSB3aGVuIHRoZSBwYXRjaFxuICogICAgIHN0YXJ0ZWQuXG4gKiBAcGFyYW0gbWF5YmVDdXJyZW50Tm9kZSBUaGUgY3VycmVudE5vZGUgd2hlbiB0aGUgcGF0Y2ggZmluaXNoZWQuXG4gKiBAcGFyYW0gZXhwZWN0ZWROZXh0Tm9kZSBUaGUgTm9kZSB0aGF0IGlzIGV4cGVjdGVkIHRvIGZvbGxvdyB0aGVcbiAqICAgIGN1cnJlbnROb2RlIGFmdGVyIHRoZSBwYXRjaDtcbiAqIEBwYXJhbSBleHBlY3RlZFByZXZOb2RlIFRoZSBOb2RlIHRoYXQgaXMgZXhwZWN0ZWQgdG8gcHJlY2VlZCB0aGVcbiAqICAgIGN1cnJlbnROb2RlIGFmdGVyIHRoZSBwYXRjaC5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0UGF0Y2hFbGVtZW50Tm9FeHRyYXMoXG4gIG1heWJlU3RhcnROb2RlOiBOb2RlIHwgbnVsbCxcbiAgbWF5YmVDdXJyZW50Tm9kZTogTm9kZSB8IG51bGwsXG4gIGV4cGVjdGVkTmV4dE5vZGU6IE5vZGUgfCBudWxsLFxuICBleHBlY3RlZFByZXZOb2RlOiBOb2RlIHwgbnVsbFxuKSB7XG4gIGNvbnN0IHN0YXJ0Tm9kZSA9IGFzc2VydChtYXliZVN0YXJ0Tm9kZSk7XG4gIGNvbnN0IGN1cnJlbnROb2RlID0gYXNzZXJ0KG1heWJlQ3VycmVudE5vZGUpO1xuICBjb25zdCB3YXNVcGRhdGVkID1cbiAgICBjdXJyZW50Tm9kZS5uZXh0U2libGluZyA9PT0gZXhwZWN0ZWROZXh0Tm9kZSAmJlxuICAgIGN1cnJlbnROb2RlLnByZXZpb3VzU2libGluZyA9PT0gZXhwZWN0ZWRQcmV2Tm9kZTtcbiAgY29uc3Qgd2FzQ2hhbmdlZCA9XG4gICAgY3VycmVudE5vZGUubmV4dFNpYmxpbmcgPT09IHN0YXJ0Tm9kZS5uZXh0U2libGluZyAmJlxuICAgIGN1cnJlbnROb2RlLnByZXZpb3VzU2libGluZyA9PT0gZXhwZWN0ZWRQcmV2Tm9kZTtcbiAgY29uc3Qgd2FzUmVtb3ZlZCA9IGN1cnJlbnROb2RlID09PSBzdGFydE5vZGU7XG5cbiAgaWYgKCF3YXNVcGRhdGVkICYmICF3YXNDaGFuZ2VkICYmICF3YXNSZW1vdmVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgXCJUaGVyZSBtdXN0IGJlIGV4YWN0bHkgb25lIHRvcCBsZXZlbCBjYWxsIGNvcnJlc3BvbmRpbmcgXCIgK1xuICAgICAgICBcInRvIHRoZSBwYXRjaGVkIGVsZW1lbnQuXCJcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogQHBhcmFtIG5ld0NvbnRleHQgVGhlIGN1cnJlbnQgcGF0Y2ggY29udGV4dC5cbiAqL1xuZnVuY3Rpb24gdXBkYXRlUGF0Y2hDb250ZXh0KG5ld0NvbnRleHQ6IHt9IHwgbnVsbCkge1xuICBpblBhdGNoID0gbmV3Q29udGV4dCAhPSBudWxsO1xufVxuXG4vKipcbiAqIFVwZGF0ZXMgdGhlIHN0YXRlIG9mIGJlaW5nIGluIGFuIGF0dHJpYnV0ZSBkZWNsYXJhdGlvbi5cbiAqIEBwYXJhbSB2YWx1ZSBXaGV0aGVyIG9yIG5vdCB0aGUgcGF0Y2ggaXMgaW4gYW4gYXR0cmlidXRlIGRlY2xhcmF0aW9uLlxuICogQHJldHVybiB0aGUgcHJldmlvdXMgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIHNldEluQXR0cmlidXRlcyh2YWx1ZTogYm9vbGVhbikge1xuICBjb25zdCBwcmV2aW91cyA9IGluQXR0cmlidXRlcztcbiAgaW5BdHRyaWJ1dGVzID0gdmFsdWU7XG4gIHJldHVybiBwcmV2aW91cztcbn1cblxuLyoqXG4gKiBVcGRhdGVzIHRoZSBzdGF0ZSBvZiBiZWluZyBpbiBhIHNraXAgZWxlbWVudC5cbiAqIEBwYXJhbSB2YWx1ZSBXaGV0aGVyIG9yIG5vdCB0aGUgcGF0Y2ggaXMgc2tpcHBpbmcgdGhlIGNoaWxkcmVuIG9mIGFcbiAqICAgIHBhcmVudCBub2RlLlxuICogQHJldHVybiB0aGUgcHJldmlvdXMgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIHNldEluU2tpcCh2YWx1ZTogYm9vbGVhbikge1xuICBjb25zdCBwcmV2aW91cyA9IGluU2tpcDtcbiAgaW5Ta2lwID0gdmFsdWU7XG4gIHJldHVybiBwcmV2aW91cztcbn1cblxuZXhwb3J0IHtcbiAgYXNzZXJ0LFxuICBhc3NlcnRJblBhdGNoLFxuICBhc3NlcnROb1VuY2xvc2VkVGFncyxcbiAgYXNzZXJ0Tm90SW5BdHRyaWJ1dGVzLFxuICBhc3NlcnRJbkF0dHJpYnV0ZXMsXG4gIGFzc2VydENsb3NlTWF0Y2hlc09wZW5UYWcsXG4gIGFzc2VydFZpcnR1YWxBdHRyaWJ1dGVzQ2xvc2VkLFxuICBhc3NlcnROb0NoaWxkcmVuRGVjbGFyZWRZZXQsXG4gIGFzc2VydE5vdEluU2tpcCxcbiAgYXNzZXJ0UGF0Y2hFbGVtZW50Tm9FeHRyYXMsXG4gIGFzc2VydFBhdGNoT3V0ZXJIYXNQYXJlbnROb2RlLFxuICBzZXRJbkF0dHJpYnV0ZXMsXG4gIHNldEluU2tpcCxcbiAgdXBkYXRlUGF0Y2hDb250ZXh0XG59O1xuIl19