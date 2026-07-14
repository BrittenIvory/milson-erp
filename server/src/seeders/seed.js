require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { sequelize, Role, User } = require('../models');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    await sequelize.sync({ alter: true });
    console.log('Schema synced.');

    const roles = [
      { name: 'Admin', description: 'Full system access' },
      { name: 'Sales', description: 'Manage customers and sales orders' },
      { name: 'Purchasing', description: 'Manage suppliers, purchase orders, and containers' },
      { name: 'Warehouse', description: 'Manage inventory and receiving' },
      { name: 'Viewer', description: 'Read-only access to all modules' },
    ];

    for (const role of roles) {
      await Role.findOrCreate({ where: { name: role.name }, defaults: role });
    }
    console.log('Roles seeded.');

    const adminRole = await Role.findOne({ where: { name: 'Admin' } });

    await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        username: 'admin',
        email: 'admin@milsonfoundry.com',
        password_hash: 'admin123',
        first_name: 'System',
        last_name: 'Admin',
        role_id: adminRole.id,
      },
    });
    console.log('Admin user seeded (username: admin, password: admin123).');

    console.log('Seeding complete.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
