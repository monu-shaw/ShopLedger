'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var invoice = require('../lib/invoice');
var pricing = require('../lib/pricing');

// Persisted order lines carry HSN but routes/orders.js does not add gstRate.
// Keep the field explicit as undefined to model that stored-line behavior.
function line(name, price, qty, hsn) {
  return {
    name: name,
    price: price,
    qty: qty,
    hsn: hsn,
    gstRate: undefined
  };
}

function summarizeInvoice(figures) {
  return {
    subtotal: figures.subtotal,
    discount: figures.discount,
    tax: figures.tax,
    cgst: figures.cgst,
    sgst: figures.sgst,
    total: figures.total,
    rows: figures.rows.map(function (row) {
      return { gstPercent: row.gstPercent, lineTax: row.lineTax };
    })
  };
}

function summarizePricing(totals) {
  return {
    subtotal: totals.subtotal,
    discount: totals.discount,
    tax: totals.tax,
    cgst: totals.cgst,
    sgst: totals.sgst,
    total: totals.total
  };
}

test('CURRENT BEHAVIOUR: order #1001 invoice uses the checkout 5% and 18% HSN slabs', function () {
  var items = [
    line('Assam CTC Masala Chai 250g', 140, 2, '0902'),
    line('Unpolished Toor Dal 1kg', 165, 2, '0713')
  ];
  var order = { items: items, coupon: '' };

  var invoiceFigures = invoice.computeInvoiceFigures(order);
  var checkoutTotals = pricing.computeTotals(items, order.coupon);

  assert.deepEqual(summarizeInvoice(invoiceFigures), {
    subtotal: 610,
    discount: 0,
    tax: 66.9,
    cgst: 33.45,
    sgst: 33.45,
    total: 676.9,
    rows: [
      { gstPercent: 18, lineTax: 50.4 },
      { gstPercent: 5, lineTax: 16.5 }
    ]
  });
  assert.deepEqual(summarizePricing(checkoutTotals), {
    subtotal: 610,
    discount: 0,
    tax: 66.9,
    cgst: 33.45,
    sgst: 33.45,
    total: 676.9
  });
});

test('CURRENT BEHAVIOUR: order #1002 invoice uses the 5% slab and SAVE10 pre-tax discount', function () {
  var items = [
    line('Indrayani Basmati Rice 5kg', 640, 1, '1006'),
    line('Cold-Pressed Sunflower Oil 1L', 190, 2, '1512')
  ];
  var order = { items: items, coupon: 'SAVE10' };

  var invoiceFigures = invoice.computeInvoiceFigures(order);
  var checkoutTotals = pricing.computeTotals(items, order.coupon);

  assert.deepEqual(summarizeInvoice(invoiceFigures), {
    subtotal: 1020,
    discount: 102,
    tax: 45.9,
    cgst: 22.95,
    sgst: 22.95,
    total: 963.9,
    rows: [
      { gstPercent: 5, lineTax: 28.8 },
      { gstPercent: 5, lineTax: 17.1 }
    ]
  });
  assert.deepEqual(summarizePricing(checkoutTotals), {
    subtotal: 1020,
    discount: 102,
    tax: 45.9,
    cgst: 22.95,
    sgst: 22.95,
    total: 963.9
  });
});

test('CURRENT BEHAVIOUR: order #1004 invoice applies the SAVE10 cap before 5% HSN GST', function () {
  var items = [
    line('Cold-Pressed Groundnut Oil 5L', 1120, 2, '1508')
  ];
  var order = { items: items, coupon: 'SAVE10' };

  var invoiceFigures = invoice.computeInvoiceFigures(order);
  var checkoutTotals = pricing.computeTotals(items, order.coupon);

  assert.deepEqual(summarizeInvoice(invoiceFigures), {
    subtotal: 2240,
    discount: 150,
    tax: 104.5,
    cgst: 52.25,
    sgst: 52.25,
    total: 2194.5,
    rows: [{ gstPercent: 5, lineTax: 104.5 }]
  });
  assert.deepEqual(summarizePricing(checkoutTotals), {
    subtotal: 2240,
    discount: 150,
    tax: 104.5,
    cgst: 52.25,
    sgst: 52.25,
    total: 2194.5
  });
});

test('CURRENT BEHAVIOUR: order #1008 all-18% no-coupon invoice matches checkout total and GST', function () {
  var items = [
    line('Assam CTC Masala Chai 250g', 140, 1, '0902'),
    line('Kokum Sherbet Concentrate 750ml', 180, 2, '2106')
  ];
  var order = { items: items, coupon: '' };

  var invoiceFigures = invoice.computeInvoiceFigures(order);
  var checkoutTotals = pricing.computeTotals(items, order.coupon);

  assert.deepEqual(summarizeInvoice(invoiceFigures), {
    subtotal: 500,
    discount: 0,
    tax: 90,
    cgst: 45,
    sgst: 45,
    total: 590,
    rows: [
      { gstPercent: 18, lineTax: 25.2 },
      { gstPercent: 18, lineTax: 64.8 }
    ]
  });
  assert.deepEqual(summarizePricing(checkoutTotals), {
    subtotal: 500,
    discount: 0,
    tax: 90,
    cgst: 45,
    sgst: 45,
    total: 590
  });
});

test('CORRECT BEHAVIOUR: order #1002 invoice matches checkout HSN GST and capped pre-tax coupon totals', function () {
  var items = [
    line('Indrayani Basmati Rice 5kg', 640, 1, '1006'),
    line('Cold-Pressed Sunflower Oil 1L', 190, 2, '1512')
  ];
  var order = { items: items, coupon: 'SAVE10' };

  var invoiceFigures = invoice.computeInvoiceFigures(order);
  var checkoutTotals = pricing.computeTotals(items, order.coupon);

  assert.deepEqual(summarizeInvoice(invoiceFigures), {
    subtotal: 1020,
    discount: 102,
    tax: 45.9,
    cgst: 22.95,
    sgst: 22.95,
    total: 963.9,
    rows: [
      { gstPercent: 5, lineTax: 28.8 },
      { gstPercent: 5, lineTax: 17.1 }
    ]
  });
  assert.deepEqual(summarizeInvoice(invoiceFigures), {
    subtotal: checkoutTotals.subtotal,
    discount: checkoutTotals.discount,
    tax: checkoutTotals.tax,
    cgst: checkoutTotals.cgst,
    sgst: checkoutTotals.sgst,
    total: checkoutTotals.total,
    rows: [
      { gstPercent: checkoutTotals.lines[0].gstPercent, lineTax: checkoutTotals.lines[0].tax },
      { gstPercent: checkoutTotals.lines[1].gstPercent, lineTax: checkoutTotals.lines[1].tax }
    ]
  });
});
