import {
  checkUniqueIds,
  enteredWeightIsGreaterThanPrevWeight,
  enteredWeightIsLessThanPrevWeight,
  generateUUID
} from "../client/query/helpers";

import * as React from "react";
import * as renderer from 'react-test-renderer';

import EnterWeightFormContainer from '../client/containers/Forms/EnterWeightFormContainer';

test("unique animal ids", () => {
  expect(checkUniqueIds(["cj2078", "r12015"])).toBe(true);
});
test("nonunique animal ids", () => {
  expect(checkUniqueIds(["cj2078", "cj2078"])).toBe(false);
});

test("current weight should be greater than 10% previous weight", () => {
  expect(enteredWeightIsGreaterThanPrevWeight(111, 100, 10)).toBe(true);
});

test("current weight should NOT be greater than 10% previous weight", () => {
  expect(enteredWeightIsGreaterThanPrevWeight(109, 100, 10)).toBe(false);
});

test("current weight should be less than 10% previous weight", () => {
  expect(enteredWeightIsLessThanPrevWeight(89, 100, 10)).toBe(true);
});

test("current weight should NOT be less than 10% previous weight", () => {
  expect(enteredWeightIsLessThanPrevWeight(91, 100, 10)).toBe(false);
});
