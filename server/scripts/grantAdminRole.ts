import { connectDB, disconnectDB } from '../config/db.js';
import { CustomerModel } from '../models/Customer.js';

async function grantAdminRole() {
  const target = (process.argv[2] || '').trim();

  if (!target) {
    console.error('Usage: npx tsx server/scripts/grantAdminRole.ts <email or username>');
    console.error('Example: npx tsx server/scripts/grantAdminRole.ts mrxettu@gmail.com');
    process.exit(1);
  }

  console.info('========================================================');
  console.info(' PARK AVENUE MENSWEAR — GRANT ADMIN ROLE');
  console.info('========================================================');
  console.info(` Target: "${target}"`);
  console.info(' Connecting to MongoDB (park_avenue_menswear)...');

  const connected = await connectDB();
  if (!connected) {
    console.error('Failed to establish MongoDB connection.');
    process.exit(1);
  }

  const cleanTarget = target.toLowerCase();
  const query = {
    $or: [
      { email: { $regex: `^${cleanTarget.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } },
      { username: { $regex: `^${cleanTarget.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } },
      { customerId: target }
    ]
  };

  const customer = await CustomerModel.findOne(query);

  if (!customer) {
    console.error(`No customer account found matching "${target}".`);
    console.info('Please create the account first via storefront registration (/login -> Create Account).');
    await disconnectDB();
    process.exit(1);
  }

  customer.role = 'admin';
  customer.staffTitle = customer.staffTitle || 'Executive Administrator';
  customer.department = customer.department || 'Executive Administration';
  customer.status = 'active';
  await customer.save();

  console.info(`✓ Successfully granted "admin" role to:`);
  console.info(` - Name: ${customer.name || customer.firstName}`);
  console.info(` - Username: ${customer.username}`);
  console.info(` - Email: ${customer.email}`);
  console.info(` - Role: ${customer.role}`);
  console.info('\nThis account can now access /admin and the administrator command center!');
  console.info('========================================================');

  await disconnectDB();
  process.exit(0);
}

grantAdminRole().catch((err) => {
  console.error('Error granting admin role:', err);
  process.exit(1);
});
