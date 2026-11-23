'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var dates = require('../lib/dates');
var orders = require('../lib/orders');
var ledger = require('../lib/ledger');

test('normalizes stored and date-picker dates to sortable year-month-day keys', function () {
  assert.equal(dates.normalizeDateKey('05/01/2022'), '2022-01-05');
  assert.equal(dates.normalizeDateKey('2022-01-05'), '2022-01-05');
  assert.equal(dates.getFiscalYear('31/03/2022'), 'FY21-22');
  assert.equal(dates.getFiscalYear('2022-04-01'), 'FY22-23');
});

test('lists orders newest first and filters a calendar date range correctly', function () {
  var db = {
    orders: [
      { id: 1001, date: '28/12/2021' },
      { id: 1002, date: '05/01/2022' },
      { id: 1003, date: '15/03/2022' }
    ]
  };

  assert.deepEqual(orders.list(db, {}).map(function (order) { return order.id; }), [1003, 1002, 1001]);
  assert.deepEqual(orders.list(db, { from: '2022-01-01', to: '2022-02-01' }).map(function (order) {
    return order.id;
  }), [1002]);
});

test('records a numeric settlement amount when the request amount is a string', function () {
  var db = {
    customers: [{
      id: 4,
      name: 'Khata customer',
      openingBalance: 100,
      totalBilled: 200,
      totalSettled: 25,
      balance: 275
    }],
    nextSettlementId: 501,
    settlements: []
  };

  var result = ledger.recordSettlement(db, 4, '30.50', 'upi', 'part payment');

  assert.equal(result.ok, true);
  assert.equal(result.settlement.amount, 30.5);
  assert.equal(db.customers[0].totalSettled, 55.5);
  assert.equal(db.customers[0].balance, 244.5);
});

test('rejects nonnumeric settlement amounts without mutating the ledger', function () {
  var db = {
    customers: [{
      id: 4,
      name: 'Khata customer',
      openingBalance: 100,
      totalBilled: 200,
      totalSettled: 25,
      balance: 275
    }],
    nextSettlementId: 501,
    settlements: []
  };

  var result = ledger.recordSettlement(db, 4, 'not-a-number', 'upi', 'invalid payment');

  assert.equal(result.ok, false);
  assert.equal(db.customers[0].totalSettled, 25);
  assert.equal(db.customers[0].balance, 275);
  assert.equal(db.settlements.length, 0);
});
