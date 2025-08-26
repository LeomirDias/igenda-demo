"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface TutorialVideo {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    videoUrl: string;
    duration: string;
    category: string;
}

interface TutorialVideoCardProps {
    video: TutorialVideo;
}

export function TutorialVideoCard({ video }: TutorialVideoCardProps) {
    const [isVideoOpen, setIsVideoOpen] = useState(false);

    return (
        <>
            <Card className="group cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]">
                <CardHeader className="p-0">
                    <div className="relative aspect-video overflow-hidden rounded-t-lg">
                        <Image
                            src={video.thumbnailUrl}
                            alt={video.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                        <Button
                            size="icon"
                            className="absolute left-2 bottom-2 bg-white/90 hover:bg-white text-black shadow-lg"
                            onClick={() => setIsVideoOpen(true)}
                        >
                            <Play className="h-6 w-6 ml-1" />
                        </Button>
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {video.duration}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="mb-2">
                        <span className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                            {video.category}
                        </span>
                    </div>
                    <CardTitle className="text-lg mb-2 line-clamp-2">{video.title}</CardTitle>
                    <CardDescription className="line-clamp-3">{video.description}</CardDescription>
                </CardContent>
            </Card>

            <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{video.title}</DialogTitle>
                    </DialogHeader>
                    <div className="aspect-video w-full">
                        <video
                            src={video.videoUrl}
                            controls
                            className="w-full h-full rounded-lg"
                            poster={video.thumbnailUrl}
                        >
                            Seu navegador não suporta a reprodução de vídeos.
                        </video>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
