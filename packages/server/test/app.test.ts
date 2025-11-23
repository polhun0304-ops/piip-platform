import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { Application } from "express";

let app: Application;

beforeAll(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
  const mod = await import("../src/server");
  app = mod.default;
});

beforeEach(async () => {
  // 인메모리 DB 초기화
  const { db } = await import("../src/repositories/memory");
  db.cases.clear();
  db.reports.clear();
});

describe("PIIP Server integration", () => {
  it("/cases/:id 조회 시 404 반환 (존재하지 않는 ID)", async () => {
    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email: "user@example.com", password: "Passw0rd!" })
      .expect(200);
    const token = loginRes.body.accessToken as string;

    await request(app)
      .get("/cases/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
      .set("Authorization", `Bearer ${token}`)
      .expect(404);
  });

  it("잘못된 상태 전이 시 409 반환", async () => {
    // 로그인 및 사건 생성
    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email: "user@example.com", password: "Passw0rd!" })
      .expect(200);
    const token = loginRes.body.accessToken as string;

    const created = await request(app)
      .post("/cases")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "사건B", description: "설명" })
      .expect(201);

    const id = created.body.id as string;

    // DRAFT -> CLOSED (허용되지 않음)
    await request(app)
      .post(`/cases/${id}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ to: "CLOSED" })
      .expect(409);
  });
  it("로그인 → 토큰 발급 → /cases 생성/조회 (해피패스)", async () => {
    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email: "user@example.com", password: "Passw0rd!" })
      .expect(200);

    expect(loginRes.body).toHaveProperty("accessToken");
    const token = loginRes.body.accessToken as string;

    const createRes = await request(app)
      .post("/cases")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "사건A", description: "설명" })
      .expect(201);

    expect(createRes.body).toHaveProperty("id");
    expect(createRes.body).toHaveProperty("status", "DRAFT");

    const listRes = await request(app)
      .get("/cases?page=1&pageSize=10")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(listRes.body).toHaveProperty("items");
    expect(Array.isArray(listRes.body.items)).toBe(true);
    expect(listRes.body.items.length).toBeGreaterThanOrEqual(1);
  });

  it("권한 부족(403): cases:write 없이 사건 생성 시도", async () => {
    const secret = process.env.JWT_SECRET || "test-secret";
    const badToken = jwt.sign(
      {
        sub: "test-user",
        role: "client",
        scopes: ["reports:read"], // cases:write 없음
      },
      secret,
      { expiresIn: "10m" }
    );

    await request(app)
      .post("/cases")
      .set("Authorization", `Bearer ${badToken}`)
      .send({ title: "금지된 생성", description: "권한 없음" })
      .expect(403);
  });

  it("/reports 생성 → 제출(in_review) 해피패스", async () => {
    // 로그인 및 사건 생성
    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email: "user@example.com", password: "Passw0rd!" })
      .expect(200);
    const token = loginRes.body.accessToken as string;

    const caseRes = await request(app)
      .post("/cases")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "사건C", description: "설명" })
      .expect(201);
    const caseId = caseRes.body.id as string;

    const reportRes = await request(app)
      .post("/reports")
      .set("Authorization", `Bearer ${token}`)
      .send({ caseId, title: "리포트1" })
      .expect(201);
    const reportId = reportRes.body.id as string;

    const submitRes = await request(app)
      .post(`/reports/${reportId}/submit`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(submitRes.body).toHaveProperty("status", "in_review");
  });

  it("리포트 상세 조회 404", async () => {
    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email: "user@example.com", password: "Passw0rd!" })
      .expect(200);
    const token = loginRes.body.accessToken as string;

    await request(app)
      .get("/reports/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
      .set("Authorization", `Bearer ${token}`)
      .expect(404);
  });

  it("리포트 패치 검증 실패 422 (summary 타입 불일치)", async () => {
    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email: "user@example.com", password: "Passw0rd!" })
      .expect(200);
    const token = loginRes.body.accessToken as string;

    // 먼저 사건/리포트 생성
    const caseRes = await request(app)
      .post("/cases")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "사건D", description: "설명" })
      .expect(201);
    const caseId = caseRes.body.id as string;

    const reportRes = await request(app)
      .post("/reports")
      .set("Authorization", `Bearer ${token}`)
      .send({ caseId, title: "리포트2" })
      .expect(201);
    const reportId = reportRes.body.id as string;

    // summary를 number로 보내어 422 유발
    await request(app)
      .patch(`/reports/${reportId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ summary: 123 })
      .expect(422);
  });

  it("잘못된 토큰으로 요청 시 401 반환", async () => {
    const invalidToken = "Bearer invalid.token.here";

    await request(app)
      .get("/cases?page=1&pageSize=10")
      .set("Authorization", invalidToken)
      .expect(401);
  });
});
