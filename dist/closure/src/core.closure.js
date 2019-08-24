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
import { assertInPatch, assertNoChildrenDeclaredYet, assertNotInAttributes, assertNoUnclosedTags, assertPatchElementNoExtras, assertPatchOuterHasParentNode, assertVirtualAttributesClosed, setInAttributes, setInSkip, updatePatchContext } from "./assertions";
import { Context } from "./context";
import { getFocusedPath, moveBefore } from "./dom_util";
import { DEBUG } from "./global";
import { getData } from "./node_data";
import { createElement, createText } from "./nodes";
/**
 * The default match function to use, if one was not specified when creating
 * the patcher.
 * @param matchNode The node to match against, unused.
 * @param nameOrCtor The name or constructor as declared.
 * @param expectedNameOrCtor The name or constructor of the existing node.
 * @param key The key as declared.
 * @param expectedKey The key of the existing node.
 * @returns True if the node matches, false otherwise.
 */
function defaultMatchFn(matchNode, nameOrCtor, expectedNameOrCtor, key, expectedKey) {
    // Key check is done using double equals as we want to treat a null key the
    // same as undefined. This should be okay as the only values allowed are
    // strings, null and undefined so the == semantics are not too weird.
    return nameOrCtor == expectedNameOrCtor && key == expectedKey;
}
let context = null;
let currentNode = null;
let currentParent = null;
let doc = null;
let focusPath = [];
let matchFn = defaultMatchFn;
/**
 * Used to build up call arguments. Each patch call gets a separate copy, so
 * this works with nested calls to patch.
 */
let argsBuilder = [];
/**
 * Used to build up attrs for the an element.
 */
let attrsBuilder = [];
/**
 * TODO(sparhami) We should just export argsBuilder directly when Closure
 * Compiler supports ES6 directly.
 * @returns The Array used for building arguments.
 */
function getArgsBuilder() {
    return argsBuilder;
}
/**
 * TODO(sparhami) We should just export attrsBuilder directly when Closure
 * Compiler supports ES6 directly.
 * @returns The Array used for building arguments.
 */
function getAttrsBuilder() {
    return attrsBuilder;
}
/**
 * Checks whether or not the current node matches the specified nameOrCtor and
 * key. This uses the specified match function when creating the patcher.
 * @param matchNode A node to match the data to.
 * @param nameOrCtor The name or constructor to check for.
 * @param key The key used to identify the Node.
 * @return True if the node matches, false otherwise.
 */
function matches(matchNode, nameOrCtor, key) {
    const data = getData(matchNode, key);
    return matchFn(matchNode, nameOrCtor, data.nameOrCtor, key, data.key);
}
/**
 * Finds the matching node, starting at `node` and looking at the subsequent
 * siblings if a key is used.
 * @param matchNode The node to start looking at.
 * @param nameOrCtor The name or constructor for the Node.
 * @param key The key used to identify the Node.
 * @returns The matching Node, if any exists.
 */
function getMatchingNode(matchNode, nameOrCtor, key) {
    if (!matchNode) {
        return null;
    }
    let cur = matchNode;
    do {
        if (matches(cur, nameOrCtor, key)) {
            return cur;
        }
    } while (key && (cur = cur.nextSibling));
    return null;
}
/**
 * Clears out any unvisited Nodes in a given range.
 * @param maybeParentNode
 * @param startNode The node to start clearing from, inclusive.
 * @param endNode The node to clear until, exclusive.
 */
function clearUnvisitedDOM(maybeParentNode, startNode, endNode) {
    const parentNode = maybeParentNode;
    let child = startNode;
    while (child !== endNode) {
        const next = child.nextSibling;
        parentNode.removeChild(child);
        context.markDeleted(child);
        child = next;
    }
}
/**
 * @return The next Node to be patched.
 */
function getNextNode() {
    if (currentNode) {
        return currentNode.nextSibling;
    }
    else {
        return currentParent.firstChild;
    }
}
/**
 * Changes to the first child of the current node.
 */
function enterNode() {
    currentParent = currentNode;
    currentNode = null;
}
/**
 * Changes to the parent of the current node, removing any unvisited children.
 */
function exitNode() {
    clearUnvisitedDOM(currentParent, getNextNode(), null);
    currentNode = currentParent;
    currentParent = currentParent.parentNode;
}
/**
 * Changes to the next sibling of the current node.
 */
function nextNode() {
    currentNode = getNextNode();
}
/**
 * Creates a Node and marking it as created.
 * @param nameOrCtor The name or constructor for the Node.
 * @param key The key used to identify the Node.
 * @return The newly created node.
 */
function createNode(nameOrCtor, key) {
    let node;
    if (nameOrCtor === "#text") {
        node = createText(doc);
    }
    else {
        node = createElement(doc, currentParent, nameOrCtor, key);
    }
    context.markCreated(node);
    return node;
}
/**
 * Aligns the virtual Node definition with the actual DOM, moving the
 * corresponding DOM node to the correct location or creating it if necessary.
 * @param nameOrCtor The name or constructor for the Node.
 * @param key The key used to identify the Node.
 */
function alignWithDOM(nameOrCtor, key) {
    nextNode();
    const existingNode = getMatchingNode(currentNode, nameOrCtor, key);
    const node = existingNode || createNode(nameOrCtor, key);
    // If we are at the matching node, then we are done.
    if (node === currentNode) {
        return;
    }
    // Re-order the node into the right position, preserving focus if either
    // node or currentNode are focused by making sure that they are not detached
    // from the DOM.
    if (focusPath.indexOf(node) >= 0) {
        // Move everything else before the node.
        moveBefore(currentParent, node, currentNode);
    }
    else {
        currentParent.insertBefore(node, currentNode);
    }
    currentNode = node;
}
/**
 * Makes sure that the current node is an Element with a matching nameOrCtor and
 * key.
 *
 * @param nameOrCtor The tag or constructor for the Element.
 * @param key The key used to identify this element. This can be an
 *     empty string, but performance may be better if a unique value is used
 *     when iterating over an array of items.
 * @return The corresponding Element.
 */
function open(nameOrCtor, key) {
    alignWithDOM(nameOrCtor, key);
    enterNode();
    return currentParent;
}
/**
 * Closes the currently open Element, removing any unvisited children if
 * necessary.
 * @returns The Element that was just closed.
 */
function close() {
    if (DEBUG) {
        setInSkip(false);
    }
    exitNode();
    return currentNode;
}
/**
 * Makes sure the current node is a Text node and creates a Text node if it is
 * not.
 * @returns The Text node that was aligned or created.
 */
function text() {
    alignWithDOM("#text", null);
    return currentNode;
}
/**
 * @returns The current Element being patched.
 */
