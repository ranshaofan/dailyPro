import { dateFormat, initCalendar } from '../../util/util'
const app = getApp();
const db = wx.cloud.database();//获取数据库引用
Page({
  data: {
    calendar: [],
    tasks: [{ type: "娱乐", con: "Today", pics: ["../common/img/phone.png", "../common/img/puke.png", "../common/img/phoneG.png"], index: 1 }, { type: "娱乐", con: "Today", pics: [], index: 2 }, { type: "娱乐", con: "Today", pics: [], index: 3 }],
    events: [{ eventtime: '2024-5-20', name: '喝咖啡', type: '饮食', notes: '不应该', evaluation: '普通', inittime: '', userid: '', index: 1, conLeft: 0 }],
    cLChosen: "",
    evaluation: [],
    typeData: [],
    startX: 0,
    currentDate: '2024-5-20',
    sdate: '2024-5-20',
    edate: '2024-5-20',
    addTimeDlgShow: 0,
    addEventDlgShow: 0,
    typeIndex: 0,
    jugeIndex: 0,
    typeArr: ["娱乐", "工作", "学习", "饮食"],
    jugeArr: ["优秀", "普通", "差劲"],
    contents: [],
    inputValue: "",
    inputCon: "",
    inputName: "",
    inputNum: "",
  },
  onLoad() {
    var cs = initCalendar();
    this.setData({
      calendar: cs.calendar,
      cLChosen: cs.cLChosen
    })
  },
  onShow() {
    const that = this;
    if (app.globalData.events.length > 0) {
      this.setData({
        events: app.globalData.events,
        evaluation: app.globalData.evaluation,
        typeData: app.globalData.typeData
      })
    } else {
      app.dataReadyCallback = function () {
        that.setData({
          events: app.globalData.events,
          evaluation: app.globalData.evaluation,
          typeData: app.globalData.typeData
        });
      }
    }
  },
  addDlgBtn(event) {
    var that = this;
    var type = event.currentTarget.dataset.type;
    if (type == "task") {
      var st = this.data.dlgStTime;
      var et = this.data.dlgEtTime;
      var type = this.data.typeArr[this.data.typeIndex];
      var con = this.data.inputValue;
      var cons = this.data.tasks;
      this.data.tasks.push({ st, et, type, con, id: cons.length, conLeft: 0, i: cons.length % 3 });
      app.globalData.todayTasks = cons;
      this.setData({
        addTimeDlgShow: 0,
        tasks: cons
      });
    } else {//event
      var type = this.data.typeArr[this.data.typeIndex];
      var notes = this.data.inputCon;
      var name = this.data.inputName;
      var evaluation = this.data.jugeArr[this.data.jugeIndex];
      var eventtime = this.data.currentDate;
      // this.data.events.push({ type, cost,pic,con, id: list.length,conLeft:0,i:list.length%3 });
      // app.globalData.todayCost = list;
      // this.setData({
      //   addEventDlgShow: 0,
      //   events: list
      // });
      // console.log(list);

      //向数据库中添加数据
      db.collection('events').add({
        data: {
          type: type,
          notes: notes,
          name: name,
          evaluation: evaluation,
          user_id: app.globalData.userInfo._id,
          eventtime: eventtime
        },
        success: res => {
          var events = db.collection('events');
          events.get().then(res => {
            if (res.data) {
              app.globalData.events = res.data;
              that.setData({
                events: res.data,
                addEventDlgShow: 0
              });
            }
          }).catch(err => {
            console.error('查询失败:', err);
            that.setData({
              addEventDlgShow: 0
            });
          });
        }
      })
    }
  },
  closeAddDlg(event) {
    this.setData({
      addTimeDlgShow: 0,
      addEventDlgShow: 0
    });
  },
  //addDlg弹框的input事件
  onInput(event) {
    var type = event.currentTarget.dataset.type;
    if (type == "costNum") {
      this.data.inputNum = event.detail.value;
    } else if (type == "eventCon") {
      this.data.inputCon = event.detail.value;
    } else if (type == "eventName") {
      this.data.inputName = event.detail.value;
    }else {
      this.data.inputValue = event.detail.value;
    }
  },
  onTypeChange(e) {
    this.setData({
      typeIndex: e.detail.value
    })
  },
  onJugeChange(e) {
    this.setData({
      jugeIndex: e.detail.value
    })
  },
  showAddEventDlg() {
    if (JSON.stringify(app.globalData.userInfo) == "{}") {
      loginIn();
    } else {
      this.setData({
        addTimeDlgShow: 0,
        addEventDlgShow: 1
      });
    }
  },
  canlenChosen: function (event) {
    var index = event.currentTarget.dataset.index;
    let calendar = this.data.calendar.map(item => {
      item.classChosen = item.index === index ? 'chosen' : '';
      return item;
    });
    this.setData({
      calendar: calendar,
      cLChosen: 'cL' + index
    });
  },
  //手指刚放到屏幕触发
  conTouchS: function (e) {
    //判断是否只有一个触摸点
    if (e.touches.length == 1) {
      this.setData({
        //记录触摸起始位置的X坐标
        startX: e.touches[0].clientX
      });
    }
  },
  //触摸时触发，手指在屏幕上每移动一次，触发一次
  conTouchM: function (e) {
    var that = this;
    if (e.touches.length == 1) {
      //记录触摸点位置的X坐标
      var moveX = e.touches[0].clientX;
      //计算手指起始点的X坐标与当前触摸点的X坐标的差值
      var disX = that.data.startX - moveX;
      //delBtnWidth 为右侧按钮区域的宽度
      var delBtnWidth = 58;
      var left = 0;
      if (disX == 0 || disX < 0) {//如果移动距离小于等于0，文本层位置不变
        left = 0;
      } else if (disX > 0) {//移动距离大于0，文本层left值等于手指移动距离
        left = disX * (-1);
        if (disX >= delBtnWidth) {
          //控制手指移动距离最大值为删除按钮的宽度
          left = delBtnWidth * (-1);
        }
      }
      //获取手指触摸的是哪一个item
      var index = e.currentTarget.dataset.index;
      var list = that.data.events;
      //将拼接好的样式设置到当前item中
      list[index].conLeft = left;
      // //更新列表的状态
      app.globalData.todayCosts = list;
      this.setData({
        events: list
      });
    }
  },
  conTouchE: function (e) {
    var that = this
    if (e.changedTouches.length == 1) {
      //手指移动结束后触摸点位置的X坐标
      var endX = e.changedTouches[0].clientX;
      //触摸开始与结束，手指移动的距离
      var disX = that.data.startX - endX;
      var delBtnWidth = 58;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      var left = disX > delBtnWidth / 2 ? delBtnWidth * (-1) : 0;
      //获取手指触摸的是哪一项
      var index = e.currentTarget.dataset.index;
      var list = that.data.events;
      //将拼接好的样式设置到当前item中
      list[index].conLeft = left;
      // //更新列表的状态
      app.globalData.todayCosts = list;
      this.setData({
        events: list
      });
    }
  },
  costDelete(e) {//删除按钮
    var index = e.currentTarget.dataset.index;
    var delArr = this.data.events.splice(index, 1);
    app.globalData.todayCosts = this.data.events;
    this.setData({
      events: this.data.events
    });
    db.collection('events').where({
      _id: delArr[0]._id
    }).remove({
      success: function (res) {
      }
    });
  },
})