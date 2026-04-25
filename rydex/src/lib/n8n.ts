import axios from "axios";

const n8nClient = axios.create({
  baseURL: process.env.N8N_BASE_URL || "http://localhost:5678",
  headers: {
    "X-N8N-API-KEY": process.env.N8N_API_KEY,
    "Content-Type": "application/json",
  },
});

export const n8nWorkflows = {
  // Trigger workflow by ID
  async triggerWorkflow(workflowId: string, data: Record<string, any>) {
    try {
      const response = await n8nClient.post(
        `/api/v1/workflows/${workflowId}/execute`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to trigger n8n workflow ${workflowId}:`, error);
      throw error;
    }
  },

  // Trigger workflow by webhook
  async triggerWebhook(webhookPath: string, data: Record<string, any>) {
    try {
      const response = await axios.post(
        `${process.env.N8N_BASE_URL}/webhook/${webhookPath}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to trigger webhook ${webhookPath}:`, error);
      throw error;
    }
  },

  // Send notification via n8n
  async sendNotification(
    userId: string,
    type: string,
    message: string,
    channels: string[] = ["email", "push"]
  ) {
    return this.triggerWebhook("send-notification", {
      userId,
      type,
      message,
      channels,
      timestamp: new Date(),
    });
  },

  // Send OTP via n8n
  async sendOTP(
    phoneNumber: string,
    otp: string,
    purpose: "booking" | "onboarding" | "verification"
  ) {
    return this.triggerWebhook("send-otp", {
      phoneNumber,
      otp,
      purpose,
      timestamp: new Date(),
    });
  },

  // Send email via n8n
  async sendEmail(
    to: string,
    subject: string,
    template: string,
    data: Record<string, any>
  ) {
    return this.triggerWebhook("send-email", {
      to,
      subject,
      template,
      data,
      timestamp: new Date(),
    });
  },

  // Process payment via n8n
  async processPayment(bookingId: string, amount: number, method: string) {
    return this.triggerWebhook("process-payment", {
      bookingId,
      amount,
      method,
      timestamp: new Date(),
    });
  },

  // Generate payout via n8n
  async generatePayout(
    vendorId: string,
    amount: number,
    bankDetails: Record<string, any>
  ) {
    return this.triggerWebhook("generate-payout", {
      vendorId,
      amount,
      bankDetails,
      timestamp: new Date(),
    });
  },

  // Schedule booking reminder
  async scheduleReminder(
    bookingId: string,
    userId: string,
    scheduledTime: Date,
    reminderType: "scheduled_ride" | "upcoming_ride"
  ) {
    return this.triggerWebhook("schedule-reminder", {
      bookingId,
      userId,
      scheduledTime,
      reminderType,
      timestamp: new Date(),
    });
  },

  // Trigger vendor onboarding workflow
  async initiateVendorOnboarding(vendorId: string, vendorData: Record<string, any>) {
    return this.triggerWebhook("vendor-onboarding", {
      vendorId,
      vendorData,
      timestamp: new Date(),
    });
  },

  // Generate analytics report
  async generateAnalyticsReport(
    type: "daily" | "weekly" | "monthly",
    data: Record<string, any>
  ) {
    return this.triggerWebhook("analytics-report", {
      type,
      data,
      timestamp: new Date(),
    });
  },
};

export default n8nClient;
