export interface MqttMessage {
  topic: string;
  payload: string;
  qos?: number;
  retain?: boolean;
}

export type MqttMessageHandler = (topic: string, message: string) => void;

export interface IMqttService {
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;
  publish(topic: string, message: string): Promise<boolean>;
  subscribe(topic: string, handler: MqttMessageHandler): Promise<void>;
  unsubscribe(topic: string): Promise<void>;
}

export class MockMqttService implements IMqttService {
  private handlers: Map<string, MqttMessageHandler[]> = new Map();
  private connected: boolean = false;

  async connect(): Promise<boolean> {
    console.log("[MQTT Service] Mock connecting to MQTT Broker...");
    await new Promise((resolve) => setTimeout(resolve, 800));
    this.connected = true;
    console.log("[MQTT Service] Mock connected to mqtt://broker.hivemq.com:1883");
    return true;
  }

  async disconnect(): Promise<void> {
    console.log("[MQTT Service] Mock disconnected.");
    this.connected = false;
  }

  async publish(topic: string, message: string): Promise<boolean> {
    if (!this.connected) {
      console.warn(`[MQTT Service] Cannot publish. Client not connected. Topic: ${topic}`);
      return false;
    }
    console.log(`[MQTT Service] Mock Publish - Topic: ${topic}, Payload: ${message}`);
    this.triggerHandlers(topic, message);
    return true;
  }

  async subscribe(topic: string, handler: MqttMessageHandler): Promise<void> {
    console.log(`[MQTT Service] Mock Subscribe - Topic: ${topic}`);
    if (!this.handlers.has(topic)) {
      this.handlers.set(topic, []);
    }
    this.handlers.get(topic)!.push(handler);
  }

  async unsubscribe(topic: string): Promise<void> {
    console.log(`[MQTT Service] Mock Unsubscribe - Topic: ${topic}`);
    this.handlers.delete(topic);
  }

  private triggerHandlers(topic: string, message: string) {
    const list = this.handlers.get(topic);
    if (list) {
      list.forEach((h) => h(topic, message));
    }
    this.handlers.forEach((handlersList, subTopic) => {
      if (subTopic.endsWith("/#")) {
        const prefix = subTopic.substring(0, subTopic.length - 2);
        if (topic.startsWith(prefix)) {
          handlersList.forEach((h) => h(topic, message));
        }
      }
    });
  }
}

export const mqttService = new MockMqttService();
