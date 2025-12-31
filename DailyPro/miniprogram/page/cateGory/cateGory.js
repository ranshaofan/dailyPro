// page/cateGory/cateGory.js
const app = getApp();
const db = wx.cloud.database(); // 初始化数据库
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false,
    categoryName: '阅读',
    selectedIcon: 'icon-domain', // 对应你之前的 SVG 类名
    selectedColor: '#E2F0CB',
    icons: [
    ],
    colors: ['#FF8B85', '#FFB380', '#C5E1A5', '#80D8B9', '#5fcaf3', '#fbd151'],
    // categories: [
    //   {
    //     _id: "1",
    //     name: "工作",
    //     color: "#6366f1", // 存储十六进制颜色
    //     class: "icon-book",
    //     count: 423,
    //     isHidden: false
    //   },
    //   {
    //     _id: "2",
    //     name: "运动",
    //     color: "#14b8a6",
    //     class: "icon-sport",
    //     count: 89,
    //     isHidden: false
    //   }
    // ],
    // checkItems: [
    //   { id: '101', name: '情绪', iconName: 'smile', subTitle: '每日记录', isOpen: false },
    //   { id: '102', name: '喝水', iconName: 'moon', subTitle: '每日目标 8 杯', isOpen: true }
    // ],
    isEdit: false,      // 是否为编辑模式
  currentId: '',
  showCheckModal: false,
  isEditCheck: false,
  checkContent: '',
  selectedCheckIcon: 'smile', // 默认选中图片名称
  checkIcons: [
  ],
  categories: [],
  checkItems: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      icons: app.globalData.icons,
      checkIcons: app.globalData.checkIcons
    });

    // 1. 处理分类数据 (categories)
    if (app.globalData.categories && app.globalData.categories.length > 0) {
      this.setData({ categories: app.globalData.categories });
    } else {
      app.categoriesReadyCallback = (data) => {
        this.setData({ categories: data });
      };
    }

    // 2. 处理打卡项目数据 (flags)
    if (app.globalData.flags && app.globalData.flags.length > 0) {
      this.setData({ checkItems: app.globalData.flags });
    } else {
      app.flagsReadyCallback = (data) => {
        this.setData({ checkItems: data });
      };
    }
    // 如果 app.js 已经跑完并拿到了数据
    if (app.globalData.todayCheckList && app.globalData.todayCheckList.length > 0) {
      this.setData({ checkItems: app.globalData.todayCheckList });
    } else {
      // 如果还没拿完，注册一个回调函数给 app.js 调用
      app.todayFlagsReadyCallback = (data) => {
        this.setData({ checkItems: data });
      };
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  // 在 page/category/category.js 中
onShow() {
  // 假设 app.js 已经把今天的数据加载到了 globalData.todayCheckList
  const todayList = getApp().globalData.todayCheckList || [];
  this.setData({
    checkItems: todayList 
  });
},
  async initTodayData() {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    
    await wx.cloud.callFunction({
      name: 'initDailyFlags',
      data: { todayStr }
    });
    // 之后执行查询 dayflags 的逻辑渲染页面
  },
  newFlag() {
    // 1. 触感反馈（可选，增加交互精致感）
    if (wx.vibrateShort) {
      wx.vibrateShort({ type: 'light' });
    }
  
    // 2. 初始化弹窗数据
    this.setData({
      showCheckModal: true,      // 显示弹窗
      isEditCheck: false,       // 明确为“新增”模式，隐藏删除按钮
      currentCheckId: '',       // 清空当前编辑ID
      
      // 重置表单内容
      checkContent: '',         
      
      // 设置一个默认的初始图标（建议取 checkIcons 数组的第一项）
      selectedCheckIcon: this.data.checkIcons && this.data.checkIcons.length > 0 
                         ? this.data.checkIcons[0] 
                         : './resources/icon/default_check.png' 
    });
  },
  
  // 顺便补全取消函数，确保点击“取消”或背景时能正常关闭
  onCheckCancel() {
    this.setData({
      showCheckModal: false
    });
  },
  async onCheckSave() {
    const { checkContent, selectedCheckIcon, isEditCheck, currentEditId } = this.data;
    const trimmedName = checkContent.trim();
    if (!trimmedName) return wx.showToast({ title: '请输入名称', icon: 'none' });
  
    wx.showLoading({ title: '保存中...' });
    const db = wx.cloud.database();
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  
    try {
      let flagId = currentEditId;
      
      // --- 1. 处理 flags 集合 (模板层) ---
      if (isEditCheck) {
        // 编辑模式
        await db.collection('flags').doc(flagId).update({
          data: { name: trimmedName, iconName: selectedCheckIcon, updateTime: db.serverDate() }
        });
      } else {
        // 新增模式：检查是否有 status:false 的同名项
        const existRes = await db.collection('flags').where({ name: trimmedName }).get();
        
        if (existRes.data.length > 0) {
          flagId = existRes.data[0]._id;
          await db.collection('flags').doc(flagId).update({
            data: { status: true, iconName: selectedCheckIcon, updateTime: db.serverDate() }
          });
        } else {
          const res = await db.collection('flags').add({
            data: { 
              name: trimmedName, iconName: selectedCheckIcon, 
              status: true, isOpen: true, createTime: db.serverDate() 
            }
          });
          flagId = res._id;
        }
      }
  
      // --- 2. 处理 dayFlags 集合 (实例层：仅限今天) ---
      const dayRes = await db.collection('dayFlags').where({ date: todayStr }).get();
      if (dayRes.data.length > 0) {
        const dayDoc = dayRes.data[0];
        let list = dayDoc.checkList || [];
        
        if (isEditCheck) {
          // 更新今天列表里的这一项
          list = list.map(item => item.flagId === flagId ? 
            { ...item, name: trimmedName, iconName: selectedCheckIcon } : item);
        } else {
          // 如果今天还没这项，则添加
          if (!list.some(item => item.flagId === flagId)) {
            list.push({ flagId, name: trimmedName, iconName: selectedCheckIcon, isCompleted: false });
          }
        }
        
        await db.collection('dayFlags').doc(dayDoc._id).update({ data: { checkList: list } });
        
        // 更新本地和全局 UI (以 dayFlags 的内容为准渲染列表)
        this.setData({ checkItems: list });
        getApp().globalData.todayCheckList = list; // 假设你在全局存了这个
      }
  
      this.setData({ showCheckModal: false });
      wx.hideLoading();
      wx.showToast({ title: '保存成功' });
    } catch (e) {
      console.error(e);
      wx.hideLoading();
    }
  },
  onCheckEdit(e) {
    const id = e.currentTarget.dataset.id; // 这里的 id 是 WXML 传来的 item.flagId
    
    // 修改查找逻辑：通过 flagId 在本地列表中找到对应项
    const target = this.data.checkItems.find(item => item.flagId === id);
  
    if (!target) {
      console.error('未找到对应打卡项');
      return;
    }
  
    this.setData({
      showCheckModal: true,      
      isEditCheck: true,         
      currentEditId: id,          // 此时存入的是 flagId
      checkContent: target.name,  
      selectedCheckIcon: target.iconName 
    });
  },
  async onDeleteCheck() {
    const { currentEditId } = this.data; // 这里的 ID 已经在 onCheckEdit 中设为 flagId 了
    
    if (!currentEditId) return;
  
    wx.showModal({
      title: '确认删除',
      content: '删除后，今日清单将不再显示该项，历史记录将保留。',
      confirmColor: '#ff4d4f',
      success: async (res) => {
        if (!res.confirm) return;
        
        wx.showLoading({ title: '删除中...' });
        const db = wx.cloud.database();
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  
        try {
          // 1. 逻辑删除模板 (flags 集合)
          // 注意：flags 集合记录的 _id 恰好就是我们这里的 flagId (即 currentEditId)
          await db.collection('flags').doc(currentEditId).update({
            data: { 
              status: false, 
              deleteTime: db.serverDate() 
            }
          });
  
          // 2. 从今日实例数组中移除 (dayFlags 集合)
          const dayRes = await db.collection('dayFlags').where({ date: todayStr }).get();
          
          if (dayRes.data.length > 0) {
            const dayDoc = dayRes.data[0];
            
            // --- 关键：使用 flagId 进行过滤，剔除被删除的这一项 ---
            const newList = dayDoc.checkList.filter(item => item.flagId !== currentEditId);
            
            // 更新云端今日记录
            await db.collection('dayFlags').doc(dayDoc._id).update({
              data: { checkList: newList }
            });
            
            // 3. 实时同步本地 UI 和全局变量
            this.setData({ 
              checkItems: newList, 
              showCheckModal: false 
            });
            getApp().globalData.todayCheckList = newList;
          }
          
          wx.hideLoading();
          wx.showToast({ title: '已删除', icon: 'success' });
          
        } catch (e) {
          console.error("删除操作失败：", e);
          wx.hideLoading();
          wx.showToast({ title: '删除失败', icon: 'none' });
        }
      }
    });
  },
  
  // 输入框内容同步
  onInputContent(e) {
    this.setData({
      checkContent: e.detail.value
    });
  },
  
  selectCheckIcon(e) {
    this.setData({ selectedCheckIcon: e.currentTarget.dataset.url });
  },
  newCategory() {
    this.setData({
      show: true,
      isEdit: false,
      categoryName: '',
      selectedIcon: 'icon-domain',
      selectedColor: '#E2F0CB',
      currentId: ''
    });
  },
  
  // 2. 点击分类卡片上的“编辑”图标
  onEdit(e) {
    const id = e.currentTarget.dataset.id;
    const category = this.data.categories.find(item => item._id === id);
    
    // 1. 检查分类是否存在
    if (!category) return;
  
    // 2. 核心逻辑：如果已隐藏（isHidden 为 true），则禁止编辑
    if (category.isHidden) {
      wx.showToast({
        title: '已隐藏的分类无法编辑',
        icon: 'none',
        duration: 2000
      });
      return; // 直接返回，不执行后面的 setData
    }
    
    // 3. 只有未隐藏的状态才会执行弹窗逻辑
    this.setData({
      show: true,
      isEdit: true,
      currentId: id,
      categoryName: category.name,
      selectedIcon: category.class,
      selectedColor: category.color
    });
  },
  
  // 3. 删除函数
  async onDelete() {
    const id = this.data.currentId;
    wx.showModal({
      title: '确认删除',
      content: '删除分类后，已有的记录仍会保留该分类标签，但无法再新增该分类的项目。',
      confirmColor: '#ff4d4f',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          try {
            await db.collection('types').doc(id).update({
              data: { 
                status: false, // 逻辑删除标记
                deleteTime: db.serverDate() 
              }
            });
            
            const updatedList = this.data.categories.filter(item => item._id !== id);
            this.setData({ categories: updatedList, show: false });
            app.globalData.categories = updatedList;
  
            wx.hideLoading();
            wx.showToast({ title: '已删除' });
          } catch (err) {
            wx.hideLoading();
            wx.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  },
  selectIcon(e) {
    this.setData({ selectedIcon: e.currentTarget.dataset.icon });
  },
  
  selectColor(e) {
    this.setData({ selectedColor: e.currentTarget.dataset.color });
  },
  
  onCancel() {
    this.setData({ show: false });
  },
  // 清除输入框内容
  onClear() {
    this.setData({
      categoryName: ''
    });
  },

  // 监听输入框变化 (确保 data 同步，否则无法保存最新值)
  onInputName(e) {
    this.setData({
      categoryName: e.detail.value
    });
  },

  // 保存分类
  async onSave() {
    const { 
      categoryName, 
      selectedColor, 
      selectedIcon, 
      categories, 
      isEdit, 
      currentId 
    } = this.data;
    const app = getApp();
  
    // 1. 校验输入
    const trimmedName = categoryName.trim();
    if (!trimmedName) {
      wx.showToast({ title: '请输入名称', icon: 'none' });
      return;
    }
  
    wx.showLoading({ title: '保存中...' });
  
    try {
      let updatedList = [...categories];
  
      if (isEdit) {
        // --- A. 编辑模式 ---
        // 检查是否与其他【活着的】分类重名
        const isDuplicate = categories.some(c => c.name === trimmedName && c._id !== currentId);
        if (isDuplicate) {
          wx.hideLoading();
          wx.showToast({ title: '分类名称已存在', icon: 'none' });
          return;
        }
  
        const updateData = {
          name: trimmedName,
          color: selectedColor,
          class: selectedIcon,
          updateTime: db.serverDate(),
          status: true // 确保编辑保存后是激活状态
        };
  
        await db.collection('types').doc(currentId).update({ data: updateData });
  
        // 同步本地列表
        updatedList = categories.map(item => {
          if (item._id === currentId) {
            return { ...item, ...updateData, updateTime: new Date() };
          }
          return item;
        });
  
      } else {
        // --- B. 新增模式 (包含复活逻辑) ---
        // 1. 检查当前显示的列表是否有重名
        if (categories.some(c => c.name === trimmedName)) {
          wx.hideLoading();
          wx.showToast({ title: '分类名称已存在', icon: 'none' });
          return;
        }
  
        // 2. 检查数据库中是否存在 status: false 的同名分类
        const existRes = await db.collection('types').where({
          name: trimmedName,
          status: false
        }).get();
  
        if (existRes.data.length > 0) {
          // --- 逻辑复活 ---
          const oldId = existRes.data[0]._id;
          const reviveData = {
            color: selectedColor,
            class: selectedIcon,
            status: true, // 重新激活
            updateTime: db.serverDate()
          };
  
          await db.collection('types').doc(oldId).update({ data: reviveData });
          
          // 将复活的项加入本地列表
          updatedList.push({ 
            ...existRes.data[0], 
            ...reviveData, 
            updateTime: new Date() 
          });
  
        } else {
          // --- 真正的新增 ---
          const newCategory = {
            name: trimmedName,
            color: selectedColor,
            class: selectedIcon,
            status: true, // 初始状态为 true
            isHidden: false,
            count: 0,
            createTime: db.serverDate()
          };
  
          const addRes = await db.collection('types').add({ data: newCategory });
          updatedList.push({ ...newCategory, _id: addRes._id, createTime: new Date() });
        }
      }
  
      // 3. 统一更新页面渲染和全局数据
      this.setData({
        categories: updatedList,
        show: false,
        categoryName: '',
        selectedIcon: 'icon-domain',
        selectedColor: '#E2F0CB',
        isEdit: false,
        currentId: ''
      });
  
      app.globalData.categories = updatedList;
  
      wx.hideLoading();
      wx.showToast({ 
        title: isEdit ? '修改成功' : '保存成功', 
        icon: 'success' 
      });
  
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '保存失败', icon: 'none' });
      console.error('保存操作失败：', err);
    }
  },
  
  // 防止冒泡（点击弹窗内容不关闭弹窗）
  preventBubble() {
    return;
  },
 // 之前的 toggleStatus 函数也需要同步更新 globalData
  async toggleStatus(e) {
    const id = e.currentTarget.dataset.id;
    const { categories } = this.data;
    const index = categories.findIndex(item => item._id === id);
    if (index === -1) return;

    const newStatus = !categories[index].isHidden;
    
    // 更新本地
    const updateKey = `categories[${index}].isHidden`;
    this.setData({ [updateKey]: newStatus });

    // 同步更新全局 globalData 保证一致性
    app.globalData.categories[index].isHidden = newStatus;

    // 更新云端
    const db = wx.cloud.database();
    try {
      await db.collection('types').doc(id).update({
        data: { isHidden: newStatus }
      });
    } catch (err) {
      wx.showToast({ title: '更新失败', icon: 'none' });
    }
  },

  /**
   * 2. 切换“今日打卡内容”的开启/关闭状态 (滑动开关)
   */
  // page/cateGory/cateGory.js

  async onToggleCheck(e) {
    const flagId = e.currentTarget.dataset.id; // 这里的 id 是 flags 集合的长 ID
    const { checkItems } = this.data;
    const index = checkItems.findIndex(item => item.flagId === flagId);

    if (index === -1) return;

    // 1. 触感反馈
    wx.vibrateShort({ type: 'light' });

    // 2. 准备更新后的状态
    const newStatus = !checkItems[index].isOpen; // 假设页面上用的是 isOpen 字段控制开关
    const updateKey = `checkItems[${index}].isOpen`;

    // 3. 乐观 UI 更新：先让用户看到开关动了
    this.setData({ [updateKey]: newStatus });

    try {
      const db = wx.cloud.database();
      const _ = db.command;
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

      // 4. 云端更新：定位到今日记录，并修改 checkList 数组中对应 flagId 的项
      // 使用查询条件定位记录，然后使用 'checkList.index.isOpen' 的方式更新（如果云端支持）
      // 或者直接全量更新 checkList（最稳妥）
      
      const dayRes = await db.collection('dayFlags').where({ date: todayStr }).get();
      if (dayRes.data.length > 0) {
        const docId = dayRes.data[0]._id;
        const updatedList = [...this.data.checkItems];
        
        await db.collection('dayFlags').doc(docId).update({
          data: {
            checkList: updatedList
          }
        });

        // 5. 同步全局数据
        getApp().globalData.todayCheckList = updatedList;
        
        wx.showToast({ 
          title: newStatus ? '已开启' : '已关闭', 
          icon: 'none' 
        });
      }
    } catch (err) {
      console.error('切换状态失败', err);
      // 失败回滚
      this.setData({ [updateKey]: !newStatus });
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})