const config = require('./config');
const themeListeners = [];
global.isDemo = true
const util = require('./util/util.js');
App({

  onLaunch: function (opts, data) {
    // 1. 初始化云开发环境（如果尚未初始化）
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: config.envId,
        traceUser: true,
      });
    }

    // 2. 调用读取数据的函数
    this.fetchGlobalCategories();
    this.fetchGlobalFlags(); // 新增：初始化时读取打卡配置
    this.initTodayData();

  },
  // 读取打卡项目配置 (flags集合)
  // app.js
  async fetchGlobalFlags() {
    const db = wx.cloud.database();
    try {
      // 关键点：只查询 status 为 true 的数据
      const res = await db.collection('flags')
        .where({ 
          _openid: '{openid}', // 云开发会自动处理，如果是客户端调用可省略
          status: true 
        })
        .get();
        
      this.globalData.flags = res.data;
      if (this.flagsReadyCallback) {
        this.flagsReadyCallback(res.data);
      }
    } catch (err) {
      console.error('读取Flags失败:', err);
    }
  },
  async fetchGlobalCategories() {
    const db = wx.cloud.database();
    try {
      const res = await db.collection('types').where({ status: true }).get();
      this.globalData.categories = res.data;
      
      // 如果页面已经加载完成，但数据才刚回来，可以通过回调或事件通知页面
      if (this.categoriesReadyCallback) {
        this.categoriesReadyCallback(res.data);
      }
      console.log('全局分类初始化成功:', res.data);
    } catch (err) {
      console.error('全局分类初始化失败:', err);
    }
  },
  // app.js

// 抽取一个公共函数保证全应用日期格式统一
getTodayStr() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
},

async initTodayData() {
  const db = wx.cloud.database();
  const todayStr = this.getTodayStr(); // 使用统一格式：YYYY-MM-DD

  try {
    // 1. 加载打卡数据 (dayFlags)
    const res = await db.collection('dayFlags').where({ date: todayStr }).get();
    if (res.data.length > 0) {
      this.globalData.todayCheckList = res.data[0].checkList;
    } else {
      // 初始化逻辑... (保持你原来的 map 逻辑，但确保 date 使用 todayStr)
      const flagsRes = await db.collection('flags').where({ status: true, isOpen: true }).get();
      const initialCheckList = flagsRes.data.map(f => ({
        flagId: f._id, name: f.name, iconName: f.iconName, isCompleted: false
      }));
      await db.collection('dayFlags').add({
        data: { date: todayStr, checkList: initialCheckList, createTime: db.serverDate() }
      });
      this.globalData.todayCheckList = initialCheckList;
    }

    // 2. 新增：加载流水数据 (daysFlow) 存入全局
    await this.fetchTodayFlow();

    // 3. 统一通知页面
    if (this.todayDataReadyCallback) {
      this.todayDataReadyCallback();
    }
  } catch (e) {
    console.error("初始化每日数据失败", e);
  }
},

