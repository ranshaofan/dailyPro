const config = require('./config');
const themeListeners = [];
global.isDemo = true
const util = require('./util/util.js');
App({

  onLaunch: function (opts, data) {
    const that = this;
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: config.envId,
        traceUser: true,
      });
    }
    // this.getUserOpenId();
    
    // 获取数据库引用
    const db = wx.cloud.database();
    var day = util.dateFormat('yyyy-MM-dd', new Date());
    // 获取集合的引用
    const userInfoCollection = db.collection('userInfo');
    const events = db.collection('events');
    const slots = db.collection('slots'); 
    const typeInfo = db.collection('typeInfo'); 

    // 用于跟踪数据加载状态
    this.dataLoadStatus = {
      userInfoLoaded: false,
      eventsLoaded: false,
      typeInfoLoaded:false
    };

    // 查询数据
    userInfoCollection.get().then(res => {
      // 查询成功，res.data 包含了查询结果
      if (res.data[0]) this.globalData.userInfo = res.data[0];
      this.dataLoadStatus.userInfoLoaded = true;
      this.checkDataReady();
      if(!res.data || res.data.length==0)return;
      //查询userinfo以后才查询对应的数据
      //events事件
      events.where({
        eventtime: day,
        user_id:this.globalData.userInfo._openid
      }).get().then(res => {
        if (res.data) {
          that.globalData.events = res.data;
        }
        this.dataLoadStatus.eventsLoaded = true;
        this.checkDataReady();
      }).catch(err => {
        console.error('查询失败:', err);
      });
      //slots时间
      slots.where({
        datetime: day,
        user_id:this.globalData.userInfo._openid
      }).get().then(res => {
        if (res.data) {
          that.globalData.slots = res.data;
        }
        this.dataLoadStatus.slotsLoaded = true;
        this.checkDataReady();
      }).catch(err => {
        console.error('查询失败:', err);
      });
      //typeInfo
      typeInfo.where({
        user_id:this.globalData.userInfo._openid
      }).get().then(res => {
        if (res.data) {
          that.globalData.typeInfo = res.data;
        }
        this.dataLoadStatus.typeInfoLoaded = true;
        this.checkDataReady();
      }).catch(err => {
        console.error('查询失败:', err);
      });
    }).catch(err => {
      console.error('查询失败:', err);
    });

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
    ]
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
