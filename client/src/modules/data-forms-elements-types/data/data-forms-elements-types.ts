import { DataFormElementType } from "../models/data-form-element-type.model";


export const DATA_FORMS_ELEMENTS_TYPES: DataFormElementType[] = [
    {
      "id": 1,
      "data": {
        "categoryId": 1,
        "name": "Non-Repeating Group",
        "icon": "arrow-right",
        "operators": []
      },
      "version": 1
    },
    {
      "id": 2,
      "data": {
        "categoryId": 1,
        "name": "Repeating Group",
        "icon": "rotate-right",
        "operators": []
      },
      "version": 1
    },
    {
      "id": 3,
      "data": {
        "categoryId": 2,
        "name": "Integer",
        "icon": "0",
        "operators": [
          1,
          2,
          3,
          4,
          5,
          6
        ]
      },
      "version": 1
    },
    {
      "id": 4,
      "data": {
        "categoryId": 2,
        "name": "Decimal",
        "icon": "0",
        "operators": [
          1,
          2,
          3,
          4,
          5,
          6
        ]
      },
      "version": 1
    },
    {
      "id": 5,
      "data": {
        "categoryId": 2,
        "name": "Short Text",
        "icon": "t",
        "operators": [
          9,
          10
        ]
      },
      "version": 1
    },
    {
      "id": 6,
      "data": {
        "categoryId": 2,
        "name": "Long Text",
        "icon": "paragraph",
        "operators": [
          9,
          10
        ]
      },
      "version": 1
    },
    {
      "id": 7,
      "data": {
        "categoryId": 2,
        "name": "Date",
        "icon": "calendar-day",
        "operators": [
          1,
          2,
          3,
          4,
          5,
          6
        ]
      },
      "version": 1
    },
    {
      "id": 8,
      "data": {
        "categoryId": 2,
        "name": "Single Selection",
        "icon": "circle-dot",
        "operators": [
          5,
          6
        ]
      },
      "version": 1
    },
    {
      "id": 9,
      "data": {
        "categoryId": 2,
        "name": "Multiple Selection",
        "icon": "square-check",
        "operators": [
          7,
          8
        ]
      },
      "version": 1
    },
    {
      "id": 10,
      "data": {
        "categoryId": 2,
        "name": "Dropdown",
        "icon": "square-caret-down",
        "operators": [
          5,
          6
        ]
      },
      "version": 1
    },
    {
      "id": 11,
      "data": {
        "categoryId": 2,
        "name": "File",
        "icon": "paperclip",
        "operators": [
          11
        ]
      },
      "version": 1
    }
  ];