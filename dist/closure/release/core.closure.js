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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3JlbGVhc2UvY29yZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7R0FjRztBQUVILE9BQU8sRUFDTCxhQUFhLEVBQ2IsMkJBQTJCLEVBQzNCLHFCQUFxQixFQUNyQixvQkFBb0IsRUFDcEIsMEJBQTBCLEVBQzFCLDZCQUE2QixFQUM3Qiw2QkFBNkIsRUFDN0IsZUFBZSxFQUNmLFNBQVMsRUFDVCxrQkFBa0IsRUFDbkIsTUFBTSxjQUFjLENBQUM7QUFDdEIsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUNwQyxPQUFPLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUN4RCxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ2pDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDdEMsT0FBTyxFQUFFLGFBQWEsRUFBRSxVQUFVLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFTcEQ7Ozs7Ozs7OztHQVNHO0FBQ0gsU0FBUyxjQUFjLENBQ3JCLFNBQWUsRUFDZixVQUF5QixFQUN6QixrQkFBaUMsRUFDakMsR0FBUSxFQUNSLFdBQWdCO0lBRWhCLDJFQUEyRTtJQUMzRSx3RUFBd0U7SUFDeEUscUVBQXFFO0lBQ3JFLE9BQU8sVUFBVSxJQUFJLGtCQUFrQixJQUFJLEdBQUcsSUFBSSxXQUFXLENBQUM7QUFDaEUsQ0FBQztBQUVELElBQUksT0FBTyxHQUFtQixJQUFJLENBQUM7QUFFbkMsSUFBSSxXQUFXLEdBQWdCLElBQUksQ0FBQztBQUVwQyxJQUFJLGFBQWEsR0FBZ0IsSUFBSSxDQUFDO0FBRXRDLElBQUksR0FBRyxHQUFvQixJQUFJLENBQUM7QUFFaEMsSUFBSSxTQUFTLEdBQWdCLEVBQUUsQ0FBQztBQUVoQyxJQUFJLE9BQU8sR0FBZSxjQUFjLENBQUM7QUFFekM7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QztRQUN4QixFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFVCxJQUFJLEtBQUssRUFBRTtZQUNULDZCQUE2QixDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQzdDLDBCQUEwQixDQUN4QixTQUFTLEVBQ1QsV0FBVyxFQUNYLGdCQUFnQixFQUNoQixnQkFBZ0IsQ0FDakIsQ0FBQztTQUNIO1FBRUQsSUFBSSxhQUFhLEVBQUU7WUFDakIsaUJBQWlCLENBQUMsYUFBYSxFQUFFLFdBQVcsRUFBRSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUNuRTtRQUVELE9BQU8sU0FBUyxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUM7SUFDeEQsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBQ2xCLENBQUM7QUFFRCxNQUFNLFVBQVUsR0FJSixnQkFBZ0IsRUFBRSxDQUFDO0FBQy9CLE1BQU0sVUFBVSxHQUlHLGdCQUFnQixFQUFFLENBQUM7QUFFdEMsT0FBTyxFQUNMLFlBQVksRUFDWixjQUFjLEVBQ2QsZUFBZSxFQUNmLElBQUksRUFDSixnQkFBZ0IsRUFDaEIsZ0JBQWdCLEVBQ2hCLFVBQVUsRUFDVixVQUFVLEVBQ1YsSUFBSSxFQUNKLEtBQUssRUFDTCxjQUFjLEVBQ2QsY0FBYyxFQUNkLElBQUksRUFDSixRQUFRLElBQUksUUFBUSxFQUNyQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxOCBUaGUgSW5jcmVtZW50YWwgRE9NIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge1xuICBhc3NlcnRJblBhdGNoLFxuICBhc3NlcnROb0NoaWxkcmVuRGVjbGFyZWRZZXQsXG4gIGFzc2VydE5vdEluQXR0cmlidXRlcyxcbiAgYXNzZXJ0Tm9VbmNsb3NlZFRhZ3MsXG4gIGFzc2VydFBhdGNoRWxlbWVudE5vRXh0cmFzLFxuICBhc3NlcnRQYXRjaE91dGVySGFzUGFyZW50Tm9kZSxcbiAgYXNzZXJ0VmlydHVhbEF0dHJpYnV0ZXNDbG9zZWQsXG4gIHNldEluQXR0cmlidXRlcyxcbiAgc2V0SW5Ta2lwLFxuICB1cGRhdGVQYXRjaENvbnRleHRcbn0gZnJvbSBcIi4vYXNzZXJ0aW9uc1wiO1xuaW1wb3J0IHsgQ29udGV4dCB9IGZyb20gXCIuL2NvbnRleHRcIjtcbmltcG9ydCB7IGdldEZvY3VzZWRQYXRoLCBtb3ZlQmVmb3JlIH0gZnJvbSBcIi4vZG9tX3V0aWxcIjtcbmltcG9ydCB7IERFQlVHIH0gZnJvbSBcIi4vZ2xvYmFsXCI7XG5pbXBvcnQgeyBnZXREYXRhIH0gZnJvbSBcIi4vbm9kZV9kYXRhXCI7XG5pbXBvcnQgeyBjcmVhdGVFbGVtZW50LCBjcmVhdGVUZXh0IH0gZnJvbSBcIi4vbm9kZXNcIjtcbmltcG9ydCB7XG4gIEtleSxcbiAgTWF0Y2hGbkRlZixcbiAgTmFtZU9yQ3RvckRlZixcbiAgUGF0Y2hDb25maWcsXG4gIFBhdGNoRnVuY3Rpb25cbn0gZnJvbSBcIi4vdHlwZXNcIjtcblxuLyoqXG4gKiBUaGUgZGVmYXVsdCBtYXRjaCBmdW5jdGlvbiB0byB1c2UsIGlmIG9uZSB3YXMgbm90IHNwZWNpZmllZCB3aGVuIGNyZWF0aW5nXG4gKiB0aGUgcGF0Y2hlci5cbiAqIEBwYXJhbSBtYXRjaE5vZGUgVGhlIG5vZGUgdG8gbWF0Y2ggYWdhaW5zdCwgdW51c2VkLlxuICogQHBhcmFtIG5hbWVPckN0b3IgVGhlIG5hbWUgb3IgY29uc3RydWN0b3IgYXMgZGVjbGFyZWQuXG4gKiBAcGFyYW0gZXhwZWN0ZWROYW1lT3JDdG9yIFRoZSBuYW1lIG9yIGNvbnN0cnVjdG9yIG9mIHRoZSBleGlzdGluZyBub2RlLlxuICogQHBhcmFtIGtleSBUaGUga2V5IGFzIGRlY2xhcmVkLlxuICogQHBhcmFtIGV4cGVjdGVkS2V5IFRoZSBrZXkgb2YgdGhlIGV4aXN0aW5nIG5vZGUuXG4gKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBub2RlIG1hdGNoZXMsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZnVuY3Rpb24gZGVmYXVsdE1hdGNoRm4oXG4gIG1hdGNoTm9kZTogTm9kZSxcbiAgbmFtZU9yQ3RvcjogTmFtZU9yQ3RvckRlZixcbiAgZXhwZWN0ZWROYW1lT3JDdG9yOiBOYW1lT3JDdG9yRGVmLFxuICBrZXk6IEtleSxcbiAgZXhwZWN0ZWRLZXk6IEtleVxuKTogYm9vbGVhbiB7XG4gIC8vIEtleSBjaGVjayBpcyBkb25lIHVzaW5nIGRvdWJsZSBlcXVhbHMgYXMgd2Ugd2FudCB0byB0cmVhdCBhIG51bGwga2V5IHRoZVxuICAvLyBzYW1lIGFzIHVuZGVmaW5lZC4gVGhpcyBzaG91bGQgYmUgb2theSBhcyB0aGUgb25seSB2YWx1ZXMgYWxsb3dlZCBhcmVcbiAgLy8gc3RyaW5ncywgbnVsbCBhbmQgdW5kZWZpbmVkIHNvIHRoZSA9PSBzZW1hbnRpY3MgYXJlIG5vdCB0b28gd2VpcmQuXG4gIHJldHVybiBuYW1lT3JDdG9yID09IGV4cGVjdGVkTmFtZU9yQ3RvciAmJiBrZXkgPT0gZXhwZWN0ZWRLZXk7XG59XG5cbmxldCBjb250ZXh0OiBDb250ZXh0IHwgbnVsbCA9IG51bGw7XG5cbmxldCBjdXJyZW50Tm9kZTogTm9kZSB8IG51bGwgPSBudWxsO1xuXG5sZXQgY3VycmVudFBhcmVudDogTm9kZSB8IG51bGwgPSBudWxsO1xuXG5sZXQgZG9jOiBEb2N1bWVudCB8IG51bGwgPSBudWxsO1xuXG5sZXQgZm9jdXNQYXRoOiBBcnJheTxOb2RlPiA9IFtdO1xuXG5sZXQgbWF0Y2hGbjogTWF0Y2hGbkRlZiA9IGRlZmF1bHRNYXRjaEZuO1xuXG4vKipcbiAqIFVzZWQgdG8gYnVpbGQgdXAgY2FsbCBhcmd1bWVudHMuIEVhY2ggcGF0Y2ggY2FsbCBnZXRzIGEgc2VwYXJhdGUgY29weSwgc29cbiAqIHRoaXMgd29ya3Mgd2l0aCBuZXN0ZWQgY2FsbHMgdG8gcGF0Y2guXG4gKi9cbmxldCBhcmdzQnVpbGRlcjogQXJyYXk8e30gfCBudWxsIHwgdW5kZWZpbmVkPiA9IFtdO1xuXG4vKipcbiAqIFVzZWQgdG8gYnVpbGQgdXAgYXR0cnMgZm9yIHRoZSBhbiBlbGVtZW50LlxuICovXG5sZXQgYXR0cnNCdWlsZGVyOiBBcnJheTxhbnk+ID0gW107XG5cbi8qKlxuICogVE9ETyhzcGFyaGFtaSkgV2Ugc2hvdWxkIGp1c3QgZXhwb3J0IGFyZ3NCdWlsZGVyIGRpcmVjdGx5IHdoZW4gQ2xvc3VyZVxuICogQ29tcGlsZXIgc3VwcG9ydHMgRVM2IGRpcmVjdGx5LlxuICogQHJldHVybnMgVGhlIEFycmF5IHVzZWQgZm9yIGJ1aWxkaW5nIGFyZ3VtZW50cy5cbiAqL1xuZnVuY3Rpb24gZ2V0QXJnc0J1aWxkZXIoKTogQXJyYXk8YW55PiB7XG4gIHJldHVybiBhcmdzQnVpbGRlcjtcbn1cblxuLyoqXG4gKiBUT0RPKHNwYXJoYW1pKSBXZSBzaG91bGQganVzdCBleHBvcnQgYXR0cnNCdWlsZGVyIGRpcmVjdGx5IHdoZW4gQ2xvc3VyZVxuICogQ29tcGlsZXIgc3VwcG9ydHMgRVM2IGRpcmVjdGx5LlxuICogQHJldHVybnMgVGhlIEFycmF5IHVzZWQgZm9yIGJ1aWxkaW5nIGFyZ3VtZW50cy5cbiAqL1xuZnVuY3Rpb24gZ2V0QXR0cnNCdWlsZGVyKCk6IEFycmF5PGFueT4ge1xuICByZXR1cm4gYXR0cnNCdWlsZGVyO1xufVxuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIG9yIG5vdCB0aGUgY3VycmVudCBub2RlIG1hdGNoZXMgdGhlIHNwZWNpZmllZCBuYW1lT3JDdG9yIGFuZFxuICoga2V5LiBUaGlzIHVzZXMgdGhlIHNwZWNpZmllZCBtYXRjaCBmdW5jdGlvbiB3aGVuIGNyZWF0aW5nIHRoZSBwYXRjaGVyLlxuICogQHBhcmFtIG1hdGNoTm9kZSBBIG5vZGUgdG8gbWF0Y2ggdGhlIGRhdGEgdG8uXG4gKiBAcGFyYW0gbmFtZU9yQ3RvciBUaGUgbmFtZSBvciBjb25zdHJ1Y3RvciB0byBjaGVjayBmb3IuXG4gKiBAcGFyYW0ga2V5IFRoZSBrZXkgdXNlZCB0byBpZGVudGlmeSB0aGUgTm9kZS5cbiAqIEByZXR1cm4gVHJ1ZSBpZiB0aGUgbm9kZSBtYXRjaGVzLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmZ1bmN0aW9uIG1hdGNoZXMoXG4gIG1hdGNoTm9kZTogTm9kZSxcbiAgbmFtZU9yQ3RvcjogTmFtZU9yQ3RvckRlZixcbiAga2V5OiBLZXlcbik6IGJvb2xlYW4ge1xuICBjb25zdCBkYXRhID0gZ2V0RGF0YShtYXRjaE5vZGUsIGtleSk7XG5cbiAgcmV0dXJuIG1hdGNoRm4obWF0Y2hOb2RlLCBuYW1lT3JDdG9yLCBkYXRhLm5hbWVPckN0b3IsIGtleSwgZGF0YS5rZXkpO1xufVxuXG4vKipcbiAqIEZpbmRzIHRoZSBtYXRjaGluZyBub2RlLCBzdGFydGluZyBhdCBgbm9kZWAgYW5kIGxvb2tpbmcgYXQgdGhlIHN1YnNlcXVlbnRcbiAqIHNpYmxpbmdzIGlmIGEga2V5IGlzIHVzZWQuXG4gKiBAcGFyYW0gbWF0Y2hOb2RlIFRoZSBub2RlIHRvIHN0YXJ0IGxvb2tpbmcgYXQuXG4gKiBAcGFyYW0gbmFtZU9yQ3RvciBUaGUgbmFtZSBvciBjb25zdHJ1Y3RvciBmb3IgdGhlIE5vZGUuXG4gKiBAcGFyYW0ga2V5IFRoZSBrZXkgdXNlZCB0byBpZGVudGlmeSB0aGUgTm9kZS5cbiAqIEByZXR1cm5zIFRoZSBtYXRjaGluZyBOb2RlLCBpZiBhbnkgZXhpc3RzLlxuICovXG5mdW5jdGlvbiBnZXRNYXRjaGluZ05vZGUoXG4gIG1hdGNoTm9kZTogTm9kZSB8IG51bGwsXG4gIG5hbWVPckN0b3I6IE5hbWVPckN0b3JEZWYsXG4gIGtleTogS2V5XG4pOiBOb2RlIHwgbnVsbCB7XG4gIGlmICghbWF0Y2hOb2RlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBsZXQgY3VyOiBOb2RlIHwgbnVsbCA9IG1hdGNoTm9kZTtcblxuICBkbyB7XG4gICAgaWYgKG1hdGNoZXMoY3VyLCBuYW1lT3JDdG9yLCBrZXkpKSB7XG4gICAgICByZXR1cm4gY3VyO1xuICAgIH1cbiAgfSB3aGlsZSAoa2V5ICYmIChjdXIgPSBjdXIubmV4dFNpYmxpbmcpKTtcblxuICByZXR1cm4gbnVsbDtcbn1cbi8qKlxuICogQ2xlYXJzIG91dCBhbnkgdW52aXNpdGVkIE5vZGVzIGluIGEgZ2l2ZW4gcmFuZ2UuXG4gKiBAcGFyYW0gbWF5YmVQYXJlbnROb2RlXG4gKiBAcGFyYW0gc3RhcnROb2RlIFRoZSBub2RlIHRvIHN0YXJ0IGNsZWFyaW5nIGZyb20sIGluY2x1c2l2ZS5cbiAqIEBwYXJhbSBlbmROb2RlIFRoZSBub2RlIHRvIGNsZWFyIHVudGlsLCBleGNsdXNpdmUuXG4gKi9cbmZ1bmN0aW9uIGNsZWFyVW52aXNpdGVkRE9NKFxuICBtYXliZVBhcmVudE5vZGU6IE5vZGUgfCBudWxsLFxuICBzdGFydE5vZGU6IE5vZGUgfCBudWxsLFxuICBlbmROb2RlOiBOb2RlIHwgbnVsbFxuKSB7XG4gIGNvbnN0IHBhcmVudE5vZGUgPSBtYXliZVBhcmVudE5vZGUhO1xuICBsZXQgY2hpbGQgPSBzdGFydE5vZGU7XG5cbiAgd2hpbGUgKGNoaWxkICE9PSBlbmROb2RlKSB7XG4gICAgY29uc3QgbmV4dCA9IGNoaWxkIS5uZXh0U2libGluZztcbiAgICBwYXJlbnROb2RlLnJlbW92ZUNoaWxkKGNoaWxkISk7XG4gICAgY29udGV4dCEubWFya0RlbGV0ZWQoY2hpbGQhKTtcbiAgICBjaGlsZCA9IG5leHQ7XG4gIH1cbn1cblxuLyoqXG4gKiBAcmV0dXJuIFRoZSBuZXh0IE5vZGUgdG8gYmUgcGF0Y2hlZC5cbiAqL1xuZnVuY3Rpb24gZ2V0TmV4dE5vZGUoKTogTm9kZSB8IG51bGwge1xuICBpZiAoY3VycmVudE5vZGUpIHtcbiAgICByZXR1cm4gY3VycmVudE5vZGUubmV4dFNpYmxpbmc7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGN1cnJlbnRQYXJlbnQhLmZpcnN0Q2hpbGQ7XG4gIH1cbn1cblxuLyoqXG4gKiBDaGFuZ2VzIHRvIHRoZSBmaXJzdCBjaGlsZCBvZiB0aGUgY3VycmVudCBub2RlLlxuICovXG5mdW5jdGlvbiBlbnRlck5vZGUoKSB7XG4gIGN1cnJlbnRQYXJlbnQgPSBjdXJyZW50Tm9kZTtcbiAgY3VycmVudE5vZGUgPSBudWxsO1xufVxuXG4vKipcbiAqIENoYW5nZXMgdG8gdGhlIHBhcmVudCBvZiB0aGUgY3VycmVudCBub2RlLCByZW1vdmluZyBhbnkgdW52aXNpdGVkIGNoaWxkcmVuLlxuICovXG5mdW5jdGlvbiBleGl0Tm9kZSgpIHtcbiAgY2xlYXJVbnZpc2l0ZWRET00oY3VycmVudFBhcmVudCwgZ2V0TmV4dE5vZGUoKSwgbnVsbCk7XG5cbiAgY3VycmVudE5vZGUgPSBjdXJyZW50UGFyZW50O1xuICBjdXJyZW50UGFyZW50ID0gY3VycmVudFBhcmVudCEucGFyZW50Tm9kZTtcbn1cblxuLyoqXG4gKiBDaGFuZ2VzIHRvIHRoZSBuZXh0IHNpYmxpbmcgb2YgdGhlIGN1cnJlbnQgbm9kZS5cbiAqL1xuZnVuY3Rpb24gbmV4dE5vZGUoKSB7XG4gIGN1cnJlbnROb2RlID0gZ2V0TmV4dE5vZGUoKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgTm9kZSBhbmQgbWFya2luZyBpdCBhcyBjcmVhdGVkLlxuICogQHBhcmFtIG5hbWVPckN0b3IgVGhlIG5hbWUgb3IgY29uc3RydWN0b3IgZm9yIHRoZSBOb2RlLlxuICogQHBhcmFtIGtleSBUaGUga2V5IHVzZWQgdG8gaWRlbnRpZnkgdGhlIE5vZGUuXG4gKiBAcmV0dXJuIFRoZSBuZXdseSBjcmVhdGVkIG5vZGUuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZU5vZGUobmFtZU9yQ3RvcjogTmFtZU9yQ3RvckRlZiwga2V5OiBLZXkpOiBOb2RlIHtcbiAgbGV0IG5vZGU7XG5cbiAgaWYgKG5hbWVPckN0b3IgPT09IFwiI3RleHRcIikge1xuICAgIG5vZGUgPSBjcmVhdGVUZXh0KGRvYyEpO1xuICB9IGVsc2Uge1xuICAgIG5vZGUgPSBjcmVhdGVFbGVtZW50KGRvYyEsIGN1cnJlbnRQYXJlbnQhLCBuYW1lT3JDdG9yLCBrZXkpO1xuICB9XG5cbiAgY29udGV4dCEubWFya0NyZWF0ZWQobm9kZSk7XG5cbiAgcmV0dXJuIG5vZGU7XG59XG5cbi8qKlxuICogQWxpZ25zIHRoZSB2aXJ0dWFsIE5vZGUgZGVmaW5pdGlvbiB3aXRoIHRoZSBhY3R1YWwgRE9NLCBtb3ZpbmcgdGhlXG4gKiBjb3JyZXNwb25kaW5nIERPTSBub2RlIHRvIHRoZSBjb3JyZWN0IGxvY2F0aW9uIG9yIGNyZWF0aW5nIGl0IGlmIG5lY2Vzc2FyeS5cbiAqIEBwYXJhbSBuYW1lT3JDdG9yIFRoZSBuYW1lIG9yIGNvbnN0cnVjdG9yIGZvciB0aGUgTm9kZS5cbiAqIEBwYXJhbSBrZXkgVGhlIGtleSB1c2VkIHRvIGlkZW50aWZ5IHRoZSBOb2RlLlxuICovXG5mdW5jdGlvbiBhbGlnbldpdGhET00obmFtZU9yQ3RvcjogTmFtZU9yQ3RvckRlZiwga2V5OiBLZXkpIHtcbiAgbmV4dE5vZGUoKTtcbiAgY29uc3QgZXhpc3RpbmdOb2RlID0gZ2V0TWF0Y2hpbmdOb2RlKGN1cnJlbnROb2RlLCBuYW1lT3JDdG9yLCBrZXkpO1xuICBjb25zdCBub2RlID0gZXhpc3RpbmdOb2RlIHx8IGNyZWF0ZU5vZGUobmFtZU9yQ3Rvciwga2V5KTtcblxuICAvLyBJZiB3ZSBhcmUgYXQgdGhlIG1hdGNoaW5nIG5vZGUsIHRoZW4gd2UgYXJlIGRvbmUuXG4gIGlmIChub2RlID09PSBjdXJyZW50Tm9kZSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIFJlLW9yZGVyIHRoZSBub2RlIGludG8gdGhlIHJpZ2h0IHBvc2l0aW9uLCBwcmVzZXJ2aW5nIGZvY3VzIGlmIGVpdGhlclxuICAvLyBub2RlIG9yIGN1cnJlbnROb2RlIGFyZSBmb2N1c2VkIGJ5IG1ha2luZyBzdXJlIHRoYXQgdGhleSBhcmUgbm90IGRldGFjaGVkXG4gIC8vIGZyb20gdGhlIERPTS5cbiAgaWYgKGZvY3VzUGF0aC5pbmRleE9mKG5vZGUpID49IDApIHtcbiAgICAvLyBNb3ZlIGV2ZXJ5dGhpbmcgZWxzZSBiZWZvcmUgdGhlIG5vZGUuXG4gICAgbW92ZUJlZm9yZShjdXJyZW50UGFyZW50ISwgbm9kZSwgY3VycmVudE5vZGUpO1xuICB9IGVsc2Uge1xuICAgIGN1cnJlbnRQYXJlbnQhLmluc2VydEJlZm9yZShub2RlLCBjdXJyZW50Tm9kZSk7XG4gIH1cblxuICBjdXJyZW50Tm9kZSA9IG5vZGU7XG59XG5cbi8qKlxuICogTWFrZXMgc3VyZSB0aGF0IHRoZSBjdXJyZW50IG5vZGUgaXMgYW4gRWxlbWVudCB3aXRoIGEgbWF0Y2hpbmcgbmFtZU9yQ3RvciBhbmRcbiAqIGtleS5cbiAqXG4gKiBAcGFyYW0gbmFtZU9yQ3RvciBUaGUgdGFnIG9yIGNvbnN0cnVjdG9yIGZvciB0aGUgRWxlbWVudC5cbiAqIEBwYXJhbSBrZXkgVGhlIGtleSB1c2VkIHRvIGlkZW50aWZ5IHRoaXMgZWxlbWVudC4gVGhpcyBjYW4gYmUgYW5cbiAqICAgICBlbXB0eSBzdHJpbmcsIGJ1dCBwZXJmb3JtYW5jZSBtYXkgYmUgYmV0dGVyIGlmIGEgdW5pcXVlIHZhbHVlIGlzIHVzZWRcbiAqICAgICB3aGVuIGl0ZXJhdGluZyBvdmVyIGFuIGFycmF5IG9mIGl0ZW1zLlxuICogQHJldHVybiBUaGUgY29ycmVzcG9uZGluZyBFbGVtZW50LlxuICovXG5mdW5jdGlvbiBvcGVuKG5hbWVPckN0b3I6IE5hbWVPckN0b3JEZWYsIGtleT86IEtleSk6IEhUTUxFbGVtZW50IHtcbiAgYWxpZ25XaXRoRE9NKG5hbWVPckN0b3IsIGtleSk7XG4gIGVudGVyTm9kZSgpO1xuICByZXR1cm4gY3VycmVudFBhcmVudCBhcyBIVE1MRWxlbWVudDtcbn1cblxuLyoqXG4gKiBDbG9zZXMgdGhlIGN1cnJlbnRseSBvcGVuIEVsZW1lbnQsIHJlbW92aW5nIGFueSB1bnZpc2l0ZWQgY2hpbGRyZW4gaWZcbiAqIG5lY2Vzc2FyeS5cbiAqIEByZXR1cm5zIFRoZSBFbGVtZW50IHRoYXQgd2FzIGp1c3QgY2xvc2VkLlxuICovXG5mdW5jdGlvbiBjbG9zZSgpOiBFbGVtZW50IHtcbiAgaWYgKERFQlVHKSB7XG4gICAgc2V0SW5Ta2lwKGZhbHNlKTtcbiAgfVxuXG4gIGV4aXROb2RlKCk7XG4gIHJldHVybiBjdXJyZW50Tm9kZSBhcyBFbGVtZW50O1xufVxuXG4vKipcbiAqIE1ha2VzIHN1cmUgdGhlIGN1cnJlbnQgbm9kZSBpcyBhIFRleHQgbm9kZSBhbmQgY3JlYXRlcyBhIFRleHQgbm9kZSBpZiBpdCBpc1xuICogbm90LlxuICogQHJldHVybnMgVGhlIFRleHQgbm9kZSB0aGF0IHdhcyBhbGlnbmVkIG9yIGNyZWF0ZWQuXG4gKi9cbmZ1bmN0aW9uIHRleHQoKTogVGV4dCB7XG4gIGFsaWduV2l0aERPTShcIiN0ZXh0XCIsIG51bGwpO1xuICByZXR1cm4gY3VycmVudE5vZGUgYXMgVGV4dDtcbn1cblxuLyoqXG4gKiBAcmV0dXJucyBUaGUgY3VycmVudCBFbGVtZW50IGJlaW5nIHBhdGNoZWQuXG4gKi9cbmZ1bmN0aW9uIGN1cnJlbnRFbGVtZW50KCk6IEVsZW1lbnQge1xuICBpZiAoREVCVUcpIHtcbiAgICBhc3NlcnRJblBhdGNoKFwiY3VycmVudEVsZW1lbnRcIik7XG4gICAgYXNzZXJ0Tm90SW5BdHRyaWJ1dGVzKFwiY3VycmVudEVsZW1lbnRcIik7XG4gIH1cbiAgcmV0dXJuIGN1cnJlbnRQYXJlbnQgYXMgRWxlbWVudDtcbn1cblxuLyoqXG4gKiBAcmV0dXJuIFRoZSBOb2RlIHRoYXQgd2lsbCBiZSBldmFsdWF0ZWQgZm9yIHRoZSBuZXh0IGluc3RydWN0aW9uLlxuICovXG5mdW5jdGlvbiBjdXJyZW50UG9pbnRlcigpOiBOb2RlIHtcbiAgaWYgKERFQlVHKSB7XG4gICAgYXNzZXJ0SW5QYXRjaChcImN1cnJlbnRQb2ludGVyXCIpO1xuICAgIGFzc2VydE5vdEluQXR0cmlidXRlcyhcImN1cnJlbnRQb2ludGVyXCIpO1xuICB9XG4gIC8vIFRPRE8odG9tbmd1eWVuKTogYXNzZXJ0IHRoYXQgdGhpcyBpcyBub3QgbnVsbFxuICByZXR1cm4gZ2V0TmV4dE5vZGUoKSE7XG59XG5cbi8qKlxuICogU2tpcHMgdGhlIGNoaWxkcmVuIGluIGEgc3VidHJlZSwgYWxsb3dpbmcgYW4gRWxlbWVudCB0byBiZSBjbG9zZWQgd2l0aG91dFxuICogY2xlYXJpbmcgb3V0IHRoZSBjaGlsZHJlbi5cbiAqL1xuZnVuY3Rpb24gc2tpcCgpIHtcbiAgaWYgKERFQlVHKSB7XG4gICAgYXNzZXJ0Tm9DaGlsZHJlbkRlY2xhcmVkWWV0KFwic2tpcFwiLCBjdXJyZW50Tm9kZSk7XG4gICAgc2V0SW5Ta2lwKHRydWUpO1xuICB9XG4gIGN1cnJlbnROb2RlID0gY3VycmVudFBhcmVudCEubGFzdENoaWxkO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBwYXRjaGVyIGZ1bmN0aW9uIHRoYXQgc2V0cyB1cCBhbmQgcmVzdG9yZXMgYSBwYXRjaCBjb250ZXh0LFxuICogcnVubmluZyB0aGUgcnVuIGZ1bmN0aW9uIHdpdGggdGhlIHByb3ZpZGVkIGRhdGEuXG4gKiBAcGFyYW0gcnVuIFRoZSBmdW5jdGlvbiB0aGF0IHdpbGwgcnVuIHRoZSBwYXRjaC5cbiAqIEBwYXJhbSBwYXRjaENvbmZpZyBUaGUgY29uZmlndXJhdGlvbiB0byB1c2UgZm9yIHRoZSBwYXRjaC5cbiAqIEByZXR1cm5zIFRoZSBjcmVhdGVkIHBhdGNoIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBjcmVhdGVQYXRjaGVyPFQsIFI+KFxuICBydW46IFBhdGNoRnVuY3Rpb248VCwgUj4sXG4gIHBhdGNoQ29uZmlnOiBQYXRjaENvbmZpZyA9IHt9XG4pOiBQYXRjaEZ1bmN0aW9uPFQsIFI+IHtcbiAgY29uc3QgeyBtYXRjaGVzID0gZGVmYXVsdE1hdGNoRm4gfSA9IHBhdGNoQ29uZmlnO1xuXG4gIGNvbnN0IGY6IFBhdGNoRnVuY3Rpb248VCwgUj4gPSAobm9kZSwgZm4sIGRhdGEpID0+IHtcbiAgICBjb25zdCBwcmV2Q29udGV4dCA9IGNvbnRleHQ7XG4gICAgY29uc3QgcHJldkRvYyA9IGRvYztcbiAgICBjb25zdCBwcmV2Rm9jdXNQYXRoID0gZm9jdXNQYXRoO1xuICAgIGNvbnN0IHByZXZBcmdzQnVpbGRlciA9IGFyZ3NCdWlsZGVyO1xuICAgIGNvbnN0IHByZXZBdHRyc0J1aWxkZXIgPSBhdHRyc0J1aWxkZXI7XG4gICAgY29uc3QgcHJldkN1cnJlbnROb2RlID0gY3VycmVudE5vZGU7XG4gICAgY29uc3QgcHJldkN1cnJlbnRQYXJlbnQgPSBjdXJyZW50UGFyZW50O1xuICAgIGNvbnN0IHByZXZNYXRjaEZuID0gbWF0Y2hGbjtcbiAgICBsZXQgcHJldmlvdXNJbkF0dHJpYnV0ZXMgPSBmYWxzZTtcbiAgICBsZXQgcHJldmlvdXNJblNraXAgPSBmYWxzZTtcblxuICAgIGRvYyA9IG5vZGUub3duZXJEb2N1bWVudDtcbiAgICBjb250ZXh0ID0gbmV3IENvbnRleHQoKTtcbiAgICBtYXRjaEZuID0gbWF0Y2hlcztcbiAgICBhcmdzQnVpbGRlciA9IFtdO1xuICAgIGF0dHJzQnVpbGRlciA9IFtdO1xuICAgIGN1cnJlbnROb2RlID0gbnVsbDtcbiAgICBjdXJyZW50UGFyZW50ID0gbm9kZS5wYXJlbnROb2RlO1xuICAgIGZvY3VzUGF0aCA9IGdldEZvY3VzZWRQYXRoKG5vZGUsIGN1cnJlbnRQYXJlbnQpO1xuXG4gICAgaWYgKERFQlVHKSB7XG4gICAgICBwcmV2aW91c0luQXR0cmlidXRlcyA9IHNldEluQXR0cmlidXRlcyhmYWxzZSk7XG4gICAgICBwcmV2aW91c0luU2tpcCA9IHNldEluU2tpcChmYWxzZSk7XG4gICAgICB1cGRhdGVQYXRjaENvbnRleHQoY29udGV4dCk7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJldFZhbCA9IHJ1bihub2RlLCBmbiwgZGF0YSk7XG4gICAgICBpZiAoREVCVUcpIHtcbiAgICAgICAgYXNzZXJ0VmlydHVhbEF0dHJpYnV0ZXNDbG9zZWQoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJldFZhbDtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgY29udGV4dC5ub3RpZnlDaGFuZ2VzKCk7XG5cbiAgICAgIGRvYyA9IHByZXZEb2M7XG4gICAgICBjb250ZXh0ID0gcHJldkNvbnRleHQ7XG4gICAgICBtYXRjaEZuID0gcHJldk1hdGNoRm47XG4gICAgICBhcmdzQnVpbGRlciA9IHByZXZBcmdzQnVpbGRlcjtcbiAgICAgIGF0dHJzQnVpbGRlciA9IHByZXZBdHRyc0J1aWxkZXI7XG4gICAgICBjdXJyZW50Tm9kZSA9IHByZXZDdXJyZW50Tm9kZTtcbiAgICAgIGN1cnJlbnRQYXJlbnQgPSBwcmV2Q3VycmVudFBhcmVudDtcbiAgICAgIGZvY3VzUGF0aCA9IHByZXZGb2N1c1BhdGg7XG5cbiAgICAgIC8vIE5lZWRzIHRvIGJlIGRvbmUgYWZ0ZXIgYXNzZXJ0aW9ucyBiZWNhdXNlIGFzc2VydGlvbnMgcmVseSBvbiBzdGF0ZVxuICAgICAgLy8gZnJvbSB0aGVzZSBtZXRob2RzLlxuICAgICAgaWYgKERFQlVHKSB7XG4gICAgICAgIHNldEluQXR0cmlidXRlcyhwcmV2aW91c0luQXR0cmlidXRlcyk7XG4gICAgICAgIHNldEluU2tpcChwcmV2aW91c0luU2tpcCk7XG4gICAgICAgIHVwZGF0ZVBhdGNoQ29udGV4dChjb250ZXh0KTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIHJldHVybiBmO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBwYXRjaGVyIHRoYXQgcGF0Y2hlcyB0aGUgZG9jdW1lbnQgc3RhcnRpbmcgYXQgbm9kZSB3aXRoIGFcbiAqIHByb3ZpZGVkIGZ1bmN0aW9uLiBUaGlzIGZ1bmN0aW9uIG1heSBiZSBjYWxsZWQgZHVyaW5nIGFuIGV4aXN0aW5nIHBhdGNoIG9wZXJhdGlvbi5cbiAqIEBwYXJhbSBwYXRjaENvbmZpZyBUaGUgY29uZmlnIHRvIHVzZSBmb3IgdGhlIHBhdGNoLlxuICogQHJldHVybnMgVGhlIGNyZWF0ZWQgZnVuY3Rpb24gZm9yIHBhdGNoaW5nIGFuIEVsZW1lbnQncyBjaGlsZHJlbi5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlUGF0Y2hJbm5lcjxUPihcbiAgcGF0Y2hDb25maWc/OiBQYXRjaENvbmZpZ1xuKTogUGF0Y2hGdW5jdGlvbjxULCBOb2RlPiB7XG4gIHJldHVybiBjcmVhdGVQYXRjaGVyKChub2RlLCBmbiwgZGF0YSkgPT4ge1xuICAgIGN1cnJlbnROb2RlID0gbm9kZTtcblxuICAgIGVudGVyTm9kZSgpO1xuICAgIGZuKGRhdGEpO1xuICAgIGV4aXROb2RlKCk7XG5cbiAgICBpZiAoREVCVUcpIHtcbiAgICAgIGFzc2VydE5vVW5jbG9zZWRUYWdzKGN1cnJlbnROb2RlLCBub2RlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbm9kZTtcbiAgfSwgcGF0Y2hDb25maWcpO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBwYXRjaGVyIHRoYXQgcGF0Y2hlcyBhbiBFbGVtZW50IHdpdGggdGhlIHRoZSBwcm92aWRlZCBmdW5jdGlvbi5cbiAqIEV4YWN0bHkgb25lIHRvcCBsZXZlbCBlbGVtZW50IGNhbGwgc2hvdWxkIGJlIG1hZGUgY29ycmVzcG9uZGluZyB0byBgbm9kZWAuXG4gKiBAcGFyYW0gcGF0Y2hDb25maWcgVGhlIGNvbmZpZyB0byB1c2UgZm9yIHRoZSBwYXRjaC5cbiAqIEByZXR1cm5zIFRoZSBjcmVhdGVkIGZ1bmN0aW9uIGZvciBwYXRjaGluZyBhbiBFbGVtZW50LlxuICovXG5mdW5jdGlvbiBjcmVhdGVQYXRjaE91dGVyPFQ+KFxuICBwYXRjaENvbmZpZz86IFBhdGNoQ29uZmlnXG4pOiBQYXRjaEZ1bmN0aW9uPFQsIE5vZGUgfCBudWxsPiB7XG4gIHJldHVybiBjcmVhdGVQYXRjaGVyKChub2RlLCBmbiwgZGF0YSkgPT4ge1xuICAgIGNvbnN0IHN0YXJ0Tm9kZSA9ICh7IG5leHRTaWJsaW5nOiBub2RlIH0gYXMgYW55KSBhcyBFbGVtZW50O1xuICAgIGxldCBleHBlY3RlZE5leHROb2RlOiBOb2RlIHwgbnVsbCA9IG51bGw7XG4gICAgbGV0IGV4cGVjdGVkUHJldk5vZGU6IE5vZGUgfCBudWxsID0gbnVsbDtcblxuICAgIGlmIChERUJVRykge1xuICAgICAgZXhwZWN0ZWROZXh0Tm9kZSA9IG5vZGUubmV4dFNpYmxpbmc7XG4gICAgICBleHBlY3RlZFByZXZOb2RlID0gbm9kZS5wcmV2aW91c1NpYmxpbmc7XG4gICAgfVxuXG4gICAgY3VycmVudE5vZGUgPSBzdGFydE5vZGU7XG4gICAgZm4oZGF0YSk7XG5cbiAgICBpZiAoREVCVUcpIHtcbiAgICAgIGFzc2VydFBhdGNoT3V0ZXJIYXNQYXJlbnROb2RlKGN1cnJlbnRQYXJlbnQpO1xuICAgICAgYXNzZXJ0UGF0Y2hFbGVtZW50Tm9FeHRyYXMoXG4gICAgICAgIHN0YXJ0Tm9kZSxcbiAgICAgICAgY3VycmVudE5vZGUsXG4gICAgICAgIGV4cGVjdGVkTmV4dE5vZGUsXG4gICAgICAgIGV4cGVjdGVkUHJldk5vZGVcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKGN1cnJlbnRQYXJlbnQpIHtcbiAgICAgIGNsZWFyVW52aXNpdGVkRE9NKGN1cnJlbnRQYXJlbnQsIGdldE5leHROb2RlKCksIG5vZGUubmV4dFNpYmxpbmcpO1xuICAgIH1cblxuICAgIHJldHVybiBzdGFydE5vZGUgPT09IGN1cnJlbnROb2RlID8gbnVsbCA6IGN1cnJlbnROb2RlO1xuICB9LCBwYXRjaENvbmZpZyk7XG59XG5cbmNvbnN0IHBhdGNoSW5uZXI6IDxUPihcbiAgbm9kZTogRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQsXG4gIHRlbXBsYXRlOiAoYTogVCB8IHVuZGVmaW5lZCkgPT4gdm9pZCxcbiAgZGF0YT86IFQgfCB1bmRlZmluZWRcbikgPT4gTm9kZSA9IGNyZWF0ZVBhdGNoSW5uZXIoKTtcbmNvbnN0IHBhdGNoT3V0ZXI6IDxUPihcbiAgbm9kZTogRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQsXG4gIHRlbXBsYXRlOiAoYTogVCB8IHVuZGVmaW5lZCkgPT4gdm9pZCxcbiAgZGF0YT86IFQgfCB1bmRlZmluZWRcbikgPT4gTm9kZSB8IG51bGwgPSBjcmVhdGVQYXRjaE91dGVyKCk7XG5cbmV4cG9ydCB7XG4gIGFsaWduV2l0aERPTSxcbiAgZ2V0QXJnc0J1aWxkZXIsXG4gIGdldEF0dHJzQnVpbGRlcixcbiAgdGV4dCxcbiAgY3JlYXRlUGF0Y2hJbm5lcixcbiAgY3JlYXRlUGF0Y2hPdXRlcixcbiAgcGF0Y2hJbm5lcixcbiAgcGF0Y2hPdXRlcixcbiAgb3BlbixcbiAgY2xvc2UsXG4gIGN1cnJlbnRFbGVtZW50LFxuICBjdXJyZW50UG9pbnRlcixcbiAgc2tpcCxcbiAgbmV4dE5vZGUgYXMgc2tpcE5vZGVcbn07XG4iXX0=