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
goog.module('incrementaldom.src.changes');
var module = module || { id: 'src/changes.ts' };
var util_1 = goog.require('incrementaldom.src.util');
var tsickle_forward_declare_1 = goog.forwardDeclare("incrementaldom.src.util");
/** @type {!Array<?>} */
var buffer = [];
/** @type {number} */
var bufferStart = 0;
/**
 * TODO(tomnguyen): This is a bit silly and really needs to be better typed.
 * @template A, B, C
 * @param {function(A, B, C): undefined} fn
 * @param {A} a
 * @param {B} b
 * @param {C} c
 * @return {void}
 */
function queueChange(fn, a, b, c) {
    buffer.push(fn);
    buffer.push(a);
    buffer.push(b);
    buffer.push(c);
}
exports.queueChange = queueChange;
/**
 * Flushes the changes buffer, calling the functions for each change.
 * @return {void}
 */
function flush() {
    /** @type {number} */
    var start = bufferStart;
    /** @type {number} */
    var end = buffer.length;
    bufferStart = end;
    for (var i = start; i < end; i += 4) {
        /** @type {function(?, ?, ?): undefined} */
        var fn = /** @type {function(?, ?, ?): undefined} */ (buffer[i]);
        fn(buffer[i + 1], buffer[i + 2], buffer[i + 3]);
    }
    bufferStart = start;
    util_1.truncateArray(buffer, start);
}
exports.flush = flush;
//# sourceMappingURL=changes.js.map