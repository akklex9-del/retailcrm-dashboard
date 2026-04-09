import dotenv from "dotenv";

dotenv.config({ override: true });

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

export function getRetailCrmConfig() {
  return {
    baseUrl: required("RETAILCRM_BASE_URL"),
    apiKey: required("RETAILCRM_API_KEY"),
  };
}

export function getSupabaseConfig() {
  return {
    url: required("SUPABASE_URL"),
    serviceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

export function getTelegramConfig() {
  return {
    botToken: required("TELEGRAM_BOT_TOKEN"),
    chatId: required("TELEGRAM_CHAT_ID"),
  };
}
