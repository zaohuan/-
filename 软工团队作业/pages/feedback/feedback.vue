<template>
	<view class="feedback">
		<view class="header">
			<view class="back-icon" @click="goBack">
				<image src="/static/icons/back.png" mode="widthFix"></image>
			</view>
			<text class="title">在线客服</text>
		</view>

		<scroll-view class="chat-container" scroll-y>
			<view class="chat-list">
				<view class="chat-item" v-for="(msg, index) in chatMessages" :key="index" :class="msg.type">
					<image class="avatar" :src="msg.type === 'received' ? '/static/icons/customer-service.png' : '/static/icons/user-avatar.png'"></image>
					<view class="message">{{msg.content}}</view>
				</view>
			</view>
		</scroll-view>

		<!-- 评价区域 -->
		<view class="rating-section" v-if="showRating">
			<view class="rating-title">您对客服服务满意吗</view>
			<view class="rating-options">
				<view class="rating-item" v-for="(item, index) in ratingOptions" :key="index" @click="selectRating(index)">
					<image :src="item.icon" mode="widthFix"></image>
					<text :class="{ active: selectedRating === index }">{{item.label}}</text>
				</view>
			</view>
		</view>

		<!-- 底部操作区 -->
		<view class="bottom-area">
			<view class="action-buttons" v-if="!showRating">
				<view class="action-btn" @click="toggleRating">
					<image src="/static/icons/rating.png" mode="widthFix"></image>
					<text>评价客服</text>
				</view>
				<view class="action-btn" @click="makePhoneCall">
					<image src="/static/icons/phone-call.png" mode="widthFix"></image>
					<text>电话咨询</text>
				</view>
			</view>
			
			<view class="input-area">
				<input type="text" v-model="messageInput" placeholder="输入问题"/>
				<button @click="sendMessage">发送</button>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				messageInput: '',
				chatMessages: [
					{
						type: 'received',
						content: '您好，我是智能客服助手，很高兴为您服务！'
					}
				],
				showRating: false,
				selectedRating: -1,
				ratingOptions: [
					{ label: '很不满', icon: '/static/icons/rating-1.png' },
					{ label: '不满', icon: '/static/icons/rating-2.png' },
					{ label: '一般', icon: '/static/icons/rating-3.png' },
					{ label: '满意', icon: '/static/icons/rating-4.png' },
					{ label: '很满意', icon: '/static/icons/rating-5.png' }
				]
			}
		},
		methods: {
			goBack() {
				uni.navigateBack()
			},
			sendMessage() {
				if (!this.messageInput.trim()) return
				
				this.chatMessages.push({
					type: 'sent',
					content: this.messageInput
				})
				
				setTimeout(() => {
					this.chatMessages.push({
						type: 'received',
						content: '您的问题已收到，请稍候...'
					})
				}, 500)
				
				this.messageInput = ''
			},
			toggleRating() {
				this.showRating = !this.showRating
			},
			selectRating(index) {
				this.selectedRating = index
				setTimeout(() => {
					this.showRating = false
					uni.showToast({
						title: '感谢您的评价',
						icon: 'success'
					})
				}, 500)
			},
			makePhoneCall() {
				uni.makePhoneCall({
					phoneNumber: '400-XXX-XXXX'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
.feedback {
	min-height: 100vh;
	background-color: #f5f5f5;
	display: flex;
	flex-direction: column;

	.header {
		background-color: #1890ff;
		padding: 40rpx 20rpx;
		display: flex;
		align-items: center;
		color: #fff;
		
		.back-icon {
			width: 40rpx;
			height: 40rpx;
			margin-right: 20rpx;
			
			image {
				width: 100%;
				height: 100%;
			}
		}
		
		.title {
			font-size: 32rpx;
			font-weight: 500;
		}
	}

	.chat-container {
		flex: 1;
		padding: 20rpx;
		
		.chat-item {
			display: flex;
			margin-bottom: 20rpx;
			
			&.received {
				flex-direction: row;
			}
			
			&.sent {
				flex-direction: row-reverse;
			}
			
			.avatar {
				width: 80rpx;
				height: 80rpx;
				border-radius: 50%;
			}
			
			.message {
				max-width: 70%;
				margin: 0 20rpx;
				padding: 20rpx;
				border-radius: 10rpx;
				background-color: #fff;
				word-break: break-all;
			}
			
			&.sent .message {
				background-color: #1890ff;
				color: #fff;
			}
		}
	}

	.rating-section {
		background-color: #fff;
		padding: 20rpx;
		
		.rating-title {
			text-align: center;
			font-size: 28rpx;
			color: #333;
			margin-bottom: 20rpx;
		}
		
		.rating-options {
			display: flex;
			justify-content: space-around;
			
			.rating-item {
				display: flex;
				flex-direction: column;
				align-items: center;
				
				image {
					width: 60rpx;
					height: 60rpx;
					margin-bottom: 10rpx;
				}
				
				text {
					font-size: 24rpx;
					color: #666;
					
					&.active {
						color: #1890ff;
					}
				}
			}
		}
	}

	.bottom-area {
		background-color: #fff;
		
		.action-buttons {
			display: flex;
			padding: 20rpx;
			border-bottom: 1rpx solid #eee;
			
			.action-btn {
				flex: 1;
				display: flex;
				align-items: center;
				justify-content: center;
				
				image {
					width: 40rpx;
					height: 40rpx;
					margin-right: 10rpx;
				}
				
				text {
					font-size: 28rpx;
					color: #666;
				}
			}
		}
		
		.input-area {
			padding: 20rpx;
			display: flex;
			align-items: center;
			
			input {
				flex: 1;
				height: 80rpx;
				background-color: #f5f5f5;
				border-radius: 40rpx;
				padding: 0 30rpx;
				margin-right: 20rpx;
			}
			
			button {
				width: 160rpx;
				height: 80rpx;
				line-height: 80rpx;
				background-color: #1890ff;
				color: #fff;
				border-radius: 40rpx;
				font-size: 28rpx;
			}
		}
	}
}
</style>
