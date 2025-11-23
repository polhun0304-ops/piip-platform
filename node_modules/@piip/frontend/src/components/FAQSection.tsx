import React, { useState } from 'react';
import './FAQSection.css';

const faqs = [
  {
    question: 'How does the platform work?',
    answer: 'Our platform connects you with professional detectives to solve your cases.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes, we use top-notch security measures to protect your data.',
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-premium">
      <div className="faq-container">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div
              className={`faq-item ${openIndex === index ? 'open' : ''}`}
              key={index}
              onClick={() => toggleFAQ(index)}
            >
              <div className="faq-question">
                <span className="faq-question-text">{faq.question}</span>
                <span className="faq-toggle">{openIndex === index ? '-' : '+'}</span>
              </div>
              {openIndex === index && <div className="faq-answer">{faq.answer}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
