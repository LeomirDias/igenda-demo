'use server'

import { put } from '@vercel/blob'
import { eq } from 'drizzle-orm'

import { db } from '@/db'
import { enterprisesTable } from '@/db/schema'

export async function uploadEnterpriseProfilePicture(formData: FormData, enterpriseId: string) {
    const file = formData.get('photo') as File

    if (!file || file.size === 0) {
        throw new Error('Imagem inválida')
    }

    const blob = await put(file.name, file, {
        access: 'public',
    })

    await db.update(enterprisesTable)
        .set({ avatarImageURL: blob.url })
        .where(eq(enterprisesTable.id, enterpriseId))

    return { url: blob.url }
}
