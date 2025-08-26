import z from "zod";

export const associateProfessionalsSchema = z.object({
    serviceId: z.string().uuid(),
    professionalIds: z.array(z.string().uuid()),
});

export const removeProfessionalFromServiceSchema = z.object({
    serviceId: z.string().uuid(),
    professionalId: z.string().uuid(),
}); 