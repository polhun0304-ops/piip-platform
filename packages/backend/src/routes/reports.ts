import { Router, Response } from "express";
import { AppDataSource } from "../config/database";
import { Report } from "../entities/Report";
import { Case } from "../entities/Case";
import { verifyJWT, AuthRequest, requireAdmin } from "../middleware/auth";

const router = Router();

// GET /api/reports - 보고서 목록 조회 (관리자: 전체, 탐정: 배정된 사건의 보고서, 의뢰인: 본인 사건의 보고서)
router.get("/", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { caseId } = req.query;
    const repo = AppDataSource.getRepository(Report);

    const qb = repo.createQueryBuilder("report");
    qb.leftJoinAndSelect("report.case", "case");

    if (req.user?.role === "detective" && req.user.detectiveId) {
      // join assignments to ensure detective only sees assigned cases
      qb.leftJoin("case.assignments", "assignment").andWhere(
        "assignment.detectiveId = :detectiveId",
        { detectiveId: req.user.detectiveId }
      );
    } else if (req.user?.role === "client") {
      qb.andWhere("case.clientUserId = :userId", { userId: req.user.userId });
    }

    if (caseId) qb.andWhere("report.caseId = :caseId", { caseId });

    const reports = await qb.orderBy("report.createdAt", "DESC").getMany();
    res.json(reports);
  } catch (e: unknown) {
    console.error("Error fetching reports:", e);
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg || "Internal server error" });
  }
});

// GET /api/reports/:id - 단건 조회
router.get("/:id", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const repo = AppDataSource.getRepository(Report);
    const rpt = await repo.findOne({ where: { id }, relations: ["case"] });
    if (!rpt) return res.status(404).json({ error: "Report not found" });

    if (req.user?.role === "client") {
      if ((rpt.case as any)?.clientUserId !== req.user.userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
    }

    if (req.user?.role === "detective") {
      const assignments = (rpt.case as any)?.assignments || [];
      const assigned = assignments.some(
        (a: any) => a.detectiveId === req.user?.detectiveId
      );
      if (!assigned) return res.status(403).json({ error: "Unauthorized" });
    }

    res.json(rpt);
  } catch (e: unknown) {
    console.error("Error fetching report:", e);
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg || "Internal server error" });
  }
});

// POST /api/reports - 보고서 생성 (의뢰인/탐정 가능)
router.post("/", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { caseId, title, content } = req.body;
    if (!caseId || !title || !content) {
      return res.status(400).json({ error: "caseId, title, content required" });
    }

    const caseRepo = AppDataSource.getRepository(Case);
    const targetCase = await caseRepo.findOne({
      where: { id: caseId },
      relations: ["assignments"],
    });
    if (!targetCase) return res.status(404).json({ error: "Case not found" });

    // 권한 체크
    if (req.user?.role === "client") {
      if (targetCase.clientUserId !== req.user.userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
    } else if (req.user?.role === "detective") {
      const isAssigned = targetCase.assignments?.some(
        (a) => a.detectiveId === req.user?.detectiveId
      );
      if (!isAssigned) return res.status(403).json({ error: "Unauthorized" });
    }

    const repo = AppDataSource.getRepository(Report);
    const newRpt = repo.create({
      caseId,
      title,
      content,
      authorUserId: req.user?.userId,
      authorRole: req.user?.role,
      authorDetectiveId: req.user?.detectiveId,
    });
    const saved = await repo.save(newRpt);
    res.status(201).json(saved);
  } catch (e: unknown) {
    console.error("Error creating report:", e);
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg || "Internal server error" });
  }
});

// PUT /api/reports/:id - 보고서 수정 (작성자 또는 관리자)
router.put("/:id", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const repo = AppDataSource.getRepository(Report);
    const rpt = await repo.findOne({ where: { id } });
    if (!rpt) return res.status(404).json({ error: "Report not found" });

    const isAuthor = req.user?.userId && req.user.userId === rpt.authorUserId;
    const isDetectiveAuthor =
      req.user?.detectiveId && req.user.detectiveId === rpt.authorDetectiveId;
    const isAdmin = req.user?.role === "admin";
    if (!(isAuthor || isDetectiveAuthor || isAdmin)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    repo.merge(rpt, { title, content });
    const updated = await repo.save(rpt);
    res.json(updated);
  } catch (e: unknown) {
    console.error("Error updating report:", e);
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg || "Internal server error" });
  }
});

// DELETE /api/reports/:id - 보고서 삭제 (관리자 또는 작성자)
router.delete("/:id", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const repo = AppDataSource.getRepository(Report);
    const rpt = await repo.findOne({ where: { id } });
    if (!rpt) return res.status(404).json({ error: "Report not found" });

    const isAuthor = req.user?.userId && req.user.userId === rpt.authorUserId;
    const isDetectiveAuthor =
      req.user?.detectiveId && req.user.detectiveId === rpt.authorDetectiveId;
    const isAdmin = req.user?.role === "admin";
    if (!(isAuthor || isDetectiveAuthor || isAdmin)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await repo.delete(id);
    res.status(204).send();
  } catch (e: unknown) {
    console.error("Error deleting report:", e);
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg || "Internal server error" });
  }
});

// GET /api/reports/:id/download - 보고서 다운로드 (HTML 형식)
router.get(
  "/:id/download",
  verifyJWT,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(Report);
      const rpt = await repo.findOne({ where: { id }, relations: ["case"] });
      if (!rpt) return res.status(404).json({ error: "Report not found" });
      if (!rpt.case)
        return res.status(404).json({ error: "Report case not found" });

      // 권한 체크 (보고서 조회 권한과 동일)
      if (req.user?.role === "client") {
        if (rpt.case.clientUserId !== req.user.userId) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      }

      // 간단한 HTML 형식으로 다운로드
      const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${rpt.title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #333; }
        .meta { color: #666; margin-bottom: 20px; }
        .content { line-height: 1.6; white-space: pre-wrap; }
    </style>
</head>
<body>
    <h1>${rpt.title}</h1>
    <div class="meta">
        <p>사건 ID: ${rpt.caseId}</p>
        <p>생성일: ${rpt.createdAt ? new Date(rpt.createdAt).toLocaleString("ko-KR") : "N/A"}</p>
        <p>작성자: ${rpt.authorRole === "detective" ? "탐정" : rpt.authorRole === "client" ? "의뢰인" : "관리자"}</p>
    </div>
    <div class="content">${rpt.content}</div>
</body>
</html>`;

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="report-${id}.html"`
      );
      res.send(html);
    } catch (e: unknown) {
      console.error("Error downloading report:", e);
      const msg = e instanceof Error ? e.message : String(e);
      res.status(500).json({ error: msg || "Internal server error" });
    }
  }
);

export default router;
