import z from "zod";

export const updateProfessionalSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().trim().min(1, { message: "Nome do profissional é obrigatório." }),
    specialty: z.string().trim().min(1, { message: "Função ou especialidade do profissional é obrigatória." }),
    phoneNumber: z.string().trim().min(1, { message: "Telefone do profissonal é obrigatório." }),
    instagramURL: z.string().trim().url({ message: "URL do Instagram inválida." }).or(z.literal("")),
    avatarImageURL: z.string().url({ message: "URL do avatar inválida." }).optional(),
    availableFromWeekDay: z.number().min(0).max(6),
    availableToWeekDay: z.number().min(0).max(6),
    availableFromTime: z.string().min(1, { message: "Hora de início é obrigatória" }),
    availableToTime: z.string().min(1, { message: "Hora de término é obrigatória." }),
}).refine(
    (data) => {
        return data.availableFromTime < data.availableToTime;
    },
    {
        message: "O horário de início não pode ser anterior ao horário de término.",
        path: ["availableToTime"],
    },
);

export type UpdateProfessionalSchema = z.infer<typeof updateProfessionalSchema>;