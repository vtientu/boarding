import { io } from 'socket.io-client';

class SocketClient {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
    }

    // Kết nối tới server socket
    connect(token) {
        this.socket = io("http://localhost:3000", {
            auth: { token },
        });

        // Xử lý các sự kiện cơ bản
        this.socket.on("connect", () => {
            console.log("Connected to socket server with socket id:", this.socket.id);
        });

        this.socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error.message);
        });

        // Lắng nghe trạng thái người dùng
        this.socket.on("user_status", (data) => {
            if (this.listeners.has("user_status")) {
                this.listeners.get("user_status")(data);
            }
        });

        // Lắng nghe tin nhắn mới
        this.socket.on("receive_message", (message) => {
            if (this.listeners.has("receive_message")) {
                this.listeners.get("receive_message")(message);
            }
        });

        // Lắng nghe thông báo tin nhắn mới
        this.socket.on("new_message_notification", (data) => {
            if (this.listeners.has("new_message_notification")) {
                this.listeners.get("new_message_notification")(data);
            }
        });

        // Lắng nghe sự kiện đọc tin nhắn
        this.socket.on("messages_read", (data) => {
            if (this.listeners.has("messages_read")) {
                this.listeners.get("messages_read")(data);
            }
        });

        // Lắng nghe danh sách người dùng online
        this.socket.on("online_users", (data) => {
            if (this.listeners.has("online_users")) {
                this.listeners.get("online_users")(data);
            }
        });
    }

    // Lắng nghe danh sách người dùng online


    // Tham gia phòng chat
    joinRoom(receiverId) {
        if (this.socket) {
            this.socket.emit("join_room", receiverId);
        }
    }

    // Gửi tin nhắn
    async sendMessage(data) {
        await this.joinRoom(data.receiver_id);
        return new Promise((resolve, reject) => {
            if (!this.socket) {
                reject(new Error("Socket not connected"));
                return;
            }

            this.socket.emit("send_message", data, (response) => {
                if (response.status === "success") {
                    resolve(response.message);
                } else {
                    reject(new Error(response.message));
                }
            });
        });
    }

    // Lấy lịch sử tin nhắn
    getMessages(receiverId, page = 1, limit = 20) {
        return new Promise((resolve, reject) => {
            if (!this.socket) {
                reject(new Error("Socket not connected"));
                return;
            }

            this.socket.emit("get_messages", { receiver_id: receiverId, page, limit }, (response) => {
                if (response.status === "success") {
                    resolve(response.data);
                } else {
                    reject(new Error(response.message));
                }
            });
        });
    }

    // Lấy danh sách người dùng online
    getOnlineUsers() {
        return new Promise((resolve, reject) => {
            if (!this.socket) {
                reject(new Error("Socket not connected"));
                return;
            }

            this.socket.emit("get_online_users", (response) => {
                if (response.status === "success") {
                    resolve(response.data);
                }
            });
        });
    }

    // Lấy danh sách cuộc trò chuyện
    getConversations() {
        return new Promise((resolve, reject) => {
            if (!this.socket) {
                reject(new Error("Socket not connected"));
                return;
            }

            this.socket.emit("get_conversations", (response) => {
                if (response.status === "success") {
                    resolve(response.data);
                } else {
                    reject(new Error(response.message));
                }
            });
        });
    }

    // Đánh dấu tin nhắn đã đọc
    markAsRead(roomId) {
        if (this.socket) {
            this.socket.emit("mark_as_read", { room_id: roomId });
        }
    }

    // Đăng ký lắng nghe sự kiện
    on(event, callback) {
        this.listeners.set(event, callback);
    }

    // Hủy đăng ký lắng nghe sự kiện
    off(event) {
        this.listeners.delete(event);
    }

    // Ngắt kết nối
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.listeners.clear();
        }
    }
}

// Export instance duy nhất của SocketClient
export const socketClient = new SocketClient();
