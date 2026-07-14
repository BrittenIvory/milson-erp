const generateOrderNumber = async (Model, field, prefix) => {
  const latest = await Model.findOne({
    order: [[field, 'DESC']],
    attributes: [field],
  });

  if (!latest) {
    return `${prefix}-0001`;
  }

  const currentNumber = latest[field];
  const numericPart = parseInt(currentNumber.split('-').pop(), 10);
  const nextNumber = (numericPart + 1).toString().padStart(4, '0');
  return `${prefix}-${nextNumber}`;
};

module.exports = { generateOrderNumber };
