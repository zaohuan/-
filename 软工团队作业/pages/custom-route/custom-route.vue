<template>
  <view class="container">
    <view class="form-container">
      <!-- 旅游计划输入区域 -->
      <view class="form-title">请填写您的旅游计划</view>

      <!-- 目的地 -->
      <view class="form-item">
        <text class="label">目的地：</text>
        <input type="text" placeholder="如福建省福州市鼓楼区，仅限国内" v-model="formData.destination" />
      </view>

      <!-- 时间选择 -->
      <view class="form-item">
        <text class="label">时间：</text>
        <view class="date-picker">
          <input type="text" placeholder="如2024/10/25" v-model="formData.startDate" />
          <text class="separator">至</text>
          <input type="text" placeholder="如2024/11/04" v-model="formData.endDate" />
        </view>
      </view>

      <!-- 预算 -->
      <view class="form-item">
        <text class="label">预算：</text>
        <view class="budget-input">
          <input type="number" placeholder="请输入数字" v-model="formData.budgetMin" />
          <text class="separator">—</text>
          <input type="number" placeholder="请输入数字" v-model="formData.budgetMax" />
          <text>元</text>
        </view>
      </view>

      <!-- 特殊需求选项 -->
      <view class="form-title sub">请勾选您对旅游景点的要求</view>
      
      <view class="checkbox-group">
        <view class="checkbox-item">
          <text>无障碍设施：</text>
          <radio-group v-model="formData.accessibility">
            <radio value="yes">是</radio>
            <radio value="no">否</radio>
          </radio-group>
        </view>

        <view class="checkbox-item">
          <text>亲子友好：</text>
          <radio-group v-model="formData.familyFriendly">
            <radio value="yes">是</radio>
            <radio value="no">否</radio>
          </radio-group>
        </view>

        <view class="checkbox-item">
          <text>宠物友好：</text>
          <radio-group v-model="formData.petFriendly">
            <radio value="yes">是</radio>
            <radio value="no">否</radio>
          </radio-group>
        </view>
      </view>

      <!-- 个性需求输入区域 -->
      <view class="form-title sub">请填写您对旅游景点的个性需求</view>
      <view class="requirement-section">
        <view class="form-item">
          <text class="required">*</text>
          <text>自然景观：</text>
          <input type="text" placeholder="如草原/海滩/雪山" v-model="formData.naturalScenery" />
        </view>

        <view class="form-item">
          <text class="required">*</text>
          <text>社会景观：</text>
          <input type="text" placeholder="如纪念馆/博物馆/科技馆" v-model="formData.culturalSites" />
        </view>

        <view class="form-item">
          <text class="required">*</text>
          <text>周边饮食：</text>
          <input type="text" placeholder="如闽菜/川菜/粤菜" v-model="formData.food" />
        </view>

        <view class="form-item">
          <text class="required">*</text>
          <text>其余需求：</text>
          <input type="text" placeholder="填写对景点的其余需求" v-model="formData.otherRequirements" />
        </view>
      </view>

      <!-- 提交按钮 -->
      <button class="submit-btn" @click="submitForm">
        提交
        <text class="btn-sub">获得景点推荐</text>
      </button>
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue'

export default defineComponent({
  setup() {
    const formData = reactive({
      destination: '',
      startDate: '',
      endDate: '',
      budgetMin: '',
      budgetMax: '',
      accessibility: 'no',
      familyFriendly: 'no',
      petFriendly: 'no',
      naturalScenery: '',
      culturalSites: '',
      food: '',
      otherRequirements: ''
    })

    const submitForm = () => {
      console.log('提交的表单数据：', formData)
      // 这里添加表单提交逻辑
    }

    return {
      formData,
      submitForm
    }
  }
})
</script>

<style scoped>
.container {
  padding: 20px;
  background-color: #f5f5f5;
}

.form-container {
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
}

.form-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 20px;
}

.form-title.sub {
  margin-top: 20px;
}

.form-item {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.label {
  width: 80px;
  flex-shrink: 0;
}

input {
  flex: 1;
  border: 1px solid #ddd;
  padding: 8px;
  border-radius: 4px;
}

.date-picker {
  display: flex;
  align-items: center;
  gap: 10px;
}

.budget-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

.separator {
  color: #666;
}

.checkbox-group {
  margin: 15px 0;
}

.checkbox-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

radio-group {
  display: flex;
  gap: 20px;
}

.required {
  color: #ff4d4f;
  margin-right: 5px;
}

.requirement-section {
  margin-top: 15px;
}

.submit-btn {
  margin-top: 30px;
  width: 100%;
  background-color: #007AFF;
  color: white;
  border: none;
  padding: 15px;
  border-radius: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.btn-sub {
  font-size: 12px;
  margin-top: 5px;
}
</style>