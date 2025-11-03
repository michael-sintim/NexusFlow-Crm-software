class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
    this.subscriptions = new Map();
  }

  connect() {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const wsUrl = `ws://localhost:8000/ws/notifications/?token=${token}`;
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.attemptReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('WebSocket connection failed:', error);
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectInterval);
    }
  }

  handleMessage(data) {
    // Notify all subscribers for this type of message
    const subscribers = this.subscriptions.get(data.type) || [];
    subscribers.forEach(callback => callback(data));
  }

  subscribe(messageType, callback) {
    if (!this.subscriptions.has(messageType)) {
      this.subscriptions.set(messageType, []);
    }
    this.subscriptions.get(messageType).push(callback);

    // Return unsubscribe function
    return () => {
      const subscribers = this.subscriptions.get(messageType) || [];
      const index = subscribers.indexOf(callback);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.subscriptions.clear();
  }
}

export const websocketService = new WebSocketService();