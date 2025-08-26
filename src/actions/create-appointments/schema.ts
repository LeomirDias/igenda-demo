import { z } from "zod";

export const createAppointmentSchema = z.object({
    clientId: z.string({
        required_error: "O cliente é obrigatório",
    }),
    serviceId: z.string({
        required_error: "O serviço é obrigatório",
    }),
    professionalId: z.string({
        required_error: "O profissional é obrigatório",
    }),
    date: z.string({
        required_error: "A data é obrigatória",
    }),
    time: z.string({
        required_error: "O horário é obrigatório",
    }),
    enterpriseId: z.string({
        required_error: "A empresa é obrigatória",
    }),
});

export type CreateAppointmentSchema = z.infer<typeof createAppointmentSchema>; 