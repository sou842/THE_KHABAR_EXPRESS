import React, { useState, useCallback } from "react";

import FAQItem from "./FaqItem";
import { Button } from "../ui/button";
import { IFaqItem } from "./FaqSchema";
import { Trash2 } from "lucide-react";

interface FAQManagerProps {
    faqs: IFaqItem[];
    setFaqs: React.Dispatch<React.SetStateAction<IFaqItem[]>>;
}

const FAQManager: React.FC<FAQManagerProps> = ({ faqs, setFaqs }) => {
    const [faqForm, setFaqForm] = useState<IFaqItem>({ question: "", answer: "" });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFaqForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddFAQ = useCallback(() => {
        const { question, answer } = faqForm;
        if (!question.trim() || !answer.trim()) return;

        setFaqs((prev = []) => [...prev, { question: question.trim(), answer: answer.trim() }]);
        setFaqForm({ question: "", answer: "" });
    }, [faqForm, setFaqs]);

    const handleRemoveFAQ = useCallback((indexToRemove: number) => {
        setFaqs((prev) => prev.filter((_, i) => i !== indexToRemove));
    }, [setFaqs]);

    return (
        <section className="p-6 max-w-2xl mx-auto space-y-6">
            <h3 className="text-xl font-bold">Frequently Asked Questions</h3>

            {/* FAQ List */}
            {faqs?.length > 0 && (
                <div className="space-y-4">
                    {faqs?.map((faq, index) => (
                        <div key={index} className="border rounded p-4 relative">
                            <FAQItem question={faq.question} answer={faq.answer} />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveFAQ(index)}
                                className="absolute top-2 right-2 text-destructive hover:bg-red-100"
                                aria-label={`Remove FAQ ${index + 1}`}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add New FAQ Form */}
            <div className="space-y-4">
                <input
                    type="text"
                    name="question"
                    className="w-full p-2 border rounded"
                    placeholder="Enter question"
                    value={faqForm.question}
                    onChange={handleInputChange}
                />
                <textarea
                    name="answer"
                    className="w-full p-2 border rounded"
                    placeholder="Enter answer"
                    value={faqForm.answer}
                    onChange={handleInputChange}
                />
                <div className="text-right">
                    <Button onClick={handleAddFAQ} disabled={!faqForm.question || !faqForm.answer}>
                        + Add FAQ
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default FAQManager;
