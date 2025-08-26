"use server";

import { headers } from "next/headers";

import { db } from "@/db";
import { enterprisesTable, usersToEnterprisesTable } from "@/db/schema";
import { auth } from "@/lib/auth";

const generateSlug = (name: string) => {
  if (!name) return "";
  let slug = name.toLowerCase();
  slug = slug.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  slug = slug.replace(/\s+/g, "-");
  slug = slug.replace(/[^a-z0-9-]/g, "");
  slug = slug.replace(/-+/g, "-");
  slug = slug.replace(/^-+|-+$/g, "");
  return slug;
};

export const createEnterprise = async (
  name: string,
  specialty: string,
  phoneNumber: string,
  register: string,
  instagramURL: string,
  cep: string,
  address: string,
  number: string,
  complement: string | undefined,
  city: string,
  state: string,
  avatarImageURL?: string,
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const slug = generateSlug(name);

  const [enterprise] = await db
    .insert(enterprisesTable)
    .values({
      name,
      specialty,
      phoneNumber,
      register,
      instagramURL,
      slug,
      cep,
      address,
      number,
      complement,
      city,
      state,
      avatarImageURL,
      ownerId: session.user.id,
    })
    .returning();

  await db.insert(usersToEnterprisesTable).values({
    userId: session.user.id,
    enterpriseId: enterprise.id,
  });

  return { enterpriseId: enterprise.id };
};