function currentElement() {
    if (DEBUG) {
        assertInPatch("currentElement");
        assertNotInAttributes("currentElement");
    }
    return currentParent;
}
/**
 * @return The Node that will be evaluated for the next instruction.
 */
function currentPointer() {
    if (DEBUG) {
        assertInPatch("currentPointer");
        assertNotInAttributes("currentPointer");
    }
    // TODO(tomnguyen): assert that this is not null
    return getNextNode();
}
/**
 * Skips the children in a subtree, allowing an Element to be closed without
 * clearing out the children.
 */
function skip() {
    if (DEBUG) {
        assertNoChildrenDeclaredYet("skip", currentNode);
        setInSkip(true);
    }
    currentNode = currentParent.lastChild;
}
/**
 * Returns a patcher function that sets up and restores a patch context,
 * running the run function with the provided data.
 * @param run The function that will run the patch.
 * @param patchConfig The configuration to use for the patch.
 * @returns The created patch function.
 */
function createPatcher(run, patchConfig = {}) {
    const { matches = defaultMatchFn } = patchConfig;
    const f = (node, fn, data) => {
        const prevContext = context;
        const prevDoc = doc;
        const prevFocusPath = focusPath;
        const prevArgsBuilder = argsBuilder;
        const prevAttrsBuilder = attrsBuilder;
        const prevCurrentNode = currentNode;
        const prevCurrentParent = currentParent;
        const prevMatchFn = matchFn;
        let previousInAttributes = false;
        let previousInSkip = false;
        doc = node.ownerDocument;
        context = new Context();
        matchFn = matches;
        argsBuilder = [];
        attrsBuilder = [];
        currentNode = null;
        currentParent = node.parentNode;
        focusPath = getFocusedPath(node, currentParent);
        if (DEBUG) {
            previousInAttributes = setInAttributes(false);
            previousInSkip = setInSkip(false);
            updatePatchContext(context);
        }
        try {
            const retVal = run(node, fn, data);
            if (DEBUG) {
                assertVirtualAttributesClosed();
            }
            return retVal;
        }
        finally {
            context.notifyChanges();
            doc = prevDoc;
            context = prevContext;
            matchFn = prevMatchFn;
            argsBuilder = prevArgsBuilder;
            attrsBuilder = prevAttrsBuilder;
            currentNode = prevCurrentNode;
            currentParent = prevCurrentParent;
            focusPath = prevFocusPath;
            // Needs to be done after assertions because assertions rely on state
            // from these methods.
            if (DEBUG) {
                setInAttributes(previousInAttributes);
                setInSkip(previousInSkip);
                updatePatchContext(context);
            }
        }
    };
    return f;
}
/**
 * Creates a patcher that patches the document starting at node with a
 * provided function. This function may be called during an existing patch operation.
 * @param patchConfig The config to use for the patch.
 * @returns The created function for patching an Element's children.
 */
function createPatchInner(patchConfig) {
    return createPatcher((node, fn, data) => {
        currentNode = node;
        enterNode();
        fn(data);
        exitNode();
        if (DEBUG) {
            assertNoUnclosedTags(currentNode, node);
        }
        return node;
    }, patchConfig);
}
/**
 * Creates a patcher that patches an Element with the the provided function.
 * Exactly one top level element call should be made corresponding to `node`.
 * @param patchConfig The config to use for the patch.
 * @returns The created function for patching an Element.
 */
