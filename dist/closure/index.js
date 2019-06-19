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
goog.module('incrementaldom');
var module = module || { id: 'index.ts' };
var attributes_1 = goog.require('incrementaldom.src.attributes');
exports.applyAttr = attributes_1.applyAttr;
exports.applyProp = attributes_1.applyProp;
exports.attributes = attributes_1.attributes;
var tsickle_forward_declare_1 = goog.forwardDeclare("incrementaldom.src.attributes");
var core_1 = goog.require('incrementaldom.src.core');
exports.alignWithDOM = core_1.alignWithDOM;
exports.close = core_1.close;
exports.createPatchInner = core_1.createPatchInner;
exports.createPatchOuter = core_1.createPatchOuter;
exports.currentElement = core_1.currentElement;
exports.currentPointer = core_1.currentPointer;
exports.open = core_1.open;
exports.patch = core_1.patchInner;
exports.patchInner = core_1.patchInner;
exports.patchOuter = core_1.patchOuter;
exports.skip = core_1.skip;
exports.skipNode = core_1.skipNode;
var tsickle_forward_declare_2 = goog.forwardDeclare("incrementaldom.src.core");
var global_1 = goog.require('incrementaldom.src.global');
exports.setKeyAttributeName = global_1.setKeyAttributeName;
var tsickle_forward_declare_3 = goog.forwardDeclare("incrementaldom.src.global");
var node_data_1 = goog.require('incrementaldom.src.node_data');
exports.clearCache = node_data_1.clearCache;
exports.getKey = node_data_1.getKey;
exports.importNode = node_data_1.importNode;
exports.isDataInitialized = node_data_1.isDataInitialized;
var tsickle_forward_declare_4 = goog.forwardDeclare("incrementaldom.src.node_data");
var notifications_1 = goog.require('incrementaldom.src.notifications');
exports.notifications = notifications_1.notifications;
var tsickle_forward_declare_5 = goog.forwardDeclare("incrementaldom.src.notifications");
var symbols_1 = goog.require('incrementaldom.src.symbols');
exports.symbols = symbols_1.symbols;
var tsickle_forward_declare_6 = goog.forwardDeclare("incrementaldom.src.symbols");
var virtual_elements_1 = goog.require('incrementaldom.src.virtual_elements');
exports.attr = virtual_elements_1.attr;
exports.elementClose = virtual_elements_1.elementClose;
exports.elementOpen = virtual_elements_1.elementOpen;
exports.elementOpenEnd = virtual_elements_1.elementOpenEnd;
exports.elementOpenStart = virtual_elements_1.elementOpenStart;
exports.elementVoid = virtual_elements_1.elementVoid;
exports.key = virtual_elements_1.key;
exports.text = virtual_elements_1.text;
var tsickle_forward_declare_7 = goog.forwardDeclare("incrementaldom.src.virtual_elements");
/** @typedef {!ElementConstructor} */
exports.ElementConstructor; // re-export typedef
/** @typedef {!AttrMutator} */
exports.AttrMutator; // re-export typedef
/** @typedef {!AttrMutatorConfig} */
exports.AttrMutatorConfig; // re-export typedef
/** @typedef {!NameOrCtorDef} */
exports.NameOrCtorDef; // re-export typedef
/** @typedef {!Key} */
exports.Key; // re-export typedef
/** @typedef {!Statics} */
exports.Statics; // re-export typedef
/** @typedef {!PatchFunction} */
exports.PatchFunction; // re-export typedef
/** @typedef {!MatchFnDef} */
exports.MatchFnDef; // re-export typedef
/** @typedef {!PatchConfig} */
exports.PatchConfig; // re-export typedef
//# sourceMappingURL=index.js.map