const isDecimalLike = (value) => {
  // Prisma uses Decimal.js for Decimal fields
  return (
    value &&
    typeof value === 'object' &&
    typeof value.toNumber === 'function' &&
    typeof value.toString === 'function'
  );
};

const normalizeForJson = (value) => {
  if (value === null || value === undefined) return value;

  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (isDecimalLike(value)) {
    // Convert Decimal to Number for frontend friendliness (toFixed, charts, etc.)
    return value.toNumber();
  }

  if (value instanceof Date) {
    // Keep as ISO string to avoid timezone surprises in clients
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(normalizeForJson);
  }

  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = normalizeForJson(v);
    }
    return out;
  }

  return value;
};

export const jsonSerializerMiddleware = (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (data) => originalJson(normalizeForJson(data));
  next();
};

