(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.CertificateRenderer = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  var WIDTH = 3508;
  var HEIGHT = 2480;
  var OUTPUT_WIDTH = 1200;
  var OUTPUT_HEIGHT = 848;

  function text(value) {
    return typeof value === 'string' && value.trim() ? value.trim() : '';
  }

  function teacherNames(award) {
    return Object.keys(award)
      .filter(function (k) { return /^reg_teacher_name(_\d+)?$/.test(k); })
      .map(function (k) { return text(award[k]); })
      .filter(Boolean)
      .join('、');
  }

  function teamTeacherNames(regs) {
    var seen = {};
    var names = [];
    if (!Array.isArray(regs)) return '';
    regs.forEach(function (reg) {
      Object.keys(reg)
        .filter(function (k) { return /^reg_teacher_name(_\d+)?$/.test(k); })
        .forEach(function (k) {
          var v = text(reg[k]);
          if (v && !seen[v]) { seen[v] = true; names.push(v); }
        });
    });
    return names.join('、');
  }

  function teamRegValues(regs, field, unique) {
    var values = Array.isArray(regs)
      ? regs.map(function (reg) { return text(reg && reg[field]); }).filter(Boolean)
      : [];
    return (unique ? values.filter(function (v, i, a) { return a.indexOf(v) === i; }) : values).join('、');
  }

  function buildAwardCertificateModel(award, query) {
    var a = award || {};
    var q = query || {};
    var isTeam = a.is_team === 'YES';
    var matchYear = text(q.matchYear);
    var studentName = text(a.reg_name);
    var teamMembers = teamRegValues(a.regs, 'reg_name');
    var teamSchools = teamRegValues(a.regs, 'reg_school', true);
    var teamTeachers = teamTeacherNames(a.regs);
    var school = isTeam ? teamSchools : text(a.reg_school);
    var teachers = isTeam ? teamTeachers : teacherNames(a);
    
    var teacherLabel = '指导老师：' + (teachers || '无');
    var groupItem = text(a.reg_group) + '-' + text(a.compitem_name);

    return {
      template: isTeam ? 'team' : 'student',
      recipient: isTeam ? text(a.regteam_name) : (studentName ? studentName + '同学' : ''),
      workLabel: '参赛作品：《' + text(a.reg_work_name) + '》',
      matchDescription: '在' + matchYear + '年第一届《全国青少年人工智能辅助生成数字艺术创作者大赛》' + groupItem + text(a.area_name) + '选拔赛中表现优异。荣获：',
      awardLevel: text(a.pretty_reward_level),
      certificateCodeLabel: '证书编号：' + text(a.reward_level_cert_no),
      memberLabel: isTeam ? '团队成员：' + teamMembers : '',
      schoolLabel: '就读学校：' + (school || '无'),
      teacherLabel: teacherLabel,
      hash: text(a.reward_hash),
      year: '2026',
      month: '7',
      day: '25',
    };
  }

  function buildSocialCertificateModel(award) {
    var a = award || {};
    var studentName = text(a.reg_name);
    return {
      recipient: studentName ? studentName + '同学' : '',
      // school: '就读学校：' + text(a.reg_school) || '无',
      practiceDescription: '兹证明该生参加了2026年第一届《全国青少年人工智能辅助生成数字艺术创作者大赛》' + text(a.area_name) + '选拔赛。通过参与本次"人工智能+艺术"社会实践活动，该生展现出较强的综合素养能力，显著提升了人工智能应用与创新水平。',
      practiceArchive: 'AIGCNYACC组委会已将本次活动计入该生社会实践档案。',
      certificateCode: '证书编号：' + text(a.shijian_cert_no),
      hash: text(a.shijian_hash),
      year: '2026',
      month: '7',
      day: '25',
    };
  }

  function createCertificateElement(templateId, model) {
    var template = document.getElementById(templateId);
    if (!template || !template.content) {
      throw new Error('证书模板未加载：' + templateId);
    }
    var certificate = template.content.firstElementChild.cloneNode(true);
    certificate.classList.toggle('is-team', model.template === 'team');
    Object.entries(model).forEach(function (entry) {
      var field = entry[0];
      var value = entry[1];
      var element = certificate.querySelector('[data-field="' + field + '"]');
      if (element) element.textContent = value;
    });
    return certificate;
  }

  function resolveImage(filename) {
    var prefix = window.location.pathname.indexOf('/h5/') !== -1 ? '../img/zhengshu/' : './img/zhengshu/';
    return prefix + filename;
  }

  function mountCertificate(certificate) {
    var host = document.createElement('div');
    Object.assign(host.style, {
      position: 'fixed',
      left: '-10000px',
      top: '-10000px',
      width: WIDTH + 'px',
      height: HEIGHT + 'px',
      pointerEvents: 'none',
    });
    host.append(certificate);
    document.body.append(host);
    return host;
  }

  async function awaitCertificateFonts() {
    if (!document.fonts) return;
    try {
      if (document.fonts.load) {
        await Promise.all([
          document.fonts.load('400 50px "Certificate Source Han Serif"'),
          document.fonts.load('700 58px "Certificate Source Han Serif"'),
        ]);
      }
    } catch (e) {
      // console.warn('[CertificateRenderer] font load skipped', e);
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

  function overlayHasVisiblePixels(image) {
    var sourceWidth = image.naturalWidth || WIDTH;
    var sourceHeight = image.naturalHeight || HEIGHT;
    var scale = 256 / Math.max(sourceWidth, sourceHeight);
    var canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(sourceWidth * scale));
    canvas.height = Math.max(1, Math.round(sourceHeight * scale));
    try {
      var ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return false;
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      var pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      for (var i = 3; i < pixels.length; i += 4) {
        if (pixels[i] > 0) return true;
      }
      return false;
    } finally {
      canvas.width = 0;
      canvas.height = 0;
    }
  }

  function waitForNextPaint() {
    return new Promise(function (resolve) {
      if (typeof requestAnimationFrame !== 'function') {
        setTimeout(resolve, 0);
        return;
      }
      requestAnimationFrame(function () {
        requestAnimationFrame(resolve);
      });
    });
  }

  async function composeCertificateBlob(backgroundUrl, overlayCanvas, watermarkUrl) {
    var bgImg;
    var wmImg;
    var outputCanvas;
    try {
      if (!overlayHasVisiblePixels(overlayCanvas)) {
        var error = new Error('证书文字层为空');
        error.code = 'EMPTY_CERTIFICATE_OVERLAY';
        throw error;
      }
      bgImg = await loadImageForCanvas(backgroundUrl);
      outputCanvas = document.createElement('canvas');
      outputCanvas.width = OUTPUT_WIDTH;
      outputCanvas.height = OUTPUT_HEIGHT;
      var ctx = outputCanvas.getContext('2d');
      if (!ctx) throw new Error('证书画布创建失败');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      // 1. 先画文字层
      ctx.drawImage(overlayCanvas, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
      // 2. 在文字下方垫背景
      ctx.save();
      try {
        ctx.globalCompositeOperation = 'destination-over';
        ctx.drawImage(bgImg, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
      } finally {
        ctx.restore();
      }
      // 3. Canvas 直接绘制水印（最上层，解决 Safari 中 html-to-image 无法正确捕获水印 img 的问题）
      if (watermarkUrl) {
        wmImg = await loadImageForCanvas(watermarkUrl);
        ctx.drawImage(wmImg, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
      }
      return await new Promise(function (resolve, reject) {
        outputCanvas.toBlob(function (blob) {
          if (blob) resolve(blob);
          else reject(new Error('证书图片合成失败'));
        }, 'image/png');
      });
    } finally {
      if (bgImg) bgImg.removeAttribute('src');
      if (wmImg) wmImg.removeAttribute('src');
      if (overlayCanvas) {
        overlayCanvas.width = 0;
        overlayCanvas.height = 0;
      }
      if (outputCanvas) {
        outputCanvas.width = 0;
        outputCanvas.height = 0;
      }
    }
  }

  async function renderCertificate(templateId, model, baseImageUrl) {
    if (!globalThis.htmlToImage) {
      throw new Error('证书图片导出组件未加载');
    }
    // console.log('[CertificateRenderer] render start', {
    //   templateId: templateId,
    //   baseImageUrl: baseImageUrl,
    //   page: window.location.href,
    //   htmlToImage: !!globalThis.htmlToImage,
    // });

    var certificate = createCertificateElement(templateId, model);

    // html-to-image 只生成透明文字层，底图随后绘制到同一张画布背后。
    certificate.style.setProperty('background', 'transparent', 'important');

    var host = mountCertificate(certificate);
    try {
      await waitForNextPaint();
      await awaitCertificateFonts();
      await waitForNextPaint();
      var finalBlob;
      for (var attempt = 1; attempt <= 2; attempt++) {
        // console.log('[CertificateRenderer] html-to-image start', {
        //   templateId: templateId,
        //   width: WIDTH,
        //   height: HEIGHT,
        //   attempt: attempt,
        // });
        var overlayCanvas = await globalThis.htmlToImage.toCanvas(certificate, {
          width: WIDTH,
          height: HEIGHT,
          pixelRatio: 1,
        });
        if (!overlayCanvas) throw new Error('证书图片生成失败');
        try {
          var watermarkUrl = resolveImage('AIGCNYACC.png');
          finalBlob = await composeCertificateBlob(baseImageUrl, overlayCanvas, watermarkUrl);
          break;
        } catch (e) {
          if (e.code !== 'EMPTY_CERTIFICATE_OVERLAY' || attempt === 2) throw e;
          // console.warn('[CertificateRenderer] empty overlay, retrying', {
          //   templateId: templateId,
          //   attempt: attempt,
          // });
          await waitForNextPaint();
        }
      }
      // console.log('[CertificateRenderer] html-to-image ok', {
      //   templateId: templateId,
      //   attempt: attempt,
      //   blobType: finalBlob.type,
      //   blobSize: finalBlob.size,
      // });
      return URL.createObjectURL(finalBlob);
    } catch (e) {
      // console.error('[CertificateRenderer] html-to-image failed', {
      //   templateId: templateId,
      //   baseImageUrl: baseImageUrl,
      //   error: e,
      // });
      throw e;
    } finally {
      host.remove();
    }
  }

  function renderAwardCertificate(award, query) {
    var model = buildAwardCertificateModel(award, query);
    var baseImageUrl = model.template === 'team'
      ? resolveImage('studentTeam.png')
      : resolveImage('studentOwn.png');
    return renderCertificate('awardCertificateTemplate', model, baseImageUrl);
  }

  function renderSocialCertificate(award) {
    return renderCertificate(
      'socialCertificateTemplate',
      buildSocialCertificateModel(award),
      resolveImage('shehui.png')
    );
  }

  return {
    buildAwardCertificateModel: buildAwardCertificateModel,
    buildSocialCertificateModel: buildSocialCertificateModel,
    renderAwardCertificate: renderAwardCertificate,
    renderSocialCertificate: renderSocialCertificate,
  };
});
