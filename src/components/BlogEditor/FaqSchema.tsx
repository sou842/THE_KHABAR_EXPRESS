import Head from 'next/head';
import FAQItem from './FaqItem';

export interface IFaqItem {
    question: string;
    answer: string;
    lastItem?: boolean;
}

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
