// Provides utility functions for working with arrays, objects, and other data types.
const _ = require('lodash');

// Helper function to get all values from an object, including nested properties
function getAllValues(obj) {
  const values = [];

  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      values.push(...getAllValues(obj[key]));
    } else {
      values.push(obj[key]);
    }
  }

  return values;
}

// Helper function to get all descendants recursively given a parentId
function getAllDescendants(targetTable, parentId) {
  const children = targetTable.filter(entry => entry.data.parentId == parentId);
  const descendants = children.flatMap(child => getAllDescendants(targetTable, child.id));
  return [...children, ...descendants];
}



// Returns a middleware function that handles incoming requests to entities endpoint if filtered by location
function entitiesFilteringMiddleware(router) {

  return function (req, res, next) {

    // Checks if the incoming request is a GET request to entities endpoint.
    if (req.method === 'GET' && req.path.includes('/entities')) {

      // Extracts the value of the data.location.id query parameter from the request URL.
      const location = req.query['data.location.id'];

      // If the data.location parameter is not present, the middleware function skips processing and passes control to the next middleware.
      if (!location) {
        next();
        return;
      }

      // Initializes the data variable with a reference to the JSON Server target locationed database table.
      let data = router.db.get('entities');

      // Loops through all the query parameters in the request URL and applies the corresponding filter to the data array.
      Object.entries(req.query).forEach(([key, value]) => {
        if (key === 'data.location.id') {
          data = data.filter(entry => entry.data.location.some(loc => loc.id === parseInt(value)));
        } else if (key.endsWith('_like')) {
          const field = key.slice(0, -5);
          data = data.filter(entry => _.get(entry, field, '').includes(value));
        } else if (key.endsWith('_gt')) {
          const field = key.slice(0, -3);
          const fieldValue = parseFloat(value);
          data = data.filter(entry => _.get(entry, field) > fieldValue);
        } else if (key.endsWith('_gte')) {
          const field = key.slice(0, -4);
          const fieldValue = parseFloat(value);
          data = data.filter(entry => _.get(entry, field) >= fieldValue);
        } else if (key.endsWith('_lt')) {
          const field = key.slice(0, -3);
          const fieldValue = parseFloat(value);
          data = data.filter(entry => _.get(entry, field) < fieldValue);
        } else if (key.endsWith('_lte')) {
          const field = key.slice(0, -4);
          const fieldValue = parseFloat(value);
          data = data.filter(entry => _.get(entry, field) <= fieldValue);
        } else if (key.endsWith('_ne')) {
          const field = key.slice(0, -3);
          const fieldValue = parseFloat(value);
          data = data.filter(entry => _.get(entry, field) !== fieldValue);
        } else if (!key.endsWith('_sort') && !key.endsWith('_order') && !key.endsWith('_page') && !key.endsWith('_limit') && !key.endsWith('_start') && !key.endsWith('_end')) {
          data = data.filter(entry => _.get(entry, key) == value);
        }
      });

      // If the _sort parameter is present in the request URL, sorts the data array by the specified field and order
      if (req.query._sort) {
        const order = req.query._order || 'asc';
        data = data.orderBy(_.get(req.query, '_sort'), order);
      }

      // If the _page and _limit parameters are present, applies pagination to the data array.
      if (req.query._page && req.query._limit) {
        const page = parseInt(_.get(req.query, '_page'));
        const limit = parseInt(_.get(req.query, '_limit'));
        const start = (page - 1) * limit;
        const end = start + limit;
        res.setHeader('X-Total-Count', data.size());
        data = data.slice(start, end);
      }

      // If the _start and _end parameters are present, slices the data array according to the specified start and end indices.
      if (req.query._start && req.query._end) {
        const start = parseInt(_.get(req.query, '_start'));
        const end = parseInt(_.get(req.query, '_end'));
        data = data.slice(start, end);
      }


      // If the q parameter is present, filters the data array to include only entries that have at least one property that matches the query string.
      if (req.query.q) {
        const query = req.query.q.toLowerCase();
        data = data.filter(entry => Object.values(entry).some(value => {
          if (typeof value === 'string') {
            return value.toLowerCase().includes(query);
          } else {
            return false;
          }
        }));
      }

      // Sends the filtered and sorted data back to the client as a JSON response.
      res.jsonp(data.value());

    } else {
      next();
    }
  };
};


