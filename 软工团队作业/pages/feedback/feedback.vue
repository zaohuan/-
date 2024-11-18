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

<script lang="ts">
import { defineComponent } from 'vue'
import { 
  ChatMessage, 
  ChatHistory, 
  WenxinRequestParams, 
  WenxinResponse,
  ServiceConfig,
  AccessTokenResponse 
} from '@/types/feedback'

export default defineComponent({
	data() {
		return {
			messageInput: '',
			chatMessages: [] as ChatMessage[],
			showRating: false,
			selectedRating: -1,
			ratingOptions: [
				{ label: '很不满', icon: '/static/icons/rating-1.png' },
				{ label: '不满', icon: '/static/icons/rating-2.png' },
				{ label: '一般', icon: '/static/icons/rating-3.png' },
				{ label: '满意', icon: '/static/icons/rating-4.png' },
				{ label: '很满意', icon: '/static/icons/rating-5.png' }
			],
			wenxinConfig: {
				systemPrompt: '你是一个专业的客服助手，擅长解答用户问题。请用简洁友善的语气回答。',
				maxHistoryLength: 10,
				temperature: 0.7,
				top_p: 0.8
			} as ServiceConfig,
			sessionInfo: {
				sessionId: '',
				userId: '',
				chatHistory: [] as ChatHistory['messages']
			}
		}
	},
	methods: {
		goBack() {
			uni.navigateBack()
		},
		async sendToWenxin(userMessage: string): Promise<WenxinResponse> {
			//该方法用于发送用户消息到文心一言API
			const params: WenxinRequestParams = {
				messages: [
					{
						role: 'user',
						content: userMessage
					},
					...this.sessionInfo.chatHistory
				],
				temperature: this.wenxinConfig.temperature,
				top_p: this.wenxinConfig.top_p,
				user_id: this.sessionInfo.userId,
			}
			
			// 实际API调用部分需要在后端实现
			return uniCloud.callFunction({
				name: 'sendToWenXin', // 云函数名称
				data: {
					accessToken: this.wenxinConfig.accessToken, // 替换为实际 Access Token
					params: params,
				},
				success: (res) => {
					if (res.result) {
						console.log('云函数返回:', res.result);

						if (res.result.data && res.result.data.result) {
							console.log('文心一言返回数据:', res.result.data.result);
						} else {
							console.error('文心一言响应结构不符合预期:', res.result.data);
						}
					} else {
						console.error('云函数未返回预期结果:', res);
					}
				},
				fail: (err) => {
					console.error('云函数调用失败:', err);
				},
			});
		},
		async sendMessage() {
			//该方法用于处理用户消息的发送
			if (!this.messageInput.trim()) return;
			
			const userMessage: ChatMessage = {
				type: 'sent',
				content: this.messageInput,
				timestamp: Date.now(),
				messageId: Math.random().toString(36).substring(2)
			};
			this.chatMessages.push(userMessage);
			
			this.sessionInfo.chatHistory.push({
				role: 'user',
				content: this.messageInput
			});
			
			this.messageInput = '';
			
			const loadingMessage: ChatMessage = {
				type: 'received',
				content: '正在思考中...',
				timestamp: Date.now(),
				messageId: Math.random().toString(36).substring(2)
			};
			this.chatMessages.push(loadingMessage);
			
			const aiResponse = await this.sendToWenxin(userMessage.content);
			
			this.sessionInfo.chatHistory.push({
				role: 'assistant',
				content: aiResponse.result
			});
			
			this.chatMessages.pop();
			const aiResponseMessage: ChatMessage = {
				type: 'received',
				content: aiResponse.result,
				timestamp: Date.now(),
				messageId: Math.random().toString(36).substring(2)
			};
			this.chatMessages.push(aiResponseMessage);
			
			if (this.sessionInfo.chatHistory.length > this.wenxinConfig.maxHistoryLength) {
				this.sessionInfo.chatHistory = this.sessionInfo.chatHistory.slice(-this.wenxinConfig.maxHistoryLength);
			}
		},
		toggleRating() {
			//控制评分界面的显示和隐藏
			this.showRating = !this.showRating
		},
		selectRating(index: number) {
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
			//用于发起电话拨打
			uni.makePhoneCall({
				phoneNumber: '400-XXX-XXXX'
			})
		},
		async getAccessToken() {
		    try {
				uniCloud.callFunction({
				    name: 'getAccessToken', // 云函数的名称
				    data: {}, // 如果需要传参，则在此传递
				    success: (res) => {
				        if (res.result && res.result.data.access_token) {
				            console.log('Access Token:', res.result.data.access_token);
				            // 处理 access_token，例如保存到前端变量中
							this.wenxinConfig.accessToken = res.result.data.access_token;
				        } else {
				            console.error('获取 Access Token 失败:', res.result.error);
				        }
				    },
				    fail: (err) => {
				        console.error('云函数调用失败:', err);
				    },
				});
		    } catch (error) {
		        console.error('请求失败:', error);
		        uni.showToast({
		            title: `请求失败: ${error}`,
		            icon: 'none'
		        });
		    }
		}
	},
	created() {
		//在组件创建时调用 getAccessToken() 方法，获取并设置 access_token
		this.getAccessToken();
	}
})
function wenxinApiCall(_params: WenxinRequestParams): WenxinResponse | PromiseLike<WenxinResponse> {
	throw new Error('Function not implemented.')
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
