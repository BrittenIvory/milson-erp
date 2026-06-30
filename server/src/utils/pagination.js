const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const offset = (page - 1) * limit;
  const sort = query.sort || 'created_at';
  const order = (query.order || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  return { page, limit, offset, sort, order };
};

const formatPaginatedResponse = (data, page, limit) => {
  const totalPages = Math.ceil(data.count / limit);
  return {
    success: true,
    data: data.rows,
    pagination: {
      page,
      limit,
      total: data.count,
      totalPages,
    },
  };
};

module.exports = { getPagination, formatPaginatedResponse };
