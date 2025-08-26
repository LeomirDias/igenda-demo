import { z } from "zod";

export const upsertAppointmentSchema = z.object({
    id: z.string().optional(),
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
});

export type UpsertAppointmentSchema = z.infer<typeof upsertAppointmentSchema>; 