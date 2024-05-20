const config = require('./config')
const themeListeners = [];
global.isDemo = true
App({

  onLaunch(opts, data) {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: config.envId,
        traceUser: true,
      })
    }
    // 获取数据库引用
    const db = wx.cloud.database();

    // 获取集合的引用
    const userInfoCollection = db.collection('userInfo');
    const costs = db.collection('events');

    // 查询数据
    // userInfoCollection.get().then(res => {
    //   // 查询成功，res.data 包含了查询结果
    //   if(res.data[0])this.globalData.userInfo = res.data[0];
    // }).catch(err => {
    //   // 查询失败
    //   console.error('查询失败:', err);
    // });
    costs.get().then(res => {
      // 查询成功，res.data 包含了查询结果
      if(res.data)this.globalData.costs = res.data;
    }).catch(err => {
      // 查询失败
      console.error('查询失败:', err);
    });
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
  globalData: {
    theme: wx.getSystemInfoSync().theme,
    hasLogin: false,
    openid: null,
    todayTasks: [],
    todayCosts: [],
    costs:[],
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    colorobj: { "娱乐": "#C3ACEB", "工作": "#EB974F", "学习": "#B4EBA1", "兴趣": "#EA90BA" },
    iconTabbar: '/page/weui/example/images/icon_tabbar.png',
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
