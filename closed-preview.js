/*!
 * 页面右下角「已关闭状态」预览切换按钮
 *
 * 默认状态为当前状态；点击按钮切换到「事务性服务关闭后」状态，再次点击恢复。
 *
 * 关闭状态下的通用规则：
 *   1. 所有带 class `aigc-claim-btn` 的按钮（申领纸质证书 / 确认证书信息 / 证书问题反馈等）隐藏；
 *   2. 页面可监听 `aigc:closed-preview-change` 事件做额外处理（如证书详情下载免确认、个人中心申领记录按记录显隐）。
 *
 * 页面接入方式：
 *   <script src="./closed-preview.js"></script>
 *   - 给需要隐藏的按钮追加 class="... aigc-claim-btn"
 *   - 需要额外逻辑的页面监听事件：
 *       document.addEventListener('aigc:closed-preview-change', function (e) { ... e.detail.closed ... });
 */
(function () {
  'use strict';

  var BTN_ID = 'aigc-closed-preview-btn';
  var closed = false;

  var CSS = '' +
    '#aigc-closed-preview-btn{position:fixed;right:20px;bottom:20px;z-index:9999;' +
    'height:40px;padding:0 18px;border-radius:20px;border:1px solid #b9a2f0;background:#fff;' +
    'color:#8742DB;font:500 14px/1 "PingFang SC","Microsoft YaHei",Arial,sans-serif;cursor:pointer;' +
    'box-shadow:0 8px 24px rgba(87,47,160,.18);transition:background .15s,color .15s,border-color .15s;' +
    'display:flex;align-items:center;gap:6px;white-space:nowrap;}' +
    '#aigc-closed-preview-btn:hover{background:#8742DB;color:#fff;}' +
    '#aigc-closed-preview-btn.active{background:#8742DB;color:#fff;border-color:#8742DB;}' +
    'body.aigc-closed-mode .aigc-claim-btn{display:none!important;}' +
    '@media (max-width:560px){#aigc-closed-preview-btn{right:12px;bottom:12px;height:38px;padding:0 14px;font-size:13px;}}';

  function injectCss() {
    if (document.getElementById('aigc-closed-preview-css')) return;
    var st = document.createElement('style');
    st.id = 'aigc-closed-preview-css';
    st.appendChild(document.createTextNode(CSS));
    document.head.appendChild(st);
  }

  function label() {
    return closed ? '恢复当前状态' : '切换到已关闭状态';
  }

  function render(btn) {
    if (!btn) return;
    btn.textContent = (closed ? '◀ ' : '▶ ') + label();
    btn.setAttribute('aria-pressed', String(closed));
    btn.classList.toggle('active', closed);
  }

  function apply(v) {
    if (!!v === closed) return;
    closed = !!v;
    document.body.classList.toggle('aigc-closed-mode', closed);
    render(document.getElementById(BTN_ID));
    try {
      window.dispatchEvent(new CustomEvent('aigc:closed-preview-change', { detail: { closed: closed } }));
    } catch (e) { /* ignore */ }
    // 同步回调：供页面直接响应（比 CustomEvent 更可靠）
    try {
      if (typeof window.AIGC_ON_CLOSED_PREVIEW_CHANGE === 'function') {
        window.AIGC_ON_CLOSED_PREVIEW_CHANGE(closed);
      }
    } catch (e) { /* ignore */ }
  }

  function build() {
    var existing = document.getElementById(BTN_ID);
    if (existing) return existing;
    var btn = document.createElement('button');
    btn.id = BTN_ID;
    btn.type = 'button';
    btn.setAttribute('aria-pressed', 'false');
    render(btn);
    btn.addEventListener('click', function () { apply(!closed); });
    document.body.appendChild(btn);
    return btn;
  }

  function init() {
    injectCss();
    build();
  }

  if (document.body) {
    init();
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  }
  window.setTimeout(init, 500);

  window.ClosedPreview = {
    isClosed: function () { return closed; },
    set: function (v) { apply(!!v); },
    toggle: function () { apply(!closed); }
  };
})();
