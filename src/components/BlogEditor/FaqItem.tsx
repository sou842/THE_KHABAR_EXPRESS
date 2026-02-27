 const FAQItem = ({ question, answer }: { question: string; answer: string }) => (
  <div className="w-full flex flex-col gap-4 mb-4 border-b pb-2" itemScope itemType="https://schema.org/Question">
    <h3 className="font-semibold text-lg" itemProp="name">
      Q: {question}
    </h3>
    <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
      <p className="text-gray-700" itemProp="text">
        {answer || ''}
      </p>
    </div>
  </div>
);


export default FAQItem;