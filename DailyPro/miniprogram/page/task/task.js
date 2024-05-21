import CustomPage from './base/CustomPage'
import { dateFormat, initCalendar } from '../../util/util'
const app = getApp();
const db = wx.cloud.database();//获取数据库引用
CustomPage({
  onShareAppMessage() {
    return {
      title: '时间录入',
      path: 'page/task/task'
    }
  },
  data: {
    Type_Pic: { "娱乐": "phoneG", "工作": "phoneG" },//type和图片对应的数据表
    ifTime: 0,
    ifEvent: 1,
    calendar: [],
    typeData:[],
    evaluation:[],
    valueEventIndex:0,
    typeEventIndex:0,
    currentDate:'2024-5-20',
    sdate:'2024-5-20',
    edate:'2024-5-20',
    cLChosen: "",
    events: [{eventtime:'2024-5-20',name:'喝咖啡',type:'饮食',notes:'不应该',evaluation:'普通',inittime:'',userid:'',index:1,conLeft:0}],
    // events:[{type:"娱乐",con:"Today",pic:"../common/img/phoneG.png",index:1,cost:200,conLeft:0},{type:"娱乐",con:"Today",pic:"../common/img/phoneG.png",index:2,cost:200,conLeft:0},{type:"娱乐",con:"Today",pic:"../common/img/phoneG.png",index:3,cost:20,conLeft:0}],
    tasks: [{ type: "Work", con: "that's all bullshit", st: "11:00", et: "12:00", i: 0 }, { type: "Work", con: "that's all bullshit", st: "11:00", et: "12:00", i: 1 }],
    today: dateFormat('yyyy-MM-dd', new Date()),
    timePicker: null,
    dlgStTime: "08:00",
    dlgEtTime: "08:00",
    addTimeDlgShow: 0,
    addEventDlgShow: 0,
    typeIndex: 0,
    startX: 0,//滑动时的起始坐标
    typeArr: ["娱乐", "工作", "学习","饮食"],
    jugeArr: ["优秀", "普通", "差劲"],
    contents: [],
    inputValue: "",
    inputCon: "",
    inputName: "",
    inputNum: "",
    userInfo: { balanceAmount: 3000, limitAmount: 1000 },
    curEvent:{name:'',type:'',notes:'',juge:''}
  },
  changePageTask() {
    this.setData({
      ifTime: 1,
      ifEvent: 0
    });
  },
  changePageCost() {
    this.setData({
      ifTime: 0,
      ifEvent: 1
    });
  },
  onTimeStartChange(e) {
    this.setData({
      dlgStTime: e.detail.value
    })
  },
  onTimeEndChange(e) {
    this.setData({
      dlgEtTime: e.detail.value
    })
  },
  onTypeChange(e) {
    this.setData({
      typeIndex: e.detail.value
    })
  },
  onJugeChange(e){
    this.setData({
      jugeIndex: e.detail.value
    })
  },
  onEventValueChange(e){
    this.setData({
      valueEventIndex: e.detail.value
    })
  },
  onTypeEventChange(e){
    this.setData({
      typeEventIndex: e.detail.value
    })
  },
  onLoad() {
    var cs = initCalendar();
    this.setData({
      calendar: cs.calendar,
      cLChosen: cs.cLChosen,
      events: app.globalData.events,
      evaluation:app.globalData.evaluation,
      typeData: app.globalData.typeData
    })
    if (app.globalData.userInfo && app.globalData.userInfo.avatarUrl) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }
  },
  onshow() {
    if (JSON.stringify(app.globalData.events) != JSON.stringify(events)) {
      this.setData({
        events: app.globalData.events
      })
    }
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
      success: function(res) {
      }
    });
  },
  //悬浮addDLg确定按钮的click
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
          console.log(res);
          var events = db.collection('events');
          events.get().then(res => {
            if (res.data) {
              app.globalData.events = res.data;
              that.setData({
                events: res.data
              });
            }
          }).catch(err => {
            console.error('查询失败:', err);
          });
        }
      })
    }
  },
  showAddTimeDlg(){
    this.setData({
      addTimeDlgShow: 1,
      addEventDlgShow: 0
    });
  },
  showAddEventDlg(){
    this.setData({
      addTimeDlgShow: 0,
      addEventDlgShow: 1
    });
  },
  closeAddDlg(event) {
      this.setData({
        addTimeDlgShow: 0,
        addEventDlgShow:0
      });
  },
  handleLongPress(event) {
    //长按某一个task 在对应位置出现删除标签
    const { pageX, pageY } = event.touches[0];
    this.setData({
      isLongPress: true,
      scale: 1.1,
      pageX,
      pageY,
      key: event.currentTarget.dataset.index
    });

    wx.vibrateShort(); // 触发震动效果
  },
  clickTask: function (event) {
    this.setData({
      isLongPress: false,
      scale: 1,
      key: event.currentTarget.dataset.index
    });
  },
  taskDelete: function () {
    console.log(this.data.key);
    this.data.tasks.splice(this.data.key, 1)
    this.setData({
      tasks: this.data.tasks,
      isLongPress: false,
      scale: 1
    });
  },
  onDateChange: function(e) {
    this.setData({
      currentDate: e.detail.value
    });
  },
  onSDateChange: function(e) {
    this.setData({
      sdate: e.detail.value
    });
  },
  onEDateChange: function(e) {
    this.setData({
      edate: e.detail.value
    });
  }

  // handleTouchMove(event) {
  //   if (!this.data.isLongPress) {
  //     return;
  //   }

  //   const { pageX, pageY } = event.touches[0];
  //   const translateX = pageX - this.data.startX;
  //   const translateY = pageY - this.data.startY;

  //   this.setData({
  //     translateX,
  //     translateY
  //   });
  // },

  // handleTouchEnd() {
  //   if (!this.data.isLongPress) {
  //     return;
  //   }
  //   this.setData({
  //     isLongPress: false,
  //     scale:1
  //   });
  // }
})
