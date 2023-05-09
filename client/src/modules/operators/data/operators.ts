import { Operator } from "../models/operator.model";


export const OPERATORS: Operator[] = [
  {
    "id": 1,
    "data": {
      "name": "Greater Than",
      "constraint": "Should be greater than",
      "condition": "Is greater than"
    },
    "version": 1
  },
  {
    "id": 2,
    "data": {
      "name": "Greater Than Or Equal To",
      "constraint": "Should be greater than or equal to",
      "condition": "Is greater than or equal to"
    },
    "version": 1
  },
  {
    "id": 3,
    "data": {
      "name": "Less Than",
      "constraint": "Should be less than",
      "condition": "Is less than"
    },
    "version": 1
  },
  {
    "id": 4,
    "data": {
      "name": "Less Than Or Equal To",
      "constraint": "Should be less than or equal to",
      "condition": "Is less than or equal to"
    },
    "version": 1
  },
  {
    "id": 5,
    "data": {
      "name": "Equal To",
      "constraint": "Should be equal to",
      "condition": "Is equal to"
    },
    "version": 1
  },
  {
    "id": 6,
    "data": {
      "name": "Not Equal To",
      "constraint": "Should not be equal to",
      "condition": "Is not equal to"
    },
    "version": 1
  },
  {
    "id": 7,
    "data": {
      "name": "Contains",
      "constraint": "Should contain",
      "condition": "Contains"
    },
    "version": 1
  },
  {
    "id": 8,
    "data": {
      "name": "Does Not Contain",
      "constraint": "Should not contain",
      "condition": "Does not contain"
    },
    "version": 1
  },
  {
    "id": 9,
    "data": {
      "name": "Minimum Characters",
      "constraint": "Should have a min character count of",
      "condition": "Has a min character count of"
    },
    "version": 1
  },
  {
    "id": 10,
    "data": {
      "name": "Maximum Characters",
      "constraint": "Should have a max character count of",
      "condition": "Has a max character count of"
    },
    "version": 1
  },
  {
    "id": 11,
    "data": {
      "name": "Maximum MB Size",
      "constraint": "Should have a max mb size of",
      "condition": "Has a max mb size of"
    },
    "version": 1
  }
];
