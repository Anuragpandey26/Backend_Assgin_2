/**
 * A higher-order function that wraps an asynchronous Express middleware/controller
 * and automatically catches any errors, passing them to the next() function.
 * This removes the need for repetitive try-catch blocks in controllers.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
