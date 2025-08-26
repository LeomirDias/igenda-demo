"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";

interface TutorialQuestionProps {
    question: string;
    answer: string;
}

export function TutorialQuestion({ question, answer }: TutorialQuestionProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Card className="border-border/50 bg-card/50">
            <CardContent className="p-0">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                >
                    <span className="font-medium text-foreground">{question}</span>
                    <div className="flex items-center gap-2">
                        <ChevronDown
                            className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""
                                }`}
                        />
                    </div>
                </button>

                {isOpen && (
                    <div className="px-4 pb-4">
                        <div className="border-t border-border/50 pt-4 space-y-4">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {answer}
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