// Returns a middleware function that handles incoming requests to data form responses endpoint if filtered by location or organisation
function dataFormResponsesFilteringMiddleware(router) {

  return function (req, res, next) {

    // Checks if the incoming request is a GET request to a locationed endpoint.
    if (req.method === 'GET' && req.path.includes('/data_forms_responses')) {

      // Extracts the value of the data.location.id query parameter from the request URL.
      const location = req.query['data.location.id'];

      // Extracts the value of the data.organisation.id query parameter from the request URL.
      const organisation = req.query['data.organisation.id'];

      // If the data.organisation parameter is not present, the middleware function skips processing and passes control to the next middleware.
      if (!location && !organisation) {
        next();
        return;
      }

      // Initializes the data variable with a reference to the JSON Server target locationed database table.
      let data = router.db.get('data_forms_responses');

      // Handle the situation where data.status.id has been provided more than once
      const statusIds = req.query['data.status.id'];
      if (Array.isArray(statusIds)) {

        // Create an array of all the values.
        const values = statusIds.map(id => parseInt(id));

        // Filter the data that has any of the statuses
        data = data.filter(entry => values.includes(entry.data.status.id));
      } else {

        // Loops through all the query parameters in the request URL and applies the corresponding filter to the data array.
        Object.entries(req.query).forEach(([key, value]) => {
          if (key === 'q') {
            data = data.filter(entry => {
              // Get all values from the entry object, including nested properties
              const allValues = getAllValues(entry);
              return allValues.some(v => {
                if (typeof v === 'string') {
                  return v.toLowerCase().includes(value);
                } else {
                  return false;
                }
              });
            });
          } else if (key === 'data.location.id') {
            data = data.filter(entry => {
              const locs = entry.data.location || [];
              return locs.some(loc => loc.id === parseInt(value));
            });
          } else if (key === 'data.organisation.id') {
            data = data.filter(entry => {
              const orgs = entry.data.organisations || [];
              return orgs.some(org => org.id === parseInt(value));
            });
          } else if (key.endsWith('_like')) {
            const field = key.slice(0, -5);
            data = data.filter(entry => _.get(entry, field, '').includes(value));
          } else if (key.endsWith('_gt')) {
            const field = key.slice(0, -3);
            const fieldValue = parseFloat(value);
            data = data.filter(entry => _.get(entry, field) > fieldValue);
          } else if (key.endsWith('_gte')) {
            const field = key.slice(0, -4);
            const fieldValue = parseFloat(value);
            data = data.filter(entry => _.get(entry, field) >= fieldValue);
          } else if (key.endsWith('_lt')) {
            const field = key.slice(0, -3);
            const fieldValue = parseFloat(value);
            data = data.filter(entry => _.get(entry, field) < fieldValue);
          } else if (key.endsWith('_lte')) {
            const field = key.slice(0, -4);
            const fieldValue = parseFloat(value);
            data = data.filter(entry => _.get(entry, field) <= fieldValue);
          } else if (key.endsWith('_ne')) {
            const field = key.slice(0, -3);
            const fieldValue = parseFloat(value);
            data = data.filter(entry => _.get(entry, field) !== fieldValue);
          } else if (!key.endsWith('_sort') && !key.endsWith('_order') && !key.endsWith('_page') && !key.endsWith('_limit') && !key.endsWith('_start') && !key.endsWith('_end')) {
            data = data.filter(entry => _.get(entry, key) == value);
          }
        });
      }

      // If the _sort parameter is present in the request URL, sorts the data array by the specified field and order
      if (req.query._sort) {
        const order = req.query._order || 'asc';
        data = data.orderBy(_.get(req.query, '_sort'), order);
      }

      // If the _page and _limit parameters are present, applies pagination to the data array.
      if (req.query._page && req.query._limit) {
        const page = parseInt(_.get(req.query, '_page'));
        const limit = parseInt(_.get(req.query, '_limit'));
        const start = (page - 1) * limit;
        const end = start + limit;
        res.setHeader('X-Total-Count', data.size());
        data = data.slice(start, end);
      }

      // If the _start and _end parameters are present, slices the data array according to the specified start and end indices.
      if (req.query._start && req.query._end) {
        const start = parseInt(_.get(req.query, '_start'));
        const end = parseInt(_.get(req.query, '_end'));
        data = data.slice(start, end);
      }

      // Sends the filtered and sorted data back to the client as a JSON response.
      res.jsonp(data.value());

    } else {
      next();
    }

    
  };
};


function bulkInsertDataFormResponsesMiddleware(router) {
  return function (req, res, next) {
    if (req.method === 'POST' && req.path.includes('/data_forms_responses/all')) {
      const objects = req.body;

      if (!Array.isArray(objects)) {
        res.status(400).send('Error: req.body must be an array.');
        return;
      }

      const targetTable = router.db.get('data_forms_responses');
      const createdObjects = objects.map(obj => targetTable.insert(obj).value());

      // Call router.db.write() to persist the changes
      try {
        router.db.write();
        res.status(201).jsonp(createdObjects);
      } catch (error) {
        res.status(500).send('Error: Failed to persist data. ' + error.message);
      }

    } else {
      next();
    }
  };
}

function bulkInsertDataFormElementsMiddleware(router) {
  return function (req, res, next) {
    if (req.method === 'POST' && req.path.includes('/data_forms_elements/all')) {
      const objects = req.body;

      if (!Array.isArray(objects)) {
        res.status(400).send('Error: req.body must be an array.');
        return;
      }

      const targetTable = router.db.get('data_forms_elements');
      const createdObjects = objects.map(obj => targetTable.insert(obj).value());

      // Call router.db.write() to persist the changes
      try {
        router.db.write();
        res.status(201).jsonp(createdObjects);
      } catch (error) {
        res.status(500).send('Error: Failed to persist data. ' + error.message);
      }

    } else {
      next();
    }
  };
};

