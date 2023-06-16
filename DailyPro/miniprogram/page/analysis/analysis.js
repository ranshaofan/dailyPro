// Page({
//   onShareAppMessage() {
//     return {
//       title: '小程序接口能力展示',
//       path: 'page/analysis/analysis'
//     }
//   },

//   data: {
//     list: [{
//       id: 'api',
//       name: '开放接口',
//       open: false,
//       pages: [{
//         zh: '微信登录',
//         url: 'login/login'
//       }, {
//         zh: '获取用户信息',
//         url: 'get-user-info/get-user-info'
//       }, {
//         zh: '发起支付',
//         url: 'request-payment/request-payment'
//       }, {
//         zh: '跳转',
//         url: 'jump/jump'
//       }, {
//         zh: '转发',
//         url: 'share/share'
//       }, {
//         zh: '转发按钮',
//         url: 'share-button/share-button'
//       }, {
//         zh: '客服消息',
//         url: 'custom-message/custom-message'
//       }, {
//         zh: '订阅消息',
//         url: 'subscribe-message/subscribe-message'
//       }, {
//         zh: '收货地址',
//         url: 'choose-address/choose-address'
//       }, {
//         zh: '获取发票抬头',
//         url: 'choose-invoice-title/choose-invoice-title'
//       }, {
//         zh: '生物认证',
//         url: 'soter-authentication/soter-authentication'
//       }, {
//         zh: '设置',
//         url: 'setting/setting'
//       }]
//     }, {
//       id: 'page',
//       name: '界面',
//       open: false,
//       pages: [{
//         zh: '设置界面标题',
//         url: 'set-navigation-bar-title/set-navigation-bar-title'
//       }, {
//         zh: '标题栏加载动画',
//         url: 'navigation-bar-loading/navigation-bar-loading'
//       }, {
//         zh: '设置TabBar',
//         url: '@set-tab-bar'
//       }, {
//         zh: '页面跳转',
//         url: 'navigator/navigator'
//       }, {
//         zh: '下拉刷新',
//         url: 'pull-down-refresh/pull-down-refresh'
//       }, {
//         zh: '创建动画',
//         url: 'animation/animation'
//       }, {
//         zh: '创建绘画',
//         url: 'canvas/canvas'
//       }, {
//         zh: '显示操作菜单',
//         url: 'action-sheet/action-sheet'
//       }, {
//         zh: '显示模态弹窗',
//         url: 'modal/modal'
//       }, {
//         zh: '页面滚动',
//         url: 'page-scroll/page-scroll'
//       }, {
//         zh: '显示消息提示框',
//         url: 'toast/toast'
//       }, {
//         zh: '获取WXML节点信息',
//         url: 'get-wxml-node-info/get-wxml-node-info'
//       }, {
//         zh: 'WXML节点布局相交状态',
//         url: 'intersection-observer/intersection-observer'
//       }]
//     }, {
//       id: 'device',
//       name: '设备',
//       open: false,
//       pages: [{
//         zh: '获取手机网络状态',
//         url: 'get-network-type/get-network-type'
//       }, {
//         zh: '监听手机网络变化',
//         url: 'on-network-status-change/on-network-status-change'
//       }, {
//         zh: '获取手机系统信息',
//         url: 'get-system-info/get-system-info'
//       }, {
//         zh: '获取手机设备电量',
//         url: 'get-battery-info/get-battery-info'
//       }, {
//         zh: '监听重力感应数据',
//         url: 'on-accelerometer-change/on-accelerometer-change'
//       }, {
//         zh: '监听罗盘数据',
//         url: 'on-compass-change/on-compass-change'
//       }, {
//         zh: '打电话',
//         url: 'make-phone-call/make-phone-call'
//       }, {
//         zh: '扫码',
//         url: 'scan-code/scan-code'
//       }, {
//         zh: '剪切板',
//         url: 'clipboard-data/clipboard-data'
//       }, {
//         zh: '蓝牙',
//         url: 'bluetooth/bluetooth'
//       }, {
//         zh: 'iBeacon',
//         url: 'ibeacon/ibeacon'
//       }, {
//         zh: '屏幕亮度',
//         url: 'screen-brightness/screen-brightness'
//       }, {
//         zh: '用户截屏事件',
//         url: 'capture-screen/capture-screen'
//       }, {
//         zh: '振动',
//         url: 'vibrate/vibrate'
//       }, {
//         zh: '手机联系人',
//         url: 'add-contact/add-contact'
//       }, {
//         zh: 'Wi-Fi',
//         url: 'wifi/wifi'
//       }]
//     }, {
//       id: 'performance',
//       name: '性能',
//       open: false,
//       pages: [{
//         zh: '获取性能数据',
//         url: 'get-performance/get-performance'
//       }]
//     }, {
//       id: 'network',
//       name: '网络',
//       open: false,
//       pages: [{
//         zh: '发起一个请求',
//         url: 'request/request'
//       }, {
//         zh: 'WebSocket',
//         url: 'web-socket/web-socket'
//       }, {
//         zh: '上传文件',
//         url: 'upload-file/upload-file'
//       }, {
//         zh: '下载文件',
//         url: 'download-file/download-file'
//       }, {
//         zh: 'UDPSocket',
//         url: 'udp-socket/udp-socket'
//       }, {
//         zh: 'mDNS',
//         url: 'mdns/mdns'
//       }]
//     }, {
//       id: 'media',
//       name: '媒体',
//       open: false,
//       pages: [{
//         zh: '图片',
//         url: 'image/image'
//       }, {
//         zh: '音频',
//         url: 'audio/audio'
//       }, {
//         zh: '录音',
//         url: 'voice/voice'
//       }, {
//         zh: '背景音频',
//         url: 'background-audio/background-audio'
//       }, {
//         zh: '文件',
//         url: 'file/file'
//       }, {
//         zh: '视频',
//         url: 'video/video'
//       }, {
//         zh: '音视频合成',
//         url: 'media-container/media-container'
//       }, {
//         zh: '动态加载字体',
//         url: 'load-font-face/load-font-face'
//       }]
//     }, {
//       id: 'location',
//       name: '位置',
//       open: false,
//       pages: [{
//         zh: '获取当前位置',
//         url: 'get-location/get-location'
//       }, {
//         zh: '使用原生地图查看位置',
//         url: 'open-location/open-location'
//       }, {
//         zh: '使用原生地图选择位置',
//         url: 'choose-location/choose-location'
//       }]
//     }, {
//       id: 'storage',
//       name: '数据',
//       pages: [{
//         zh: '本地存储',
//         url: 'storage/storage'
//       }, {
//         zh: '周期性更新',
//         url: 'get-background-fetch-data/get-background-fetch-data'

