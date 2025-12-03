"use client";
import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const faqs = [
  {
    question: "What is your refund policy?",
    answer:
      "We offer a full refund within 30 days of purchase if you're not satisfied with our product.",
  },
  {
    question: "How do I track my order?",
    answer:
      "You can track your order by logging into your account and visiting the 'Orders' section.",
  },
  {
    question: "Do you offer international shipping?",
    answer:
      "Yes, we ship internationally. Shipping rates and delivery times vary depending on the destination.",
  },
  {
    question: "Do you offer international shipping?",
    answer:
      "Yes, we ship internationally. Shipping rates and delivery times vary depending on the destination.",
  },
];

const Faqs = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="py-20 px-6">
      <h1 className="text-center text-5xl font-bold text-orange-500 mb-8">
        FAQs
      </h1>

      <div className="max-w-5xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className=" bg-orange-200 ">
            {/* Question */}
            <button
              className="w-full text-left px-6 py-3 flex justify-between items-center text-lg text-black"
              onClick={() => toggleFAQ(index)}
            >
              {faq.question}
              <span className="text-black text-2xl">
                {openIndex === index ? <FaChevronUp />  : <FaChevronDown />}
              </span>
            </button>

            {/* Answer (Collapsible Section) */}
            {openIndex === index && (
              <div className="px-6 py-3 text-gray-700 bg-orange-100 rounded-b-lg">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Faqs;
