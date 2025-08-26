"use client";

import { Filter, Search } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import { TutorialVideoCard } from "./tutorial-video-card";

interface TutorialVideo {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    videoUrl: string;
    duration: string;
    category: string;
}

interface TutorialVideoGalleryProps {
    videos: TutorialVideo[];
}

export function TutorialVideoGallery({ videos }: TutorialVideoGalleryProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    // Extrair categorias únicas dos vídeos
    const categories = ["all", ...Array.from(new Set(videos.map(video => video.category)))];

    // Filtrar vídeos baseado na busca e categoria
    const filteredVideos = videos.filter(video => {
        const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            video.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "all" || video.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6">
            {/* Barra de busca e filtros */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar tutoriais..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground hidden" />
                    <span className="text-sm text-muted-foreground hidden">Filtrar por:</span>
                    <ScrollArea className="">
                        <div className="flex gap-2 pb-2">
                            {categories.map((category) => (
                                <Badge
                                    key={category}
                                    variant={selectedCategory === category ? "default" : "outline"}
                                    className="cursor-pointer whitespace-nowrap"
                                    onClick={() => setSelectedCategory(category)}
                                >
                                    {category === "all" ? "Todos" : category}
                                </Badge>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            {/* Resultados da busca */}
            <div className="text-sm text-muted-foreground">
                {filteredVideos.length === 0 ? (
                    <p className="text-center py-8">Nenhum tutorial encontrado para sua busca.</p>
                ) : (
                    <p>
                        {filteredVideos.length} {filteredVideos.length !== 1 ? 'tutoriais' : 'tutorial'} encontrado{filteredVideos.length !== 1 ? 's' : ''}
                        {searchTerm && ` para "${searchTerm}"`}
                        {selectedCategory !== "all" && ` na categoria "${selectedCategory}"`}
                    </p>
                )}
            </div>

            {/* Grid de vídeos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredVideos.map((video) => (
                    <TutorialVideoCard key={video.id} video={video} />
                ))}
            </div>

            {/* Botão para carregar mais vídeos (se necessário) */}
            {filteredVideos.length > 0 && (
                <div className="text-center pt-4">
                    <Button variant="outline" size="lg">
                        Carregar mais tutoriais
                    </Button>
                </div>
            )}
        </div>
    );
}