//       }, {
//         zh: '数据预拉取',
//         url: 'get-background-prefetch-data/get-background-prefetch-data'
//       }],
//     }, {
//       id: 'worker',
//       name: '多线程',
//       url: 'worker/worker'
//     }, {
//       id: 'framework',
//       name: '框架',
//       pages: [{
//         zh: '双向绑定',
//         url: 'two-way-bindings/two-way-bindings',
//       }, {
//         zh: 'WXS',
//         url: 'wxs/wxs'
//       }, {
//         zh: '屏幕旋转',
//         url: 'resizable/resizable'
//       }]
//     }],
//     isSetTabBarPage: false,
//     theme: 'light'
//   },
//   onLoad() {
//     this.setData({
//       theme: wx.getSystemInfoSync().theme || 'light'
//     })

//     if (wx.onThemeChange) {
//       wx.onThemeChange(({
//         theme
//       }) => {
//         this.setData({
//           theme
//         })
//       })
//     }
//   },
//   onShow() {
//     this.leaveSetTabBarPage()
//   },
//   onHide() {
//     this.leaveSetTabBarPage()
//   },
//   kindToggle(e) {
//     const id = e.currentTarget.id;
//     const
//       list = this.data.list
//     for (let i = 0, len = list.length; i < len; ++i) {
//       if (list[i].id === id) {
//         if (list[i].url) {
//           wx.navigateTo({
//             url: `../../packageAPI/pages/${list[i].id}/${list[i].url}`
//           })
//           return
//         }
//         list[i].open = !list[i].open
//       } else {
//         list[i].open = false
//       }
//     }
//     this.setData({
//       list
//     })
//   },
//   enterSetTabBarPage() {
//     this.setData({
//       isSetTabBarPage: true
//     })
//   },
//   leaveSetTabBarPage() {
//     this.setData({
//       isSetTabBarPage: false
//     })
//   },
// })
import { drawLine, drawTimeline, drawFan } from '../../util/util.js'
const app = getApp()
Page({
  onShow() {
    // wx.reportAnalytics('enter_home_programmatically', {})

    // // http://tapd.oa.com/miniprogram_experiment/prong/stories/view/1020425689866413543
    // if (wx.canIUse('getExptInfoSync')) {
    //   console.log('getExptInfoSync expt_args_1', wx.getExptInfoSync(['expt_args_1']))
    //   console.log('getExptInfoSync expt_args_2', wx.getExptInfoSync(['expt_args_2']))
    //   console.log('getExptInfoSync expt_args_3', wx.getExptInfoSync(['expt_args_3']))
    // }
    // if (wx.canIUse('reportEvent')) {
    //   wx.reportEvent('expt_event_1', { expt_data: 1 })
    //   wx.reportEvent('expt_event_2', { expt_data: 5 })
    //   wx.reportEvent('expt_event_3', { expt_data: 9 })
    //   wx.reportEvent('expt_event_4', { expt_data: 200 })

    //   wx.reportEvent('weexpt_event_key_1', { option_1: 1, option_2: 10, option_str_1: 'abc' })
    //   wx.reportEvent('weexpt_event_key_1', { option_1: 'abc', option_2: '1000', option_str_1: '1' })
    // }
  },
  // onShareAppMessage() {
  //   // return {
  //   //   title: '分布图',
  //   //   path: 'page/home/home'
  //   // }
  // },
  // onShareTimeline() {
  //   '分布图'
  // },

  data: {
    list: [
      {
        id: 'view',
        name: '视图容器',
        open: false,
        pages: ['view', 'scroll-view', 'swiper', 'movable-view', 'cover-view']
      }, {
        id: 'content',
        name: '基础内容',
        open: false,
        pages: ['text', 'icon', 'progress', 'rich-text']
      }, {
        id: 'form',
        name: '表单组件',
        open: false,
        pages: ['button', 'checkbox', 'form', 'input', 'label', 'picker', 'picker-view', 'radio', 'slider', 'switch', 'textarea', 'editor']
      }, {
        id: 'nav',
        name: '导航',
        open: false,
        pages: ['navigator']
      }, {
        id: 'media',
        name: '媒体组件',
        open: false,
        pages: ['image', 'video', 'camera', 'live-pusher', 'live-player']
      }, {
        id: 'map',
        name: '地图',
        open: false,
        pages: ['map', { appid: 'wxe3f314db2e921db0', name: '腾讯位置服务示例中心' }]
      }, {
        id: 'canvas',
        name: '画布',
        open: false,
        pages: ['canvas-2d', 'webgl']
      }, {
        id: 'open',
        name: '开放能力',
        open: false,
        pages: ['ad', 'open-data', 'web-view']
      }, {
        id: 'obstacle-free',
        name: '无障碍访问',
        open: false,
        pages: ['aria-component']
      }
    ],
    theme: 'light'
  },

  onLoad() {
    // this.setData({
    //   theme: wx.getSystemInfoSync().theme || 'light'
    // })

    // if (wx.onThemeChange) {
    //   wx.onThemeChange(({ theme }) => {
    //     this.setData({ theme })
    //   })
    // }
    // this.listToCanvas(app.globalData.todayTasks);
    // ctx.draw()

    // const ctx = wx.createCanvasContext('timeCanvas');

  },

  // kindToggle(e) {
  //   const id = e.currentTarget.id
  //   const list = this.data.list
  //   for (let i = 0, len = list.length; i < len; ++i) {
  //     if (list[i].id === id) {
  //       list[i].open = !list[i].open
  //     } else {
  //       list[i].open = false
  //     }
  //   }
  //   this.setData({
  //     list
  //   })
  //   wx.reportAnalytics('click_view_programmatically', {})
  // },
  onTimelineClick() {

  },
  //把list分类整体并且图形化
  listToCanvas() {//list:[{starttime,endtime,type,con,id}]
    // list.sort(function(a,b){
    //   return new Date("2023-1-11 "+a.time) - new Date("2023-1-11 "+b.time);
    // });
    var list = app.globalData.todayTasks;
    // 根据type分类统计 并且计算每一个type所用的总分钟数sumTime
    var gatherList = {};//{type:{sumTime,arr:[{},{}]},type2:{}}
    list.forEach(item => {
      if (gatherList[item.type]) {
        gatherList[item.type].arr.push(item);
        //计算当前耗时
        var min = (new Date("2023-1-11 " + item.endtime) - new Date("2023-1-11 " + item.starttime)) / 1000 / 60;
        gatherList[item.type].sumTime += min;
      } else {
        gatherList[item.type] = { sumTime: 0, arr: [] };
        gatherList[item.type].arr.push(item);
        //计算当前耗时
        var min = (new Date("2023-1-11 " + item.endtime) - new Date("2023-1-11 " + item.starttime)) / 1000 / 60;
        gatherList[item.type].sumTime += min;
      }
    });
    //根据gatherList计算每个type所占的角度
    var gCanvaslist = [];//[{type,ratio,color}]
    //首先计算全部的分钟数
    var allT = 0;
    for (var key in gatherList) {
      allT += gatherList[key].sumTime;
    }
    //计算每个type所占比例,并补充gCanvasList数组，以便后期绘图
    for (var key in gatherList) {
      var ratio = gatherList[key].sumTime / allT;
      gCanvaslist.push({ type: key, ratio, color: app.globalData.colorobj[key] });
    }
    //计算每个type的起始弧度和终止弧度 [{type,ratio,color，startAngle,endAngle}]
    for(let i=0;i<gCanvaslist.length;i++){
      let startAngle = i==0?0:gCanvaslist[i-1].endAngle;
      let endAngle = 2 * Math.PI * gCanvaslist[i].ratio + startAngle;
      gCanvaslist[i]["startAngle"] = startAngle;
      gCanvaslist[i]["endAngle"] = endAngle;
    }

    //根据gatherListh绘制图形
    wx.createSelectorQuery()
      .select('#timeCanvas') // 在 WXML 中填入的 id
      .fields({ node: true, size: true })
      .exec((res) => {
        // Canvas 对象
        const canvas = res[0].node
        // 渲染上下文
        const ctx = canvas.getContext('2d');

        // Canvas 画布的实际绘制宽高
        const width = res[0].width;
        const height = res[0].height;

        // 初始化画布大小
        const dpr = wx.getWindowInfo().pixelRatio;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);
        //计算圆心
        var rx = width / 2;
        var ry = height / 2;
        var r = Number(ry-20)/2
        for (let i = 0; i < gCanvaslist.length; i++) {
          //  let angle = 2 * Math.PI * gCanvaslist[i].ratio;
          // drawFan(ctx,rx,ry,ry-20,gCanvaslist[i].ratio,app.globalData.colorobj[gCanvaslist[i].type]);
          ctx.beginPath();
          ctx.moveTo(rx, ry)
          ctx.arc(rx, ry, r,gCanvaslist[i].startAngle,gCanvaslist[i].endAngle);
          ctx.lineTo(rx, ry)
          ctx.fillStyle = app.globalData.colorobj[gCanvaslist[i].type];
          ctx.fill();
        }

        // ctx.moveTo(100, 15)
        // // ctx.strokeStyle('#AAAAAA')
        // ctx.stroke();

        // ctx.fontSize = 12;
        // ctx.fillStyle ='black';
        // ctx.fillText('0', 165, 78)
        // ctx.fillText('0.5*PI', 83, 145)
        // ctx.fillText('1*PI', 15, 78)
        // ctx.fillText('1.5*PI', 83, 10)

        // // Draw points
        // ctx.beginPath()
        // ctx.arc(100, 75, 2, 0, 2 * Math.PI)
        // // ctx.fillStyle('lightgreen')
        // ctx.fill()

        // ctx.beginPath()
        // ctx.arc(100, 25, 2, 0, 2 * Math.PI)
        // // ctx.fillStyle('blue')
        // ctx.fill()

        // ctx.beginPath()
        // ctx.arc(150, 75, 2, 0, 2 * Math.PI)
        // // ctx.fillStyle('red')
        // ctx.fill()

        // // Draw arc
        // ctx.beginPath()
        // ctx.arc(100, 75, 50, 0, 1.5 * Math.PI)
        // // ctx.strokeStyle('#333333')
        // ctx.stroke()

        // ctx.draw()
      })

  }
})
