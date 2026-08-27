// ===== API 公共请求方法 =====

/**
 * 显示全局 loading 遮罩
 */
function showLoading() {
  let loader = document.getElementById('__global_loader__');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = '__global_loader__';
    loader.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.3);';
    const spinner = document.createElement('div');
    spinner.style.cssText = 'width:40px;height:40px;border:4px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:__spin__ 0.8s linear infinite;';
    loader.appendChild(spinner);
    const style = document.createElement('style');
    style.textContent = '@keyframes __spin__ { to { transform: rotate(360deg); } }';
    loader.appendChild(style);
    document.body.appendChild(loader);
  }
  loader.style.display = 'flex';
}

/**
 * 隐藏全局 loading 遮罩
 */
function hideLoading() {
  const loader = document.getElementById('__global_loader__');
  if (loader) {
    loader.style.display = 'none';
  }
}

/**
 * 获取 API 基础地址
 * 如果是 127.0.0.1/localhost 则使用固定地址，否则使用当前页面域名
 */
export function getBaseUrl() {
  const host = window.location.hostname;
  if (host === '127.0.0.1' || host === 'localhost') {
    return 'http://ds45.kaibanshenqi.net'; // 本地开发时直接请求远程服务器（HTTP，避免证书问题）
  }
  return window.location.protocol + '//' + host + (window.location.port ? ':' + window.location.port : '');
}

/**
 * 统一处理响应错误
 * @param {Response} res - fetch 响应对象
 * @param {object} data - 解析后的 JSON 数据
 * @returns {object} 响应数据
 */
function handleResponseError(res, data) {
  // 1. 检查 HTTP 状态码
  if (res.status === 500) {
    const msg = data && data.message ? data.message : '服务器内部错误，请稍后重试';
    alert(msg);
    throw new Error(`[HTTP ${res.status}] ${msg}`);
  }
  if (res.status === 404) {
    const msg = data && data.message ? data.message : '请求的接口不存在';
    alert(msg);
    throw new Error(`[HTTP ${res.status}] ${msg}`);
  }
  if (res.status === 403) {
    const msg = data && data.message ? data.message : '没有权限访问';
    alert(msg);
    throw new Error(`[HTTP ${res.status}] ${msg}`);
  }
  if (res.status === 401) {
    const msg = data && data.message ? data.message : '未授权，请重新登录';
    alert(msg);
    throw new Error(`[HTTP ${res.status}] ${msg}`);
  }
  if (!res.ok && res.status !== 200) {
    const msg = data && data.message ? data.message : `请求失败 (HTTP ${res.status})`;
    alert(msg);
    throw new Error(`[HTTP ${res.status}] ${msg}`);
  }

  // 2. 检查业务状态码（status 字段）
  if (data && data.status && data.status !== 'success') {
    const msg = data.message || data.msg || data.error || '请求失败，请稍后重试';
    alert(msg);
    throw new Error(`[业务错误] ${msg}`);
  }

  return data;
}

/**
 * GET 请求
 * @param {string} path - 接口路径，如 /captcha
 * @param {object} params - 查询参数对象
 * @returns {Promise<any>} 响应数据
 */
export async function httpGet(path, params = {}) {
  showLoading();
  const baseUrl = getBaseUrl();
  const query = Object.keys(params)
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&');
  const url = baseUrl + path + (query ? '?' + query : '');
  try {
    const res = await fetch(url, {
      credentials: 'include'
    });
    const data = await res.json();
    // 统一错误处理
    handleResponseError(res, data);
    return data;
  } catch (error) {
    console.error('[httpGet] 请求失败:', error);
    throw error;
  } finally {
    hideLoading();
  }
}

