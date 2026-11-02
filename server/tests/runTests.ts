/**
 * Park Avenue Menswear — Comprehensive Automated Test Suite
 * Tests critical backend workflows and business rules.
 */

import { connectDB } from '../config/db.js';
import { seedInitialData } from '../config/seed.js';
import { authService } from '../services/authService.js';
import { productService } from '../services/productService.js';
import { inventoryService } from '../services/inventoryService.js';
import { cartService } from '../services/cartService.js';
import { orderService } from '../services/orderService.js';
import { alterationService } from '../services/alterationService.js';
import { notificationService } from '../services/notificationService.js';
import { paymentService } from '../services/paymentService.js';
import { customerService } from '../services/customerService.js';
import { returnService } from '../services/returnService.js';

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: any) {
  if (condition) {
    passedCount++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedCount++;
    console.error(`  ✗ FAIL: ${testName}`, detail || '');
  }
}

async function runTests() {
  console.log('========================================================');
  console.log(' PARK AVENUE MENSWEAR — BACKEND API TEST SUITE');
  console.log('========================================================\n');

  // Initialize DB and Seed
  await connectDB();
  await seedInitialData();

  const testTimestamp = Date.now();
  const testAdmin = {
    id: 'CUST-ADMIN-001',
    name: 'Master Director',
    email: 'admin@parkavenuemenswear.com',
    role: 'admin'
  };

  // ----------------------------------------------------
  // TEST 1: Authentication & Password Hashing
  // ----------------------------------------------------
  console.log('[1/13] Testing Authentication & Password Hashing...');
  try {
    const rawPass = 'BespokeTailor2026!';
    const hash = await authService.hashPassword(rawPass);
    const isValid = await authService.verifyPassword(rawPass, hash);
    const isInvalid = await authService.verifyPassword('WrongPassword', hash);

    assert(isValid === true, 'Bcrypt hashes and verifies valid password');
    assert(isInvalid === false, 'Bcrypt rejects incorrect password');

    // Register a new customer
    const regEmail = `patron-${testTimestamp}@parkavenuemenswear.com`;
    const { customer, token } = await authService.register({
      firstName: 'Alexander',
      lastName: 'Vanderbilt',
      email: regEmail,
      phone: '+1 (555) 901-2345',
      password: rawPass
    });

    assert(Boolean(customer.customerId), 'Customer registration returns valid customerId');
    assert(Boolean(token), 'Customer registration returns signed JWT token');

    const decoded = authService.verifyToken(token);
    assert(decoded?.email === regEmail, 'JWT token decodes with correct email');
  } catch (err: any) {
    assert(false, 'Authentication test threw exception', err.message);
  }

  // ----------------------------------------------------
  // TEST 2: Product Creation
  // ----------------------------------------------------
  console.log('\n[2/13] Testing Product Creation...');
  let createdProductId = '';
  try {
    const newProduct = await productService.createProduct({
      name: `Imperial Worsted Navy Blazer ${testTimestamp}`,
      sku: `PA-BLAZER-${testTimestamp}`,
      description: 'Hand-tailored from Super 160s English wool with brass crest buttons.',
      category: 'Suits',
      price: 1250,
      variants: [
        { size: '40R', color: 'Navy', stock: 6 },
        { size: '42R', color: 'Navy', stock: 4 }
      ],
      fabric: '100% Super 160s English Wool',
      fit: 'Sartorial Tailored Fit'
    }, testAdmin);

    createdProductId = newProduct.productId;
    assert(Boolean(createdProductId), 'Product created with unique productId');
    assert(newProduct.stockQuantity === 10, 'Product stockQuantity accurately calculated from variants');
    assert(newProduct.variants.length === 2, 'Variants array initialized correctly');
  } catch (err: any) {
    assert(false, 'Product creation threw exception', err.message);
  }

  // ----------------------------------------------------
  // TEST 3: Product Search & Filtering
  // ----------------------------------------------------
  console.log('\n[3/13] Testing Product Search & Filtering...');
  try {
    const searchRes = await productService.getProducts({
      search: 'Navy',
      category: 'Suits'
    });
    assert(searchRes.products.length > 0, 'Search finds matches by garment name and fabric');

    const filtered = await productService.getProducts({
      category: 'Dress Shirts'
    });
    const allShirts = filtered.products.length > 0 && filtered.products.every(p => p.category === 'Dress Shirts' || p.category === 'Shirts');
    assert(allShirts, 'Category filtering isolates requested garment category');
  } catch (err: any) {
    assert(false, 'Product search threw exception', err.message);
  }

  // ----------------------------------------------------
  // TEST 4: Inventory Updates & Variant Management
  // ----------------------------------------------------
  console.log('\n[4/13] Testing Inventory Updates...');
  try {
    const adjustResult = await inventoryService.adjustStock({
      productId: createdProductId,
      size: '40R',
      color: 'Navy',
      adjustmentType: 'add',
      quantity: 5,
      reason: 'restock',
      adminUser: testAdmin
    });

    assert(adjustResult.updatedVariant?.stock === 11, 'Stock successfully added to variant (6 + 5 = 11)');
    assert(adjustResult.product.stockQuantity === 15, 'Total product stockQuantity updated (10 + 5 = 15)');
    assert(adjustResult.transaction.reason === 'restock', 'Inventory transaction record logged with reason');
  } catch (err: any) {
    assert(false, 'Inventory update threw exception', err.message);
  }

  // ----------------------------------------------------
  // TEST 5: Inventory Negative Prevention
  // ----------------------------------------------------
  console.log('\n[5/13] Testing Inventory Negative Stock Prevention...');
  try {
    let prevented = false;
    try {
      await inventoryService.adjustStock({
        productId: createdProductId,
        size: '40R',
        color: 'Navy',
        adjustmentType: 'remove',
        quantity: 999, // Exceeds stock
        reason: 'order_fulfillment',
        adminUser: testAdmin
      });
    } catch {
      prevented = true;
    }
    assert(prevented, 'Strict business rule: Backend rejects negative inventory deduction');
  } catch (err: any) {
    assert(false, 'Negative inventory check error', err.message);
  }

  // ----------------------------------------------------
  // TEST 6: Cart Validation & Server-Side Pricing
  // ----------------------------------------------------
  console.log('\n[6/13] Testing Cart Validation & Server-Side Pricing...');
  const testSession = `sess-test-${testTimestamp}`;
  try {
    const cart = await cartService.addItem(testSession, {
      productId: createdProductId,
      size: '40R',
      color: 'Navy',
      quantity: 2
    });

    assert(cart.items.length === 1, 'Item added to server cart');
    assert(cart.subtotal === 2500, 'Cart subtotal calculated strictly from authoritative server price (2 x $1250)');

    const validation = await cartService.validateCart(cart);
    assert(validation.isValid === true, 'Cart validation confirms inventory and live prices');
  } catch (err: any) {
    assert(false, 'Cart validation threw exception', err.message);
  }

  // ----------------------------------------------------
  // TEST 7: Order Creation & Atomic Stock Deduction
  // ----------------------------------------------------
  console.log('\n[7/13] Testing Order Creation & Atomic Stock Deduction...');
  let createdOrderId = '';
  try {
    const order = await orderService.createOrder({
      customerName: 'Marcus Sterling',
      customerEmail: 'marcus.sterling@example.com',
      customerPhone: '+1 (555) 777-8899',
      items: [{
        productId: createdProductId,
        size: '40R',
        color: 'Navy',
        quantity: 1,
        alterationRequested: true
      }],
      shippingInfo: {
        recipientName: 'Marcus Sterling',
        email: 'marcus.sterling@example.com',
        phone: '+1 (555) 777-8899',
        street: '6170 W Grand Ave',
        city: 'Gurnee',
        state: 'IL',
        postalCode: '60031',
        country: 'United States',
        shippingMethod: 'White Glove Express'
      }
    });

    createdOrderId = order.orderId;
    assert(createdOrderId.startsWith('PA-'), `Generated human-readable Order ID (${createdOrderId})`);
    assert(order.orderStatus === 'Confirmed', 'Order initial status marked Confirmed');
    assert(order.statusHistory.length >= 1, 'Initial status history recorded');

    // Verify stock was deducted automatically
    const prodAfter = await productService.getProductBySlugOrId(createdProductId);
    const variantAfter = prodAfter?.variants.find(v => v.size === '40R');
    assert(variantAfter?.stock === 10, 'Variant stock decremented safely (11 - 1 = 10)');
  } catch (err: any) {
    assert(false, 'Order creation threw exception', err.message);
  }

  // ----------------------------------------------------
  // TEST 8: Order Status Updates & Notification Event
  // ----------------------------------------------------
  console.log('\n[8/13] Testing Order Status Updates & History...');
  try {
    const updatedOrder = await orderService.updateOrderStatus(
      createdOrderId,
      'Shipped',
      testAdmin,
      {
        trackingNumber: 'PA-TRK-774921',
        note: 'Garments packaged in breathable bespoke garment bag and dispatched via courier.'
      }
    );

    assert(updatedOrder.orderStatus === 'Shipped', 'Order status updated to Shipped');
    assert(updatedOrder.trackingNumber === 'PA-TRK-774921', 'Tracking number recorded');
    assert(updatedOrder.statusHistory.length === 2, 'Status history ledger appended');
  } catch (err: any) {
    assert(false, 'Order status update threw exception', err.message);
  }

  // ----------------------------------------------------
  // TEST 9: Alteration Creation & Status Updates
  // ----------------------------------------------------
  console.log('\n[9/13] Testing Alterations Lifecycle...');
  let createdAlterationId = '';
  try {
    const alteration = await alterationService.createAlteration({
      customerName: 'Marcus Sterling',
      customerEmail: 'marcus.sterling@example.com',
      customerPhone: '+1 (555) 777-8899',
      orderId: createdOrderId,
      productName: 'Imperial Worsted Navy Blazer',
      alterationType: 'Sleeve Length & Waist Suppression',
      measurements: {
        jacketSleeveAdjustment: 'Take up 0.75 inches',
        jacketWaistSuppression: 'Taper waist 1.25 inches'
      },
      tailorAssigned: 'Giovanni Rossi'
    });

    createdAlterationId = alteration.alterationId;
    assert(createdAlterationId.startsWith('ALT-'), `Generated human-readable Alteration ID (${createdAlterationId})`);
    assert(alteration.currentStatus === 'Received', 'Alteration ticket starts in Received status');

    // Update alteration status
    const inProgress = await alterationService.updateStatus(
      createdAlterationId,
      'In Progress',
      testAdmin,
      { note: 'Hand chalking and basting completed' }
    );
    assert(inProgress.currentStatus === 'In Progress', 'Alteration status progressed to In Progress');
    assert(inProgress.statusHistory.length === 2, 'Alteration history updated with tailor notes');
  } catch (err: any) {
    assert(false, 'Alterations test threw exception', err.message);
  }

  // ----------------------------------------------------
  // TEST 10: Customer Order & Alteration Lookup
  // ----------------------------------------------------
  console.log('\n[10/13] Testing Customer Order & Alteration Lookup...');
  try {
    const foundOrder = await orderService.customerLookup(createdOrderId, 'marcus.sterling@example.com');
    assert(foundOrder !== null && foundOrder.orderId === createdOrderId, 'Lookup retrieves order by ID + Email');

    const foundAlteration = await alterationService.customerLookup(createdAlterationId, 'marcus.sterling@example.com');
    assert(foundAlteration !== null && foundAlteration.alterationId === createdAlterationId, 'Lookup retrieves alteration by ID + Email');

    const wrongLookup = await orderService.customerLookup(createdOrderId, 'hacker@example.com');
    assert(wrongLookup === null, 'Lookup rejects unauthorized/unmatched contact credentials');
  } catch (err: any) {
    assert(false, 'Customer lookup threw exception', err.message);
  }

  // ----------------------------------------------------
  // TEST 11: Notification Dispatching & History
  // ----------------------------------------------------
  console.log('\n[11/13] Testing Notification Triggering & Log...');
  try {
    const notifRes = await notificationService.send('email', {
      recipient: 'marcus.sterling@example.com',
      recipientName: 'Marcus Sterling',
      subject: 'Your Bespoke Garment is Ready',
      message: 'Your altered suit has passed hand inspection and is ready for pickup.',
      notificationType: 'ALTERATION_READY',
      orderId: createdOrderId
    });

    assert(notifRes.success === true, 'Notification dispatched successfully via email adapter');
    assert(Boolean(notifRes.log.notificationId), 'Notification logged with unique ID');

    const history = await notificationService.getNotificationHistory({ orderId: createdOrderId });
    assert(history.logs.length > 0, 'Notification history queries logs for admin dashboard');
  } catch (err: any) {
    assert(false, 'Notification test threw exception', err.message);
  }

  // ----------------------------------------------------
  // TEST 12: Customer Management & Multi-Attribute Search
  // ----------------------------------------------------
  console.log('\n[12/13] Testing Customer Search by Email, Phone, Order ID...');
  try {
    const byEmail = await customerService.searchCustomers('admin@parkavenuemenswear.com');
    assert(byEmail.length > 0, 'Search finds customer by email');

    const byOrderId = await customerService.searchCustomers(createdOrderId);
    assert(byOrderId.length > 0, 'Search finds customer associated with Order ID');
  } catch (err: any) {
    assert(false, 'Customer search threw exception', err.message);
  }

  // ----------------------------------------------------
  // TEST 13: Payment Webhook Handling
  // ----------------------------------------------------
  console.log('\n[13/14] Testing Payment Webhook Handling...');
  try {
    const webhookRes = await paymentService.handleWebhook({
      type: 'payment_intent.succeeded',
      data: {
        object: {
          metadata: { orderId: createdOrderId }
        }
      }
    });

    assert(webhookRes.received === true, 'Payment webhook processed and acknowledged');
    assert(webhookRes.status === 'Paid', 'Order payment status transitioned to Paid via webhook');
  } catch (err: any) {
    assert(false, 'Payment webhook threw exception', err.message);
  }

  // ----------------------------------------------------
  // TEST 14: Return & Exchange Request Workflow
  // ----------------------------------------------------
  console.log('\n[14/14] Testing Return & Exchange Creation & Admin Status Workflow...');
  try {
    const returnReq = await returnService.createReturn({
      orderId: createdOrderId,
      customerName: 'Alexander Vanderbilt',
      customerEmail: 'alexander@example.com',
      actionType: 'Size / Fit Exchange',
      reason: 'Requested 42R jacket swap',
      preferredReplacement: 'Imperial Worsted Navy Blazer 42R'
    }, testAdmin);

    assert(Boolean(returnReq.returnId), 'Return request generated valid returnId');
    assert(returnReq.status === 'Approved - Return Label Sent', 'Return initial status is Approved - Return Label Sent');
    assert(Boolean(returnReq.trackingReturnNumber), 'Return has prepaid tracking number');

    const updatedRet = await returnService.updateReturnStatus(returnReq.returnId, {
      status: 'Inspection Complete',
      adminNotes: 'Garment inspected and approved for exchange.'
    }, testAdmin);

    assert(updatedRet?.status === 'Inspection Complete', 'Admin successfully updated return status in DB');
  } catch (err: any) {
    assert(false, 'Return test threw exception', err.message);
  }

  // Final Summary
  console.log('\n========================================================');
  console.log(` TEST RESULTS: ${passedCount} PASSED | ${failedCount} FAILED`);
  console.log('========================================================');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
