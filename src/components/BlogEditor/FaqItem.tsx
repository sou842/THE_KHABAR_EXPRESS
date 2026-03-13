import { IFaqItem } from "./FaqSchema";

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

export default FAQItem;