export async function httpPost(path, data = {}) {
  showLoading();
  const baseUrl = getBaseUrl();
  const url = baseUrl + path;
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    formData.append(key, data[key]);
  });
  try {
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    const result = await res.json();
    // 统一错误处理
    handleResponseError(res, result);
    return result;
  } catch (error) {
    console.error('[httpPost] 请求失败:', error);
    throw error;
  } finally {
    hideLoading();
  }
}
export const list = [

    {
        name: '北京',
        area: '北京赛区', unitList: [
            {
                unit: '北京绚一文化有限公司',
                supportList: ['中关村移动互联网产业联盟'],
                Contact: '宋老师',
                phone: '13260362086',
                Complaint: '王老师',
                ComplaintPhone: '15210735732',
                eventList: [
                    { key: '小学赛项', value: 'AI与图像生成表达、AI与影像生成表达、AI与音频生成表达、AI与文本生成表达（诗歌和戏剧）' },
                    { key: '初中赛项', value: 'AI与造型艺术、AI与设计艺术、AI与影像艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                    { key: '高中赛项', value: 'AI与造型艺术、AI与视觉传达、AI 与产品设计艺术、AI与影像艺术、AI与数字媒体艺术、AI与摄影艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                ]
            },
            {
                unit: '北京众安晓育教育科技有限公司',
                supportList: ['北京市海淀区文化创意产业协会'],
                Contact: '李老师',
                phone: '18611206246',
                Complaint: '雷老师',
                ComplaintPhone: '13911837778',
                eventList: [
                    { key: '初中赛项', value: 'AI与数字动漫艺术' },
                    { key: '高中赛项', value: 'AI与数字动漫艺术' },
                    { key: '中等职业赛项', value: 'AI与造型艺术、AI与摄影艺术、AI与数字动漫艺术、AI与影像艺术、AI与视觉传达、AI与产品设计艺术、AI与数字媒体艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                ]
            },
            {
                unit: '中京南城(北京)文化产业发展有限公司',
                Contact: '乔小兰',
                phone: '15611072458',
                Complaint: '杨洪阳',
                ComplaintPhone: '13911602099',
                eventList: [
                    { key: '中等职业赛项', value: 'AI与造型艺术、AI与摄影艺术、AI与数字动漫艺术、AI与影像艺术、AI与视觉传达、AI与产品设计艺术、AI与数字媒体艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                ]
            }
        ], email: 'comp-bj@aigcnyacc.com'
    }, {
        name: '天津',
        area: '天津赛区', unitList: [
            {
                unit: '天津阿雅文化传播有限公司',
                Contact: '王老师',
                phone: '17611535553',
                Complaint: '张老师',
                ComplaintPhone: '15522857123',
                eventList: [
                    { key: '小学赛项', value: 'AI与图像生成表达' },
                    { key: '初中赛项', value: 'AI与造型艺术、AI 与设计艺术' },
                    { key: '高中赛项', value: 'AI与造型艺术、AI 与视觉传达、AI 与产品设计艺术' },
                ]
            },
            {
                unit: '天津沐桐文化传播有限公司',
                Contact: '刘老师',
                phone: '15222787852',
                Complaint: '王老师',
                ComplaintPhone: '13102061324',
                eventList: [
                    { key: '小学赛项', value: 'AI与图像生成表达、AI与影像生成表达、AI与音频生成表达、AI与文本生成表达（诗歌和戏剧）' },
                    { key: '初中赛项', value: 'AI与影像艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                    { key: '高中赛项', value: 'AI与影像艺术、AI与数字媒体艺术、AI与摄影艺术。AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                    { key: '中等职业赛项', value: 'AI与造型艺术、AI与摄影艺术、AI与数字动漫艺术、AI与影像艺术、AI与视觉传达、AI与产品设计艺术、AI与数字媒体艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                ]
            }
        ], email: 'comp-tj@aigcnyacc.com'
    }, {
        name: '河南',
        area: '河南赛区', unitList: [
            {
                unit: '河南微墨文化传播有限公司',
                Contact: '李老师',
                phone: '18511166627',
                Complaint: '张老师',
                ComplaintPhone: '15617660542',
                eventList: [
                    { key: '小学赛项', value: 'AI与图像生成表达' },
                    { key: '初中赛项', value: 'AI与造型艺术、AI 与设计艺术、AI 与数字动漫艺术' },
                    { key: '高中赛项', value: 'AI与造型艺术、AI 与视觉传达、AI 与产品设计艺术、AI 与数字动漫艺术' },
                    { key: '中等职业赛项', value: 'AI与造型艺术、AI与设计艺术、AI与视觉传达、AI 与产品设计艺术、AI与数字动漫艺术' },
                ]
            },
            {
                unit: '河南灵音教育咨询有限公司',
                Contact: '李彤',
                phone: '13191847687',
                Complaint: '晨阳',
                ComplaintPhone: '15831135281',
                eventList: [
                    { key: '小学赛项', value: 'AI与音频生成表达' },
                    { key: '初中赛项', value: 'AI与音频艺术' },
                    { key: '高中赛项', value: 'AI与音频艺术' },
                    { key: '中等职业赛项', value: 'AI与造型艺术、AI与摄影艺术、AI与数字动漫艺术、AI与影像艺术、AI与视觉传达、AI与产品设计艺术、AI与数字媒体艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                ]
            },
            {
                unit: '锐敏教育科技有限公司',
                Contact: '魏老师',
                phone: '13811916975',
                Complaint: '李老师',
                ComplaintPhone: '17812137723',
                eventList: [
                    { key: '小学赛项', value: 'AI与影像生成表达、AI与文本生成表达（诗歌和戏剧）' },
                    { key: '初中赛项', value: 'AI与影像艺术、AI与非物质文化遗产、AI与诗歌和戏剧' },
                    { key: '高中赛项', value: 'AI与影像艺术、AI与数字媒体艺术、AI与摄影艺术、AI与非物质文化遗产、AI与诗歌和戏剧' },
                ]
            }
        ], email: 'comp-ha@aigcnyacc.com'
    }, {
        name: '辽宁',
        area: '辽宁赛区', unitList: [
            {
                unit: '爱伯特教育科技（辽宁）有限公司',
                supportList: ['大连市人工智能与计算机辅助教育学会'],
                Contact: '韩老师',
                phone: '13942000263',
                Complaint: '张老师',
                ComplaintPhone: '17812137723',
                eventList: [
                    { key: '小学赛项', value: 'AI与图像生成表达、AI与影像生成表达、AI与音频生成表达、AI与文本生成表达（诗歌和戏剧）' },
                    { key: '初中赛项', value: 'AI与造型艺术、AI与设计艺术、AI与影像艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                    { key: '高中赛项', value: 'AI与造型艺术、AI与视觉传达、AI 与产品设计艺术、AI与影像艺术、AI与数字媒体艺术、AI与摄影艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                    { key: '中等职业赛项', value: 'AI与造型艺术、AI与摄影艺术、AI与数字动漫艺术、AI与影像艺术、AI与视觉传达、AI与产品设计艺术、AI与数字媒体艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                ]
            }
        ], email: 'comp-ln@aigcnyacc.com'
    }, {
        name: '广东',
        area: '广东赛区', unitList: [
            {
                unit: '广州新烨数码科技股份有限公司',
                supportList: ['广东岭南美术出版社有限公司', '广东省人工智能产业协会', '广东省青少年科技教育协会'],
                Contact: '潘老师',
                phone: '13570290294',
                Complaint: '萧老师',
                ComplaintPhone: '13138486263',
                eventList: [
                    { key: '小学赛项', value: 'AI与图像生成表达、AI与影像生成表达' },
                    { key: '初中赛项', value: 'AI与造型艺术、AI与设计艺术、AI与影像艺术' },
                    { key: '高中赛项', value: 'AI与造型艺术、AI与视觉传达、AI 与产品设计艺术、AI与影像艺术、AI与数字媒体艺术、AI与摄影艺术' },
                    { key: '中等职业赛项', value: 'AI与造型艺术、AI与摄影艺术、AI与数字动漫艺术、AI与影像艺术、AI与视觉传达、AI与产品设计艺术、AI与数字媒体艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                ]
            },
            {
                unit: '广东南方文交所艺术品运营有限公司',
                supportList: ['广东省艺术品行业协会'],
                Contact: '邱丹锋',
                phone: '13570290294',
                Complaint: '彭志强',
                ComplaintPhone: '18902238786',
                eventList: [
                    { key: '小学赛项', value: 'AI与音频生成表达' },
                    { key: '初中赛项', value: 'AI与音频艺术' },
                    { key: '高中赛项', value: 'AI与音频艺术' },
                    { key: '中等职业赛项', value: 'AI与造型艺术、AI与摄影艺术、AI与数字动漫艺术、AI与影像艺术、AI与视觉传达、AI与产品设计艺术、AI与数字媒体艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                ]
            },
        ], email: 'comp-gd@aigcnyacc.com'
    }, {
        name: '江苏',
        area: '江苏赛区', unitList: [
            {
                unit: '苏州福绘润智文化发展有限公司',
                supportList: ['江苏凤凰少年儿童出版社', '苏州大学传媒学院','苏州广电教育投资有限公司'],
                Contact: '江老师',
                phone: '15506210068',
                Complaint: '周老师',
                ComplaintPhone: '15190059311',
                eventList: [
                    { key: '小学赛项', value: 'AI与图像生成表达、AI与影像生成表达' },
                    { key: '初中赛项', value: 'AI与造型艺术、AI与设计艺术、AI与影像艺术、AI与数字动漫艺术、AI与非物质文化遗产' },
                    { key: '高中赛项', value: 'AI与造型艺术、AI与视觉传达、AI 与产品设计艺术、AI与影像艺术、AI与数字媒体艺术、AI与摄影艺术、AI与数字动漫艺术、AI与非物质文化遗产' },
                    { key: '中等职业赛项', value: 'AI与造型艺术、AI与摄影艺术、AI与数字动漫艺术、AI与影像艺术、AI与视觉传达、AI与产品设计艺术、AI与数字媒体艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                ]
            },
            {
                unit: '徐州出晨尚翊文化传媒有限公司',
                supportList: ['江阴外国语学校', '徐州市西苑中学'],
                Contact: '李老师',
                phone: '17625169988',
                Complaint: '翟老师',
                ComplaintPhone: '19984684111',
                eventList: [
                    { key: '小学赛项', value: 'AI与音频生成表达' },
                    { key: '初中赛项', value: 'AI与音频艺术' },
                    { key: '高中赛项', value: 'AI与音频艺术' },
                ]
            },
            {
                unit: '江苏青荷美育文化传媒有限公司',
                Contact: '赵老师',
                phone: '15335199126',
                Complaint: '万老师',
                ComplaintPhone: '18136884444',
                eventList: [
                    { key: '小学赛项', value: 'AI与文本生成表达（诗歌和戏剧）' },
                    { key: '初中赛项', value: 'AI与诗歌和戏剧' },
                    { key: '高中赛项', value: 'AI与诗歌和戏剧' },
                ]
            },
            {
                unit: '江苏华恒数字科技有限公司',
                supportList: ['西安交通大学苏州研究院'],
                Contact: '罗刚',
                phone: '18036392855',
                Complaint: '康涛',
                ComplaintPhone: '400-685-9685',
                eventList: [
                    { key: '中等职业赛项', value: 'AI与造型艺术、AI与摄影艺术、AI与数字动漫艺术、AI与影像艺术、AI与视觉传达、AI与产品设计艺术、AI与数字媒体艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                ]
            }
        ], email: 'comp-js@aigcnyacc.com'
    }, {
        name: '浙江',
        area: '浙江赛区', unitList: [
            {
                unit: '悦纷享教育科技（杭州）有限公司',
                supportList: ['杭州电视台综合频道'],
                Contact: '王老师',
                phone: '13989806269',
                Complaint: '张老师',
                ComplaintPhone: '18968084550',
                eventList: [
                    { key: '小学赛项', value: 'AI与图像生成表达、AI与影像生成表达、AI与音频生成表达、AI与文本生成表达（诗歌和戏剧）' },
                    { key: '初中赛项', value: 'AI与造型艺术、AI与设计艺术、AI与影像艺术、AI与音频艺术、AI与诗歌和戏剧' },
                    { key: '高中赛项', value: 'AI与造型艺术、AI与视觉传达、AI 与产品设计艺术、AI与影像艺术、AI与数字媒体艺术、AI与摄影艺术、AI与音频艺术、AI与诗歌和戏剧' },
                ]
            },
            {
                unit: '杭州博鑫文化传播有限公司',
                supportList: ['杭州电视台综合频道'],
                Contact: '朱老师',
                phone: '18758204879',
                Complaint: '刘老师',
                ComplaintPhone: '18668211831',
                eventList: [
                    { key: '初中赛项', value: 'AI与数字动漫艺术、AI与非物质文化遗产' },
                    { key: '高中赛项', value: 'AI与数字动漫艺术、AI与非物质文化遗产' },
                    { key: '中等职业赛项', value: 'AI与造型艺术、AI与摄影艺术、AI与数字动漫艺术、AI与影像艺术、AI与视觉传达、AI与产品设计艺术、AI与数字媒体艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                ]
            }
        ], email: 'comp-zj@aigcnyacc.com'
    }, {
        name: '山东',
        area: '山东赛区', unitList: [
            {
                unit: '山东综招教研院教育产业发展有限公司',
                supportList: ['山东省青年作家协会', '山东大学管理学院'],
                Contact: '赵老师',
                phone: '13651215423',
                Complaint: '李老师',
                ComplaintPhone: '13256788130',
                eventList: [
                    { key: '小学赛项', value: 'AI与文本生成表达（诗歌和戏剧）' },
                    { key: '初中赛项', value: 'AI与诗歌和戏剧' },
                    { key: '高中赛项', value: 'AI与诗歌和戏剧' },
                ]
            },
            {
                unit: '青岛星梦童年文化艺术有限公司',
                supportList: ['山东大学管理学院', '临沂市青少年科技辅导员协会'],
                Contact: '刘老师',
                phone: '15564871949',
                Complaint: '郭老师',
                ComplaintPhone: '13905324799',
                eventList: [
                    { key: '小学赛项', value: 'AI与图像生成表达、AI与音频生成表达' },
                    { key: '初中赛项', value: 'AI与造型艺术、AI与设计艺术、AI与音频艺术' },
                    { key: '高中赛项', value: 'AI与造型艺术、AI与视觉传达、AI 与产品设计艺术、AI与音频艺术' },
                    { key: '中等职业赛项', value: 'AI与造型艺术、AI与摄影艺术、AI与数字动漫艺术、AI与影像艺术、AI与视觉传达、AI与产品设计艺术、AI与数字媒体艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                ]
            },
            {
                unit: '山东正达实业集团有限公司',
                supportList: ['山东黄河文化经济发展促进会'],
                Contact: '刘老师',
                phone: '15908086578',
                Complaint: '周老师',
                ComplaintPhone: '13395316221',
                eventList: [
                    { key: '初中赛项', value: 'AI与数字动漫艺术' },
                    { key: '高中赛项', value: 'AI与数字动漫艺术' },
                    { key: '中等职业赛项', value: 'AI与造型艺术、AI与摄影艺术、AI与数字动漫艺术、AI与影像艺术、AI与视觉传达、AI与产品设计艺术、AI与数字媒体艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                ]
            },
            {
                unit: '山东普古物联网科技有限公司',
                Contact: '包雪莲',
                phone: '17686279190',
                Complaint: '王伟',
                ComplaintPhone: '18818288518',
                eventList: [
                    { key: '小学赛项', value: 'AI与影像生成表达' },
                    { key: '初中赛项', value: 'AI与影像艺术、AI 与非物质文化遗产' },
                    { key: '高中赛项', value: 'AI与影像艺术、AI与数字媒体艺术、AI与摄影艺术、AI与非物质文化遗产' },
                ]
            }
        ], email: 'comp-sd@aigcnyacc.com'
    }, {
        name: '福建',
        area: '福建赛区', unitList: [
            {
                unit: '云之绘（福建）信息科技有限公司',
                supportList: ['厦⻔市⼈⼯智能创新中⼼'],
                Contact: '杨老师',
                phone: '18650802121',
                Complaint: '戴老师',
                ComplaintPhone: '15394467278',
                eventList: [
                    { key: '小学赛项', value: 'AI与图像生成表达、AI与影像生成表达、AI与音频生成表达、AI与文本生成表达（诗歌和戏剧）' },
                    { key: '初中赛项', value: 'AI与造型艺术、AI与设计艺术、AI与影像艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                    { key: '高中赛项', value: 'AI与造型艺术、AI与视觉传达、AI 与产品设计艺术、AI与影像艺术、AI与数字媒体艺术、AI与摄影艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                    { key: '中等职业赛项', value: 'AI与造型艺术、AI与摄影艺术、AI与数字动漫艺术、AI与影像艺术、AI与视觉传达、AI与产品设计艺术、AI与数字媒体艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },

                ]
            }
        ], email: 'comp-fj@aigcnyacc.com'
    },
    {
        name: '上海',
        area: '上海赛区', unitList: [
            {
                unit: '上海勃冉众创数字科技有限公司',
                Contact: '侯大波',
                phone: '18721762578',
                Complaint: '王伟',
                ComplaintPhone: '18939935859',
                eventList: [
                    { key: '小学赛项', value: 'AI与图像生成表达、AI与影像生成表达、AI与音频生成表达、AI与文本生成表达（诗歌和戏剧）' },
                    { key: '初中赛项', value: 'AI与造型艺术、AI与设计艺术、AI与影像艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                    { key: '高中赛项', value: 'AI与造型艺术、AI与视觉传达、AI 与产品设计艺术、AI与影像艺术、AI与数字媒体艺术、AI与摄影艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                    { key: '中等职业赛项', value: 'AI与造型艺术、AI与摄影艺术、AI与数字动漫艺术、AI与影像艺术、AI与视觉传达、AI与产品设计艺术、AI与数字媒体艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },

                ]
            },
            {
                unit: '上海校外宝教育科技股份有限公司',
                Contact: '金老师',
                phone: '15102188128',
                Complaint: '董老师',
                ComplaintPhone: '17521118506',
                eventList: [
                    { key: '初中赛项', value: 'AI与数字动漫艺术' },
                    { key: '高中赛项', value: 'AI与数字动漫艺术' },

                ]
            }
        ], email: 'comp-sh@aigcnyacc.com'
    },
    {
        name: '河北',
        area: '河北赛区', unitList: [
            {
                unit: '河北爱艺智慧科技有限公司',
                Contact: '董老师',
                phone: '15075134013',
                Complaint: '崔老师',
                ComplaintPhone: '18910283880',
                eventList: [
                    { key: '小学赛项', value: 'AI与图像生成表达、AI与影像生成表达、AI与音频生成表达、AI与文本生成表达（诗歌和戏剧）' },
                    { key: '初中赛项', value: 'AI与造型艺术、AI与设计艺术、AI与影像艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                    { key: '高中赛项', value: 'AI与造型艺术、AI与视觉传达、AI 与产品设计艺术、AI与影像艺术、AI与数字媒体艺术、AI与摄影艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                    { key: '中等职业赛项', value: 'AI与造型艺术、AI与摄影艺术、AI与数字动漫艺术、AI与影像艺术、AI与视觉传达、AI与产品设计艺术、AI与数字媒体艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },

                ]
            },
        ], email: 'comp-he@aigcnyacc.com'
    },
    {
        name: '山西',
        area: '山西赛区', unitList: [
            {
                unit: '山西麦青文化传媒有限公司',
                Contact: '范老师',
                phone: '13100006430',
                Complaint: '米老师',
                ComplaintPhone: '17262396952',
                eventList: [
                    { key: '小学赛项', value: 'AI与图像生成表达、AI与影像生成表达、AI与音频生成表达、AI与文本生成表达（诗歌和戏剧）' },
                    { key: '初中赛项', value: 'AI与造型艺术、AI与设计艺术、AI与影像艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                    { key: '高中赛项', value: 'AI与造型艺术、AI与视觉传达、AI 与产品设计艺术、AI与影像艺术、AI与数字媒体艺术、AI与摄影艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                    { key: '中等职业赛项', value: 'AI与造型艺术、AI与摄影艺术、AI与数字动漫艺术、AI与影像艺术、AI与视觉传达、AI与产品设计艺术、AI与数字媒体艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },

                ]
            },
        ], email: 'comp-sx@aigcnyacc.com'
    },
    {
        name: '安徽',
        area: '安徽赛区', unitList: [
            {
                unit: '安徽海佩电子科技有限公司',
                supportList: ['安徽省工艺美术学会'],
                Contact: '夏老师',
                phone: '15910563795',
                Complaint: '杨老师',
                ComplaintPhone: '0551-62691678',
                eventList: [
                    { key: '小学赛项', value: 'AI与图像生成表达、AI与影像生成表达、AI与音频生成表达、AI与文本生成表达（诗歌和戏剧）' },
                    { key: '初中赛项', value: 'AI与造型艺术、AI与设计艺术、AI与影像艺术、AI与音频艺术、AI与诗歌和戏剧' },
                    { key: '高中赛项', value: 'AI与造型艺术、AI与视觉传达、AI 与产品设计艺术、AI与影像艺术、AI与数字媒体艺术、AI与摄影艺术、AI与音频艺术、AI与诗歌和戏剧' },

                ]
            },
            {
                unit: '“工作组”',
                Contact: '',
                phone: '4009398005',
                Complaint: '',
                ComplaintPhone: '4009398330',
                eventList: [
                    { key: '初中赛项', value: 'AI与数字动漫艺术、AI与非物质文化遗产' },
                    { key: '高中赛项', value: 'AI与数字动漫艺术、AI与非物质文化遗产' },

                ]
            },
        ], email: 'comp-ah@aigcnyacc.com'
    },
    {
        name: '湖北',
        area: '湖北赛区', unitList: [
            {
                unit: '湖北雅奥文化传媒有限公司',
                supportList: ['湖北艺术职业学院'],
                Contact: '倪钟',
                phone: '13986158943',
                Complaint: '朱老师',
                ComplaintPhone: '15806177181',
                eventList: [
                    { key: '小学赛项', value: 'AI与图像生成表达、AI与影像生成表达、AI与音频生成表达、AI与文本生成表达（诗歌和戏剧）' },
                    { key: '初中赛项', value: 'AI与造型艺术、AI与设计艺术、AI与影像艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                    { key: '高中赛项', value: 'AI与造型艺术、AI与视觉传达、AI 与产品设计艺术、AI与影像艺术、AI与数字媒体艺术、AI与摄影艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                    { key: '中等职业赛项', value: 'AI与造型艺术、AI与摄影艺术、AI与数字动漫艺术、AI与影像艺术、AI与视觉传达、AI与产品设计艺术、AI与数字媒体艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                ]
            },
        ], email: 'comp-hb@aigcnyacc.com'
    },
    {
        name: '四川',
        area: '四川赛区', unitList: [
            {
                unit: '成都艾尔帕思科技有限公司',
                supportList: ['四川省大数据产业联合会'],
                Contact: '刘老师',
                phone: '18086817961',
                Complaint: '邓老师',
                ComplaintPhone: '18980446001',
                eventList: [
                    { key: '小学赛项', value: 'AI与图像生成表达、AI与音频生成表达、AI与文本生成表达（诗歌和戏剧）' },
                    { key: '初中赛项', value: 'AI与造型艺术、AI与设计艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                    { key: '高中赛项', value: 'AI与造型艺术、AI与视觉传达、AI 与产品设计艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                ]
            },
            {
                unit: '“工作组”',
                Contact: '',
                phone: '4009398112',
                Complaint: '',
                ComplaintPhone: '4009398330',
                eventList: [
                    { key: '小学赛项', value: 'AI与影像生成表达' },
                    { key: '初中赛项', value: 'AI与影像艺术、AI与数字动漫艺术' },
                    { key: '高中赛项', value: 'AI与影像艺术、AI与数字媒体艺术、AI与摄影艺术、AI与数字动漫艺术' },
                    { key: '中等职业赛项', value: 'AI与影像艺术、AI与数字媒体艺术、AI与摄影艺术、AI与数字动漫艺术' },
                ]
            },
        ], email: 'comp-sc@aigcnyacc.com'
    },
    {
        name: '贵州',
        area: '贵州赛区', unitList: [
            {
                unit: '贵州以诺教育咨询有限公司',
                supportList: ['贵州省科技摄影协会'],
                Contact: '周婧雯',
                phone: '16608515294',
                Complaint: '祝瑞铂',
                ComplaintPhone: '16685550813',
                eventList: [
                    { key: '小学赛项', value: 'AI与影像生成表达' },
                    { key: '初中赛项', value: 'AI与影像艺术' },
                    { key: '高中赛项', value: 'AI与影像艺术、AI 与数字媒体艺术、AI 与摄影艺术' },
                ]
            },
             {
                unit: '“工作组”',
                Contact: '',
                phone: '4009398113',
                Complaint: '',
                ComplaintPhone: '4009398330',
                eventList: [
                    { key: '小学赛项', value: 'AI与图像生成表达、AI与音频生成表达、AI与文本生成表达（诗歌和戏剧）' },
                    { key: '初中赛项', value: 'AI与造型艺术、AI与设计艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                    { key: '高中赛项', value: 'AI与造型艺术、AI与视觉传达、AI 与产品设计艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                    { key: '中等职业赛项', value: 'AI与造型艺术、AI与摄影艺术、AI与数字动漫艺术、AI与影像艺术、AI与视觉传达、AI与产品设计艺术、AI与数字媒体艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                ]
            },
        ], email: 'comp-gz@aigcnyacc.com'
    },
    {
        name: '陕西',
        area: '陕西赛区', unitList: [
            {
                unit: '陕西唯真教育科技（集团）有限公司',
                Contact: '姜鲁玉',
                phone: '18210974934',
                Complaint: '王昊',
                ComplaintPhone: '18942639664',
                eventList: [
                    { key: '小学赛项', value: 'AI与图像生成表达、AI与影像生成表达、AI与音频生成表达、AI与文本生成表达（诗歌和戏剧）' },
                    { key: '初中赛项', value: 'AI与造型艺术、AI与设计艺术、AI与影像艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                    { key: '高中赛项', value: 'AI与造型艺术、AI与视觉传达、AI 与产品设计艺术、AI与影像艺术、AI与数字媒体艺术、AI与摄影艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                    { key: '中等职业赛项', value: 'AI与造型艺术、AI与摄影艺术、AI与数字动漫艺术、AI与影像艺术、AI与视觉传达、AI与产品设计艺术、AI与数字媒体艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                ]
            },
        ], email: 'comp-sn@aigcnyacc.com'
    },
    {
        name: '青海',
        area: '青海赛区', unitList: [
            {
                unit: '青海多学文化艺术有限公司',
                supportList: ['西宁市民办教育协会'],
                Contact: '林巍',
                phone: '18709713813',
                Complaint: '苏海峰',
                ComplaintPhone: '15609716513',
                eventList: [
                    { key: '小学赛项', value: 'AI与图像生成表达、AI与影像生成表达、AI与音频生成表达、AI与文本生成表达（诗歌和戏剧）' },
                    { key: '初中赛项', value: 'AI与造型艺术、AI与设计艺术、AI与影像艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                    { key: '高中赛项', value: 'AI与造型艺术、AI与视觉传达、AI 与产品设计艺术、AI与影像艺术、AI与数字媒体艺术、AI与摄影艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                    { key: '中等职业赛项', value: 'AI与造型艺术、AI与摄影艺术、AI与数字动漫艺术、AI与影像艺术、AI与视觉传达、AI与产品设计艺术、AI与数字媒体艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                ]
            },
        ], email: 'comp-qh@aigcnyacc.com'
    },
    {
        name: '宁夏',
        area: '宁夏赛区', unitList: [
            {
                unit: '宁夏星盛世纪文化传媒有限公司',
                Contact: '李昱蕾',
                phone: '13473783244',
                Complaint: '楠楠老师',
                ComplaintPhone: '17746507909',
                eventList: [
                    { key: '小学赛项', value: 'AI与图像生成表达、AI 与音频生成表达' },
                    { key: '初中赛项', value: 'AI与造型艺术、AI与设计艺术、AI与音频艺术' },
                    { key: '高中赛项', value: 'AI与造型艺术、AI与视觉传达、AI 与产品设计艺术、AI与音频艺术' },
                ]
            },
            {
                unit: '“工作组”',
                Contact: '',
                phone: '4009398009',
                Complaint: '',
                ComplaintPhone: '4009398330',
                eventList: [
                    { key: '小学赛项', value: 'AI与影像生成表达、AI与文本生成表达（诗歌和戏剧）' },
                    { key: '初中赛项', value: 'AI与影像艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与诗歌和戏剧' },
                    { key: '高中赛项', value: 'AI与影像艺术、AI与数字媒体艺术、AI与摄影艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与诗歌和戏剧' },
                    { key: '中等职业赛项', value: 'AI与造型艺术、AI与摄影艺术、AI与数字动漫艺术、AI与影像艺术、AI与视觉传达、AI与产品设计艺术、AI与数字媒体艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                ]
            },
        ], email: 'comp-nx@aigcnyacc.com'
    },
    {
        name: '云南',
        area: '云南赛区', unitList: [
            {
                unit: '“工作组”',
                Contact: '',
                phone: '4009398003',
                Complaint: '',
                ComplaintPhone: '4009398330',
                eventList: [
                    { key: '小学赛项', value: 'AI与影像生成表达、AI与音频生成表达' },
                    { key: '初中赛项', value: 'AI与影像艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术' },
                    { key: '高中赛项', value: 'AI与影像艺术、AI与数字媒体艺术、AI与摄影艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术' },
                    { key: '中等职业赛项', value: 'AI与造型艺术、AI与摄影艺术、AI与数字动漫艺术、AI与影像艺术、AI与视觉传达、AI与产品设计艺术、AI与数字媒体艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                ]
            },
            {
                unit: '云南汉桥国际文化艺术交流有限公司',
                Contact: '朱泠霖',
                phone: '15925199751',
                Complaint: '彭艳平',
                ComplaintPhone: '15925122698',
                eventList: [
                    { key: '小学赛项', value: 'AI与图像生成表达、AI与文本生成表达（诗歌和戏剧）' },
                    { key: '初中赛项', value: 'AI与造型艺术、AI与设计艺术、AI与诗歌和戏剧' },
                    { key: '高中赛项', value: 'AI与造型艺术、AI与视觉传达、AI 与产品设计艺术、AI与诗歌和戏剧' },
                ]
            },
        ], email: 'comp-yn@aigcnyacc.com'
    },
    {
        name: '吉林',
        area: '吉林赛区', unitList: [
            {
                unit: '长春东师学思教育科技发展有限公司',
                supportList: ['长春东北师范大学出版社有限责任公司'],
                Contact: '王添怡',
                phone: '17808089859',
                Complaint: '李海滨',
                ComplaintPhone: '0431-84568025',
                eventList: [
                    { key: '小学赛项', value: 'AI与影像生成表达、AI与音频生成表达' },
                    { key: '初中赛项', value: 'AI与影像艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术' },
                    { key: '高中赛项', value: 'AI与影像艺术、AI与数字媒体艺术、AI与摄影艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术' },
                ]
            },
            {
                unit: '“工作组”',
                Contact: '',
                phone: '4009398005',
                Complaint: '',
                ComplaintPhone: '4009398330',
                eventList: [
                    { key: '小学赛项', value: 'AI与图像生成表达、AI与文本生成表达（诗歌和戏剧）' },
                    { key: '初中赛项', value: 'AI与造型艺术、AI与设计艺术、AI与诗歌和戏剧' },
                    { key: '高中赛项', value: 'AI与造型艺术、AI与视觉传达、AI 与产品设计艺术、AI与诗歌和戏剧' },
                    { key: '中等职业赛项', value: 'AI与造型艺术、AI与摄影艺术、AI与数字动漫艺术、AI与影像艺术、AI与视觉传达、AI与产品设计艺术、AI与数字媒体艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                ]
            },
        ], email: 'comp-jl@aigcnyacc.com'
    },
    {
        name: '重庆',
        area: '重庆赛区', unitList: [
            {
                unit: '“工作组”',
                Contact: '',
                phone: '4009398009',
                Complaint: '',
                ComplaintPhone: '4009398330',
                eventList: [
                    { key: '小学赛项', value: 'AI与图像生成表达、AI与影像生成表达、AI与音频生成表达、AI与文本生成表达（诗歌和戏剧）' },
                    { key: '初中赛项', value: 'AI与造型艺术、AI与设计艺术、AI与影像艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                    { key: '高中赛项', value: 'AI与造型艺术、AI与视觉传达、AI 与产品设计艺术、AI与影像艺术、AI与数字媒体艺术、AI与摄影艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                     { key: '中等职业赛项', value: 'AI与造型艺术、AI与摄影艺术、AI与数字动漫艺术、AI与影像艺术、AI与视觉传达、AI与产品设计艺术、AI与数字媒体艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                ]
            },
        ], email: 'comp-cq@aigcnyacc.com'
    },
    {
        name: '内蒙古',
        area: '内蒙古赛区', unitList: [
            {
                unit: '“工作组”',
                Contact: '',
                phone: '4009398113',
                Complaint: '',
                ComplaintPhone: '4009398330',
                eventList: [
                    { key: '小学赛项', value: 'AI与图像生成表达、AI与影像生成表达、AI与音频生成表达、AI与文本生成表达（诗歌和戏剧）' },
                    { key: '初中赛项', value: 'AI与造型艺术、AI与设计艺术、AI与影像艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                    { key: '高中赛项', value: 'AI与造型艺术、AI与视觉传达、AI 与产品设计艺术、AI与影像艺术、AI与数字媒体艺术、AI与摄影艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                     { key: '中等职业赛项', value: 'AI与造型艺术、AI与摄影艺术、AI与数字动漫艺术、AI与影像艺术、AI与视觉传达、AI与产品设计艺术、AI与数字媒体艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                ]
            },
        ], email: 'comp-nmg@aigcnyacc.com'
    },
    {
        name: '黑龙江',
        area: '黑龙江赛区', unitList: [
            {
                unit: '“工作组”',
                Contact: '',
                phone: '4009398009',
                Complaint: '',
                ComplaintPhone: '4009398330',
                eventList: [
                    { key: '小学赛项', value: 'AI与图像生成表达、AI与影像生成表达、AI与音频生成表达、AI与文本生成表达（诗歌和戏剧）' },
                    { key: '初中赛项', value: 'AI与造型艺术、AI与设计艺术、AI与影像艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                    { key: '高中赛项', value: 'AI与造型艺术、AI与视觉传达、AI 与产品设计艺术、AI与影像艺术、AI与数字媒体艺术、AI与摄影艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                     { key: '中等职业赛项', value: 'AI与造型艺术、AI与摄影艺术、AI与数字动漫艺术、AI与影像艺术、AI与视觉传达、AI与产品设计艺术、AI与数字媒体艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                ]
            },
        ], email: 'comp-hlj@aigcnyacc.com'
    },
    {
        name: '江西',
        area: '江西赛区', unitList: [
            {
                unit: '“工作组”',
                Contact: '',
                phone: '4009398003',
                Complaint: '',
                ComplaintPhone: '4009398330',
                eventList: [
                    { key: '小学赛项', value: 'AI与图像生成表达、AI与影像生成表达、AI与音频生成表达、AI与文本生成表达（诗歌和戏剧）' },
                    { key: '初中赛项', value: 'AI与造型艺术、AI与设计艺术、AI与影像艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                    { key: '高中赛项', value: 'AI与造型艺术、AI与视觉传达、AI 与产品设计艺术、AI与影像艺术、AI与数字媒体艺术、AI与摄影艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                     { key: '中等职业赛项', value: 'AI与造型艺术、AI与摄影艺术、AI与数字动漫艺术、AI与影像艺术、AI与视觉传达、AI与产品设计艺术、AI与数字媒体艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                ]
            },
        ], email: 'comp-jx@aigcnyacc.com'
    },
    {
        name: '湖南',
        area: '湖南赛区', unitList: [
            {
                unit: '“工作组”',
                Contact: '',
                phone: '4009398112',
                Complaint: '',
                ComplaintPhone: '4009398330',
                eventList: [
                    { key: '小学赛项', value: 'AI与图像生成表达、AI与影像生成表达、AI与音频生成表达、AI与文本生成表达（诗歌和戏剧）' },
                    { key: '初中赛项', value: 'AI与造型艺术、AI与设计艺术、AI与影像艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                    { key: '高中赛项', value: 'AI与造型艺术、AI与视觉传达、AI 与产品设计艺术、AI与影像艺术、AI与数字媒体艺术、AI与摄影艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                     { key: '中等职业赛项', value: 'AI与造型艺术、AI与摄影艺术、AI与数字动漫艺术、AI与影像艺术、AI与视觉传达、AI与产品设计艺术、AI与数字媒体艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                ]
            },
        ], email: 'comp-hn@aigcnyacc.com'
    },
    {
        name: '广西',
        area: '广西赛区', unitList: [
            {
                unit: '“工作组”',
                Contact: '',
                phone: '4009398005',
                Complaint: '',
                ComplaintPhone: '4009398330',
                eventList: [
                    { key: '小学赛项', value: 'AI与图像生成表达、AI与影像生成表达、AI与音频生成表达、AI与文本生成表达（诗歌和戏剧）' },
                    { key: '初中赛项', value: 'AI与造型艺术、AI与设计艺术、AI与影像艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                    { key: '高中赛项', value: 'AI与造型艺术、AI与视觉传达、AI 与产品设计艺术、AI与影像艺术、AI与数字媒体艺术、AI与摄影艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                     { key: '中等职业赛项', value: 'AI与造型艺术、AI与摄影艺术、AI与数字动漫艺术、AI与影像艺术、AI与视觉传达、AI与产品设计艺术、AI与数字媒体艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                ]
            },
        ], email: 'comp-gx@aigcnyacc.com'
    },
    {
        name: '海南',
        area: '海南赛区', unitList: [
            {
                unit: '“工作组”',
                Contact: '',
                phone: '4009398113',
                Complaint: '',
                ComplaintPhone: '4009398330',
                eventList: [
                    { key: '小学赛项', value: 'AI与图像生成表达、AI与影像生成表达、AI与音频生成表达、AI与文本生成表达（诗歌和戏剧）' },
                    { key: '初中赛项', value: 'AI与造型艺术、AI与设计艺术、AI与影像艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                    { key: '高中赛项', value: 'AI与造型艺术、AI与视觉传达、AI 与产品设计艺术、AI与影像艺术、AI与数字媒体艺术、AI与摄影艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                     { key: '中等职业赛项', value: 'AI与造型艺术、AI与摄影艺术、AI与数字动漫艺术、AI与影像艺术、AI与视觉传达、AI与产品设计艺术、AI与数字媒体艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                ]
            },
        ], email: 'comp-hn@aigcnyacc.com'
    },
    {
        name: '西藏',
        area: '西藏赛区', unitList: [
            {
                unit: '“工作组”',
                Contact: '',
                phone: '4009398003',
                Complaint: '',
                ComplaintPhone: '4009398330',
                eventList: [
                    { key: '小学赛项', value: 'AI与图像生成表达、AI与影像生成表达、AI与音频生成表达、AI与文本生成表达（诗歌和戏剧）' },
                    { key: '初中赛项', value: 'AI与造型艺术、AI与设计艺术、AI与影像艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                    { key: '高中赛项', value: 'AI与造型艺术、AI与视觉传达、AI 与产品设计艺术、AI与影像艺术、AI与数字媒体艺术、AI与摄影艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                     { key: '中等职业赛项', value: 'AI与造型艺术、AI与摄影艺术、AI与数字动漫艺术、AI与影像艺术、AI与视觉传达、AI与产品设计艺术、AI与数字媒体艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                ]
            },
        ], email: 'comp-xz@aigcnyacc.com'
    },
    {
        name: '甘肃',
        area: '甘肃赛区', unitList: [
            {
                unit: '“工作组”',
                Contact: '',
                phone: '4009398112',
                Complaint: '',
                ComplaintPhone: '4009398330',
                eventList: [
                    { key: '小学赛项', value: 'AI与图像生成表达、AI与影像生成表达、AI与音频生成表达、AI与文本生成表达（诗歌和戏剧）' },
                    { key: '初中赛项', value: 'AI与造型艺术、AI与设计艺术、AI与影像艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                    { key: '高中赛项', value: 'AI与造型艺术、AI与视觉传达、AI 与产品设计艺术、AI与影像艺术、AI与数字媒体艺术、AI与摄影艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                     { key: '中等职业赛项', value: 'AI与造型艺术、AI与摄影艺术、AI与数字动漫艺术、AI与影像艺术、AI与视觉传达、AI与产品设计艺术、AI与数字媒体艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                ]
            },
        ], email: 'comp-gs@aigcnyacc.com'
    },
    {
        name: '新疆',
        area: '新疆赛区', unitList: [
            {
                unit: '“工作组”',
                Contact: '',
                phone: '4009398112',
                Complaint: '',
                ComplaintPhone: '4009398330',
                eventList: [
                    { key: '小学赛项', value: 'AI与图像生成表达、AI与影像生成表达、AI与音频生成表达、AI与文本生成表达（诗歌和戏剧）' },
                    { key: '初中赛项', value: 'AI与造型艺术、AI与设计艺术、AI与影像艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                    { key: '高中赛项', value: 'AI与造型艺术、AI与视觉传达、AI 与产品设计艺术、AI与影像艺术、AI与数字媒体艺术、AI与摄影艺术、AI与数字动漫艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                     { key: '中等职业赛项', value: 'AI与造型艺术、AI与摄影艺术、AI与数字动漫艺术、AI与影像艺术、AI与视觉传达、AI与产品设计艺术、AI与数字媒体艺术、AI与非物质文化遗产、AI与音频艺术、AI与诗歌和戏剧' },
                ]
            },
        ], email: 'comp-xj@aigcnyacc.com'
    }
]
export const defaultList = [
    { src: "./img/stamp/content/file_4.jpg", clickable: true },
    { src: "./img/stamp/content/file_5.jpg", clickable: true },
    { src: "./img/stamp/content/file_6.jpg", clickable: true },
    { src: "./img/stamp/content/file_7.jpg", clickable: true },
    { src: "./img/stamp/content/file_8.jpg", clickable: true },
    { src: "./img/stamp/content/file_9.jpg", clickable: true },
]
export const documenDetailsList = [
    {
        name: '《大赛组织实施管理办法》',
        idx: 1,
        list: [
            { src: "./img/stamp/file_1/file_12.jpg", clickable: true },
            { src: "./img/stamp/file_1/file_13.jpg", clickable: true },
            { src: "./img/stamp/file_1/file_14.jpg", clickable: true },
            { src: "./img/stamp/file_1/file_15.jpg", clickable: true },
            { src: "./img/stamp/file_1/file_16.jpg", clickable: true },
            { src: "./img/stamp/file_1/file_17.jpg", clickable: true },
        ]
    },
    {
        name: '《大赛组委会管理办法》',
        idx: 2,
        list: [
            { src: "./img/stamp/file_2/file_18.jpg", clickable: true },
            { src: "./img/stamp/file_2/file_19.jpg", clickable: true },
            { src: "./img/stamp/file_2/file_20.jpg", clickable: true },
        ]
    },
    {
        name: '《大赛公正监督管理办法》',
        idx: 3,
        list: [
            { src: "./img/stamp/file_3/file_21.jpg", clickable: true },
            { src: "./img/stamp/file_3/file_22.jpg", clickable: true },
        ]
    },
    {
        name: '《大赛经费管理办法》',
        idx: 4,
        list: [
            { src: "./img/stamp/file_4/file_23.jpg", clickable: true },
        ]
    },
    {
        name: '《大赛赛区管理办法》',
        idx: 5,
        list: [
            { src: "./img/stamp/file_5/file_24.jpg", clickable: true },
            { src: "./img/stamp/file_5/file_25.jpg", clickable: true },
            { src: "./img/stamp/file_5/file_26.jpg", clickable: true },
            { src: "./img/stamp/file_5/file_27.jpg", clickable: true },
        ]
    },
    {
        name: '《大赛主题与阅卷管理办法》',
        idx: 6,
        list: [
            { src: "./img/stamp/file_6/file_28.jpg", clickable: true },
            { src: "./img/stamp/file_6/file_29.jpg", clickable: true },
            { src: "./img/stamp/file_6/file_30.jpg", clickable: true },
            { src: "./img/stamp/file_6/file_31.jpg", clickable: true },
            { src: "./img/stamp/file_6/file_32.jpg", clickable: true },
            { src: "./img/stamp/file_6/file_33.jpg", clickable: true },
        ]
    },
    {
        name: '《大赛专家库管理办法》',
        idx: 7,
        list: [
            { src: "./img/stamp/file_7/file_34.jpg", clickable: true },
            { src: "./img/stamp/file_7/file_35.jpg", clickable: true },
            { src: "./img/stamp/file_7/file_36.jpg", clickable: true },
            { src: "./img/stamp/file_7/file_37.jpg", clickable: true },
            { src: "./img/stamp/file_7/file_38.jpg", clickable: true },
            { src: "./img/stamp/file_7/file_39.jpg", clickable: true },
            { src: "./img/stamp/file_7/file_40.jpg", clickable: true },
        ]
    },
    {
        name: '《大赛工作人员行为规范》',
        idx: 8,
        list: [
            { src: "./img/stamp/file_8/file_41.jpg", clickable: true },
            { src: "./img/stamp/file_8/file_42.jpg", clickable: true },
            { src: "./img/stamp/file_8/file_43.jpg", clickable: true },
            { src: "./img/stamp/file_8/file_44.jpg", clickable: true },
        ]
    },
    {
        name: '《赛事组织单位遴选管理制度》',
        idx: 9,
        list: [
            { src: "./img/stamp/file_9/file_45.jpg", clickable: true },
            { src: "./img/stamp/file_9/file_46.jpg", clickable: true },
        ]
    },
]
export const documentList = [
    { name: "《大赛组织实施管理办法》", type: "link" },
    { name: "《大赛组委会管理办法》", type: "link" },
    { name: "《大赛公正监督管理办法》", type: "link" },
    { name: "《大赛经费管理办法》", type: "link" },
    { name: "《大赛赛区管理办法》", type: "link" },
    { name: "《大赛主题与阅卷管理办法》", type: "link" },
    { name: "《大赛专家库管理办法》", type: "link" },
    { name: "《大赛工作人员行为规范》", type: "link" },
    { name: "《赛事组织单位遴选管理制度》", type: "link" },
    { name: "《组织单位申报信息登记表》", type: "download" },
    { name: "《组织单位申报承诺书》", type: "download" },
]
export const hrefDowcumentList = [
    { name: "《组织单位申报信息登记表》", url: "https://dasaifiles.oss-cn-beijing.aliyuncs.com/doc/10b6ac5fc0-9fe1-4159-9fce-8c3ad87e24d9.docx" },
    { name: "《组织单位申报承诺书》", url: "https://dasaifiles.oss-cn-beijing.aliyuncs.com/doc/1170c02d71-ef87-468e-95a6-dcf2ba86bd8f.docx" },
]