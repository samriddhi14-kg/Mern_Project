require('dotenv').config();
const mongoose = require('mongoose');
const app = require('../app');

const runTest = async () => {
  console.log('==================================================');
  console.log('STARTING END-TO-END SYSTEM INTEGRATION TEST');
  console.log('==================================================\n');

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/food_ordering');
  console.log('✓ Connected to MongoDB');

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api/v1`;
  console.log(`✓ Test Express server listening on ${baseUrl}\n`);

  try {
    // 1. Health check
    console.log('[Test 1] Health Check...');
    const healthRes = await fetch(`${baseUrl}/health`).then(r => r.json());
    if (!healthRes.success) throw new Error('Health check failed');
    console.log('  -> Health check OK: ', healthRes.message);

    // 2. Fetch Public Menu
    console.log('\n[Test 2] Public Menu Foods & Categories...');
    const foodsRes = await fetch(`${baseUrl}/foods`).then(r => r.json());
    if (!foodsRes.success || foodsRes.data.length === 0) throw new Error('Failed to retrieve menu foods');
    console.log(`  -> Retrieved ${foodsRes.data.length} foods. First food: ${foodsRes.data[0].name} (NPR ${foodsRes.data[0].price})`);

    const sampleFood1 = foodsRes.data[0];
    const sampleFood2 = foodsRes.data[1];

    // 3. Register Customer
    const testEmail = `testcustomer_${Date.now()}@example.com`;
    console.log(`\n[Test 3] Registering Customer (${testEmail})...`);
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Integration Tester',
        email: testEmail,
        password: 'Password123!',
        phone: '9841234567'
      })
    }).then(r => r.json());

    if (!regRes.success || !regRes.data.token) throw new Error('Customer registration failed');
    const customerToken = regRes.data.token;
    console.log('  -> Registration successful. Customer ID:', regRes.data.user._id);

    // 4. Place COD Order
    console.log('\n[Test 4] Placing Cash on Delivery Order...');
    const orderPayload = {
      items: [
        { foodId: sampleFood1._id, quantity: 2 },
        { foodId: sampleFood2._id, quantity: 1 }
      ],
      delivery: {
        recipientName: 'Integration Tester',
        phone: '9841234567',
        address: 'Thamel, Kathmandu, Nepal',
        instructions: 'Deliver to main lobby'
      },
      paymentMethod: 'CASH_ON_DELIVERY'
    };

    const orderRes = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify(orderPayload)
    }).then(r => r.json());

    if (!orderRes.success || !orderRes.data) throw new Error(`Order placement failed: ${orderRes.message}`);
    const order = orderRes.data;
    console.log(`  -> Order created! OrderNumber: ${order.orderNumber}`);
    console.log(`  -> Calculated Subtotal: NPR ${order.subtotal}, Delivery Fee: NPR ${order.deliveryFee}, Total: NPR ${order.total}`);
    console.log(`  -> Initial Status: ${order.status}`);

    const expectedSubtotal = (sampleFood1.price * 2) + (sampleFood2.price * 1);
    if (order.subtotal !== expectedSubtotal) {
      throw new Error(`Subtotal mismatch! Expected ${expectedSubtotal}, got ${order.subtotal}`);
    }
    console.log('  -> Server-side price calculation verified strictly against database prices.');

    // 5. Customer Order History
    console.log('\n[Test 5] Fetching Customer Order History...');
    const myOrdersRes = await fetch(`${baseUrl}/orders/my`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    }).then(r => r.json());

    if (!myOrdersRes.success || myOrdersRes.data.length === 0) throw new Error('Could not find placed order in my orders');
    console.log(`  -> Found ${myOrdersRes.data.length} orders in customer history.`);

    // 6. Admin Login
    console.log('\n[Test 6] Admin Login...');
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@foodorder.com',
        password: 'AdminPassword123!'
      })
    }).then(r => r.json());

    if (!adminLoginRes.success || adminLoginRes.data.user.role !== 'admin') {
      throw new Error('Admin login failed');
    }
    const adminToken = adminLoginRes.data.token;
    console.log('  -> Admin login successful.');

    // 7. Admin Dashboard Metrics
    console.log('\n[Test 7] Checking Admin Dashboard Metrics...');
    const dashRes = await fetch(`${baseUrl}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    }).then(r => r.json());

    if (!dashRes.success) throw new Error('Dashboard metrics fetch failed');
    console.log('  -> Dashboard Metrics:', dashRes.data);

    // 8. Admin State Machine Progression: PLACED -> CONFIRMED -> PREPARING -> PACKED -> OUT_FOR_DELIVERY -> DELIVERED
    console.log('\n[Test 8] Executing State Machine Progression...');
    const transitions = [
      { status: 'CONFIRMED', note: 'Kitchen accepted order' },
      { status: 'PREPARING', note: 'Cooking in progress' },
      { status: 'PACKED', note: 'Food packed in thermal bag' },
      { status: 'OUT_FOR_DELIVERY', note: 'Courier dispatched' },
      { status: 'DELIVERED', note: 'Handed to customer and collected cash' }
    ];

    for (const step of transitions) {
      const stepRes = await fetch(`${baseUrl}/admin/orders/${order._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(step)
      }).then(r => r.json());

      if (!stepRes.success) {
        throw new Error(`Failed to advance order to ${step.status}: ${stepRes.message}`);
      }
      console.log(`  -> Advanced to: ${step.status} (Note: "${step.note}")`);
    }

    // 9. Customer Views Updated Order
    console.log('\n[Test 9] Customer Views Final Delivered Order...');
    const finalOrderRes = await fetch(`${baseUrl}/orders/${order._id}`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    }).then(r => r.json());

    if (!finalOrderRes.success) throw new Error('Failed to fetch updated order');
    const finalOrder = finalOrderRes.data;

    console.log(`  -> Final status: ${finalOrder.status}`);
    console.log(`  -> Payment status: ${finalOrder.paymentStatus}`);
    console.log(`  -> Status history entries recorded: ${finalOrder.statusHistory.length}`);

    if (finalOrder.status !== 'DELIVERED') throw new Error('Expected final status to be DELIVERED');
    if (finalOrder.paymentStatus !== 'PAID') throw new Error('Expected payment status to be PAID on delivery');

    // 10. Security Checks
    console.log('\n[Test 10] Security & State Boundary Checks...');
    // Customer cannot cancel a DELIVERED order
    const illegalCancel = await fetch(`${baseUrl}/orders/${order._id}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({ reason: 'Try cancel delivered' })
    }).then(r => r.json());

    if (illegalCancel.success) throw new Error('Security flaw: Customer was able to cancel DELIVERED order!');
    console.log('  ✓ Verified: Customer cannot cancel a DELIVERED order.');

    // Customer cannot access admin routes
    const forbiddenAdmin = await fetch(`${baseUrl}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    if (forbiddenAdmin.status !== 403) throw new Error(`Security flaw: Customer received HTTP ${forbiddenAdmin.status} instead of 403 on admin route!`);
    console.log('  ✓ Verified: Customer receives 403 Forbidden on admin routes.');

    console.log('\n==================================================');
    console.log('ALL INTEGRATION & SPECIFICATION TESTS PASSED! 100%');
    console.log('==================================================\n');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    server.close();
    await mongoose.disconnect();
    process.exit();
  }
};

runTest();
