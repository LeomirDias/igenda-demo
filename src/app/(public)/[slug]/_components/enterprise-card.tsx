import { eq } from "drizzle-orm";
import { Calendar, Instagram, Phone } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SlugPageContainer, SlugPageHeader, SlugPageHeaderContent } from "@/components/ui/slug-page-container";
import { db } from "@/db";
import { enterprisesTable } from "@/db/schema";

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

const EnterpriseCard = async ({ params }: PageProps) => {
    const { slug } = await params;

    const enterprise = await db.query.enterprisesTable.findFirst({
        where: eq(enterprisesTable.slug, slug),
    });

    if (!enterprise) {
        redirect("/enterprise-not-found");
    }

    const enterpriseInitials = enterprise.name
        .split(" ")
        .map((name: string) => name[0])
        .join("");

    return (
        <SlugPageContainer>
            <SlugPageHeader>
                <SlugPageHeaderContent>
                    <div className="flex flex-col items-center text-center gap-4 max-w-2xl mx-auto mb-0">
                        <Avatar className="h-25 w-25 md:h-28 md:w-28 relative border-2 border-border rounded-full">
                            {enterprise.avatarImageURL ? (
                                <Image
                                    src={enterprise.avatarImageURL}
                                    alt={enterprise.name}
                                    fill
                                    style={{ objectFit: "cover" }}
                                    className="rounded-full"
                                />
                            ) : (
                                <AvatarFallback>{enterpriseInitials}</AvatarFallback>
                            )}
                        </Avatar>
                        <h1 className="text-2xl font-bold text-foreground">{enterprise.name}</h1>
                    </div>
                </SlugPageHeaderContent>
            </SlugPageHeader>
            <Card className="flex flex-row gap-4 justify-center items-center bg-background shadow-lg p-4 w-full">
                <a href={`https://wa.me/${enterprise.phoneNumber}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">
                        <Phone className="h-4 w-4" />
                        <span className="text-xs font-bold hidden md:block">WhatsApp</span>
                    </Button>
                </a>
                <a href={`https://instagram.com/${enterprise.instagramURL}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">
                        <Instagram className="h-4 w-4" />
                        <span className="text-xs font-bold hidden md:block">Instagram</span>
                    </Button>
                </a>
                <a href={`${slug}/client-infos`} rel="noopener noreferrer">
                    <Button variant="default" className="w-25">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm font-bold">Agendar</span>
                    </Button>
                </a>
            </Card>
        </SlugPageContainer>
    )
}

export default EnterpriseCard;