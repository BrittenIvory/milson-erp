const { SalesOrder, PurchaseOrder, Container, Part, Customer, Supplier, Inventory, sequelize } = require('../models');

const getStats = async (req, res, next) => {
  try {
    const [
      totalParts,
      totalCustomers,
      totalSuppliers,
      activeSalesOrders,
      activePurchaseOrders,
      pendingContainers,
      lowStockCount,
    ] = await Promise.all([
      Part.count({ where: { is_active: true } }),
      Customer.count({ where: { is_active: true } }),
      Supplier.count({ where: { is_active: true } }),
      SalesOrder.count({ where: { status: { [sequelize.Sequelize.Op.notIn]: ['Cancelled', 'Delivered'] } } }),
      PurchaseOrder.count({ where: { status: { [sequelize.Sequelize.Op.notIn]: ['Cancelled', 'Received'] } } }),
      Container.count({ where: { status: { [sequelize.Sequelize.Op.notIn]: ['Received'] } } }),
      Inventory.count({
        where: sequelize.literal('quantity_on_hand <= reorder_point AND reorder_point > 0'),
      }),
    ]);

    return res.json({
      success: true,
      data: {
        totalParts,
        totalCustomers,
        totalSuppliers,
        activeSalesOrders,
        activePurchaseOrders,
        pendingContainers,
        lowStockCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getRecent = async (req, res, next) => {
  try {
    const [recentSalesOrders, recentPurchaseOrders, recentContainers] = await Promise.all([
      SalesOrder.findAll({
        include: [{ model: Customer, attributes: ['id', 'name', 'code'] }],
        order: [['created_at', 'DESC']],
        limit: 5,
      }),
      PurchaseOrder.findAll({
        include: [{ model: Supplier, attributes: ['id', 'name', 'code'] }],
        order: [['created_at', 'DESC']],
        limit: 5,
      }),
      Container.findAll({
        order: [['created_at', 'DESC']],
        limit: 5,
      }),
    ]);

    return res.json({
      success: true,
      data: {
        recentSalesOrders,
        recentPurchaseOrders,
        recentContainers,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats, getRecent };
