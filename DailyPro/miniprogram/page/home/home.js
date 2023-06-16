import { dateFormat,initCalendar } from '../../util/util'
const app = getApp()
Page({
  data: {
    calendar: [],
    tasks:[{type:"娱乐",con:"Today",pics:["../common/img/phone.png","../common/img/puke.png","../common/img/phoneG.png"],index:1},{type:"娱乐",con:"Today",pics:[],index:2},{type:"娱乐",con:"Today",pics:[],index:3}],
    costs:[{type:"娱乐",con:"Today",pic:"../common/img/phoneG.png",index:1},{type:"娱乐",con:"Today",pic:"../common/img/phoneG.png",index:2},{type:"娱乐",con:"Today",pic:"../common/img/phoneG.png",index:3}],
    cLChosen: ""
  },
  onLoad() {
    var cs = initCalendar();
    this.setData({
      calendar: cs.calendar,
      cLChosen: cs.cLChosen
    })
  }
})