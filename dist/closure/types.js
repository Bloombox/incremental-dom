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
goog.module('incrementaldom.src.types');
var module = module || { id: 'src/types.ts' };
/**
 * @record
 */
function ElementConstructor() { }
exports.ElementConstructor = ElementConstructor;
;
/** @typedef {function(!HTMLElement, string, ?): void} */
var AttrMutator;
exports.AttrMutator = AttrMutator;
/** @typedef {!Object<string,AttrMutator>} */
var AttrMutatorConfig;
exports.AttrMutatorConfig = AttrMutatorConfig;
/** @typedef {(string|!ElementConstructor)} */
var NameOrCtorDef;
exports.NameOrCtorDef = NameOrCtorDef;
/** @typedef {(undefined|null|string|number)} */
var Key;
exports.Key = Key;
/** @typedef {(undefined|null|!Array<!Object>)} */
var Statics;
exports.Statics = Statics;
/** @typedef {function((!Element|!DocumentFragment), function((undefined|?)): void, (undefined|?)=): ?} */
var PatchFunction;
exports.PatchFunction = PatchFunction;
/** @typedef {function(!Node, NameOrCtorDef, NameOrCtorDef, Key, Key): boolean} */
var MatchFnDef;
exports.MatchFnDef = MatchFnDef;
/** @typedef {{matches: (undefined|MatchFnDef)}} */
var PatchConfig;
exports.PatchConfig = PatchConfig;
//# sourceMappingURL=types.js.map