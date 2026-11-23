// Date utilities for ShopLedger (Indian DD/MM/YYYY format)

function pad2(n) {
  return ('0' + n).slice(-2);
}

exports.today = function () {
  var d = new Date();
  return pad2(d.getDate()) + '/' + pad2(d.getMonth() + 1) + '/' + d.getFullYear();
};

// Accepts either DD/MM/YYYY or YYYY-MM-DD and returns a sortable date key
exports.normalizeDateKey = function (str) {
  if (!str) return '';
  var s = String(str).trim();
  var isoParts = s.split('-');
  if (isoParts.length === 3 && isoParts[0].length === 4) {
    return isoParts[0] + '-' + pad2(isoParts[1]) + '-' + pad2(isoParts[2]);
  }

  var localParts = s.split('/');
  if (localParts.length === 3 && localParts[2].length === 4) {
    return localParts[2] + '-' + pad2(localParts[1]) + '-' + pad2(localParts[0]);
  }
  return s;
};

exports.getFiscalYear = function (dateStr) {
  var s = exports.normalizeDateKey(dateStr);
  var parts = s.split('-');
  if (parts.length !== 3) return 'FY21-22';
  var year = parseInt(parts[0], 10);
  var month = parseInt(parts[1], 10);
  if (month >= 4) {
    return 'FY' + String(year).slice(-2) + '-' + String(year + 1).slice(-2);
  }
  return 'FY' + String(year - 1).slice(-2) + '-' + String(year).slice(-2);
};
