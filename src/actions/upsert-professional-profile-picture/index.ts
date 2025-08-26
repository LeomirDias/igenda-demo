'use server'

import { put } from '@vercel/blob'
import { eq } from 'drizzle-orm'

import { db } from '@/db'
import { professionalsTable } from '@/db/schema'

export async function uploadProfessionalProfilePicture(formData: FormData, professionalId: string) {
    const file = formData.get('photo') as File

    if (!file || file.size === 0) {
        throw new Error('Imagem inválida')
    }

    const blob = await put(file.name, file, {
        access: 'public',
    })

    await db.update(professionalsTable)
        .set({ avatarImageURL: blob.url })
        .where(eq(professionalsTable.id, professionalId))

    return { url: blob.url }
}
