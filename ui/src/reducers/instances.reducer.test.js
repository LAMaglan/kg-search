/*
 * Copyright 2018 - 2021 Swiss Federal Institute of Technology Lausanne (EPFL)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This open source software code was developed in part or in whole in the
 * Human Brain Project, funded from the European Union's Horizon 2020
 * Framework Programme for Research and Innovation under
 * Specific Grant Agreements No. 720270, No. 785907, and No. 945539
 * (Human Brain Project SGA1, SGA2 and SGA3).
 *
 */

import * as actions from "../actions/actions.instances";
import { reducer as instancesReducer} from "./instances.reducer";
describe("instances reducer", () => {
  describe("unknown action", () => {
    it("should return same state", () => {
      const state = {a: {c: 1, d: 2}, b: [{e:3}, {e:4}]};
      const action = {type: "ABCDEFGH"};
      const newState = instancesReducer(state, action);
      expect(JSON.stringify(newState)).toBe(JSON.stringify(state));
    });
  });
  describe("load instance request", () => {
    it("should set loading reference", () => {
      const state = {isLoading: false, currentInstance: {_id: 567}, previousInstances:[{_id: 234}, {_id: 345}, {_id: 456}]};
      const action = actions.loadInstanceRequest();
      const newState = instancesReducer(state, action);
      expect(newState.isLoading).toBe(true);
    });
  });
  describe("load instance success", () => {
    it("should set current instance", () => {
      const state = undefined;
      const action = actions.loadInstanceSuccess({_id: 123});
      const newState = instancesReducer(state, action);
      expect(newState.currentInstance).toMatchObject({_id: 123});
    });
    it("should increase previous instances array length", () => {
      const state = {currentInstance: {_id: 567}, previousInstances:[{_id: 234}, {_id: 345}, {_id: 456}]};
      const action = actions.loadInstanceSuccess({_id: 123});
      const newState = instancesReducer(state, action);
      expect(newState.previousInstances.length).toBe(4);
    });
    it("should put previous instance into previous instances array", () => {
      const state = {currentInstance: {_id: 567}, previousInstances:[{_id: 234}, {_id: 345}, {_id: 456}]};
      const action = actions.loadInstanceSuccess({_id: 123});
      const newState = instancesReducer(state, action);
      expect(newState.previousInstances[3]).toMatchObject({_id: 567});
    });
  });
  describe("set instance", () => {
    it("should set current instance", () => {
      const state = undefined;
      const action = actions.setInstance({_id:123});
      const newState = instancesReducer(state, action);
      expect(newState.currentInstance).toMatchObject({_id: 123});
    });
    it("should increase previous instance array length", () => {
      const state = {currentInstance: {_id: 567}, previousInstances:[{_id: 234}, {_id: 345}, {_id: 456}]};
      const action = actions.setInstance({_id:123});
      const newState = instancesReducer(state, action);
      expect(newState.previousInstances.length).toBe(4);
    });
    it("should put previous instance into previous instances array", () => {
      const state = {currentInstance: {_id: 567}, previousInstances:[{_id: 234}, {_id: 345}, {_id: 456}]};
      const action = actions.setInstance({_id:123});
      const newState = instancesReducer(state, action);
      expect(newState.previousInstances[3]).toMatchObject({_id: 567});
    });
  });
  describe("set previous instance", () => {
    it("should set last item of previous instances array as current instance", () => {
      const state = {currentInstance: {_id: 567}, previousInstances:[{_id: 234}, {_id: 345}, {_id: 456}]};
      const action = actions.setPreviousInstance();
      const newState = instancesReducer(state, action);
      expect(newState.currentInstance).toMatchObject({_id: 456});
    });
    it("should set current instance as null when previous instances array is empty", () => {
      const state = {currentInstance: {_id: 567}, previousInstances:[]};
      const action = actions.setPreviousInstance();
      const newState = instancesReducer(state, action);
      expect(newState.currentInstance).toBe(null);
    });
  });
  describe("clear all instances", () => {
    it("should set current instance to null", () => {
      const state = {currentInstance: {_id: 567}, previousInstances:[{_id: 234}, {_id: 345}, {_id: 456}]};
      const action = actions.clearAllInstances();
      const newState = instancesReducer(state, action);
      expect(newState.currentInstance).toBe(null);
    });
    it("should set previous instances array empty", () => {
      const state = {currentInstance: {_id: 567}, previousInstances:[]};
      const action = actions.clearAllInstances();
      const newState = instancesReducer(state, action);
      expect(newState.previousInstances.length).toBe(0);
    });
  });
});