function createPatchOuter(patchConfig) {
    return createPatcher((node, fn, data) => {
        const startNode = { nextSibling: node };
        let expectedNextNode = null;
        let expectedPrevNode = null;
        if (DEBUG) {
            expectedNextNode = node.nextSibling;
            expectedPrevNode = node.previousSibling;
        }
        currentNode = startNode;
        fn(data);
        if (DEBUG) {
            assertPatchOuterHasParentNode(currentParent);
            assertPatchElementNoExtras(startNode, currentNode, expectedNextNode, expectedPrevNode);
        }
        if (currentParent) {
            clearUnvisitedDOM(currentParent, getNextNode(), node.nextSibling);
        }
        return startNode === currentNode ? null : currentNode;
    }, patchConfig);
}
const patchInner = createPatchInner();
const patchOuter = createPatchOuter();
export { alignWithDOM, getArgsBuilder, getAttrsBuilder, text, createPatchInner, createPatchOuter, patchInner, patchOuter, open, close, currentElement, currentPointer, skip, nextNode as skipNode };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb3JlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7OztHQWNHO0FBRUgsT0FBTyxFQUNMLGFBQWEsRUFDYiwyQkFBMkIsRUFDM0IscUJBQXFCLEVBQ3JCLG9CQUFvQixFQUNwQiwwQkFBMEIsRUFDMUIsNkJBQTZCLEVBQzdCLDZCQUE2QixFQUM3QixlQUFlLEVBQ2YsU0FBUyxFQUNULGtCQUFrQixFQUNuQixNQUFNLGNBQWMsQ0FBQztBQUN0QixPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ3hELE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDakMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUN0QyxPQUFPLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQVNwRDs7Ozs7Ozs7O0dBU0c7QUFDSCxTQUFTLGNBQWMsQ0FDckIsU0FBZSxFQUNmLFVBQXlCLEVBQ3pCLGtCQUFpQyxFQUNqQyxHQUFRLEVBQ1IsV0FBZ0I7SUFFaEIsMkVBQTJFO0lBQzNFLHdFQUF3RTtJQUN4RSxxRUFBcUU7SUFDckUsT0FBTyxVQUFVLElBQUksa0JBQWtCLElBQUksR0FBRyxJQUFJLFdBQVcsQ0FBQztBQUNoRSxDQUFDO0FBRUQsSUFBSSxPQUFPLEdBQW1CLElBQUksQ0FBQztBQUVuQyxJQUFJLFdBQVcsR0FBZ0IsSUFBSSxDQUFDO0FBRXBDLElBQUksYUFBYSxHQUFnQixJQUFJLENBQUM7QUFFdEMsSUFBSSxHQUFHLEdBQW9CLElBQUksQ0FBQztBQUVoQyxJQUFJLFNBQVMsR0FBZ0IsRUFBRSxDQUFDO0FBRWhDLElBQUksT0FBTyxHQUFlLGNBQWMsQ0FBQztBQUV6Qzs7O0dB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Q3hCLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVULElBQUksS0FBSyxFQUFFO1lBQ1QsNkJBQTZCLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDN0MsMEJBQTBCLENBQ3hCLFNBQVMsRUFDVCxXQUFXLEVBQ1gsZ0JBQWdCLEVBQ2hCLGdCQUFnQixDQUNqQixDQUFDO1NBQ0g7UUFFRCxJQUFJLGFBQWEsRUFBRTtZQUNqQixpQkFBaUIsQ0FBQyxhQUFhLEVBQUUsV0FBVyxFQUFFLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQ25FO1FBRUQsT0FBTyxTQUFTLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQztJQUN4RCxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDbEIsQ0FBQztBQUVELE1BQU0sVUFBVSxHQUlKLGdCQUFnQixFQUFFLENBQUM7QUFDL0IsTUFBTSxVQUFVLEdBSUcsZ0JBQWdCLEVBQUUsQ0FBQztBQUV0QyxPQUFPLEVBQ0wsWUFBWSxFQUNaLGNBQWMsRUFDZCxlQUFlLEVBQ2YsSUFBSSxFQUNKLGdCQUFnQixFQUNoQixnQkFBZ0IsRUFDaEIsVUFBVSxFQUNWLFVBQVUsRUFDVixJQUFJLEVBQ0osS0FBSyxFQUNMLGNBQWMsRUFDZCxjQUFjLEVBQ2QsSUFBSSxFQUNKLFFBQVEsSUFBSSxRQUFRLEVBQ3JCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE4IFRoZSBJbmNyZW1lbnRhbCBET00gQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7XG4gIGFzc2VydEluUGF0Y2gsXG4gIGFzc2VydE5vQ2hpbGRyZW5EZWNsYXJlZFlldCxcbiAgYXNzZXJ0Tm90SW5BdHRyaWJ1dGVzLFxuICBhc3NlcnROb1VuY2xvc2VkVGFncyxcbiAgYXNzZXJ0UGF0Y2hFbGVtZW50Tm9FeHRyYXMsXG4gIGFzc2VydFBhdGNoT3V0ZXJIYXNQYXJlbnROb2RlLFxuICBhc3NlcnRWaXJ0dWFsQXR0cmlidXRlc0Nsb3NlZCxcbiAgc2V0SW5BdHRyaWJ1dGVzLFxuICBzZXRJblNraXAsXG4gIHVwZGF0ZVBhdGNoQ29udGV4dFxufSBmcm9tIFwiLi9hc3NlcnRpb25zXCI7XG5pbXBvcnQgeyBDb250ZXh0IH0gZnJvbSBcIi4vY29udGV4dFwiO1xuaW1wb3J0IHsgZ2V0Rm9jdXNlZFBhdGgsIG1vdmVCZWZvcmUgfSBmcm9tIFwiLi9kb21fdXRpbFwiO1xuaW1wb3J0IHsgREVCVUcgfSBmcm9tIFwiLi9nbG9iYWxcIjtcbmltcG9ydCB7IGdldERhdGEgfSBmcm9tIFwiLi9ub2RlX2RhdGFcIjtcbmltcG9ydCB7IGNyZWF0ZUVsZW1lbnQsIGNyZWF0ZVRleHQgfSBmcm9tIFwiLi9ub2Rlc1wiO1xuaW1wb3J0IHtcbiAgS2V5LFxuICBNYXRjaEZuRGVmLFxuICBOYW1lT3JDdG9yRGVmLFxuICBQYXRjaENvbmZpZyxcbiAgUGF0Y2hGdW5jdGlvblxufSBmcm9tIFwiLi90eXBlc1wiO1xuXG4vKipcbiAqIFRoZSBkZWZhdWx0IG1hdGNoIGZ1bmN0aW9uIHRvIHVzZSwgaWYgb25lIHdhcyBub3Qgc3BlY2lmaWVkIHdoZW4gY3JlYXRpbmdcbiAqIHRoZSBwYXRjaGVyLlxuICogQHBhcmFtIG1hdGNoTm9kZSBUaGUgbm9kZSB0byBtYXRjaCBhZ2FpbnN0LCB1bnVzZWQuXG4gKiBAcGFyYW0gbmFtZU9yQ3RvciBUaGUgbmFtZSBvciBjb25zdHJ1Y3RvciBhcyBkZWNsYXJlZC5cbiAqIEBwYXJhbSBleHBlY3RlZE5hbWVPckN0b3IgVGhlIG5hbWUgb3IgY29uc3RydWN0b3Igb2YgdGhlIGV4aXN0aW5nIG5vZGUuXG4gKiBAcGFyYW0ga2V5IFRoZSBrZXkgYXMgZGVjbGFyZWQuXG4gKiBAcGFyYW0gZXhwZWN0ZWRLZXkgVGhlIGtleSBvZiB0aGUgZXhpc3Rpbmcgbm9kZS5cbiAqIEByZXR1cm5zIFRydWUgaWYgdGhlIG5vZGUgbWF0Y2hlcywgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5mdW5jdGlvbiBkZWZhdWx0TWF0Y2hGbihcbiAgbWF0Y2hOb2RlOiBOb2RlLFxuICBuYW1lT3JDdG9yOiBOYW1lT3JDdG9yRGVmLFxuICBleHBlY3RlZE5hbWVPckN0b3I6IE5hbWVPckN0b3JEZWYsXG4gIGtleTogS2V5LFxuICBleHBlY3RlZEtleTogS2V5XG4pOiBib29sZWFuIHtcbiAgLy8gS2V5IGNoZWNrIGlzIGRvbmUgdXNpbmcgZG91YmxlIGVxdWFscyBhcyB3ZSB3YW50IHRvIHRyZWF0IGEgbnVsbCBrZXkgdGhlXG4gIC8vIHNhbWUgYXMgdW5kZWZpbmVkLiBUaGlzIHNob3VsZCBiZSBva2F5IGFzIHRoZSBvbmx5IHZhbHVlcyBhbGxvd2VkIGFyZVxuICAvLyBzdHJpbmdzLCBudWxsIGFuZCB1bmRlZmluZWQgc28gdGhlID09IHNlbWFudGljcyBhcmUgbm90IHRvbyB3ZWlyZC5cbiAgcmV0dXJuIG5hbWVPckN0b3IgPT0gZXhwZWN0ZWROYW1lT3JDdG9yICYmIGtleSA9PSBleHBlY3RlZEtleTtcbn1cblxubGV0IGNvbnRleHQ6IENvbnRleHQgfCBudWxsID0gbnVsbDtcblxubGV0IGN1cnJlbnROb2RlOiBOb2RlIHwgbnVsbCA9IG51bGw7XG5cbmxldCBjdXJyZW50UGFyZW50OiBOb2RlIHwgbnVsbCA9IG51bGw7XG5cbmxldCBkb2M6IERvY3VtZW50IHwgbnVsbCA9IG51bGw7XG5cbmxldCBmb2N1c1BhdGg6IEFycmF5PE5vZGU+ID0gW107XG5cbmxldCBtYXRjaEZuOiBNYXRjaEZuRGVmID0gZGVmYXVsdE1hdGNoRm47XG5cbi8qKlxuICogVXNlZCB0byBidWlsZCB1cCBjYWxsIGFyZ3VtZW50cy4gRWFjaCBwYXRjaCBjYWxsIGdldHMgYSBzZXBhcmF0ZSBjb3B5LCBzb1xuICogdGhpcyB3b3JrcyB3aXRoIG5lc3RlZCBjYWxscyB0byBwYXRjaC5cbiAqL1xubGV0IGFyZ3NCdWlsZGVyOiBBcnJheTx7fSB8IG51bGwgfCB1bmRlZmluZWQ+ID0gW107XG5cbi8qKlxuICogVXNlZCB0byBidWlsZCB1cCBhdHRycyBmb3IgdGhlIGFuIGVsZW1lbnQuXG4gKi9cbmxldCBhdHRyc0J1aWxkZXI6IEFycmF5PGFueT4gPSBbXTtcblxuLyoqXG4gKiBUT0RPKHNwYXJoYW1pKSBXZSBzaG91bGQganVzdCBleHBvcnQgYXJnc0J1aWxkZXIgZGlyZWN0bHkgd2hlbiBDbG9zdXJlXG4gKiBDb21waWxlciBzdXBwb3J0cyBFUzYgZGlyZWN0bHkuXG4gKiBAcmV0dXJucyBUaGUgQXJyYXkgdXNlZCBmb3IgYnVpbGRpbmcgYXJndW1lbnRzLlxuICovXG5mdW5jdGlvbiBnZXRBcmdzQnVpbGRlcigpOiBBcnJheTxhbnk+IHtcbiAgcmV0dXJuIGFyZ3NCdWlsZGVyO1xufVxuXG4vKipcbiAqIFRPRE8oc3BhcmhhbWkpIFdlIHNob3VsZCBqdXN0IGV4cG9ydCBhdHRyc0J1aWxkZXIgZGlyZWN0bHkgd2hlbiBDbG9zdXJlXG4gKiBDb21waWxlciBzdXBwb3J0cyBFUzYgZGlyZWN0bHkuXG4gKiBAcmV0dXJucyBUaGUgQXJyYXkgdXNlZCBmb3IgYnVpbGRpbmcgYXJndW1lbnRzLlxuICovXG5mdW5jdGlvbiBnZXRBdHRyc0J1aWxkZXIoKTogQXJyYXk8YW55PiB7XG4gIHJldHVybiBhdHRyc0J1aWxkZXI7XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgb3Igbm90IHRoZSBjdXJyZW50IG5vZGUgbWF0Y2hlcyB0aGUgc3BlY2lmaWVkIG5hbWVPckN0b3IgYW5kXG4gKiBrZXkuIFRoaXMgdXNlcyB0aGUgc3BlY2lmaWVkIG1hdGNoIGZ1bmN0aW9uIHdoZW4gY3JlYXRpbmcgdGhlIHBhdGNoZXIuXG4gKiBAcGFyYW0gbWF0Y2hOb2RlIEEgbm9kZSB0byBtYXRjaCB0aGUgZGF0YSB0by5cbiAqIEBwYXJhbSBuYW1lT3JDdG9yIFRoZSBuYW1lIG9yIGNvbnN0cnVjdG9yIHRvIGNoZWNrIGZvci5cbiAqIEBwYXJhbSBrZXkgVGhlIGtleSB1c2VkIHRvIGlkZW50aWZ5IHRoZSBOb2RlLlxuICogQHJldHVybiBUcnVlIGlmIHRoZSBub2RlIG1hdGNoZXMsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZnVuY3Rpb24gbWF0Y2hlcyhcbiAgbWF0Y2hOb2RlOiBOb2RlLFxuICBuYW1lT3JDdG9yOiBOYW1lT3JDdG9yRGVmLFxuICBrZXk6IEtleVxuKTogYm9vbGVhbiB7XG4gIGNvbnN0IGRhdGEgPSBnZXREYXRhKG1hdGNoTm9kZSwga2V5KTtcblxuICByZXR1cm4gbWF0Y2hGbihtYXRjaE5vZGUsIG5hbWVPckN0b3IsIGRhdGEubmFtZU9yQ3Rvciwga2V5LCBkYXRhLmtleSk7XG59XG5cbi8qKlxuICogRmluZHMgdGhlIG1hdGNoaW5nIG5vZGUsIHN0YXJ0aW5nIGF0IGBub2RlYCBhbmQgbG9va2luZyBhdCB0aGUgc3Vic2VxdWVudFxuICogc2libGluZ3MgaWYgYSBrZXkgaXMgdXNlZC5cbiAqIEBwYXJhbSBtYXRjaE5vZGUgVGhlIG5vZGUgdG8gc3RhcnQgbG9va2luZyBhdC5cbiAqIEBwYXJhbSBuYW1lT3JDdG9yIFRoZSBuYW1lIG9yIGNvbnN0cnVjdG9yIGZvciB0aGUgTm9kZS5cbiAqIEBwYXJhbSBrZXkgVGhlIGtleSB1c2VkIHRvIGlkZW50aWZ5IHRoZSBOb2RlLlxuICogQHJldHVybnMgVGhlIG1hdGNoaW5nIE5vZGUsIGlmIGFueSBleGlzdHMuXG4gKi9cbmZ1bmN0aW9uIGdldE1hdGNoaW5nTm9kZShcbiAgbWF0Y2hOb2RlOiBOb2RlIHwgbnVsbCxcbiAgbmFtZU9yQ3RvcjogTmFtZU9yQ3RvckRlZixcbiAga2V5OiBLZXlcbik6IE5vZGUgfCBudWxsIHtcbiAgaWYgKCFtYXRjaE5vZGUpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGxldCBjdXI6IE5vZGUgfCBudWxsID0gbWF0Y2hOb2RlO1xuXG4gIGRvIHtcbiAgICBpZiAobWF0Y2hlcyhjdXIsIG5hbWVPckN0b3IsIGtleSkpIHtcbiAgICAgIHJldHVybiBjdXI7XG4gICAgfVxuICB9IHdoaWxlIChrZXkgJiYgKGN1ciA9IGN1ci5uZXh0U2libGluZykpO1xuXG4gIHJldHVybiBudWxsO1xufVxuLyoqXG4gKiBDbGVhcnMgb3V0IGFueSB1bnZpc2l0ZWQgTm9kZXMgaW4gYSBnaXZlbiByYW5nZS5cbiAqIEBwYXJhbSBtYXliZVBhcmVudE5vZGVcbiAqIEBwYXJhbSBzdGFydE5vZGUgVGhlIG5vZGUgdG8gc3RhcnQgY2xlYXJpbmcgZnJvbSwgaW5jbHVzaXZlLlxuICogQHBhcmFtIGVuZE5vZGUgVGhlIG5vZGUgdG8gY2xlYXIgdW50aWwsIGV4Y2x1c2l2ZS5cbiAqL1xuZnVuY3Rpb24gY2xlYXJVbnZpc2l0ZWRET00oXG4gIG1heWJlUGFyZW50Tm9kZTogTm9kZSB8IG51bGwsXG4gIHN0YXJ0Tm9kZTogTm9kZSB8IG51bGwsXG4gIGVuZE5vZGU6IE5vZGUgfCBudWxsXG4pIHtcbiAgY29uc3QgcGFyZW50Tm9kZSA9IG1heWJlUGFyZW50Tm9kZSE7XG4gIGxldCBjaGlsZCA9IHN0YXJ0Tm9kZTtcblxuICB3aGlsZSAoY2hpbGQgIT09IGVuZE5vZGUpIHtcbiAgICBjb25zdCBuZXh0ID0gY2hpbGQhLm5leHRTaWJsaW5nO1xuICAgIHBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoY2hpbGQhKTtcbiAgICBjb250ZXh0IS5tYXJrRGVsZXRlZChjaGlsZCEpO1xuICAgIGNoaWxkID0gbmV4dDtcbiAgfVxufVxuXG4vKipcbiAqIEByZXR1cm4gVGhlIG5leHQgTm9kZSB0byBiZSBwYXRjaGVkLlxuICovXG5mdW5jdGlvbiBnZXROZXh0Tm9kZSgpOiBOb2RlIHwgbnVsbCB7XG4gIGlmIChjdXJyZW50Tm9kZSkge1xuICAgIHJldHVybiBjdXJyZW50Tm9kZS5uZXh0U2libGluZztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gY3VycmVudFBhcmVudCEuZmlyc3RDaGlsZDtcbiAgfVxufVxuXG4vKipcbiAqIENoYW5nZXMgdG8gdGhlIGZpcnN0IGNoaWxkIG9mIHRoZSBjdXJyZW50IG5vZGUuXG4gKi9cbmZ1bmN0aW9uIGVudGVyTm9kZSgpIHtcbiAgY3VycmVudFBhcmVudCA9IGN1cnJlbnROb2RlO1xuICBjdXJyZW50Tm9kZSA9IG51bGw7XG59XG5cbi8qKlxuICogQ2hhbmdlcyB0byB0aGUgcGFyZW50IG9mIHRoZSBjdXJyZW50IG5vZGUsIHJlbW92aW5nIGFueSB1bnZpc2l0ZWQgY2hpbGRyZW4uXG4gKi9cbmZ1bmN0aW9uIGV4aXROb2RlKCkge1xuICBjbGVhclVudmlzaXRlZERPTShjdXJyZW50UGFyZW50LCBnZXROZXh0Tm9kZSgpLCBudWxsKTtcblxuICBjdXJyZW50Tm9kZSA9IGN1cnJlbnRQYXJlbnQ7XG4gIGN1cnJlbnRQYXJlbnQgPSBjdXJyZW50UGFyZW50IS5wYXJlbnROb2RlO1xufVxuXG4vKipcbiAqIENoYW5nZXMgdG8gdGhlIG5leHQgc2libGluZyBvZiB0aGUgY3VycmVudCBub2RlLlxuICovXG5mdW5jdGlvbiBuZXh0Tm9kZSgpIHtcbiAgY3VycmVudE5vZGUgPSBnZXROZXh0Tm9kZSgpO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBOb2RlIGFuZCBtYXJraW5nIGl0IGFzIGNyZWF0ZWQuXG4gKiBAcGFyYW0gbmFtZU9yQ3RvciBUaGUgbmFtZSBvciBjb25zdHJ1Y3RvciBmb3IgdGhlIE5vZGUuXG4gKiBAcGFyYW0ga2V5IFRoZSBrZXkgdXNlZCB0byBpZGVudGlmeSB0aGUgTm9kZS5cbiAqIEByZXR1cm4gVGhlIG5ld2x5IGNyZWF0ZWQgbm9kZS5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlTm9kZShuYW1lT3JDdG9yOiBOYW1lT3JDdG9yRGVmLCBrZXk6IEtleSk6IE5vZGUge1xuICBsZXQgbm9kZTtcblxuICBpZiAobmFtZU9yQ3RvciA9PT0gXCIjdGV4dFwiKSB7XG4gICAgbm9kZSA9IGNyZWF0ZVRleHQoZG9jISk7XG4gIH0gZWxzZSB7XG4gICAgbm9kZSA9IGNyZWF0ZUVsZW1lbnQoZG9jISwgY3VycmVudFBhcmVudCEsIG5hbWVPckN0b3IsIGtleSk7XG4gIH1cblxuICBjb250ZXh0IS5tYXJrQ3JlYXRlZChub2RlKTtcblxuICByZXR1cm4gbm9kZTtcbn1cblxuLyoqXG4gKiBBbGlnbnMgdGhlIHZpcnR1YWwgTm9kZSBkZWZpbml0aW9uIHdpdGggdGhlIGFjdHVhbCBET00sIG1vdmluZyB0aGVcbiAqIGNvcnJlc3BvbmRpbmcgRE9NIG5vZGUgdG8gdGhlIGNvcnJlY3QgbG9jYXRpb24gb3IgY3JlYXRpbmcgaXQgaWYgbmVjZXNzYXJ5LlxuICogQHBhcmFtIG5hbWVPckN0b3IgVGhlIG5hbWUgb3IgY29uc3RydWN0b3IgZm9yIHRoZSBOb2RlLlxuICogQHBhcmFtIGtleSBUaGUga2V5IHVzZWQgdG8gaWRlbnRpZnkgdGhlIE5vZGUuXG4gKi9cbmZ1bmN0aW9uIGFsaWduV2l0aERPTShuYW1lT3JDdG9yOiBOYW1lT3JDdG9yRGVmLCBrZXk6IEtleSkge1xuICBuZXh0Tm9kZSgpO1xuICBjb25zdCBleGlzdGluZ05vZGUgPSBnZXRNYXRjaGluZ05vZGUoY3VycmVudE5vZGUsIG5hbWVPckN0b3IsIGtleSk7XG4gIGNvbnN0IG5vZGUgPSBleGlzdGluZ05vZGUgfHwgY3JlYXRlTm9kZShuYW1lT3JDdG9yLCBrZXkpO1xuXG4gIC8vIElmIHdlIGFyZSBhdCB0aGUgbWF0Y2hpbmcgbm9kZSwgdGhlbiB3ZSBhcmUgZG9uZS5cbiAgaWYgKG5vZGUgPT09IGN1cnJlbnROb2RlKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gUmUtb3JkZXIgdGhlIG5vZGUgaW50byB0aGUgcmlnaHQgcG9zaXRpb24sIHByZXNlcnZpbmcgZm9jdXMgaWYgZWl0aGVyXG4gIC8vIG5vZGUgb3IgY3VycmVudE5vZGUgYXJlIGZvY3VzZWQgYnkgbWFraW5nIHN1cmUgdGhhdCB0aGV5IGFyZSBub3QgZGV0YWNoZWRcbiAgLy8gZnJvbSB0aGUgRE9NLlxuICBpZiAoZm9jdXNQYXRoLmluZGV4T2Yobm9kZSkgPj0gMCkge1xuICAgIC8vIE1vdmUgZXZlcnl0aGluZyBlbHNlIGJlZm9yZSB0aGUgbm9kZS5cbiAgICBtb3ZlQmVmb3JlKGN1cnJlbnRQYXJlbnQhLCBub2RlLCBjdXJyZW50Tm9kZSk7XG4gIH0gZWxzZSB7XG4gICAgY3VycmVudFBhcmVudCEuaW5zZXJ0QmVmb3JlKG5vZGUsIGN1cnJlbnROb2RlKTtcbiAgfVxuXG4gIGN1cnJlbnROb2RlID0gbm9kZTtcbn1cblxuLyoqXG4gKiBNYWtlcyBzdXJlIHRoYXQgdGhlIGN1cnJlbnQgbm9kZSBpcyBhbiBFbGVtZW50IHdpdGggYSBtYXRjaGluZyBuYW1lT3JDdG9yIGFuZFxuICoga2V5LlxuICpcbiAqIEBwYXJhbSBuYW1lT3JDdG9yIFRoZSB0YWcgb3IgY29uc3RydWN0b3IgZm9yIHRoZSBFbGVtZW50LlxuICogQHBhcmFtIGtleSBUaGUga2V5IHVzZWQgdG8gaWRlbnRpZnkgdGhpcyBlbGVtZW50LiBUaGlzIGNhbiBiZSBhblxuICogICAgIGVtcHR5IHN0cmluZywgYnV0IHBlcmZvcm1hbmNlIG1heSBiZSBiZXR0ZXIgaWYgYSB1bmlxdWUgdmFsdWUgaXMgdXNlZFxuICogICAgIHdoZW4gaXRlcmF0aW5nIG92ZXIgYW4gYXJyYXkgb2YgaXRlbXMuXG4gKiBAcmV0dXJuIFRoZSBjb3JyZXNwb25kaW5nIEVsZW1lbnQuXG4gKi9cbmZ1bmN0aW9uIG9wZW4obmFtZU9yQ3RvcjogTmFtZU9yQ3RvckRlZiwga2V5PzogS2V5KTogSFRNTEVsZW1lbnQge1xuICBhbGlnbldpdGhET00obmFtZU9yQ3Rvciwga2V5KTtcbiAgZW50ZXJOb2RlKCk7XG4gIHJldHVybiBjdXJyZW50UGFyZW50IGFzIEhUTUxFbGVtZW50O1xufVxuXG4vKipcbiAqIENsb3NlcyB0aGUgY3VycmVudGx5IG9wZW4gRWxlbWVudCwgcmVtb3ZpbmcgYW55IHVudmlzaXRlZCBjaGlsZHJlbiBpZlxuICogbmVjZXNzYXJ5LlxuICogQHJldHVybnMgVGhlIEVsZW1lbnQgdGhhdCB3YXMganVzdCBjbG9zZWQuXG4gKi9cbmZ1bmN0aW9uIGNsb3NlKCk6IEVsZW1lbnQge1xuICBpZiAoREVCVUcpIHtcbiAgICBzZXRJblNraXAoZmFsc2UpO1xuICB9XG5cbiAgZXhpdE5vZGUoKTtcbiAgcmV0dXJuIGN1cnJlbnROb2RlIGFzIEVsZW1lbnQ7XG59XG5cbi8qKlxuICogTWFrZXMgc3VyZSB0aGUgY3VycmVudCBub2RlIGlzIGEgVGV4dCBub2RlIGFuZCBjcmVhdGVzIGEgVGV4dCBub2RlIGlmIGl0IGlzXG4gKiBub3QuXG4gKiBAcmV0dXJucyBUaGUgVGV4dCBub2RlIHRoYXQgd2FzIGFsaWduZWQgb3IgY3JlYXRlZC5cbiAqL1xuZnVuY3Rpb24gdGV4dCgpOiBUZXh0IHtcbiAgYWxpZ25XaXRoRE9NKFwiI3RleHRcIiwgbnVsbCk7XG4gIHJldHVybiBjdXJyZW50Tm9kZSBhcyBUZXh0O1xufVxuXG4vKipcbiAqIEByZXR1cm5zIFRoZSBjdXJyZW50IEVsZW1lbnQgYmVpbmcgcGF0Y2hlZC5cbiAqL1xuZnVuY3Rpb24gY3VycmVudEVsZW1lbnQoKTogRWxlbWVudCB7XG4gIGlmIChERUJVRykge1xuICAgIGFzc2VydEluUGF0Y2goXCJjdXJyZW50RWxlbWVudFwiKTtcbiAgICBhc3NlcnROb3RJbkF0dHJpYnV0ZXMoXCJjdXJyZW50RWxlbWVudFwiKTtcbiAgfVxuICByZXR1cm4gY3VycmVudFBhcmVudCBhcyBFbGVtZW50O1xufVxuXG4vKipcbiAqIEByZXR1cm4gVGhlIE5vZGUgdGhhdCB3aWxsIGJlIGV2YWx1YXRlZCBmb3IgdGhlIG5leHQgaW5zdHJ1Y3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGN1cnJlbnRQb2ludGVyKCk6IE5vZGUge1xuICBpZiAoREVCVUcpIHtcbiAgICBhc3NlcnRJblBhdGNoKFwiY3VycmVudFBvaW50ZXJcIik7XG4gICAgYXNzZXJ0Tm90SW5BdHRyaWJ1dGVzKFwiY3VycmVudFBvaW50ZXJcIik7XG4gIH1cbiAgLy8gVE9ETyh0b21uZ3V5ZW4pOiBhc3NlcnQgdGhhdCB0aGlzIGlzIG5vdCBudWxsXG4gIHJldHVybiBnZXROZXh0Tm9kZSgpITtcbn1cblxuLyoqXG4gKiBTa2lwcyB0aGUgY2hpbGRyZW4gaW4gYSBzdWJ0cmVlLCBhbGxvd2luZyBhbiBFbGVtZW50IHRvIGJlIGNsb3NlZCB3aXRob3V0XG4gKiBjbGVhcmluZyBvdXQgdGhlIGNoaWxkcmVuLlxuICovXG5mdW5jdGlvbiBza2lwKCkge1xuICBpZiAoREVCVUcpIHtcbiAgICBhc3NlcnROb0NoaWxkcmVuRGVjbGFyZWRZZXQoXCJza2lwXCIsIGN1cnJlbnROb2RlKTtcbiAgICBzZXRJblNraXAodHJ1ZSk7XG4gIH1cbiAgY3VycmVudE5vZGUgPSBjdXJyZW50UGFyZW50IS5sYXN0Q2hpbGQ7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHBhdGNoZXIgZnVuY3Rpb24gdGhhdCBzZXRzIHVwIGFuZCByZXN0b3JlcyBhIHBhdGNoIGNvbnRleHQsXG4gKiBydW5uaW5nIHRoZSBydW4gZnVuY3Rpb24gd2l0aCB0aGUgcHJvdmlkZWQgZGF0YS5cbiAqIEBwYXJhbSBydW4gVGhlIGZ1bmN0aW9uIHRoYXQgd2lsbCBydW4gdGhlIHBhdGNoLlxuICogQHBhcmFtIHBhdGNoQ29uZmlnIFRoZSBjb25maWd1cmF0aW9uIHRvIHVzZSBmb3IgdGhlIHBhdGNoLlxuICogQHJldHVybnMgVGhlIGNyZWF0ZWQgcGF0Y2ggZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVBhdGNoZXI8VCwgUj4oXG4gIHJ1bjogUGF0Y2hGdW5jdGlvbjxULCBSPixcbiAgcGF0Y2hDb25maWc6IFBhdGNoQ29uZmlnID0ge31cbik6IFBhdGNoRnVuY3Rpb248VCwgUj4ge1xuICBjb25zdCB7IG1hdGNoZXMgPSBkZWZhdWx0TWF0Y2hGbiB9ID0gcGF0Y2hDb25maWc7XG5cbiAgY29uc3QgZjogUGF0Y2hGdW5jdGlvbjxULCBSPiA9IChub2RlLCBmbiwgZGF0YSkgPT4ge1xuICAgIGNvbnN0IHByZXZDb250ZXh0ID0gY29udGV4dDtcbiAgICBjb25zdCBwcmV2RG9jID0gZG9jO1xuICAgIGNvbnN0IHByZXZGb2N1c1BhdGggPSBmb2N1c1BhdGg7XG4gICAgY29uc3QgcHJldkFyZ3NCdWlsZGVyID0gYXJnc0J1aWxkZXI7XG4gICAgY29uc3QgcHJldkF0dHJzQnVpbGRlciA9IGF0dHJzQnVpbGRlcjtcbiAgICBjb25zdCBwcmV2Q3VycmVudE5vZGUgPSBjdXJyZW50Tm9kZTtcbiAgICBjb25zdCBwcmV2Q3VycmVudFBhcmVudCA9IGN1cnJlbnRQYXJlbnQ7XG4gICAgY29uc3QgcHJldk1hdGNoRm4gPSBtYXRjaEZuO1xuICAgIGxldCBwcmV2aW91c0luQXR0cmlidXRlcyA9IGZhbHNlO1xuICAgIGxldCBwcmV2aW91c0luU2tpcCA9IGZhbHNlO1xuXG4gICAgZG9jID0gbm9kZS5vd25lckRvY3VtZW50O1xuICAgIGNvbnRleHQgPSBuZXcgQ29udGV4dCgpO1xuICAgIG1hdGNoRm4gPSBtYXRjaGVzO1xuICAgIGFyZ3NCdWlsZGVyID0gW107XG4gICAgYXR0cnNCdWlsZGVyID0gW107XG4gICAgY3VycmVudE5vZGUgPSBudWxsO1xuICAgIGN1cnJlbnRQYXJlbnQgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgZm9jdXNQYXRoID0gZ2V0Rm9jdXNlZFBhdGgobm9kZSwgY3VycmVudFBhcmVudCk7XG5cbiAgICBpZiAoREVCVUcpIHtcbiAgICAgIHByZXZpb3VzSW5BdHRyaWJ1dGVzID0gc2V0SW5BdHRyaWJ1dGVzKGZhbHNlKTtcbiAgICAgIHByZXZpb3VzSW5Ta2lwID0gc2V0SW5Ta2lwKGZhbHNlKTtcbiAgICAgIHVwZGF0ZVBhdGNoQ29udGV4dChjb250ZXh0KTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmV0VmFsID0gcnVuKG5vZGUsIGZuLCBkYXRhKTtcbiAgICAgIGlmIChERUJVRykge1xuICAgICAgICBhc3NlcnRWaXJ0dWFsQXR0cmlidXRlc0Nsb3NlZCgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmV0VmFsO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBjb250ZXh0Lm5vdGlmeUNoYW5nZXMoKTtcblxuICAgICAgZG9jID0gcHJldkRvYztcbiAgICAgIGNvbnRleHQgPSBwcmV2Q29udGV4dDtcbiAgICAgIG1hdGNoRm4gPSBwcmV2TWF0Y2hGbjtcbiAgICAgIGFyZ3NCdWlsZGVyID0gcHJldkFyZ3NCdWlsZGVyO1xuICAgICAgYXR0cnNCdWlsZGVyID0gcHJldkF0dHJzQnVpbGRlcjtcbiAgICAgIGN1cnJlbnROb2RlID0gcHJldkN1cnJlbnROb2RlO1xuICAgICAgY3VycmVudFBhcmVudCA9IHByZXZDdXJyZW50UGFyZW50O1xuICAgICAgZm9jdXNQYXRoID0gcHJldkZvY3VzUGF0aDtcblxuICAgICAgLy8gTmVlZHMgdG8gYmUgZG9uZSBhZnRlciBhc3NlcnRpb25zIGJlY2F1c2UgYXNzZXJ0aW9ucyByZWx5IG9uIHN0YXRlXG4gICAgICAvLyBmcm9tIHRoZXNlIG1ldGhvZHMuXG4gICAgICBpZiAoREVCVUcpIHtcbiAgICAgICAgc2V0SW5BdHRyaWJ1dGVzKHByZXZpb3VzSW5BdHRyaWJ1dGVzKTtcbiAgICAgICAgc2V0SW5Ta2lwKHByZXZpb3VzSW5Ta2lwKTtcbiAgICAgICAgdXBkYXRlUGF0Y2hDb250ZXh0KGNvbnRleHQpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGY7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHBhdGNoZXIgdGhhdCBwYXRjaGVzIHRoZSBkb2N1bWVudCBzdGFydGluZyBhdCBub2RlIHdpdGggYVxuICogcHJvdmlkZWQgZnVuY3Rpb24uIFRoaXMgZnVuY3Rpb24gbWF5IGJlIGNhbGxlZCBkdXJpbmcgYW4gZXhpc3RpbmcgcGF0Y2ggb3BlcmF0aW9uLlxuICogQHBhcmFtIHBhdGNoQ29uZmlnIFRoZSBjb25maWcgdG8gdXNlIGZvciB0aGUgcGF0Y2guXG4gKiBAcmV0dXJucyBUaGUgY3JlYXRlZCBmdW5jdGlvbiBmb3IgcGF0Y2hpbmcgYW4gRWxlbWVudCdzIGNoaWxkcmVuLlxuICovXG5mdW5jdGlvbiBjcmVhdGVQYXRjaElubmVyPFQ+KFxuICBwYXRjaENvbmZpZz86IFBhdGNoQ29uZmlnXG4pOiBQYXRjaEZ1bmN0aW9uPFQsIE5vZGU+IHtcbiAgcmV0dXJuIGNyZWF0ZVBhdGNoZXIoKG5vZGUsIGZuLCBkYXRhKSA9PiB7XG4gICAgY3VycmVudE5vZGUgPSBub2RlO1xuXG4gICAgZW50ZXJOb2RlKCk7XG4gICAgZm4oZGF0YSk7XG4gICAgZXhpdE5vZGUoKTtcblxuICAgIGlmIChERUJVRykge1xuICAgICAgYXNzZXJ0Tm9VbmNsb3NlZFRhZ3MoY3VycmVudE5vZGUsIG5vZGUpO1xuICAgIH1cblxuICAgIHJldHVybiBub2RlO1xuICB9LCBwYXRjaENvbmZpZyk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHBhdGNoZXIgdGhhdCBwYXRjaGVzIGFuIEVsZW1lbnQgd2l0aCB0aGUgdGhlIHByb3ZpZGVkIGZ1bmN0aW9uLlxuICogRXhhY3RseSBvbmUgdG9wIGxldmVsIGVsZW1lbnQgY2FsbCBzaG91bGQgYmUgbWFkZSBjb3JyZXNwb25kaW5nIHRvIGBub2RlYC5cbiAqIEBwYXJhbSBwYXRjaENvbmZpZyBUaGUgY29uZmlnIHRvIHVzZSBmb3IgdGhlIHBhdGNoLlxuICogQHJldHVybnMgVGhlIGNyZWF0ZWQgZnVuY3Rpb24gZm9yIHBhdGNoaW5nIGFuIEVsZW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVBhdGNoT3V0ZXI8VD4oXG4gIHBhdGNoQ29uZmlnPzogUGF0Y2hDb25maWdcbik6IFBhdGNoRnVuY3Rpb248VCwgTm9kZSB8IG51bGw+IHtcbiAgcmV0dXJuIGNyZWF0ZVBhdGNoZXIoKG5vZGUsIGZuLCBkYXRhKSA9PiB7XG4gICAgY29uc3Qgc3RhcnROb2RlID0gKHsgbmV4dFNpYmxpbmc6IG5vZGUgfSBhcyBhbnkpIGFzIEVsZW1lbnQ7XG4gICAgbGV0IGV4cGVjdGVkTmV4dE5vZGU6IE5vZGUgfCBudWxsID0gbnVsbDtcbiAgICBsZXQgZXhwZWN0ZWRQcmV2Tm9kZTogTm9kZSB8IG51bGwgPSBudWxsO1xuXG4gICAgaWYgKERFQlVHKSB7XG4gICAgICBleHBlY3RlZE5leHROb2RlID0gbm9kZS5uZXh0U2libGluZztcbiAgICAgIGV4cGVjdGVkUHJldk5vZGUgPSBub2RlLnByZXZpb3VzU2libGluZztcbiAgICB9XG5cbiAgICBjdXJyZW50Tm9kZSA9IHN0YXJ0Tm9kZTtcbiAgICBmbihkYXRhKTtcblxuICAgIGlmIChERUJVRykge1xuICAgICAgYXNzZXJ0UGF0Y2hPdXRlckhhc1BhcmVudE5vZGUoY3VycmVudFBhcmVudCk7XG4gICAgICBhc3NlcnRQYXRjaEVsZW1lbnROb0V4dHJhcyhcbiAgICAgICAgc3RhcnROb2RlLFxuICAgICAgICBjdXJyZW50Tm9kZSxcbiAgICAgICAgZXhwZWN0ZWROZXh0Tm9kZSxcbiAgICAgICAgZXhwZWN0ZWRQcmV2Tm9kZVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoY3VycmVudFBhcmVudCkge1xuICAgICAgY2xlYXJVbnZpc2l0ZWRET00oY3VycmVudFBhcmVudCwgZ2V0TmV4dE5vZGUoKSwgbm9kZS5uZXh0U2libGluZyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0YXJ0Tm9kZSA9PT0gY3VycmVudE5vZGUgPyBudWxsIDogY3VycmVudE5vZGU7XG4gIH0sIHBhdGNoQ29uZmlnKTtcbn1cblxuY29uc3QgcGF0Y2hJbm5lcjogPFQ+KFxuICBub2RlOiBFbGVtZW50IHwgRG9jdW1lbnRGcmFnbWVudCxcbiAgdGVtcGxhdGU6IChhOiBUIHwgdW5kZWZpbmVkKSA9PiB2b2lkLFxuICBkYXRhPzogVCB8IHVuZGVmaW5lZFxuKSA9PiBOb2RlID0gY3JlYXRlUGF0Y2hJbm5lcigpO1xuY29uc3QgcGF0Y2hPdXRlcjogPFQ+KFxuICBub2RlOiBFbGVtZW50IHwgRG9jdW1lbnRGcmFnbWVudCxcbiAgdGVtcGxhdGU6IChhOiBUIHwgdW5kZWZpbmVkKSA9PiB2b2lkLFxuICBkYXRhPzogVCB8IHVuZGVmaW5lZFxuKSA9PiBOb2RlIHwgbnVsbCA9IGNyZWF0ZVBhdGNoT3V0ZXIoKTtcblxuZXhwb3J0IHtcbiAgYWxpZ25XaXRoRE9NLFxuICBnZXRBcmdzQnVpbGRlcixcbiAgZ2V0QXR0cnNCdWlsZGVyLFxuICB0ZXh0LFxuICBjcmVhdGVQYXRjaElubmVyLFxuICBjcmVhdGVQYXRjaE91dGVyLFxuICBwYXRjaElubmVyLFxuICBwYXRjaE91dGVyLFxuICBvcGVuLFxuICBjbG9zZSxcbiAgY3VycmVudEVsZW1lbnQsXG4gIGN1cnJlbnRQb2ludGVyLFxuICBza2lwLFxuICBuZXh0Tm9kZSBhcyBza2lwTm9kZVxufTtcbiJdfQ==