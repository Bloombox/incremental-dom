/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * @license
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
goog.module('incrementaldom.src.diff');
var module = module || { id: 'src/diff.ts' };
var util_1 = goog.require('incrementaldom.src.util');
var tsickle_forward_declare_1 = goog.forwardDeclare("incrementaldom.src.util");
/** *
 * Used to keep track of the previous values when a 2-way diff is necessary.
 * This object is cleared out and reused.
  @type {?} */
var prevValuesMap = util_1.createMap();
/**
 * Calculates the diff between previous and next values, calling the update
 * function when an item has changed value. If an item from the previous values
 * is not present in the the next values, the update function is called with a
 * value of `undefined`.
 * @template T
 * @param {!Array<string>} prev The previous values, alternating name, value pairs.
 * @param {!Array<string>} next The next values, alternating name, value pairs.
 * @param {T} updateCtx The context for the updateFn.
 * @param {function(T, string, (undefined|!Object)): undefined} updateFn A function to call when a value has changed.
 * @return {void}
 */
function calculateDiff(prev, next, updateCtx, updateFn) {
    /** @type {boolean} */
    var isNew = !prev.length;
    /** @type {number} */
    var i = 0;
    for (; i < next.length; i += 2) {
        /** @type {string} */
        var name_1 = next[i];
        if (isNew) {
            prev[i] = name_1;
        }
        else if (prev[i] !== name_1) {
            break;
        }
        /** @type {string} */
        var value = next[i + 1];
        if (isNew || prev[i + 1] !== value) {
            prev[i + 1] = value;
            updateFn(updateCtx, name_1, value);
        }
    }
    // Items did not line up exactly as before, need to make sure old items are
    // removed. This should be a rare case.
    // Items did not line up exactly as before, need to make sure old items are
    // removed. This should be a rare case.
    if (i < next.length || i < prev.length) {
        /** @type {number} */
        var startIndex = i;
        for (i = startIndex; i < prev.length; i += 2) {
            prevValuesMap[prev[i]] = prev[i + 1];
        }
        for (i = startIndex; i < next.length; i += 2) {
            /** @type {string} */
            var name_2 = /** @type {string} */ ((next[i]));
            /** @type {string} */
            var value = next[i + 1];
            if (prevValuesMap[name_2] !== value) {
                updateFn(updateCtx, name_2, value);
            }
            prev[i] = name_2;
            prev[i + 1] = value;
            delete prevValuesMap[name_2];
        }
        util_1.truncateArray(prev, next.length);
        for (var name_3 in prevValuesMap) {
            updateFn(updateCtx, name_3, undefined);
            delete prevValuesMap[name_3];
        }
    }
}
exports.calculateDiff = calculateDiff;
//# sourceMappingURL=diff.js.map