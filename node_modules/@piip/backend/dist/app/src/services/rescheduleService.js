"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rescheduleConsultation = rescheduleConsultation;
const Consultation_1 = require("../entities/Consultation");
const database_1 = require("../config/database");
async function rescheduleConsultation(consultationId, date, time) {
    const repo = database_1.AppDataSource.getRepository(Consultation_1.Consultation);
    const consultation = await repo.findOneBy({ id: consultationId });
    if (!consultation)
        return null;
    consultation.scheduledAt = new Date(`${date}T${time}:00+09:00`);
    consultation.status = "scheduled";
    await repo.save(consultation);
    return consultation;
}
