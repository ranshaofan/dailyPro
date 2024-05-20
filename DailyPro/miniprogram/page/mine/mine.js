const app = getApp()
const db = wx.cloud.database();//获取数据库引用
Page({
  data: {
    userInfo: { avatarUrl: "./resources/img/login.png", nickName: "未登录" },
    inputAmount: '',  // 用于存储输入的月余额
    dlgObj:{txt:"请设置月余额：",inputtxt:"请输入月余额"}
  },
  handlerSubmit: function (evt) {
    console.log(evt);
    //获取用户名和密码
    let account = evt.detail.value.account;
    let pwd = evt.detail.value.pwd;
    var userCollection = db.collection("user");//获取集合（collection）的引用
    //通过集合向数据库添加数据
    userCollection.add({
      data: {
        account: account,
        pwd: pwd
      }
    })
  },
  setBalance() {
    this.setData({
      showBalanceDialog: true,
      dlgObj:{txt:"请设置月余额：",inputtxt:"请输入月余额"}
    });
  },
  setLimit(){
    this.setData({
      showBalanceDialog: true,
      dlgObj:{txt:"请设置月限额：",inputtxt:"请输入月限额"}
    });
  },
  // 监听输入框输入
  handleBalanceInput: function (e) {
    this.setData({
      inputAmount: e.detail.value,
    });
  },
  hideDialog(){
    this.setData({
      showBalanceDialog: false
    });
  },
  balanceConfirm() {
    // 关闭弹窗
    this.setData({
      showBalanceDialog: false,
    });
    var amount = 0;
    var zdname = "";
    if(this.data.dlgObj.inputtxt=="请输入月余额")zdname="balanceAmount";
    else zdname="limitAmount";
    amount = this.data.inputAmount;
    // 在这里可以获取输入的月余额
    wx.cloud.callFunction({
      name: 'upd',  // 云函数的名称，即创建的 upd 云函数
      data: {
        tableName: 'userInfo',  // 要操作的表名
        id: app.globalData.userInfo._id,  // 要操作的记录的 id
        name: zdname,  // 要新增/更新的字段名
        value: amount  // 新字段的值
      },
      success: function (res) {
        console.log('云函数 upd 调用成功', res);
        wx.showToast({
          title: '操作成功',
          icon: 'success',
          duration: 2000
        });
      },
      fail: function (error) {
        console.error('云函数 upd 调用失败', error);
      }
    });
  
  },
  avaclick() {
    if(this.data.userInfo.avatarUrl.indexOf('login')==-1){
      return;
    }
    var that = this;
    wx.getUserProfile({
      desc: '获取用户信息',
      success: res => {
        var user = res.userInfo;
        //设置全局用户信息
        app.globalData.userInfo = res.userInfo
        //检查之前是否已经授权登录
        db.collection('userInfo').where({
          _id: app.globalData.userInfo._id
        }).get({
          success: res => {
            //原先没有添加，这里添加
            if (!res.data[0]) {
              //将数据添加到数据库
              var info = db.collection('userInfo').add({
                data: {
                  avatarUrl: user.avatarUrl,
                  nickName: user.nickName
                },
                success: res => {
                  app.globalData.user_id = res._id;
                  that.setData({
                    userInfo: res
                  })
                }
              })

            } else {
              //已经添加过了
              this.setData({
                userInfo: res.data[0]
              })
              app.globalData.userInfo = res.data[0];
            }
          }
        })
      }
    })
  },
  loginOut:function(e){
    var that = this;
    wx.cloud.callFunction({
      name: 'loginout', // 云函数名称
      success: res => {
        // 退出登录成功，跳转至登录页面或其他操作
        wx.showToast({
          title: '退出登录成功',
          icon: 'success',
          duration: 2000,
          success: () => {
            // 跳转至登录页示例
            app.globalData.userInfo = {};
            that.setData({userInfo:{}});
            wx.reLaunch({
              url: '/page/mine/mine' // 登录页面路径
            })
          }
        })
      },
      fail: err => {
        // 退出登录失败，可以在此处进行错误处理
        console.error('退出登录失败：', err)
        wx.showToast({
          title: '退出登录失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  // avaclick: function () {
  //   wx.getUserInfo({
  //     success(res) {
  //       console.log(res.userInfo)
  //     }
  //   })
  // },
  stopPropagation: function (e) {
    // 阻止事件冒泡
    return;
  },
  onLoad() {
    // this.setData({
    //   theme: wx.getSystemInfoSync().theme || 'light'
    // })

    // if (wx.onThemeChange) {
    //   wx.onThemeChange(({theme}) => {
    //     this.setData({theme})
    //   })
    // }
    if(app.globalData.userInfo && app.globalData.userInfo.avatarUrl){
      this.setData({
        userInfo:app.globalData.userInfo
      })
    }
  }
})
