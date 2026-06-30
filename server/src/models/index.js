const sequelize = require('../config/database');
const Role = require('./Role');
const User = require('./User');
const Part = require('./Part');
const Supplier = require('./Supplier');
const Customer = require('./Customer');
const CustomerPrice = require('./CustomerPrice');
const SupplierPrice = require('./SupplierPrice');
const SalesOrder = require('./SalesOrder');
const SalesOrderLine = require('./SalesOrderLine');
const PurchaseOrder = require('./PurchaseOrder');
const PurchaseOrderLine = require('./PurchaseOrderLine');
const Container = require('./Container');
const ContainerLine = require('./ContainerLine');
const PurchaseReceipt = require('./PurchaseReceipt');
const PurchaseReceiptLine = require('./PurchaseReceiptLine');
const Inventory = require('./Inventory');
const InventoryTransaction = require('./InventoryTransaction');
const AuditLog = require('./AuditLog');

// --- Associations ---

// User <-> Role
Role.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Role, { foreignKey: 'role_id' });

// Part created/updated by
Part.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });
Part.belongsTo(User, { as: 'updater', foreignKey: 'updated_by' });

// Supplier created/updated by
Supplier.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });
Supplier.belongsTo(User, { as: 'updater', foreignKey: 'updated_by' });

// Customer created/updated by
Customer.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });
Customer.belongsTo(User, { as: 'updater', foreignKey: 'updated_by' });

// Customer Prices
Customer.hasMany(CustomerPrice, { foreignKey: 'customer_id', as: 'prices' });
CustomerPrice.belongsTo(Customer, { foreignKey: 'customer_id' });
Part.hasMany(CustomerPrice, { foreignKey: 'part_id' });
CustomerPrice.belongsTo(Part, { foreignKey: 'part_id' });

// Supplier Prices
Supplier.hasMany(SupplierPrice, { foreignKey: 'supplier_id', as: 'prices' });
SupplierPrice.belongsTo(Supplier, { foreignKey: 'supplier_id' });
Part.hasMany(SupplierPrice, { foreignKey: 'part_id' });
SupplierPrice.belongsTo(Part, { foreignKey: 'part_id' });

// Sales Order
Customer.hasMany(SalesOrder, { foreignKey: 'customer_id' });
SalesOrder.belongsTo(Customer, { foreignKey: 'customer_id' });
SalesOrder.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });
SalesOrder.belongsTo(User, { as: 'updater', foreignKey: 'updated_by' });
SalesOrder.hasMany(SalesOrderLine, { foreignKey: 'sales_order_id', as: 'lines' });
SalesOrderLine.belongsTo(SalesOrder, { foreignKey: 'sales_order_id' });
SalesOrderLine.belongsTo(Part, { foreignKey: 'part_id' });

// Purchase Order
Supplier.hasMany(PurchaseOrder, { foreignKey: 'supplier_id' });
PurchaseOrder.belongsTo(Supplier, { foreignKey: 'supplier_id' });
PurchaseOrder.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });
PurchaseOrder.belongsTo(User, { as: 'updater', foreignKey: 'updated_by' });
PurchaseOrder.hasMany(PurchaseOrderLine, { foreignKey: 'purchase_order_id', as: 'lines' });
PurchaseOrderLine.belongsTo(PurchaseOrder, { foreignKey: 'purchase_order_id' });
PurchaseOrderLine.belongsTo(Part, { foreignKey: 'part_id' });

// Container
Container.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });
Container.belongsTo(User, { as: 'updater', foreignKey: 'updated_by' });
Container.hasMany(ContainerLine, { foreignKey: 'container_id', as: 'lines' });
ContainerLine.belongsTo(Container, { foreignKey: 'container_id' });
ContainerLine.belongsTo(PurchaseOrderLine, { foreignKey: 'purchase_order_line_id' });
PurchaseOrderLine.hasMany(ContainerLine, { foreignKey: 'purchase_order_line_id' });

// Purchase Receipt
Container.hasMany(PurchaseReceipt, { foreignKey: 'container_id' });
PurchaseReceipt.belongsTo(Container, { foreignKey: 'container_id' });
PurchaseReceipt.belongsTo(User, { as: 'receiver', foreignKey: 'received_by' });
PurchaseReceipt.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });
PurchaseReceipt.belongsTo(User, { as: 'updater', foreignKey: 'updated_by' });
PurchaseReceipt.hasMany(PurchaseReceiptLine, { foreignKey: 'purchase_receipt_id', as: 'lines' });
PurchaseReceiptLine.belongsTo(PurchaseReceipt, { foreignKey: 'purchase_receipt_id' });
PurchaseReceiptLine.belongsTo(PurchaseOrderLine, { foreignKey: 'purchase_order_line_id' });
PurchaseReceiptLine.belongsTo(Part, { foreignKey: 'part_id' });

// Inventory
Part.hasOne(Inventory, { foreignKey: 'part_id' });
Inventory.belongsTo(Part, { foreignKey: 'part_id' });

// Inventory Transactions
Part.hasMany(InventoryTransaction, { foreignKey: 'part_id' });
InventoryTransaction.belongsTo(Part, { foreignKey: 'part_id' });
InventoryTransaction.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });

// Audit Logs
User.hasMany(AuditLog, { foreignKey: 'user_id' });
AuditLog.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  sequelize,
  Role,
  User,
  Part,
  Supplier,
  Customer,
  CustomerPrice,
  SupplierPrice,
  SalesOrder,
  SalesOrderLine,
  PurchaseOrder,
  PurchaseOrderLine,
  Container,
  ContainerLine,
  PurchaseReceipt,
  PurchaseReceiptLine,
  Inventory,
  InventoryTransaction,
  AuditLog,
};
