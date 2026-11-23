'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var inventory = require('../lib/inventory');
var orders = require('../lib/orders');

test('allows a cart to consume exactly all sellable units', function () {
  var products = [{ id: 1, name: 'Rice', stock: 7, reserved: 2 }];

  assert.deepEqual(inventory.check(products, [{ id: 1, qty: 5 }]), { ok: true });
});

test('rejects cart quantities above sellable stock, including repeated product lines', function () {
  var products = [{ id: 1, name: 'Rice', stock: 7, reserved: 2 }];

  assert.equal(inventory.check(products, [{ id: 1, qty: 6 }]).ok, false);
  assert.equal(inventory.check(products, [
    { id: 1, qty: 3 },
    { id: 1, qty: 3 }
  ]).ok, false);
});

test('cancelling an order restores physical stock once without changing quote reservations', function () {
  var db = {
    products: [{ id: 1, name: 'Rice', stock: 5, reserved: 2 }],
    customers: [{
      id: 4,
      name: 'Khata customer',
      openingBalance: 0,
      totalBilled: 25,
      totalSettled: 0,
      balance: 25
    }],
    orders: [{
      id: 1001,
      status: 'completed',
      paymentMode: 'khata',
      customerId: 4,
      total: 25,
      items: [{ id: 1, qty: 2 }]
    }]
  };

  var result = orders.cancel(db, 1001, 'Customer cancelled');

  assert.equal(result.ok, true);
  assert.equal(db.products[0].stock, 7);
  assert.equal(db.products[0].reserved, 2);
  assert.equal(db.customers[0].totalBilled, 0);
  assert.equal(db.customers[0].balance, 0);

  var secondResult = orders.cancel(db, 1001, 'Duplicate cancellation');

  assert.equal(secondResult.ok, false);
  assert.equal(db.products[0].stock, 7);
  assert.equal(db.products[0].reserved, 2);
});
