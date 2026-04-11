const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL || "meta-llama/llama-3.1-8b-instruct:free";

// System prompt for the food delivery assistant
const SYSTEM_PROMPT = `You are a helpful customer service assistant for FoodHub, a food delivery platform in Bangladesh.
You help customers with:
- Order tracking and delivery status
- Menu and meal information
- Restaurant details and cuisines
- General FAQs about ordering process
- Payment methods and pricing
- Delivery times and fees

Be friendly, concise, and answer in Bengali/English (user's preference).
If asked about something unrelated to food delivery, politely redirect to FoodHub services.
Never provide personal/sensitive information.
Keep responses short (2-3 sentences max).`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

const getFallbackReply = (userMessage: string) => {
  const q = userMessage.toLowerCase();

  if (q.includes("order") || q.includes("অর্ডার")) {
    return "আপনার অর্ডার আপডেট দেখতে My Orders পেইজ চেক করুন। নির্দিষ্ট অর্ডার আইডি দিলে আমি গাইড করতে পারি।";
  }

  if (
    q.includes("menu") ||
    q.includes("meal") ||
    q.includes("মেনু") ||
    q.includes("খাবার")
  ) {
    return "মেনু দেখতে Meals পেইজে যান। ক্যাটাগরি, প্রাইস বা রেস্টুরেন্ট অনুযায়ী ফিল্টার করে পছন্দের আইটেম বেছে নিতে পারবেন।";
  }

  if (
    q.includes("delivery") ||
    q.includes("ডেলিভারি") ||
    q.includes("time") ||
    q.includes("সময়")
  ) {
    return "ডেলিভারি সময় লোকেশন ও রেস্টুরেন্ট অনুযায়ী ভিন্ন হতে পারে। চেকআউটের সময় আনুমানিক সময় দেখানো হয়।";
  }

  if (q.includes("payment") || q.includes("পেমেন্ট") || q.includes("price")) {
    return "পেমেন্ট ও মোট খরচ অর্ডার কনফার্মের আগে Checkout পেইজে স্পষ্টভাবে দেখানো হয়।";
  }

  return "আমি FoodHub সহায়ক। অর্ডার, মেনু, ডেলিভারি, বা পেমেন্ট বিষয়ে প্রশ্ন করলে দ্রুত সাহায্য করতে পারব।";
};

export class ChatService {
  static async chat(userMessage: string, conversationHistory: Message[] = []) {
    try {
      if (!OPENROUTER_API_KEY) {
        return {
          success: true,
          message: getFallbackReply(userMessage),
          timestamp: new Date(),
          source: "fallback",
        };
      }

      // Build conversation
      const messages: Message[] = [
        ...conversationHistory,
        { role: "user", content: userMessage },
      ];

      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": process.env.APP_URL || "http://localhost:3000", // Required by OpenRouter
          "X-Title": "FoodHub", // Required by OpenRouter
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
          temperature: 0.7,
          max_tokens: 150,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error("OpenRouter API Error:", error);
        return {
          success: true,
          message: getFallbackReply(userMessage),
          timestamp: new Date(),
          source: "fallback",
          error: `OpenRouter API error: ${response.status}`,
        };
      }

      const data = await response.json();
      const assistantMessage =
        data.choices[0]?.message?.content ||
        "Sorry, I couldn't process that request.";

      return {
        success: true,
        message: assistantMessage,
        timestamp: new Date(),
        source: "openrouter",
      };
    } catch (error) {
      console.error("Chat service error:", error);
      return {
        success: true,
        message: getFallbackReply(userMessage),
        timestamp: new Date(),
        source: "fallback",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
