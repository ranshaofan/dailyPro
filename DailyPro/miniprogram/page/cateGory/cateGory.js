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
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.initTodayData();
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
  // 1. 保存/新增打卡项到 flags 集合
  async onCheckSave() {
    const { checkContent, selectedCheckIcon, isEditCheck, currentEditId, checkItems } = this.data;
    const trimmedName = checkContent.trim();
  
    // 1. 基础验证
    if (!trimmedName) {
      wx.showToast({ title: '请输入名称', icon: 'none' });
      return;
    }
  
    // 2. 重名校验
    const isDuplicate = checkItems.some(item => {
      if (isEditCheck) {
        return item.name === trimmedName && item._id !== currentEditId;
      } else {
        return item.name === trimmedName;
      }
    });
  
    if (isDuplicate) {
      wx.showToast({ title: '当前已有同名打卡项', icon: 'none' });
      return;
    }
  
    wx.showLoading({ title: '保存中...' });
  
    try {
      const db = wx.cloud.database();
      const _ = db.command;
      let updatedCheckItems = [...checkItems];
      let targetId = currentEditId;
  
      // --- A. 更新/新增 flags 集合 ---
      if (isEditCheck) {
        await db.collection('flags').doc(currentEditId).update({
          data: {
            name: trimmedName,
            iconName: selectedCheckIcon,
            updateTime: db.serverDate(),
            status: true
          }
        });
        updatedCheckItems = updatedCheckItems.map(item =>
          item._id === currentEditId ? { ...item, name: trimmedName, iconName: selectedCheckIcon } : item
        );
      } else {
        const existRes = await db.collection('flags').where({
          name: trimmedName,
          status: false
        }).get();
  
        if (existRes.data.length > 0) {
          targetId = existRes.data[0]._id;
          await db.collection('flags').doc(targetId).update({
            data: { iconName: selectedCheckIcon, status: true, updateTime: db.serverDate() }
          });
          updatedCheckItems.push({ ...existRes.data[0], _id: targetId, name: trimmedName, iconName: selectedCheckIcon, status: true });
        } else {
          const newData = {
            name: trimmedName,
            iconName: selectedCheckIcon,
            status: true,
            isOpen: true, // 默认开启
            createTime: db.serverDate()
          };
          const res = await db.collection('flags').add({ data: newData });
          targetId = res._id;
          updatedCheckItems.push({ ...newData, _id: targetId });
        }
      }
  
      // --- B. 同步更新 dayFlags 集合（仅限今天） ---
      const now = new Date();
      // 保持和你 initTodayData 一致的日期格式: YYYY-M-D
      const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  
      const dayRecordRes = await db.collection('dayFlags').where({
        date: todayStr
      }).get();
  
      if (dayRecordRes.data.length > 0) {
        const todayDoc = dayRecordRes.data[0];
        let newCheckList = [...(todayDoc.checkList || [])];
  
        if (isEditCheck) {
          // 编辑：更新今日记录中的名称和图标
          newCheckList = newCheckList.map(item => 
            item.flagId === targetId ? { ...item, name: trimmedName, iconName: selectedCheckIcon } : item
          );
        } else {
          // 新增：如果今日记录里还没这项，就加进去
          const hasTask = newCheckList.some(item => item.flagId === targetId);
          if (!hasTask) {
            newCheckList.push({
              flagId: targetId,
              name: trimmedName,
              iconName: selectedCheckIcon,
              isCompleted: false
            });
          }
        }
  
        // 更新到云端 dayFlags
        await db.collection('dayFlags').doc(todayDoc._id).update({
          data: { checkList: newCheckList }
        });
      }
  
      // --- C. 统一同步全局和本地 ---
      this.setData({
        checkItems: updatedCheckItems,
        showCheckModal: false
      });
      getApp().globalData.flags = updatedCheckItems;
  
      wx.hideLoading();
      wx.showToast({ title: '保存成功' });
  
    } catch (e) {
      wx.hideLoading();
      console.error('保存失败：', e);
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },
  onCheckEdit(e) {
    const id = e.currentTarget.dataset.id;
    console.log('当前点击的ID:', id); // 调试用
    
    const target = this.data.checkItems.find(item => item._id === id);
    console.log('找到的目标对象:', target); // 调试用
  
    if (!target) {
      console.error('未找到对应打卡项，请检查 data-id 是否正确');
      return;
    }
  
    this.setData({
      showCheckModal: true,      
      isEditCheck: true,         
      currentEditId: id,         
      checkContent: target.name,  
      selectedCheckIcon: target.iconName 
    });
  },
  async onDeleteCheck() {
    const { currentEditId, checkItems } = this.data;
    const app = getApp();
  
    wx.showModal({
      title: '确认删除',
      content: '删除后，该项将不再出现在打卡清单中。',
      confirmColor: '#ff4d4f',
      confirmText: '删除',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '正在处理...' });
  
          try {
            const db = wx.cloud.database();
            
            // --- 核心修改：逻辑删除 ---
            await db.collection('flags').doc(currentEditId).update({
              data: {
                status: false, // 标记为不可见/已停用
                deleteTime: db.serverDate() // 记录删除时间备查
              }
            });
  
            // 从本地当前显示的列表中移除这一项
            const updatedList = checkItems.filter(item => item._id !== currentEditId);
            
            this.setData({
              checkItems: updatedList,
              showCheckModal: false
            });
  
            // 同步更新全局变量
            app.globalData.flags = updatedList;
  
            wx.hideLoading();
            wx.showToast({ title: '已成功删除', icon: 'success' });
  
          } catch (e) {
            wx.hideLoading();
            console.error('逻辑删除失败：', e);
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
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
  async onToggleCheck(e) {
    const id = e.currentTarget.dataset.id; // 这里现在拿到的是 _id
    const { checkItems } = this.data;
    
    // 核心修复：使用 _id 进行匹配
    const index = checkItems.findIndex(item => item._id === id);
  
    if (index === -1) {
      console.error('未找到对应的打卡项，传入ID为:', id);
      return;
    }
  
    // 触感反馈
    wx.vibrateShort({ type: 'medium' });
  
    // 切换后的状态
    const newOpenStatus = !checkItems[index].isOpen;
    const updateKey = `checkItems[${index}].isOpen`;
  
    // 1. 先更新本地 UI，提升响应速度
    this.setData({ [updateKey]: newOpenStatus });
  
    try {
      const db = wx.cloud.database();
      // 2. 同步更新云端数据库 flags 集合
      // 这里的 isOpen 字段名建议和你数据库保持一致，
      // 如果数据库里叫 status，这里请改为 status
      await db.collection('flags').doc(id).update({
        data: {
          isOpen: newOpenStatus 
        }
      });
  
      // 3. 同步更新全局数据
      getApp().globalData.flags = this.data.checkItems;
  
      wx.showToast({
        title: newOpenStatus ? '已开启打卡' : '已关闭打卡',
        icon: 'none',
        duration: 1000
      });
    } catch (err) {
      console.error('更新开关状态失败:', err);
      // 如果失败，回滚本地状态
      this.setData({ [updateKey]: !newOpenStatus });
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