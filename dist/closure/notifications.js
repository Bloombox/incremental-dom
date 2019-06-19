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
goog.module('incrementaldom.src.notifications');
var module = module || { id: 'src/notifications.ts' };
/** @typedef {function(!Array<!Node>): void} */
var NodeFunction;
exports.NodeFunction = NodeFunction;
/**
 * @record
 */
function Notifications() { }
exports.Notifications = Notifications;
/**
 * Called after patch has completed with any Nodes that have been created
 * and added to the DOM.
 * @type {(null|NodeFunction)}
 */
Notifications.prototype.nodesCreated;
/**
 * Called after patch has completed with any Nodes that have been removed
 * from the DOM.
 * Note it's an application's responsibility to handle any childNodes.
 * @type {(null|NodeFunction)}
 */
Notifications.prototype.nodesDeleted;
/** @type {!Notifications} */
exports.notifications = {
    nodesCreated: null,
    nodesDeleted: null
};
//# sourceMappingURL=notifications.js.map