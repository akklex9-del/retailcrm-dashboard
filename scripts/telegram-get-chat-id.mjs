import dotenv from "dotenv";

dotenv.config({ override: true });

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("Missing TELEGRAM_BOT_TOKEN in .env");
  process.exit(1);
}

const url = `https://api.telegram.org/bot${token}/getUpdates`;

async function main() {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok || !data.ok) {
    console.error("getUpdates failed:", JSON.stringify(data));
    process.exit(1);
  }

  const chats = new Map();
  for (const upd of data.result ?? []) {
    const msg = upd.message ?? upd.channel_post ?? upd.edited_message ?? upd.edited_channel_post;
    const chat = msg?.chat;
    if (chat?.id) {
      chats.set(chat.id, {
        id: chat.id,
        type: chat.type,
        title: chat.title,
        username: chat.username,
        first_name: chat.first_name,
        last_name: chat.last_name,
      });
    }
  }

  if (chats.size === 0) {
    console.log("Пока нет обновлений. Откройте бота и напишите ему любое сообщение, затем запустите скрипт снова.");
    return;
  }

  console.log("Найденные chat_id из последних обновлений:");
  for (const chat of chats.values()) {
    console.log(JSON.stringify(chat));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

