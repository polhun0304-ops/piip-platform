import { randomUUID } from "crypto";

export type CaseStatus =
  | "DRAFT"
  | "REVIEW"
  | "ACTIVE"
  | "EVIDENCE_COLLECTION"
  | "REPORT_DRAFT"
  | "REPORT_REVIEW"
  | "CLOSED";

export interface CaseEntity {
  id: string;
  code?: string;
  status: CaseStatus;
  title: string;
  description?: string;
  clientId?: string;
  assignedDetectiveId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReportEntity {
  id: string;
  caseId: string;
  status: "draft" | "in_review" | "approved" | "rejected";
  version: number;
  title: string;
  summary?: string;
  body?: any;
}

class MemoryDB {
  cases = new Map<string, CaseEntity>();
  reports = new Map<string, ReportEntity>();
}

export const db = new MemoryDB();

export const CasesRepo = {
  list: (opts: {
    page: number;
    pageSize: number;
    status?: CaseStatus;
    search?: string;
  }) => {
    let items = Array.from(db.cases.values());
    if (opts.status) items = items.filter((c) => c.status === opts.status);
    if (opts.search)
      items = items.filter(
        (c) =>
          c.title.includes(opts.search!) ||
          (c.description || "").includes(opts.search!)
      );
    const total = items.length;
    const start = (opts.page - 1) * opts.pageSize;
    const paged = items.slice(start, start + opts.pageSize);
    return { items: paged, page: opts.page, pageSize: opts.pageSize, total };
  },
  create: (data: {
    title: string;
    description: string;
    priority?: string;
    clientId?: string;
  }) => {
    const now = new Date().toISOString();
    const id = randomUUID();
    const entity: CaseEntity = {
      id,
      code: "C" + id.split("-")[0].toUpperCase(),
      status: "DRAFT",
      title: data.title,
      description: data.description,
      clientId: data.clientId,
      createdAt: now,
      updatedAt: now,
    };
    db.cases.set(id, entity);
    return entity;
  },
  get: (id: string) => db.cases.get(id) || null,
  update: (id: string, patch: Partial<CaseEntity>) => {
    const found = db.cases.get(id);
    if (!found) return null;
    const updated = {
      ...found,
      ...patch,
      updatedAt: new Date().toISOString(),
    } as CaseEntity;
    db.cases.set(id, updated);
    return updated;
  },
  transition: (id: string, to: CaseStatus) => {
    const found = db.cases.get(id);
    if (!found) return { error: "NOT_FOUND" as const };
    const allowed: Record<CaseStatus, CaseStatus[]> = {
      DRAFT: ["REVIEW"],
      REVIEW: ["ACTIVE", "DRAFT"],
      ACTIVE: ["EVIDENCE_COLLECTION", "REPORT_DRAFT"],
      EVIDENCE_COLLECTION: ["REPORT_DRAFT"],
      REPORT_DRAFT: ["REPORT_REVIEW"],
      REPORT_REVIEW: ["CLOSED", "REPORT_DRAFT"],
      CLOSED: [],
    };
    if (!allowed[found.status].includes(to)) {
      return { error: "INVALID_TRANSITION" as const };
    }
    found.status = to;
    found.updatedAt = new Date().toISOString();
    db.cases.set(id, found);
    return { ok: true as const, case: found };
  },
};

export const ReportsRepo = {
  create: (data: { caseId: string; title: string }) => {
    const id = randomUUID();
    const entity: ReportEntity = {
      id,
      caseId: data.caseId,
      status: "draft",
      version: 1,
      title: data.title,
    };
    db.reports.set(id, entity);
    return entity;
  },
  get: (id: string) => db.reports.get(id) || null,
  update: (id: string, patch: Partial<ReportEntity>) => {
    const found = db.reports.get(id);
    if (!found) return null;
    const updated = { ...found, ...patch } as ReportEntity;
    db.reports.set(id, updated);
    return updated;
  },
  submit: (id: string) => {
    const found = db.reports.get(id);
    if (!found) return null;
    found.status = "in_review";
    db.reports.set(id, found);
    return found;
  },
};
