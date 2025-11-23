"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsRepo = exports.CasesRepo = exports.db = void 0;
const crypto_1 = require("crypto");
class MemoryDB {
    constructor() {
        this.cases = new Map();
        this.reports = new Map();
    }
}
exports.db = new MemoryDB();
exports.CasesRepo = {
    list: (opts) => {
        let items = Array.from(exports.db.cases.values());
        if (opts.status)
            items = items.filter((c) => c.status === opts.status);
        if (opts.search)
            items = items.filter((c) => c.title.includes(opts.search) ||
                (c.description || "").includes(opts.search));
        const total = items.length;
        const start = (opts.page - 1) * opts.pageSize;
        const paged = items.slice(start, start + opts.pageSize);
        return { items: paged, page: opts.page, pageSize: opts.pageSize, total };
    },
    create: (data) => {
        const now = new Date().toISOString();
        const id = (0, crypto_1.randomUUID)();
        const entity = {
            id,
            code: "C" + id.split("-")[0].toUpperCase(),
            status: "DRAFT",
            title: data.title,
            description: data.description,
            clientId: data.clientId,
            createdAt: now,
            updatedAt: now,
        };
        exports.db.cases.set(id, entity);
        return entity;
    },
    get: (id) => exports.db.cases.get(id) || null,
    update: (id, patch) => {
        const found = exports.db.cases.get(id);
        if (!found)
            return null;
        const updated = {
            ...found,
            ...patch,
            updatedAt: new Date().toISOString(),
        };
        exports.db.cases.set(id, updated);
        return updated;
    },
    transition: (id, to) => {
        const found = exports.db.cases.get(id);
        if (!found)
            return { error: "NOT_FOUND" };
        const allowed = {
            DRAFT: ["REVIEW"],
            REVIEW: ["ACTIVE", "DRAFT"],
            ACTIVE: ["EVIDENCE_COLLECTION", "REPORT_DRAFT"],
            EVIDENCE_COLLECTION: ["REPORT_DRAFT"],
            REPORT_DRAFT: ["REPORT_REVIEW"],
            REPORT_REVIEW: ["CLOSED", "REPORT_DRAFT"],
            CLOSED: [],
        };
        if (!allowed[found.status].includes(to)) {
            return { error: "INVALID_TRANSITION" };
        }
        found.status = to;
        found.updatedAt = new Date().toISOString();
        exports.db.cases.set(id, found);
        return { ok: true, case: found };
    },
};
exports.ReportsRepo = {
    create: (data) => {
        const id = (0, crypto_1.randomUUID)();
        const entity = {
            id,
            caseId: data.caseId,
            status: "draft",
            version: 1,
            title: data.title,
        };
        exports.db.reports.set(id, entity);
        return entity;
    },
    get: (id) => exports.db.reports.get(id) || null,
    update: (id, patch) => {
        const found = exports.db.reports.get(id);
        if (!found)
            return null;
        const updated = { ...found, ...patch };
        exports.db.reports.set(id, updated);
        return updated;
    },
    submit: (id) => {
        const found = exports.db.reports.get(id);
        if (!found)
            return null;
        found.status = "in_review";
        exports.db.reports.set(id, found);
        return found;
    },
};
