export const toInt = (value, fallback = undefined) => {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const toDecimal = (value, fallback = undefined) => {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const toDate = (value) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

export const pagination = (query) => {
  const page = Math.max(toInt(query.page, 1), 1);
  const limit = Math.min(Math.max(toInt(query.limit, 25), 1), 100);
  return { page, limit, skip: (page - 1) * limit, take: limit };
};

export const dateRange = (field, from, to) => {
  const start = toDate(from);
  const end = toDate(to);
  if (!start && !end) return {};
  return {
    [field]: {
      ...(start ? { gte: start } : {}),
      ...(end ? { lte: end } : {}),
    },
  };
};
