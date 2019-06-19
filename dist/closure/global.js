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
goog.module('incrementaldom.src.global');
var module = module || { id: 'src/global.ts' };
/** @type {boolean} */
var DEBUG = goog.DEBUG;
exports.DEBUG = DEBUG;
/** *
 * The name of the HTML attribute that holds the element key
 * (e.g. `<div key="foo">`). The attribute value, if it exists, is then used
 * as the default key when importing an element.
 * If null, no attribute value is used as the default key.
  @type {(null|string)} */
var keyAttributeName = 'key';
/**
 * @return {(null|string)}
 */
function getKeyAttributeName() {
    return keyAttributeName;
}
exports.getKeyAttributeName = getKeyAttributeName;
/**
 * @param {(null|string)} name
 * @return {void}
 */
function setKeyAttributeName(name) {
    keyAttributeName = name;
}
exports.setKeyAttributeName = setKeyAttributeName;
//# sourceMappingURL=global.js.map