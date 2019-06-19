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
goog.module('incrementaldom.src.util');
var module = module || { id: 'src/util.ts' };
/** *
 * A cached reference to the hasOwnProperty function.
  @type {?} */
var hasOwnProperty = Object.prototype.hasOwnProperty;
/**
 * A constructor function that will create blank objects.
 * @return {void}
 */
function Blank() { }
Blank.prototype = Object.create(null);
/**
 * Used to prevent property collisions between our "map" and its prototype.
 * @param {!Object} map The map to check.
 * @param {string} property The property to check.
 * @return {boolean} Whether map has property.
 */
function has(map, property) {
    return hasOwnProperty.call(map, property);
}
exports.has = has;
/**
 * Creates an map object without a prototype.
 * @return {?}
 */
function createMap() {
    // tslint:disable-next-line:no-any
    // tslint:disable-next-line:no-any
    return new (/** @type {?} */ (Blank))();
}
exports.createMap = createMap;
/**
 * Truncates an array, removing items up until length.
 * @param {!Array<(undefined|null|!Object)>} arr The array to truncate.
 * @param {number} length The new length of the array.
 * @return {void}
 */
function truncateArray(arr, length) {
    while (arr.length > length) {
        arr.pop();
    }
}
exports.truncateArray = truncateArray;
//# sourceMappingURL=util.js.map