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
goog.module('incrementaldom.src.context');
var module = module || { id: 'src/context.ts' };
var notifications_1 = goog.require('incrementaldom.src.notifications');
var tsickle_forward_declare_1 = goog.forwardDeclare("incrementaldom.src.notifications");
/**
 * A context object keeps track of the state of a patch.
 */
var /**
 * A context object keeps track of the state of a patch.
 */
Context = /** @class */ (function () {
    function Context() {
        this.created = [];
        this.deleted = [];
    }
    /**
     * @param {!Node} node
     * @return {void}
     */
    Context.prototype.markCreated = /**
     * @param {!Node} node
     * @return {void}
     */
    function (node) {
        this.created.push(node);
    };
    /**
     * @param {!Node} node
     * @return {void}
     */
    Context.prototype.markDeleted = /**
     * @param {!Node} node
     * @return {void}
     */
    function (node) {
        this.deleted.push(node);
    };
    /**
     * Notifies about nodes that were created during the patch operation.
     */
    /**
     * Notifies about nodes that were created during the patch operation.
     * @return {void}
     */
    Context.prototype.notifyChanges = /**
     * Notifies about nodes that were created during the patch operation.
     * @return {void}
     */
    function () {
        if (notifications_1.notifications.nodesCreated && this.created.length > 0) {
            notifications_1.notifications.nodesCreated(this.created);
        }
        if (notifications_1.notifications.nodesDeleted && this.deleted.length > 0) {
            notifications_1.notifications.nodesDeleted(this.deleted);
        }
    };
    return Context;
}());
exports.Context = Context;
if (false) {
    /** @type {!Array<!Node>} */
    Context.prototype.created;
    /** @type {!Array<!Node>} */
    Context.prototype.deleted;
}
//# sourceMappingURL=context.js.map