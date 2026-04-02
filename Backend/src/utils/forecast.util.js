/**
 * Financial Forecasting Utility
 * Implementing basic linear trend analysis for spending.
 */

export const calculateTrend = (records = []) => {
  if (records.length < 2) return null;

  // Sorting records by date
  const sorted = records.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Extracting data for regression (X: days, Y: amount)
  const firstDate = new Date(sorted[0].date).getTime();
  const data = sorted.map((r, index) => ({
    x: index,
    y: r.amount,
  }));

  const n = data.length;
  const sumX = data.reduce((sum, d) => sum + d.x, 0);
  const sumY = data.reduce((sum, d) => sum + d.y, 0);
  const sumXY = data.reduce((sum, d) => sum + (d.x * d.y), 0);
  const sumXX = data.reduce((sum, d) => sum + (d.x * d.x), 0);

  // Slope (m) and Intercept (b) for y = mx + b
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Predict next value (at index n)
  const nextValue = Math.max(0, (slope * n + intercept).toFixed(2));
  
  return {
    slope,
    intercept,
    prediction: parseFloat(nextValue),
    trend: slope > 0 ? "INCREASING" : slope < 0 ? "DECREASING" : "STABLE",
  };
};
