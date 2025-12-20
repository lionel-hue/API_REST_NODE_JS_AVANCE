export function asyncHandler(fn***REMOVED*** {
  return (req, res, next***REMOVED*** => {
    Promise.resolve(fn(req, res, next***REMOVED******REMOVED***.catch(next***REMOVED***;
  };
}
