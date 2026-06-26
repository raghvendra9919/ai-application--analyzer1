import React from 'react';
import { cn } from '-/lib/utils';
import {
    Accordion,
    AccordionItem,
    AccordionHeader,
    AccordionContent
} from "~/components/Accordion";

//Define the Feedback type based on requirements
type Tip = {
    type: 'good' | 'improve';
    tip: string;
    exploration: string;
};

type Category = {
    title: string;
    score: number;
    tips: tip[];
};

type Feedback = {
    toneAndStyle: Category;
    content: Category;
    structure: Category;
    skills: Category;
};

//ScoreBadge component
const ScoreBadge: React.FC<{score: number }> = ({ score }) => {
    const getColor = () => {
        if (score > 69) return 'bg-green-100 text-green-600';
        if (score > 39) return 'bg-yellow-100 text-yellow-600';
        return 'bg-red-100 text-red-600';
    };

    const getIcon = () => {
        if (score > 69){
            return (
                <svg
                    xmlns="http://www.w3.org/200/svg"
                    className="h-4 w-4 text-green-600"
                    viewBox="0 0 20 20"
                    fill = "currentColor"
                    >
                    <path
                        fillRule="evenodd"
                        d="M10 "
                        clipRule="evenodd"
                        />
                </svg>
            );
        }
        return null;
    };

    return (
        <div className={cn('flex items-center gap-1 px-2 py-1 rounded-full', getColor())}>
            {getIcon()}
            <span className="text-sm font-medium">{score}</span>
        </div>
    );
};

const CategoryHeader: React.FC<{ title: string; categoryScore: number }> = ({
    title,categoryScore
}) => {
    return (
        <div className="flex items-center justify-between w-full">
            <h3 className="text-base font-medium"> {title}</h3>
            <ScoreBadge score={categoryScore} />
        </div>
    );
};

const CategoryContent: React.FC<{tips: Tips[]}> = ({tips}) => {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2">
                        {tip.type==="good" ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-green-600 mt-0.5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                >
                                <path
                                    fillRule="evenodd"
                                    d="M10 20"
                                    clipRule="evenodd"
                            </svg>
                        ):(
                            <svg>
                                xmlns= "http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-green-600 mt-0.5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                >
                                <path
                                    fillRule="evenodd"
                                    d="M10 20"
                                    clipRule="evenodd"
                            </svg>
                        )}
                        <span className="text-sm">{tip.tip}</span>
                    </div>
                ))}
            </div>

            <div className="space-y-3">
                {tips.map((tip, index) => (
                    <div
                    key={index}
                    className={cn('p-3 rounded-lg text-sm',
                    tip.type==="good"
                    ? 'bg-green-50 border-green-100'
                    : 'bg-yellow-50 border border-yellow-100'
                    )}
                    >
                        <p> {tip.explanation }</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Details: React.FC<{ feedback: Feedback}> ({feedback}) => {
    return (
        <div classname="w-full">
            <Accordion className="w-full">
                <AccordionItem id="tone-style" className="rounded-lg border border-gray-200 mb-3">
                    <AccordionHeader itemId="tone-style">
                        <CategoryContent tips={feedback.toneAndStyle.tips}/>
                    </AccordionHeader>
                </AccordionItem>

                <AccordionItem id="content" className="rounded-lg border border-gray-200 mb-3">
                    <AccordionHeader itemId="content">
                        <CategoryHeader title="Content" categoryScore={feedback.content.score}

                    </AccordionHeader>
                </AccordionItem>
            </Accordion>
        </div>
    )
}