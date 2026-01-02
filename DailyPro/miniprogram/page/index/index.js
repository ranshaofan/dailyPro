// page/index/index.js
const util = require('../../util/util.js');
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    helloPic: 'sun',
    checkItems: [], 
    timelineList: [], // 修复：必须初始化，否则 WXML 无法渲染
    inputMode: 'voice',
    isRecording: false,
    showModal: false,
    isEditMode: false,   // 新增：是否为编辑模式
    editingIndex: -1,    // 新增：正在编辑的索引
    startTime: '14:00',
    endTime: '14:45',
    textInfo: '',
    selectedType: {
      _id: '',
      name: '选择分类',
      class: 'icon-default',
      color: '#A98467'
    },
    categories: [],
    showTypePicker: false,
    recordDate: '',
    totalCount: 0,     // 片段数量
    totalDuration: 0 // 总时长（小时）
  },

  onLoad(options) {
    // 1. 处理分类逻辑 (如果全局已经有了就直接用)
    this.initCategories();

    // 2. 关键：注册回调。如果 app.js 加载完了，会触发这个函数
    app.todayDataReadyCallback = () => {
      console.log('收到全局数据准备就绪的通知');
      this.refreshCheckList();
      this.refreshTimelineData();
    };

    // 3. 如果从其他页面回来，app.js 早就运行完了，直接刷一次
    if (app.globalData.todayCheckList) {
      this.refreshCheckList();
      this.refreshTimelineData();
    }
  },
  // 计算流水统计数据
  calculateStats(flowList) {
    if (!flowList || flowList.length === 0) {
      this.setData({ totalCount: 0, totalDuration: 0 });
      return;
    }

    // 1. 片段数量直接就是数组长度
    const totalCount = flowList.length;

    // 2. 累加分钟时长
    const totalMinutes = flowList.reduce((sum, item) => sum + (item.duration || 0), 0);

    // 3. 转换为小时（保留一位小数，例如 6.5）
    const totalDuration = (totalMinutes / 60).toFixed(1);

    this.setData({
      totalCount,
      totalDuration: parseFloat(totalDuration) // 转回数字类型
    });
  },
  initCategories() {
    const allCategories = app.globalData.categories || [];
    const availableCategories = allCategories.filter(item => !item.isHidden);
    if (availableCategories.length > 0) {
      this.setData({
        selectedType: availableCategories[0],
        categories: availableCategories
      });
    } else {
      // 如果还没加载好，也加个回调
      app.categoriesReadyCallback = (cats) => {
        const avail = cats.filter(item => !item.isHidden);
        this.setData({ categories: avail, selectedType: avail[0] });
      };
    }
  },

  onShow() {
    // 每次显示页面，同时刷新“打卡”和“时间轴流水”
    this.refreshCheckList();
    this.refreshTimelineData(); 
  },

  /**
   * 核心：获取云端流水数据并渲染
   */
  async refreshTimelineData() {
    // 如果全局已经有数据了，直接用全局的，不用重复查库
    if (app.globalData.todayFlowList) {
      const processedList = this.renderTimeline(app.globalData.todayFlowList);
      this.setData({ timelineList: processedList });
      this.calculateStats(app.globalData.todayFlowList);
    } else {
      // 降级方案：手动去查库（逻辑保持你现在的即可）
      const db = wx.cloud.database();
      const todayStr = this.getTodayDateString();
      const res = await db.collection('daysFlow').where({ date: todayStr }).get();
      if (res.data.length > 0) {
        const processedList = this.renderTimeline(res.data[0].flowList);
        this.setData({ timelineList: processedList });
        this.calculateStats(res.data[0].flowList);
      }
    }
  },

  /**
   * 逻辑：处理数据并计算空隙
   */
  renderTimeline(flowList) {
    if (!flowList || flowList.length === 0) return [];

    // 1. 按开始时间排序
    const sortedList = flowList.sort((a, b) =>
      this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime)
    );

    const finalTimeline = [];

    for (let i = 0; i < sortedList.length; i++) {
      const current = sortedList[i];

      // 2. 检查与上一条之间是否有空隙
      if (i > 0) {
        const prev = sortedList[i - 1];
        const prevEnd = this.timeToMinutes(prev.endTime);
        const currStart = this.timeToMinutes(current.startTime);

        // 超过5分钟显示补记
        if (currStart - prevEnd > 5) {
          finalTimeline.push({
            isGap: true,
            startTime: prev.endTimeStr || prev.endTime,
            endTime: current.startTimeStr || current.startTime
          });
        }
      }

      // 3. 放入记录
      finalTimeline.push({
        ...current,
        isGap: false
      });
    }
    return finalTimeline;
  },
  // 点击卡片上的编辑按钮
  onEdit(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.timelineList[index];
    if (item.isGap) return; // 补记不走编辑逻辑

    wx.vibrateShort({ type: 'light' });

    this.setData({
      showModal: true,
      isEditMode: true,
      editingIndex: index,
      startTime: item.startTime,
      endTime: item.endTime,
      textInfo: item.textInfo,
      selectedType: {
        _id: item.typeId,
        name: item.typeName,
        class: item.typeClass,
        color: item.typeColor
      }
    });
  },

  // 弹窗内的删除按钮
  async onDel() {
    const { editingIndex } = this.data;
    wx.showModal({
      title: '删除记录',
      content: '确定要移除这段时光吗？',
      confirmColor: '#f56c6c',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '正在删除...' });
          try {
            const db = wx.cloud.database();
            const todayStr = this.getTodayDateString();
            
            // 从全局数组中移除
            let list = app.globalData.todayFlowList;
            list.splice(editingIndex, 1);

            // 更新数据库
            const dbRes = await db.collection('daysFlow').where({ date: todayStr }).get();
            await db.collection('daysFlow').doc(dbRes.data[0]._id).update({
              data: { flowList: list }
            });

            // 同步本地并重绘
            app.globalData.todayFlowList = list;
            this.refreshTimelineData(); 
            
            wx.hideLoading();
            this.setData({ showModal: false });
          } catch (err) {
            console.error(err);
            wx.hideLoading();
          }
        }
      }
    });
  },
  /**
   * 保存数据
   */
  // 核心：保存数据到云数据库（支持新增和修改双模式）
  async onAddTimeline() {
    const { startTime, endTime, textInfo, selectedType, recordDate, isEditMode, editingIndex } = this.data;

    // 1. 基础校验
    if (!selectedType?._id) {
      return wx.showToast({ title: '请选择分类', icon: 'none' });
    }
    if (!textInfo.trim()) {
      return wx.showToast({ title: '请输入内容', icon: 'none' });
    }

    // 2. 时间计算
    const startM = this.timeToMinutes(startTime);
    const endM = this.timeToMinutes(endTime);
    let duration = endM - startM;
    if (duration < 0) duration += 1440; 

    wx.showLoading({ title: isEditMode ? '正在保存修改...' : '正在存入流光...', mask: true });

    try {
      const db = wx.cloud.database();
      const _ = db.command;
      const targetDate = recordDate || this.getTodayDateString(); 

      const newFlowItem = {
        typeId: selectedType._id,
        typeName: selectedType.name,
        typeClass: selectedType.class,
        typeColor: selectedType.color,
        startTime,
        endTime,
        duration, 
        textInfo: textInfo.trim(),
        createTime: db.serverDate() 
      };

      // 3. 查找该日期文档
      const res = await db.collection('daysFlow').where({
        date: targetDate,
        _openid: '{openid}' 
      }).get();

      // --- 关键：区分模式进行数据库操作 ---
      if (isEditMode) {
        // 【修改模式】
        let allList = app.globalData.todayFlowList || [];
        // 替换掉编辑的那一项
        allList[editingIndex] = newFlowItem;
        
        await db.collection('daysFlow').doc(res.data[0]._id).update({
          data: { flowList: allList } // 整体覆盖更新
        });
        app.globalData.todayFlowList = allList;

      } else {
        // 【新增模式】
        if (res.data.length > 0) {
          await db.collection('daysFlow').doc(res.data[0]._id).update({
            data: { flowList: _.push(newFlowItem) }
          });
        } else {
          await db.collection('daysFlow').add({
            data: {
              date: targetDate,
              createTime: db.serverDate(),
              flowList: [newFlowItem]
            }
          });
        }
        // 更新本地全局变量
        if (!app.globalData.todayFlowList) app.globalData.todayFlowList = [];
        app.globalData.todayFlowList.push(newFlowItem);
      }

      // 4. 立即更新界面：计算统计并重新渲染
      this.calculateStats(app.globalData.todayFlowList);
      const processedList = this.renderTimeline(app.globalData.todayFlowList);
      this.setData({ 
        timelineList: processedList 
      });

      // 5. 视觉反馈
      wx.hideLoading();
      wx.showToast({ title: '已记录', icon: 'success' });
      
      setTimeout(() => {
        this.setData({ 
          showModal: false,
          textInfo: '',
          recordDate: '',
          isEditMode: false,
          editingIndex: -1
        });
      }, 800);

    } catch (err) {
      console.error('保存失败', err);
      wx.hideLoading();
      wx.showToast({ title: '操作失败，请重试', icon: 'none' });
    }
  },

  // 首页快速打卡切换逻辑
  async onToggleStatus(e) {
    let that = this;
    const flagId = e.currentTarget.dataset.id;
    const { checkItems } = this.data;
    const index = checkItems.findIndex(item => item.flagId === flagId);
    
    if (index === -1) return;

    // 1. UI 乐观更新
    const targetItem = checkItems[index];
    const newStatus = !targetItem.isOpen;
    const updateKey = `checkItems[${index}].isOpen`;
    this.setData({ [updateKey]: newStatus });
    
    // 2. 震动反馈
    wx.vibrateShort({ type: 'light' });

    // 3. 同步到云端 (逻辑同 category.js)
    try {
      const db = wx.cloud.database();
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
      
      const res = await db.collection('dayFlags').where({ date: todayStr }).get();
      if (res.data.length > 0) {
        const docId = res.data[0]._id;
        const updatedList = [...this.data.checkItems];
        
        await db.collection('dayFlags').doc(docId).update({
          data: { checkList: updatedList }
        });
        
        // 同步全局，确保分类页数据一致
        app.globalData.todayCheckList = updatedList;
      }
    } catch (err) {
      console.error("更新失败", err);
      that.refreshCheckList(); // 失败则回滚
    }
  },
  toggleInputMode() {
    this.setData({
      inputMode: this.data.inputMode === 'voice' ? 'text' : 'voice'
    });
    wx.vibrateShort({ type: 'light' });
  },

  startRecording() {
    this.setData({ isRecording: true });
    wx.vibrateShort({ type: 'medium' });
  },

  stopRecording() {
    this.setData({ isRecording: false });
  },

  onAddTimelineShow() {
    const now = new Date();
    const lockedDate = this.getTodayDateString();
    this.setData({ showModal: true,isEditMode: false, // 核心：新增模式下不显示删除按钮
      editingIndex: -1,
      textInfo: '', recordDate: lockedDate });
  },

  onGapClick(e) {
    const { start, end } = e.currentTarget.dataset;
    this.setData({
      showModal: true,
      startTime: start,
      endTime: end,
      recordDate: this.getTodayDateString()
    });
    wx.vibrateShort({ type: 'light' });
  },

  refreshCheckList() {
    const allCategories = app.globalData.categories || [];
    const availableCategories = allCategories.filter(item => !item.isHidden);
    const list = app.globalData.todayCheckList || [];
    this.setData({
      today: this.getTodayDateString(),
      categories: availableCategories,
      checkItems: list
    });
  },

  timeToMinutes(t) {
    if (!t) return 0;
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  },

  getTodayDateString() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  },

  toggleTypePicker() { this.setData({ showTypePicker: !this.data.showTypePicker }); },
  selectType(e) {
    this.setData({ selectedType: e.currentTarget.dataset.item, showTypePicker: false });
    wx.vibrateShort({ type: 'light' });
  },
  handleStartTimeChange(e) { this.setData({ startTime: e.detail.value }); },
  handleEndTimeChange(e) { this.setData({ endTime: e.detail.value }); },
  onTextInput(e) { this.setData({ textInfo: e.detail.value }); },
  hideModal() { this.setData({ showModal: false }); },
  toggleInputMode() { 
    this.setData({ inputMode: this.data.inputMode === 'voice' ? 'text' : 'voice' });
    wx.vibrateShort({ type: 'light' });
  }
});