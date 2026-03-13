import Head from 'next/head';
export interface IFaqItem {
    question: string;
    answer: string;
    lastItem?: boolean;
}

const FAQItem = ({ question, answer, lastItem }: IFaqItem) => (
    <div
        itemScope
        itemType="https://schema.org/Question"
        className={`w-full flex flex-col gap-4 ${lastItem ? 'border-b-0' : 'border-b mb-4 pb-2'}`}
    >
        <h3 className="font-semibold text-lg" itemProp="name">
            Q: {question || ''}
        </h3>
        <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
            <p className="text-gray-700" itemProp="text">
                {answer || ''}
            </p>
        </div>
    </div>
);

const FaqSchema = ({ faqs }: { faqs: IFaqItem[] }) => {
    if (!faqs?.length) return null;

    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs?.map((faq) => ({
            "@type": "Question",
            "name": faq?.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq?.answer,
            },
        })),
    };

    return (
        <>
            <Head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
                />
            </Head>
            {faqs?.map((faq, index) => (
                <FAQItem key={index} question={faq?.question} answer={faq?.answer} lastItem={index === faqs?.length - 1} />
            ))}
        </>
    );
};

export default FaqSchema;
