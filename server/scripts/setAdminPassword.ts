import { connectDB, disconnectDB } from '../config/db.js';
import { CustomerModel } from '../models/Customer.js';
import { authService } from '../services/authService.js';

async function setAdminPassword() {
  const args = process.argv.slice(2);
  const newPassword = (args[0] || process.env.NEW_ADMIN_PASSWORD || 'Admin@2026').trim();

  if (newPassword.length < 5) {
    console.error('Error: Password must be at least 5 characters long.');
    process.exit(1);
  }

  console.info('========================================================');
  console.info(' PARK AVENUE MENSWEAR — MONGODB ADMIN PASSWORD SYNCHRONIZER');
  console.info('========================================================');
  console.info(` Target Password: "${newPassword}"`);
  console.info(' Connecting to MongoDB database...');

  const connected = await connectDB();
  if (!connected) {
    console.error('Failed to establish MongoDB connection. Please verify MONGODB_URI in your environment.');
    process.exit(1);
  }

  const passwordHash = await authService.hashPassword(newPassword);

  // Target administrators: 'admin', 'admin1', 'devloper', 'parkamw', 'parkmens'
  const targetUsernames = ['admin', 'admin1', 'devloper', 'parkamw', 'parkmens'];
  const targetEmails = [
    'admin@parkavenuemenswear.com',
    'admin1@parkavenuemenswear.com',
    'dev@zentrixasr.com',
    'parkamw@admin.com',
    'parkmens@admin.com'
  ];

  let updateResult = await CustomerModel.updateMany(
    {
      $or: [
        { role: 'admin' },
        { username: { $in: targetUsernames } },
        { email: { $in: targetEmails } }
      ]
    },
    {
      $set: {
        passwordHash,
        status: 'active'
      }
    }
  );

  // If no administrators existed in the database yet, seed or provision them directly
  if (updateResult.matchedCount === 0) {
    console.info('No existing administrator records found. Provisioning admin and admin1...');
    for (const username of ['admin', 'admin1']) {
      await CustomerModel.create({
        customerId: username === 'admin' ? 'STF-0105' : 'STF-0106',
        firstName: 'Park Avenue',
        lastName: 'Administrator',
        name: `Park Avenue Admin (${username})`,
        username,
        email: `${username}@parkavenuemenswear.com`,
        phone: '+1 (800) 555-7276',
        passwordHash,
        role: 'admin',
        status: 'active',
        staffTitle: 'Executive Administrator',
        department: 'Executive Administration',
        addresses: []
      });
    }
  }

  console.info(`✓ Successfully updated/provisioned administrator record(s) in MongoDB.`);

  // Verify updated records
  const updatedAdmins = await CustomerModel.find(
    {
      $or: [
        { role: 'admin' },
        { username: { $in: targetUsernames } }
      ]
    },
    'customerId username email role name'
  ).lean();

  console.info('\nUpdated Administrator Accounts:');
  for (const adm of updatedAdmins) {
    console.info(` - ID: ${adm.customerId || adm._id} | Username: "${adm.username}" | Email: ${adm.email} | Role: ${adm.role}`);
  }

  console.info('\nYou can now sign in on the storefront using:');
  console.info(` - Username: admin (or admin1)`);
  console.info(` - Password: ${newPassword}`);
  console.info('========================================================');

  await disconnectDB();
  process.exit(0);
}

setAdminPassword().catch((err) => {
  console.error('Fatal error setting admin password:', err);
  process.exit(1);
});
