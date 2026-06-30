const {
  Container, ContainerLine, PurchaseOrderLine, PurchaseOrder,
  Part, User, PurchaseReceipt, PurchaseReceiptLine,
  Inventory, InventoryTransaction, sequelize,
} = require('../models');
const { getPagination, formatPaginatedResponse } = require('../utils/pagination');
const { generateOrderNumber } = require('../utils/generateNumber');
const { Op } = require('sequelize');

const list = async (req, res, next) => {
  try {
    const { page, limit, offset, sort, order } = getPagination(req.query);
    const where = {};

    if (req.query.search) {
      where[Op.or] = [
        { container_number: { [Op.iLike]: `%${req.query.search}%` } },
        { vessel_name: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }

    if (req.query.status) {
      where.status = req.query.status;
    }

    const data = await Container.findAndCountAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name'] },
      ],
      order: [[sort, order]],
      limit,
      offset,
    });

    return res.json(formatPaginatedResponse(data, page, limit));
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const container = await Container.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name'] },
        { model: User, as: 'updater', attributes: ['id', 'first_name', 'last_name'] },
        {
          model: ContainerLine,
          as: 'lines',
          include: [{
            model: PurchaseOrderLine,
            include: [
              { model: Part, attributes: ['id', 'part_number', 'description', 'unit_of_measure'] },
              { model: PurchaseOrder, attributes: ['id', 'po_number'] },
            ],
          }],
        },
        { model: PurchaseReceipt },
      ],
    });

    if (!container) {
      return res.status(404).json({ success: false, error: { message: 'Container not found' } });
    }

    return res.json({ success: true, data: container });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const container = await Container.create({
      ...req.body,
      created_by: req.user.id,
      updated_by: req.user.id,
    });

    return res.status(201).json({ success: true, data: container });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const container = await Container.findByPk(req.params.id);
    if (!container) {
      return res.status(404).json({ success: false, error: { message: 'Container not found' } });
    }

    if (container.status === 'Received') {
      return res.status(400).json({ success: false, error: { message: 'Cannot update received container' } });
    }

    await container.update({ ...req.body, updated_by: req.user.id });
    return res.json({ success: true, data: container });
  } catch (err) {
    next(err);
  }
};

const addLine = async (req, res, next) => {
  try {
    const container = await Container.findByPk(req.params.id);
    if (!container) {
      return res.status(404).json({ success: false, error: { message: 'Container not found' } });
    }

    if (container.status === 'Received') {
      return res.status(400).json({ success: false, error: { message: 'Cannot add lines to received container' } });
    }

    const { purchase_order_line_id, quantity } = req.body;

    const poLine = await PurchaseOrderLine.findByPk(purchase_order_line_id);
    if (!poLine) {
      return res.status(404).json({ success: false, error: { message: 'Purchase order line not found' } });
    }

    const line = await ContainerLine.create({
      container_id: container.id,
      purchase_order_line_id,
      quantity,
    });

    return res.status(201).json({ success: true, data: line });
  } catch (err) {
    next(err);
  }
};

const removeLine = async (req, res, next) => {
  try {
    const line = await ContainerLine.findOne({
      where: { id: req.params.lineId, container_id: req.params.id },
    });

    if (!line) {
      return res.status(404).json({ success: false, error: { message: 'Container line not found' } });
    }

    await line.destroy();
    return res.json({ success: true, data: { message: 'Container line removed' } });
  } catch (err) {
    next(err);
  }
};

const receive = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const container = await Container.findByPk(req.params.id, {
      include: [{
        model: ContainerLine,
        as: 'lines',
        include: [{
          model: PurchaseOrderLine,
          include: [{ model: Part }],
        }],
      }],
    });

    if (!container) {
      await t.rollback();
      return res.status(404).json({ success: false, error: { message: 'Container not found' } });
    }

    if (container.status === 'Received') {
      await t.rollback();
      return res.status(400).json({ success: false, error: { message: 'Container already received' } });
    }

    if (!container.lines || container.lines.length === 0) {
      await t.rollback();
      return res.status(400).json({ success: false, error: { message: 'Container has no lines to receive' } });
    }

    const receiptNumber = await generateOrderNumber(PurchaseReceipt, 'receipt_number', 'REC');

    const receipt = await PurchaseReceipt.create({
      receipt_number: receiptNumber,
      container_id: container.id,
      receipt_date: new Date(),
      received_by: req.user.id,
      created_by: req.user.id,
      updated_by: req.user.id,
    }, { transaction: t });

    for (const line of container.lines) {
      await PurchaseReceiptLine.create({
        purchase_receipt_id: receipt.id,
        purchase_order_line_id: line.purchase_order_line_id,
        part_id: line.PurchaseOrderLine.part_id,
        quantity_received: line.quantity,
      }, { transaction: t });

      await PurchaseOrderLine.update(
        {
          quantity_received: sequelize.literal(`quantity_received + ${parseFloat(line.quantity)}`),
        },
        { where: { id: line.purchase_order_line_id }, transaction: t }
      );

      const [inventory] = await Inventory.findOrCreate({
        where: { part_id: line.PurchaseOrderLine.part_id },
        defaults: { part_id: line.PurchaseOrderLine.part_id },
        transaction: t,
      });

      await inventory.update({
        quantity_on_hand: sequelize.literal(`quantity_on_hand + ${parseFloat(line.quantity)}`),
      }, { transaction: t });

      await InventoryTransaction.create({
        part_id: line.PurchaseOrderLine.part_id,
        transaction_type: 'Receipt',
        quantity: line.quantity,
        reference_type: 'PurchaseReceipt',
        reference_id: receipt.id,
        notes: `Received from container ${container.container_number}`,
        created_by: req.user.id,
      }, { transaction: t });
    }

    await container.update({
      status: 'Received',
      actual_arrival_date: new Date(),
      updated_by: req.user.id,
    }, { transaction: t });

    const poIds = [...new Set(container.lines.map((l) => l.PurchaseOrderLine.purchase_order_id))];
    for (const poId of poIds) {
      const po = await PurchaseOrder.findByPk(poId, {
        include: [{ model: PurchaseOrderLine, as: 'lines' }],
        transaction: t,
      });

      if (po) {
        const allReceived = po.lines.every(
          (l) => parseFloat(l.quantity_received) + parseFloat(
            container.lines
              .filter((cl) => cl.purchase_order_line_id === l.id)
              .reduce((sum, cl) => sum + parseFloat(cl.quantity), 0)
          ) >= parseFloat(l.quantity)
        );

        const newStatus = allReceived ? 'Received' : 'Partially Received';
        if (po.status !== 'Received') {
          await po.update({ status: newStatus }, { transaction: t });
        }
      }
    }

    await t.commit();

    const createdReceipt = await PurchaseReceipt.findByPk(receipt.id, {
      include: [
        { model: Container },
        { model: PurchaseReceiptLine, as: 'lines', include: [{ model: Part }] },
      ],
    });

    return res.status(201).json({ success: true, data: createdReceipt });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

module.exports = { list, getById, create, update, addLine, removeLine, receive };