function recursivelyRetrieveDataFormElementsMiddleware(router) {
  return function(req, res, next) {
    if (req.method === 'GET' && req.path.match(/^\/data_forms_elements\/parent\/\d+$/)) {
      const id = req.path.split('/').pop();
      const targetTable = router.db.get('data_forms_elements');
      const descendants = getAllDescendants(targetTable, id);
      const element = targetTable.find(entry => entry.id == id);
      const result = [element, ...descendants];
      res.status(200).json(result);
    } else {
      next();
    }
  };
}


function bulkUpdateDataFormElementsMiddleware(router) {
  return function(req, res, next) {
    if (req.method === 'PUT' && req.path.includes('/data_forms_elements/all')) {
      const objects = req.body;

      if (!Array.isArray(objects)) {
        res.status(400).send('Error: req.body must be an array.');
        return;
      }

      const targetTable = router.db.get('data_forms_elements');

      objects.forEach(obj => {
        targetTable.find({ id: obj.id }).assign(obj).value();
      });

      // Call router.db.write() to persist the changes
      try {
        router.db.write();
        res.status(200).jsonp(objects);
      } catch (error) {
        res.status(500).send('Error: Failed to persist data. ' + error.message);
      }

    } else {
      next();
    }
  };
}


function bulkDeleteDataFormElementsMiddleware(router) {
  return function(req, res, next) {
    if (req.method === 'DELETE' && req.path.match(/^\/data_forms_elements\/parent\/\d+$/)) {
      const parentId = req.path.split('/').pop();
      const targetTable = router.db.get('data_forms_elements');
      const descendants = getAllDescendants(targetTable, parentId);
      descendants.forEach(descendant => {
        targetTable.remove({ id: descendant.id }).write();
      });
      res.status(200).json({ message: `All descendants of element with parentId ${parentId} have been deleted` });
    } else {
      next();
    }
  };
}


function bulkUpdateSystemsTasksMiddleware(router) {
  return function(req, res, next) {
    if (req.method === 'PUT' && req.path.includes('/systems_tasks/all')) {
      const objects = req.body;

      if (!Array.isArray(objects)) {
        res.status(400).send('Error: req.body must be an array.');
        return;
      }

      const targetTable = router.db.get('systems_tasks');

      objects.forEach(obj => {
        targetTable.find({ id: obj.id }).assign(obj).value();
      });

      // Call router.db.write() to persist the changes
      try {
        router.db.write();
        res.status(200).jsonp(objects);
      } catch (error) {
        res.status(500).send('Error: Failed to persist data. ' + error.message);
      }

    } else {
      next();
    }
  };
}


function bulkInsertQuantitiesObservationsMiddleware(router) {
  return function (req, res, next) {
    if (req.method === 'POST' && req.path.includes('/quantities_observations/all')) {
      const objects = req.body;

      if (!Array.isArray(objects)) {
        res.status(400).send('Error: req.body must be an array.');
        return;
      }

      const targetTable = router.db.get('quantities_observations');
      const createdObjects = objects.map(obj => targetTable.insert(obj).value());

      // Call router.db.write() to persist the changes
      try {
        router.db.write();
        res.status(201).jsonp(createdObjects);
      } catch (error) {
        res.status(500).send('Error: Failed to persist data. ' + error.message);
      }

    } else {
      next();
    }
  };
};


function bulkDeleteQuantitiesObservationsMiddleware(router) {
  return function(req, res, next) {
    if (req.method === 'DELETE' && req.path.includes('/quantities_observations/all')) {
      const objects = req.body;

      if (!Array.isArray(objects)) {
        res.status(400).send('Error: req.body must be an array.');
        return;
      }

      const targetTable = router.db.get('quantities_observations');

      objects.forEach(obj => {
        targetTable.remove({ id: obj.id }).write();
      });

      // Call router.db.write() to persist the changes
      try {
        router.db.write();
        res.status(200).jsonp(objects);
      } catch (error) {
        res.status(500).send('Error: Failed to delete data. ' + error.message);
      }

    } else {
      next();
    }
  };
}



// Export the middleware functions as an object
module.exports = {
  entitiesFilteringMiddleware: entitiesFilteringMiddleware,
  bulkInsertDataFormElementsMiddleware: bulkInsertDataFormElementsMiddleware,
  recursivelyRetrieveDataFormElementsMiddleware: recursivelyRetrieveDataFormElementsMiddleware,
  bulkUpdateDataFormElementsMiddleware: bulkUpdateDataFormElementsMiddleware,
  bulkDeleteDataFormElementsMiddleware: bulkDeleteDataFormElementsMiddleware,
  bulkInsertDataFormResponsesMiddleware: bulkInsertDataFormResponsesMiddleware,
  dataFormResponsesFilteringMiddleware: dataFormResponsesFilteringMiddleware,
  bulkUpdateSystemsTasksMiddleware: bulkUpdateSystemsTasksMiddleware,
  bulkInsertQuantitiesObservationsMiddleware: bulkInsertQuantitiesObservationsMiddleware,
  bulkDeleteQuantitiesObservationsMiddleware: bulkDeleteQuantitiesObservationsMiddleware
};
