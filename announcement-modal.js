/*!
 * 站点公告弹窗 —— 证书信息核对与纸质证书申领功能关闭提示
 *
 * 用法（在页面 </body> 前引入即可，无需依赖 Tailwind / jQuery / Alpine）：
 *   <script src="./announcement-modal.js"></script>
 *
 * 文案与参数可在引入前覆盖：
 *   <script>
 *     window.AIGC_ANNOUNCEMENT_CONFIG = { deadline: '2026年11月6日18:00' };
 *   </script>
 *   <script src="./announcement-modal.js"></script>
 *
 * 行为说明：
 *   1. 进入页面后自动弹出（若存在访问密码门 #pwd-gate，则等其关闭后再弹出）；
 *   2. 用户关闭后写入 localStorage，同一浏览器不再重复弹出（版本号变更可重新弹出）；
 *   3. 支持右上角关闭、遮罩点击、ESC 键关闭；
 *   4. 主按钮跳转「个人中心 - 我的证书」。
 */
(function () {
  'use strict';

  var DEFAULT_CONFIG = {
    // 公告版本号：变更可让已关闭的用户重新看到
    id: 'cert-claim-close-20261106',
    badge: '公告',
    heading: '证书信息核对与纸质证书申领功能关闭提示',
    closeLabel: '功能关闭时间',
    closeTime: '2026年11月6日 18:00',
    paragraphs: [
      '大赛证书信息核对确认及纸质证书申领功能将于上述时间关闭。功能关闭后，将无法再进行证书信息核对确认、纸质证书申领等相关操作。',
      '请有需求的用户于上述时间前尽快完成证书信息核对确认及纸质证书申领。已提交的纸质证书申领订单不受影响，可继续在「个人中心 - 我的证书」中查看订单状态。'
    ],
    note: '特此提示，感谢您的理解与配合。',
    primaryText: '前往个人中心',
    primaryHref: './个人中心.html',
    secondaryText: '我已知晓',
    storagePrefix: 'aigc_announce_dismissed_'
  };

  var userCfg = (typeof window !== 'undefined' && window.AIGC_ANNOUNCEMENT_CONFIG) || {};
  var CFG = {};
  for (var k in DEFAULT_CONFIG) { if (Object.prototype.hasOwnProperty.call(DEFAULT_CONFIG, k)) CFG[k] = DEFAULT_CONFIG[k]; }
  for (var k2 in userCfg) { if (Object.prototype.hasOwnProperty.call(userCfg, k2)) CFG[k2] = userCfg[k2]; }

  var STORAGE_KEY = CFG.storagePrefix + CFG.id;
  var ROOT_ID = 'aigc-note-root';
  var shown = false;
  var scrollLocked = false;
  var prevOverflow = '';

  /* ---------- 工具 ---------- */

  function storageGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function storageSet(key, val) {
    try { window.localStorage.setItem(key, val); } catch (e) { /* 隐私模式忽略 */ }
  }
  function isDismissed() {
    return storageGet(STORAGE_KEY) === '1';
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ---------- 样式（全部内联注入，避免与站点已有 Tailwind 冲突） ---------- */

  var CSS = '' +
    '#aigc-note-root{position:fixed;inset:0;z-index:9998;display:flex;align-items:center;justify-content:center;' +
    'padding:16px;background:rgba(20,16,40,.46);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px);' +
    'font-family:"PingFang SC","Microsoft YaHei","Helvetica Neue",Arial,sans-serif;' +
    'animation:aigcNoteFade .22s ease both;}' +
    '#aigc-note-root *{box-sizing:border-box;}' +
    '@keyframes aigcNoteFade{from{opacity:0}to{opacity:1}}' +
    '@keyframes aigcNoteRise{from{opacity:0;transform:translateY(14px) scale(.98)}to{opacity:1;transform:none}}' +
    '.aigc-note-card{position:relative;width:520px;max-width:100%;max-height:calc(100vh - 32px);overflow-y:auto;' +
    'background:#fff;border-radius:18px;padding:26px 28px 20px;' +
    'box-shadow:0 24px 60px rgba(36,20,80,.28);animation:aigcNoteRise .26s cubic-bezier(.2,.7,.3,1) both;}' +
    '.aigc-note-close{position:absolute;top:14px;right:14px;width:30px;height:30px;border:0;padding:0;border-radius:50%;' +
    'background:transparent;color:#b0b0c0;font-size:18px;line-height:1;cursor:pointer;transition:background .15s,color .15s;}' +
    '.aigc-note-close:hover{background:#f4f4f8;color:#55556a;}' +
    '.aigc-note-badge{display:inline-flex;align-items:center;height:22px;padding:0 9px;border-radius:11px;' +
    'background:#f1ebfd;color:#8742DB;font-size:12px;font-weight:600;letter-spacing:.5px;}' +
    '.aigc-note-title{margin:10px 0 0;font-size:19px;line-height:1.45;font-weight:700;color:#2b2b3a;padding-right:28px;}' +
    '.aigc-note-deadline{margin:16px 0 0;padding:12px 16px;border-radius:10px;background:#f7f5fe;' +
    'border:1px solid #e8e1fb;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;}' +
    '.aigc-note-deadline-label{font-size:13px;color:#7c7898;}' +
    '.aigc-note-deadline-value{font-size:17px;font-weight:700;color:#8742DB;letter-spacing:.3px;}' +
    '.aigc-note-body{margin:14px 0 0;font-size:14px;line-height:1.85;color:#55556a;}' +
    '.aigc-note-body p{margin:0 0 8px;}' +
    '.aigc-note-body p:last-child{margin-bottom:0;}' +
    '.aigc-note-note{margin:12px 0 0;font-size:13px;line-height:1.7;color:#9a9aae;}' +
    '.aigc-note-actions{margin-top:20px;display:flex;justify-content:flex-end;gap:10px;flex-wrap:wrap;}' +
    '.aigc-note-btn{height:40px;padding:0 20px;border-radius:20px;border:1px solid transparent;font-size:14px;' +
    'font-family:inherit;cursor:pointer;transition:opacity .15s,background .15s,border-color .15s,color .15s;}' +
    '.aigc-note-btn-primary{color:#fff;border:0;background:linear-gradient(180deg,#c062ff 0%,#9072ff 100%);font-weight:500;}' +
    '.aigc-note-btn-primary:hover{opacity:.9;}' +
    '.aigc-note-btn-ghost{background:#fff;border-color:#d9d9e6;color:#55556a;}' +
    '.aigc-note-btn-ghost:hover{border-color:#8742DB;color:#8742DB;}' +
    '.aigc-note-btn:focus-visible{outline:2px solid #b9a2f0;outline-offset:2px;}' +
    '@media (max-width:560px){' +
    '.aigc-note-card{padding:22px 18px 16px;border-radius:14px;}' +
    '.aigc-note-title{font-size:17px;}' +
    '.aigc-note-deadline-value{font-size:16px;}' +
    '.aigc-note-actions{flex-direction:column-reverse;}' +
    '.aigc-note-btn{width:100%;}' +
    '}' +
    '@media (prefers-reduced-motion:reduce){' +
    '#aigc-note-root,.aigc-note-card{animation:none;}' +
    '}';

  function injectCss() {
    if (document.getElementById('aigc-note-css')) return;
    var st = document.createElement('style');
    st.id = 'aigc-note-css';
    st.appendChild(document.createTextNode(CSS));
    document.head.appendChild(st);
  }

  /* ---------- 构建弹窗 ---------- */

  function build() {
    if (document.getElementById(ROOT_ID)) return document.getElementById(ROOT_ID);

    var root = document.createElement('div');
    root.id = ROOT_ID;
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-labelledby', 'aigc-note-title');

    var paras = '';
    for (var i = 0; i < CFG.paragraphs.length; i++) {
      paras += '<p>' + escapeHtml(CFG.paragraphs[i]) + '</p>';
    }

    var primaryIsLink = !!(CFG.primaryHref && String(CFG.primaryHref).trim());
    var actions = '';
    if (primaryIsLink) {
      actions += '<a class="aigc-note-btn aigc-note-btn-primary" href="' + escapeHtml(CFG.primaryHref) + '">' +
        escapeHtml(CFG.primaryText) + '</a>';
    } else {
      actions += '<button type="button" class="aigc-note-btn aigc-note-btn-primary" data-aigc-role="primary">' +
        escapeHtml(CFG.primaryText) + '</button>';
    }
    actions += '<button type="button" class="aigc-note-btn aigc-note-btn-ghost" data-aigc-role="close">' +
      escapeHtml(CFG.secondaryText) + '</button>';

    root.innerHTML =
      '<div class="aigc-note-card">' +
        '<button type="button" class="aigc-note-close" data-aigc-role="close" aria-label="关闭公告">×</button>' +
        '<span class="aigc-note-badge">' + escapeHtml(CFG.badge) + '</span>' +
        '<h2 class="aigc-note-title" id="aigc-note-title">' + escapeHtml(CFG.heading) + '</h2>' +
        '<div class="aigc-note-deadline">' +
          '<span class="aigc-note-deadline-label">' + escapeHtml(CFG.closeLabel) + '</span>' +
          '<span class="aigc-note-deadline-value">' + escapeHtml(CFG.closeTime) + '</span>' +
        '</div>' +
        '<div class="aigc-note-body">' + paras + '</div>' +
        (CFG.note ? '<p class="aigc-note-note">' + escapeHtml(CFG.note) + '</p>' : '') +
        '<div class="aigc-note-actions">' + actions + '</div>' +
      '</div>';

    document.body.appendChild(root);
    return root;
  }

  /* ---------- 显示 / 关闭 ---------- */

  function lockScroll() {
    if (scrollLocked) return;
    prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    scrollLocked = true;
  }
  function unlockScroll() {
    if (!scrollLocked) return;
    document.body.style.overflow = prevOverflow || '';
    scrollLocked = false;
  }

  function hide(persist) {
    var root = document.getElementById(ROOT_ID);
    if (root && root.parentNode) root.parentNode.removeChild(root);
    unlockScroll();
    if (persist) storageSet(STORAGE_KEY, '1');
    document.removeEventListener('keydown', onKeydown, true);
    shown = false;
  }

  function onKeydown(e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
      e.preventDefault();
      hide(true);
    }
  }

  function show() {
    if (shown) return;
    shown = true;
    injectCss();
    var root = build();
    lockScroll();

    root.addEventListener('click', function (e) {
      var t = e.target;
      // 点击遮罩（非卡片内部）关闭
      if (t === root) { hide(true); return; }
      // 关闭按钮
      var role = t.getAttribute && t.getAttribute('data-aigc-role');
      if (!role && t.parentNode && t.parentNode.getAttribute) role = t.parentNode.getAttribute('data-aigc-role');
      if (role === 'close') { e.preventDefault(); hide(true); }
      // 主按钮若为按钮形态，点击后同样视为已读
      if (role === 'primary') { hide(true); }
    });

    // 主按钮为链接时：点击即视为已读（不再重复弹出）
    var link = root.querySelector('a[href]');
    if (link) {
      link.addEventListener('click', function () { hide(true); });
    }

    document.addEventListener('keydown', onKeydown, true);

    // 焦点落在主按钮，便于键盘操作
    window.setTimeout(function () {
      var focusEl = root.querySelector('a[href], .aigc-note-btn-primary, .aigc-note-btn-ghost, .aigc-note-close');
      if (focusEl && typeof focusEl.focus === 'function') {
        try { focusEl.focus({ preventScroll: true }); } catch (e) { focusEl.focus(); }
      }
    }, 60);
  }

  /* ---------- 访问密码门：等其关闭后再弹 ---------- */

  function gateVisible() {
    var gate = document.getElementById('pwd-gate');
    if (!gate) return false;
    var cs = window.getComputedStyle ? window.getComputedStyle(gate) : null;
    if (cs && (cs.display === 'none' || cs.visibility === 'hidden')) return false;
    if (gate.style && gate.style.display === 'none') return false;
    return true;
  }

  function whenReadyToShow(cb) {
    var waited = 0;
    var LIMIT_MS = 120000;   // 最多等 2 分钟，之后放弃弹出（避免遮挡密码门）
    var TIMEOUT_MS = 5000;   // 页面无密码门时，最多等 5 秒让其他弹窗先完成

    function tick() {
      // 密码门不存在或已隐藏（display 变为 none）→ 视为可弹出
      if (!gateVisible()) { cb(); return; }
      if (waited >= LIMIT_MS) return;
      waited += 300;
      window.setTimeout(tick, 300);
    }

    if (!document.getElementById('pwd-gate')) {
      // 没有密码门，短暂等待后直接弹
      window.setTimeout(cb, Math.min(600, TIMEOUT_MS));
      return;
    }
    tick();
  }

  /* ---------- 启动 ---------- */

  function start() {
    if (isDismissed()) return;
    whenReadyToShow(show);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  // 对外接口（便于调试与后续复用）
  window.AnnouncementModal = {
    config: CFG,
    show: function () { shown = false; show(); },
    hide: function () { hide(false); },
    reset: function () {
      try { window.localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
      shown = false;
    },
    isDismissed: isDismissed
  };
})();
