/**
 * 纸质证书申领订单共享存储（localStorage）
 * 供「证书详情页」「订单详情页」「个人中心」三处共用：
 *  - 订单列表（含状态流转）
 *  - 最近一次物流收件信息记忆
 */
(function () {
  var ORDERS_KEY = 'aigc_orders_v1';
  var SHIP_KEY = 'aigc_ship_v1';

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* ignore */ }
  }

  function getOrders() { return read(ORDERS_KEY, []); }
  function saveOrders(list) { write(ORDERS_KEY, list); }
  function getOrder(orderNo) {
    return getOrders().find(function (o) { return o.orderNo === orderNo; }) || null;
  }
  function addOrder(order) {
    var list = getOrders();
    var idx = list.findIndex(function (o) { return o.orderNo === order.orderNo; });
    if (idx >= 0) list[idx] = order; else list.unshift(order);
    saveOrders(list);
  }
  function updateOrder(orderNo, patch) {
    var list = getOrders();
    var idx = list.findIndex(function (o) { return o.orderNo === orderNo; });
    if (idx >= 0) {
      list[idx] = Object.assign({}, list[idx], patch);
      saveOrders(list);
      return list[idx];
    }
    return null;
  }
  // 某张证书最近的一条申领订单（按证书名+作品匹配）
  function orderOfCert(certName, certWork) {
    var list = getOrders();
    for (var i = 0; i < list.length; i++) {
      if (list[i].certName === certName && list[i].certWork === certWork) return list[i];
    }
    return null;
  }
  function getShipInfo() { return read(SHIP_KEY, null); }
  function saveShipInfo(info) { write(SHIP_KEY, info); }

  var STATUS_TEXT = {
    pending: '待支付',
    paid: '已支付',
    confirmed: '已收货',
    invoiced: '已开票',
  };

  function genOrderNo() {
    var d = new Date();
    var pad = function (v) { return String(v).padStart(2, '0'); };
    return 'PS' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate())
      + String(Math.floor(Math.random() * 900000) + 100000);
  }

  function fmtTime(ts) {
    if (!ts) return '—';
    var d = new Date(ts);
    var pad = function (v) { return String(v).padStart(2, '0'); };
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
      + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  window.OrderStore = {
    getOrders: getOrders,
    saveOrders: saveOrders,
    getOrder: getOrder,
    addOrder: addOrder,
    updateOrder: updateOrder,
    orderOfCert: orderOfCert,
    getShipInfo: getShipInfo,
    saveShipInfo: saveShipInfo,
    STATUS_TEXT: STATUS_TEXT,
    genOrderNo: genOrderNo,
    fmtTime: fmtTime,
  };
})();
