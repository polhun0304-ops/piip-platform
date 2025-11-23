"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSLAReport = getSLAReport;
const database_1 = require("../config/database");
const Consultation_1 = require("../entities/Consultation");
async function getSLAReport(consultationId) {
    const repo = database_1.AppDataSource.getRepository(Consultation_1.Consultation);
    const c = await repo.findOneBy({ id: consultationId });
    if (!c)
        return null;
    const report = {
        consultationId: c.id,
        proposedAt: c.createdAt,
        scheduledAt: c.scheduledAt,
        startedAt: c.startedAt,
        completedAt: c.completedAt,
        status: c.status,
    };
    if (c.scheduledAt)
        report.responseTime = Math.round((c.scheduledAt.getTime() - c.createdAt.getTime()) / 60000);
    if (c.startedAt && c.scheduledAt)
        report.kickoffTime = Math.round((c.startedAt.getTime() - c.scheduledAt.getTime()) / 60000);
    if (c.completedAt && c.startedAt)
        report.processTime = Math.round((c.completedAt.getTime() - c.startedAt.getTime()) / 60000);
    return report;
}