async fetchTodayFlow() {
  const db = wx.cloud.database();
  const todayStr = this.getTodayStr();
  try {
    const res = await db.collection('daysFlow').where({ date: todayStr }).get();
    this.globalData.todayFlowList = res.data.length > 0 ? res.data[0].flowList : [];
    console.log('全局流水加载成功');
  } catch (err) {
    console.error('获取全局流水失败', err);
  }
},

  checkDataReady: function () {
    if (this.dataLoadStatus.userInfoLoaded && this.dataLoadStatus.eventsLoaded && this.dataLoadStatus.typeInfoLoaded) {
      if (this.dataReadyCallback) {
        this.dataReadyCallback();
      }
    }
  },


  onShow(opts) {
    console.log('App Show', opts)
    // console.log(wx.getSystemInfoSync())
    //检查之前是否已经授权登录
    // wx.cloud.database().collection('userInfo').where({
    //   _id: app.globalData.user_id
    // }).get({
    //   success: res => {


    //   }
    // })
  },
  onHide() {
    console.log('App Hide')
  },
  onThemeChange({ theme }) {
    this.globalData.theme = theme
    themeListeners.forEach((listener) => {
      listener(theme)
    })
  },
  watchThemeChange(listener) {
    if (themeListeners.indexOf(listener) < 0) {
      themeListeners.push(listener)
    }
  },
  unWatchThemeChange(listener) {
    const index = themeListeners.indexOf(listener)
    if (index > -1) {
      themeListeners.splice(index, 1)
    }
  },
  /*(
{
        "pagePath": "page/analysis/analysis",
        "iconPath": "@iconTimeGray",
        "selectedIconPath": "@selectedIconTime"
      },
  )*/
  globalData: {
    theme: wx.getSystemInfoSync().theme,
    hasLogin: false,
    openid: null,
    todayTasks: [],
    // todayCosts: [],
    events:[],
    slots:[],
    userInfo:{},
    typeInfo:[],//存放类型与图片相对应的数组
    evaluation:["漂亮","正常","有点差","烂透了"],
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    zwdays: ['日', '一', '二', '三', '四', '五', '六'],
    colorobj: { "娱乐": "#C3ACEB", "工作": "#EB974F", "学习": "#B4EBA1", "兴趣": "#EA90BA" },
    types:[],
    iconTabbar: '/page/weui/example/images/icon_tabbar.png',
    iconNames:[//权宜之计
      "a-addmusic.png",
      "chuju.png",
      "a-musicquality.png",
      "archiver.png",
      "bangong.png",
      "baoxian.png",
      "bell.png",
      "bianji.png",
      "bofang.png",
      "book.png",
      "chongwu.png",
      "coffee.png",
      "computer.png",
      "create.png",
      "cup.png",
      "diannao.png",
      "dianpu.png",
      "dianying.png",
      "error.png",
      "ershou.png",
      "ershouche.png",
      "fangchan.png",
      "fastfood.png",
      "fuzhuang.png",
      "gifts.png",
      "gouwuche.png",
      "huiyuan.png",
      "huwai.png",
      "jiadian.png",
      "jiaju.png",
      "jianshen.png",
      "jiayou.png",
      "jiazhuang.png",
      "jinrong.png",
      "jipiao.png",
      "jiudian.png",
      "jiushui.png",
      "shopping.png"
    ],
    icons: [
      // 作息 / 时间
      { name: '阅读', class: 'icon-book' },
      { name: '运动', class: 'icon-run' },
      { name: '健身', class: 'icon-sport' },
      { name: '做饭', class: 'icon-cook' },
      { name: '吃饭', class: 'icon-eat' },
      { name: '咖啡', class: 'icon-coffee' },
      { name: '音乐', class: 'icon-music' },
      { name: '工作', class: 'icon-work' },
      { name: '学习', class: 'icon-study' },
      { name: '购物', class: 'icon-shopping' },
      { name: '时间', class: 'icon-alarm' },
      { name: '睡觉', class: 'icon-sleep' },
      { name: '专注', class: 'icon-focus' },
      { name: '冥想', class: 'icon-meditation' },
      { name: '聚会', class: 'icon-together' },
      { name: '出行', class: 'icon-car' },
      { name: '打扫', class: 'icon-clean' },
      { name: '宠物', class: 'icon-pet' },
      { name: '医疗', class: 'icon-hospital' },
      { name: '丽人', class: 'icon-lipstick' },
      { name: '玩具', class: 'icon-play' },
      { name: '旅游', class: 'icon-trip' },
      { name: '人', class: 'icon-person' },
      { name: '一般', class: 'icon-star' },
    ],
    checkIcons: [
      "changge",
      "chenxi",
      "chishucai",
      "chishuiguo",
      "chizaocan",
      "chouyan",
      "dadianhua",
      "hejiu",
      "heshui",
      "huahua",
      "jianfei",
      "jianshen",
      "jiejiu",
      "jieyan",
      "kanshu",
      "kaoyan",
      "lianzi",
      "licai",
      "paobu",
      "peihaizi",
      "sheying",
      "shuaya",
      "tingge",
      "weixiao",
      "yingyu",
      "zaoqi",
      "zaoshui",
      "zuofan"
    ]
    ,
    categories:[],
    flags: [],
    todayCheckList: []
  },
  // lazy loading openid
  getUserOpenId(callback) {
    const self = this

    if (self.globalData.openid) {
      callback(null, self.globalData.openid)
    } else {
      wx.login({
        success(data) {
          wx.cloud.callFunction({
            name: 'login',
            data: {
              action: 'openid'
            },
            success: res => {
              console.log('拉取openid成功', res)
              self.globalData.openid = res.result.openid
              callback(null, self.globalData.openid)
            },
            fail: err => {
              console.log('拉取用户openid失败，将无法正常使用开放接口等服务', res)
              callback(res)
            }
          })
        },
        fail(err) {
          console.log('wx.login 接口调用失败，将无法正常使用开放接口等服务', err)
          callback(err)
        }
      })
    }
  },
  // 通过云函数获取用户 openid，支持回调或 Promise
  getUserOpenIdViaCloud() {
    return wx.cloud.callFunction({
      name: 'wxContext',
      data: {}
    }).then(res => {
      this.globalData.openid = res.result.openid
      return res.result.openid
    })
  }
})
