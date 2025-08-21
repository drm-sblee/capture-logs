import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const db = new PrismaClient();
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);


// KST 시간 변환 함수
const toKST = (date) => {
  const kstTime = new Date(date.getTime() + (9 * 60 * 60 * 1000));
  const result = kstTime.toISOString().replace('Z', '+09:00');
  
  return result;
};

app.use(cors({
  // origin: "http://capture-logs-client:5000",
  origin: true,   // 테스트용
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.post("/logs/search", async (req, res) => {
  try {
    
  const rawPage = Number(req.body?.page) || 1;
  const rawSize = Number(req.body?.size) || 20;
  const field = req.body?.field;
  const keyword = req.body?.keyword;

  const size = clamp(rawSize, 1, 200);

  const where = field ? {
    [field.replace(/\s+/g, "_")]: {
      contains: keyword,
      mode: "insensitive" 
    },
  } : {};

  const totalCount = await db.log.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / size));
  const page = clamp(rawPage, 1, totalPages);

  const rows = await db.log.findMany({
    where,
    orderBy: { detected_time: "desc" },
    skip: (page - 1) * size,
    take: size,
    select: {
      log_id: true,
      username: true,
      device_id: true,
      page_url: true,
      detected_program: true,
      detected_time: true,
      browserRef: { select: { browser_name: true } },
      osRef: { select: { os_name: true } },
    },
  });

  const data = rows.map(r => ({
    log_id: r.log_id,
    username: r.username,
    device_id: r.device_id,
    page_url: r.page_url,
    detected_program: r.detected_program,
    detected_time: toKST(r.detected_time),
    browser_name: r.browserRef?.browser_name ?? null,
    os_name: r.osRef?.os_name ?? null,
  }));

  res.json({
    data,
    page,
    size,
    totalCount,
    totalPages,
  });
  } catch (e) {
    console.error("[POST /logs] error:", e);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on`);
});

// 정상 종료 처리
const shutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Closing server...`);
  server.close(async () => {
    await db.$disconnect().catch(() => {});
    console.log("Server closed. Bye!");
    process.exit(0);
  });
};
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
