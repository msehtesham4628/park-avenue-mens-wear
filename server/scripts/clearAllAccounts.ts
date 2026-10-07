import { connectDB, disconnectDB } from '../config/db.js';
import { CustomerModel } from '../models/Customer.js';

async function clearAllAccounts() {
  console.info('========================================================');
  console.info(' PARK AVENUE MENSWEAR — DATABASE ACCOUNT CLEARANCE');
  console.info('========================================================');
  console.info(' Connecting to MongoDB (park_avenue_menswear)...');

  const connected = await connectDB();
  if (!connected) {
    console.error('Failed to establish MongoDB connection. Please verify MONGODB_URI.');
    process.exit(1);
  }

  const existingCount = await CustomerModel.countDocuments();
  console.info(`Found ${existingCount} existing account(s) in the 'customers' collection.`);

  const deleteResult = await CustomerModel.deleteMany({});
  console.info(`✓ Successfully deleted ${deleteResult.deletedCount} account(s) from MongoDB.`);
  console.info(' The database is now ready for clean account registration.');
  console.info(' You can register your new account from the storefront (/login -> Create account)');
  console.info(' Then update role: "admin" directly in MongoDB Atlas to grant administrator access.');
  console.info('========================================================');

  await disconnectDB();
  process.exit(0);
}

clearAllAccounts().catch((err) => {
  console.error('Fatal error during account clearance:', err);
  process.exit(1);
});
