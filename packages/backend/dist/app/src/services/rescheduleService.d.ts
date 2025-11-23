import { Consultation } from "../entities/Consultation";
export declare function rescheduleConsultation(consultationId: string, date: string, time: string): Promise<Consultation | null>;
