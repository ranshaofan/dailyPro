import CustomPage from './base/CustomPage'
import {dateFormat,initCalendar} from '../../util/util'
const app = getApp()
CustomPage({
  onShareAppMessage() {
    return {
      title: '时间录入',
      path: 'page/task/task'
    }
  },
  data: {
    ifTask:0,
    ifCost:1,
    calendar:[],
    cLChosen:"",
    costs:[{type:"娱乐",con:"Today",pic:"../common/img/phoneG.png",index:1},{type:"娱乐",con:"Today",pic:"../common/img/phoneG.png",index:2},{type:"娱乐",con:"Today",pic:"../common/img/phoneG.png",index:3}],
    tasks:[{type:"Work",con:"that's all bullshit",st:"11:00",et:"12:00",i:0},{type:"Work",con:"that's all bullshit",st:"11:00",et:"12:00",i:1}],
    today:dateFormat('yyyy-MM-dd',new Date()),
    timePicker: null,
    dlgStTime: "08:00",
    dlgEtTime: "08:00",
    adddlgShow: 0,
    typeIndex: 0,
    startX:0,//滑动时的起始坐标
    typeArr: ["娱乐","工作","学习"],
    contents: [],
    inputValue: ""
  },
  changePageTask(){
    this.setData({
      ifTask:1,
      ifCost:0
    });
  },
  changePageCost(){
    this.setData({
      ifTask:0,
      ifCost:1
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
  onLoad() {
    var cs = initCalendar();
    console.log(cs);
    this.setData({
      calendar: cs.calendar,
      cLChosen: cs.cLChosen
    })
  },
  //addDlg弹框的input事件
  onInput(event) {
    this.data.inputValue = event.detail.value;
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
        left = disX* (-1);
        if (disX >= delBtnWidth) {
          //控制手指移动距离最大值为删除按钮的宽度
          left = delBtnWidth * (-1);
        }
      }
      //获取手指触摸的是哪一个item
      var index = e.currentTarget.dataset.index;
      var list = that.data.contents;
      //将拼接好的样式设置到当前item中
      list[index].conLeft = left;
      // //更新列表的状态
      app.globalData.todayTasks = list;
      this.setData({
        contents: list
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
      var left = disX > delBtnWidth / 2 ? delBtnWidth*(-1) : 0;
      //获取手指触摸的是哪一项
      var index = e.currentTarget.dataset.index;
      var list = that.data.contents;
      //将拼接好的样式设置到当前item中
      list[index].conLeft = left;
      // //更新列表的状态
      app.globalData.todayTasks = list;
      this.setData({
        contents: list
      });
    }
  },
  delItem(e){//删除按钮
    var index = e.currentTarget.dataset.index;
    console.log(index);
    var list = this.data.contents;
    list.splice(index,1);
    app.globalData.todayTasks = list;
    this.setData({
      contents:list
    });
  },
  //悬浮addDLg确定按钮的click
  addDlgBtn() {
    var st = this.data.dlgStTime;
    var et = this.data.dlgEtTime;
    var type = this.data.typeArr[this.data.typeIndex];
    var con = this.data.inputValue;
    var cons = this.data.tasks;
    this.data.tasks.push({ st,et, type, con, id: cons.length,conLeft:0,i:cons.length%3 });
    app.globalData.todayTasks = cons;
    this.setData({
      adddlgShow: 0,
      tasks: cons
    });
  },
  showAddDlg(event){
    // var button = event.currentTarget.dataset.btn;
    // if (button === "task") {
    // } else if (button === "cost") {
    // }
    this.setData({
      adddlgShow: 1
    });
  }
})
