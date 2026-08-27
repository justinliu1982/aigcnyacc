(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.CreatorCertificateRenderer = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  var WIDTH = 2480;
  var HEIGHT = 3508;
  var PLACEHOLDER = '占位';
  var CREATOR_TEMPLATE_ID = 'creatorCertificateTemplate';
  var PRODUCT_TRACE_TEMPLATE_ID = 'productTraceCertificateTemplate';

  var ARC_CONFIG = {
    creatorLeft: {
      center: { x: 224, y: 224 },
      radius: 198,
      startAngle: 210 * Math.PI / 180,
      endAngle: 90 * Math.PI / 180,
      fontSize: 22,
      letterSpacing: 2,
    },
    creatorRight: {
      center: { x: 224, y: 224 },
      radius: 198,
      startAngle: 90 * Math.PI / 180,
      endAngle: -30 * Math.PI / 180,
      fontSize: 22,
      letterSpacing: 2,
    },
    productLeft: {
      center: { x: 224, y: 224 },
      radius: 198,
      startAngle: 210 * Math.PI / 180,
      endAngle: 90 * Math.PI / 180,
      fontSize: 20,
      letterSpacing: 2,
    },
    productRight: {
      center: { x: 224, y: 224 },
      radius: 198,
      startAngle: 90 * Math.PI / 180,
      endAngle: -30 * Math.PI / 180,
      fontSize: 20,
      letterSpacing: 2,
    },
  };

  function text(value, fallback) {
    var v = fallback === undefined ? PLACEHOLDER : fallback;
    return typeof value === 'string' && value.trim() ? value.trim() : v;
  }

  function pointAt(t, config) {
    var angle = config.startAngle + (config.endAngle - config.startAngle) * t;
    return {
      x: config.center.x + config.radius * Math.cos(angle),
      y: config.center.y + config.radius * Math.sin(angle),
    };
  }

  function renderArcText(value, layer, config) {
    layer.replaceChildren();
    var chars = (value || '').split('');
    if (!chars.length) return;

    var sampleCount = 120;
    var samples = [];
    for (var i = 0; i <= sampleCount; i++) {
      samples.push(pointAt(i / sampleCount, config));
    }
    var distances = [0];
    for (var j = 1; j < samples.length; j++) {
      var prev = samples[j - 1];
      var curr = samples[j];
      distances.push(distances[j - 1] + Math.hypot(curr.x - prev.x, curr.y - prev.y));
    }

    var charWidth = config.fontSize * 0.62;
    var step = charWidth + config.letterSpacing;
    var totalWidth = step * chars.length;
    var arcLength = distances[distances.length - 1];
    var offset = Math.max(0, (arcLength - totalWidth) / 2 + step / 2);

    chars.forEach(function (char, index) {
      var target = offset + index * step;
      var sampleIndex = distances.findIndex(function (d) { return d >= target; });
      if (sampleIndex < 1) sampleIndex = 1;
      var prevDist = distances[sampleIndex - 1];
      var span = distances[sampleIndex] - prevDist || 1;
      var t = ((sampleIndex - 1) + (target - prevDist) / span) / sampleCount;
      var pt = pointAt(t, config);
      var tangent = pointAt(Math.min(1, t + 0.001), config);
      var angle = Math.atan2(tangent.y - pt.y, tangent.x - pt.x) * 180 / Math.PI;
      var el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      el.textContent = char;
      el.setAttribute('x', pt.x.toFixed(2));
      el.setAttribute('y', pt.y.toFixed(2));
      el.setAttribute('dy', '0.35em');
      el.setAttribute('font-size', config.fontSize);
      el.setAttribute('transform', 'rotate(' + angle.toFixed(2) + ' ' + pt.x.toFixed(2) + ' ' + pt.y.toFixed(2) + ')');
      layer.append(el);
    });
  }

  function renderCreatorArcText(certificate, model) {
    var leftLayer = certificate.querySelector('.creator-arc-left-group');
    var rightLayer = certificate.querySelector('.creator-arc-right-group');
    if (leftLayer) renderArcText(model.creatorUniqueIds || '', leftLayer, ARC_CONFIG.creatorLeft);
    if (rightLayer) renderArcText(model.evaluationIds || '', rightLayer, ARC_CONFIG.creatorRight);
  }

  function renderProductArcText(certificate, model) {
    var leftLayer = certificate.querySelector('.product-arc-left-group');
    var rightLayer = certificate.querySelector('.product-arc-right-group');
    if (leftLayer) renderArcText(model.productArtId || '', leftLayer, ARC_CONFIG.productLeft);
    if (rightLayer) renderArcText(model.traceToTheSource || '', rightLayer, ARC_CONFIG.productRight);
  }

  function getExportOptions() {
    return { width: WIDTH, height: HEIGHT, pixelRatio: 1 };
  }

  function getTemplateId() {
    return CREATOR_TEMPLATE_ID;
  }

  function buildCreatorCertificateModel(award) {
    var a = award || {};
    return {
      creatorYear: '2026',
      creatorMonth: '7',
      creatorDay: '25',
      recipient: text(a.reg_name),
      creatorUniqueId: '创作者唯一身份ID：DRICAC-2026-00000012',
      evaluationId: '量化测评ID：01H5Q8Z3NDEKTSV4RRFFQ69G5F',
      hash: '32e8e5b4f2d9c7a1b3f5e8d2c4b6a8e0d2f4c6a8f6cf450f9b0b496f9ee6d332e739b8b182fe1e3b34ed446ab068a151f1ee8cbe',
      registrationNumber:'DRICAC-YT-202605-00001234',
      creatorUniqueIds: 'DRICAC-2026-00000012',
      evaluationIds: '01H5Q8Z3NDEKTSV4RRFFQ69G5F',
    };
  }

  function createCertificateElement(model, templateId) {
    var template = document.getElementById(templateId);
    if (!template || !template.content) {
      throw new Error('证书模板未加载：' + templateId);
    }
    var certificate = template.content.firstElementChild.cloneNode(true);
    Object.entries(model).forEach(function (entry) {
      var field = entry[0];
      var value = entry[1];
      var element = certificate.querySelector('[data-field="' + field + '"]');
      if (element) element.textContent = value;
    });
    return certificate;
  }

  function createCreatorCertificateElement(model) {
    return createCertificateElement(model, CREATOR_TEMPLATE_ID);
  }

  function mountCertificate(certificate, width, height) {
    var host = document.createElement('div');
    Object.assign(host.style, {
      position: 'fixed',
      left: '-10000px',
      top: '-10000px',
      width: width + 'px',
      height: height + 'px',
      pointerEvents: 'none',
    });
    host.append(certificate);
    document.body.append(host);
    return host;
  }

  async function awaitCertificateFonts() {
    if (!document.fonts) return;
    try {
      var fontLoaded = document.fonts.check && document.fonts.check('50px "Certificate Source Han Serif"');
      if (!fontLoaded && document.fonts.load) {
        await document.fonts.load('50px "Certificate Source Han Serif"');
      }
    } catch (e) {
      console.warn('[CreatorCertificateRenderer] font load skipped', e);
    }
    if (document.fonts.ready) await document.fonts.ready;
  }

  function loadImageForCanvas(url) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { reject(new Error('图片加载失败：' + url)); };
      img.src = url;
    });
  }

  async function composeCertificateBlob(backgroundUrl, overlayBlob, width, height) {
    var overlayUrl = URL.createObjectURL(overlayBlob);
    try {
      var bgImg = await loadImageForCanvas(backgroundUrl);
      var overlayImg = await loadImageForCanvas(overlayUrl);
      var canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(bgImg, 0, 0, width, height);
      ctx.drawImage(overlayImg, 0, 0, width, height);
      return await new Promise(function (resolve, reject) {
        canvas.toBlob(function (blob) {
          if (blob) resolve(blob);
          else reject(new Error('证书图片合成失败'));
        }, 'image/png');
      });
    } finally {
      URL.revokeObjectURL(overlayUrl);
    }
  }

  /**
   * 加载图片并转为 JPEG data URL，避免 html-to-image 渲染时因 CORS 污染 Canvas
   * 失败时返回 null，调用方回退到原始 URL
   */
  function imageToJpegDataUrl(url, width, height) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.crossOrigin = 'anonymous';
      console.log('[CreatorCertificateRenderer] bg image load start', url, window.location.href);
      img.onload = function () {
        try {
          console.log('[CreatorCertificateRenderer] bg image load ok', {
            url: url,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            currentSrc: img.currentSrc,
          });
          var canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          var ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          var dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          console.log('[CreatorCertificateRenderer] bg image to dataURL ok', {
            url: url,
            dataUrlLength: dataUrl.length,
          });
          resolve(dataUrl);
        } catch (e) {
          console.error('[CreatorCertificateRenderer] bg image to dataURL failed', url, e);
          resolve(null);
        }
      };
      img.onerror = function () {
        console.error('[CreatorCertificateRenderer] bg image load error', {
          url: url,
          currentSrc: img.currentSrc,
          page: window.location.href,
        });
        resolve(null);
      };
      img.src = url;
    });
  }

  async function renderCreatorCertificate(award, backgroundUrl) {
    if (!globalThis.htmlToImage) {
      throw new Error('html-to-image 组件未加载');
    }
    console.log('[CreatorCertificateRenderer] render creator start', {
      backgroundUrl: backgroundUrl,
      page: window.location.href,
      htmlToImage: !!globalThis.htmlToImage,
    });

    var dataUrl = await imageToJpegDataUrl(backgroundUrl, WIDTH, HEIGHT);
    console.log('[CreatorCertificateRenderer] creator bg image ready', {
      backgroundUrl: backgroundUrl,
      bgSource: dataUrl ? 'dataURL' : 'raw URL fallback',
    });

    var model = buildCreatorCertificateModel(award);
    var certificate = createCreatorCertificateElement(model);

    // 渲染圆弧文字（SVG）
    renderCreatorArcText(certificate, model);

    var bgUrl = dataUrl || backgroundUrl;
    certificate.style.setProperty('background', 'transparent', 'important');

    var host = mountCertificate(certificate, WIDTH, HEIGHT);
    try {
      await awaitCertificateFonts();
      console.log('[CreatorCertificateRenderer] html-to-image creator start', {
        width: WIDTH,
        height: HEIGHT,
      });
      var blob = await globalThis.htmlToImage.toBlob(certificate, getExportOptions());
      if (!blob) throw new Error('证书图片生成失败');
      var finalBlob = await composeCertificateBlob(bgUrl, blob, WIDTH, HEIGHT);
      console.log('[CreatorCertificateRenderer] html-to-image creator ok', {
        overlayBlobSize: blob.size,
        blobType: finalBlob.type,
        blobSize: finalBlob.size,
      });
      return URL.createObjectURL(finalBlob);
    } catch (e) {
      console.error('[CreatorCertificateRenderer] html-to-image creator failed', {
        backgroundUrl: backgroundUrl,
        error: e,
      });
      throw e;
    } finally {
      host.remove();
    }
  }

  function getProductTraceTemplateId() {
    return PRODUCT_TRACE_TEMPLATE_ID;
  }

  function getProductTraceExportOptions() {
    return { width: WIDTH, height: HEIGHT, pixelRatio: 1 };
  }

  function buildProductTraceModel(award) {
    return {
      productTraceYear: '2026',
      productTraceMonth: '7',
      productTraceDay: '25',
      productRegistrationNumber: 'DRICAC-YW-202605-00005678',
      productArtId:'DOOTRT-AIGC-A-AP-000002',
      traceToTheSource:'01ARZ3NDEKTSV4RRFFQ69G5F',
      product_art_classification:'溯源登记艺术品分类',
      productArtClassification:'AIGC-A-AA',
      productArtTypeText:'艺术品分类',
      productArtTypeContent:'AI生成式艺术作品',
      productArtNameText:'艺术品名称',
      productArtNameContent:'XXXXX',
      productAuthorText:'作者',
      productAuthorContent:'XXX，XXX，XXX，XXX，XXX，XXX',
      productCreationTimeText:'完成创作时间',
      productCreationTimeContent:'2024年5月30日',
      productFirstPubTimeText:'首次发表时间',
      productFirstPubTimeContent:'2024年6月1日',
      productTraceSubjectText:'溯源登记主体',
      productTraceSubjectContent:'王XXX',
      productTraceTimeText:'溯源登记时间',
      productTraceTimeContent:'2024年6月12日 10:00:15',
      productOwnerText:'所有权人',
      productOwnerContent:'王XX，王XX，王XX，王XX，王XX',
      productTraceHashText:'溯源登记哈希',
      productTraceHashContent:'32e8e5b4f2d9c7a1b3f5e8d2c4b6a8e0d2f4c6a8f6cf450f9b0b496f9ee6d332e739b8b182fe1e3b34ed446ab068a151f1ee8cbe',
      productTraceDescText:'',
      productTraceDescContent:'溯源注册登记说明：本证书及其关联作品的数字资产已通过区块链技术在"文化艺术链"完成存证，生成唯一哈希指纹。该存证数据来源可追溯、可验证，具有唯一性、真实性和不可篡改性。可登录DOOTRT查询或www.cachain.com查询。',
    };
  }

  function createProductTraceElement(model) {
    return createCertificateElement(model, PRODUCT_TRACE_TEMPLATE_ID);
  }

  async function renderProductTraceCertificate(award, backgroundUrl) {
    if (!globalThis.htmlToImage) {
      throw new Error('html-to-image 组件未加载');
    }
    console.log('[CreatorCertificateRenderer] render product trace start', {
      backgroundUrl: backgroundUrl,
      page: window.location.href,
      htmlToImage: !!globalThis.htmlToImage,
    });

    var dataUrl = await imageToJpegDataUrl(backgroundUrl, WIDTH, HEIGHT);
    console.log('[CreatorCertificateRenderer] product trace bg image ready', {
      backgroundUrl: backgroundUrl,
      bgSource: dataUrl ? 'dataURL' : 'raw URL fallback',
    });

    var model = buildProductTraceModel(award);
    var certificate = createProductTraceElement(model);

    // 渲染圆弧文字（SVG）
    renderProductArcText(certificate, model);

    var bgUrl = dataUrl || backgroundUrl;
    certificate.style.setProperty('background', 'transparent', 'important');

    var host = mountCertificate(certificate, WIDTH, HEIGHT);
    try {
      await awaitCertificateFonts();
      console.log('[CreatorCertificateRenderer] html-to-image product trace start', {
        width: WIDTH,
        height: HEIGHT,
      });
      var blob = await globalThis.htmlToImage.toBlob(certificate, getProductTraceExportOptions());
      if (!blob) throw new Error('证书图片生成失败');
      var finalBlob = await composeCertificateBlob(bgUrl, blob, WIDTH, HEIGHT);
      console.log('[CreatorCertificateRenderer] html-to-image product trace ok', {
        overlayBlobSize: blob.size,
        blobType: finalBlob.type,
        blobSize: finalBlob.size,
      });
      return URL.createObjectURL(finalBlob);
    } catch (e) {
      console.error('[CreatorCertificateRenderer] html-to-image product trace failed', {
        backgroundUrl: backgroundUrl,
        error: e,
      });
      throw e;
    } finally {
      host.remove();
    }
  }

  return {
    buildCreatorCertificateModel: buildCreatorCertificateModel,
    getExportOptions: getExportOptions,
    getTemplateId: getTemplateId,
    renderCreatorCertificate: renderCreatorCertificate,
    buildProductTraceModel: buildProductTraceModel,
    getProductTraceTemplateId: getProductTraceTemplateId,
    getProductTraceExportOptions: getProductTraceExportOptions,
    renderProductTraceCertificate: renderProductTraceCertificate,
    ARC_CONFIG: ARC_CONFIG,
  };
});
