/*!
 * 站点公告弹窗 —— 证书信息核对与纸质证书申领事务性服务关闭提示
 *
 * 用法（在页面 </body> 前引入即可，无需依赖 Tailwind / jQuery / Alpine）：
 *   <script src="./announcement-modal.js?v=20261030c"></script>
 *
 * 行为说明：
 *   1. 每次进入 / 刷新页面都会弹出（不做本地记忆）；
 *   2. 若存在访问密码门 #pwd-gate，则等其解锁后再弹出，避免遮挡密码门；
 *   3. 支持右上角关闭、遮罩点击、ESC 键关闭；
 *   4. 弹窗仅保留一个「我已知晓」按钮。
 */
(function () {
  'use strict';

  var DEFAULT_CONFIG = {
    badge: '公告',
    heading: '证书信息核对与纸质证书申领事务性服务关闭提示',
    closeLabel: '功能关闭时间',
    closeTime: '2026年11月6日 18:00',
    paragraphs: [
      '大赛证书信息核对确认及纸质证书申领事务性服务将于2026年11月6日 18:00后关闭。关闭后，将无法再进行证书信息核对确认、纸质证书申领等相关操作。',
      '请有需求的用户于上述时间前尽快完成证书信息核对确认及纸质证书申领。已提交的纸质证书申领订单不受影响，可继续查看记录状态。',
      '第一届所有服务工作结束。'
    ],
    note: '特此提示，感谢您的理解与配合。',
    buttonText: '我已知晓'
  };

  var userCfg = (typeof window !== 'undefined' && window.AIGC_ANNOUNCEMENT_CONFIG) || {};
  var CFG = {};
  for (var k in DEFAULT_CONFIG) { if (Object.prototype.hasOwnProperty.call(DEFAULT_CONFIG, k)) CFG[k] = DEFAULT_CONFIG[k]; }
  for (var k2 in userCfg) { if (Object.prototype.hasOwnProperty.call(userCfg, k2)) CFG[k2] = userCfg[k2]; }

  var ROOT_ID = 'aigc-note-root';
  var shown = false;
  var started = false;
  var scrollLocked = false;
  var prevOverflow = '';

  /* ---------- 工具 ---------- */

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ---------- 样式（内联注入，避免与站点已有 Tailwind 冲突） ---------- */

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
    /* 「公告」标签：字号加大 */
    '.aigc-note-badge{display:inline-flex;align-items:center;height:28px;padding:0 14px;border-radius:14px;' +
    'background:#f1ebfd;color:#8742DB;font-size:17px;font-weight:700;letter-spacing:2px;}' +
    '.aigc-note-title{margin:10px 0 0;font-size:19px;line-height:1.45;font-weight:700;color:#2b2b3a;padding-right:28px;}' +
    '.aigc-note-deadline{margin:16px 0 0;padding:12px 16px;border-radius:10px;background:#f7f5fe;' +
    'border:1px solid #e8e1fb;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;}' +
    '.aigc-note-deadline-label{font-size:13px;color:#7c7898;}' +
    '.aigc-note-deadline-value{font-size:17px;font-weight:700;color:#8742DB;letter-spacing:.3px;}' +
    '.aigc-note-body{margin:14px 0 0;font-size:14px;line-height:1.85;color:#55556a;}' +
    '.aigc-note-body p{margin:0 0 8px;}' +
    '.aigc-note-body p:last-child{margin-bottom:0;}' +
    '.aigc-note-note{margin:12px 0 0;font-size:13px;line-height:1.7;color:#9a9aae;}' +
    '.aigc-note-actions{margin-top:20px;display:flex;justify-content:flex-end;}' +
    '.aigc-note-btn{height:40px;padding:0 26px;border-radius:20px;border:1px solid transparent;font-size:14px;' +
    'font-family:inherit;cursor:pointer;color:#fff;font-weight:500;' +
    'background:linear-gradient(180deg,#c062ff 0%,#9072ff 100%);transition:opacity .15s;}' +
    '.aigc-note-btn:hover{opacity:.9;}' +
    '.aigc-note-btn:focus-visible{outline:2px solid #b9a2f0;outline-offset:2px;}' +
    '@media (max-width:560px){' +
    '.aigc-note-card{padding:22px 18px 16px;border-radius:14px;}' +
    '.aigc-note-title{font-size:17px;}' +
    '.aigc-note-badge{font-size:16px;}' +
    '.aigc-note-deadline-value{font-size:16px;}' +
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
        '<div class="aigc-note-actions">' +
          '<button type="button" class="aigc-note-btn" data-aigc-role="close">' + escapeHtml(CFG.buttonText) + '</button>' +
        '</div>' +
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

  function hide() {
    var root = document.getElementById(ROOT_ID);
    if (root && root.parentNode) root.parentNode.removeChild(root);
    unlockScroll();
    document.removeEventListener('keydown', onKeydown, true);
    shown = false;
  }

  function onKeydown(e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
      e.preventDefault();
      hide();
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
      if (t === root) { hide(); return; }
      var role = t.getAttribute && t.getAttribute('data-aigc-role');
      if (!role && t.parentNode && t.parentNode.getAttribute) role = t.parentNode.getAttribute('data-aigc-role');
      if (role === 'close') { e.preventDefault(); hide(); }
    });

    document.addEventListener('keydown', onKeydown, true);

    // 焦点落在按钮，便于键盘操作
    window.setTimeout(function () {
      var focusEl = root.querySelector('.aigc-note-btn, .aigc-note-close');
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

    function tick() {
      // 密码门不存在或已隐藏 → 视为可弹出
      if (!gateVisible()) { cb(); return; }
      if (waited >= LIMIT_MS) return;
      waited += 300;
      window.setTimeout(tick, 300);
    }

    if (!document.getElementById('pwd-gate')) {
      window.setTimeout(cb, 600);
      return;
    }
    tick();
  }

  /* ---------- 启动（每次刷新都会弹出，不做本地记忆） ---------- */

  function start() {
    if (started) return;
    started = true;
    whenReadyToShow(show);
  }

  // 不依赖 DOMContentLoaded：本脚本置于 </body> 前，此时 body 已可用；
  // 站点存在外部慢资源（如第三方 jQuery）时 DOMContentLoaded 可能被长时间阻塞。
  if (document.body) {
    start();
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  }
  window.setTimeout(start, 1000);

  // 对外接口（便于调试与后续复用）
  window.AnnouncementModal = {
    config: CFG,
    show: function () { shown = false; show(); },
    hide: function () { hide(); }
  };
})();
