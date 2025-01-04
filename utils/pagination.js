const getPagination = (page, size) => {
  const limit = size ? +size : 10;
  const offset = page ? (page - 1) * limit : 0;
  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: items } = data;
  const currentPage = page ? +page : 1;
  const totalPages = Math.ceil(totalItems / limit);

  return {
    status: "success",
    data: {
      items,
      pagination: {
        totalItems,
        totalPages,
        currentPage,
        pageSize: limit,
      },
    },
  };
};

module.exports = {
  getPagination,
  getPagingData,
};
