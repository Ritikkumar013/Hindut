"use client";
import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const faqs = [
  {
    question: "Our Purpose",
    answer:
      "HindutavQuiz was created to bridge the gap between ancient Hindu wisdom and modern interactive learning. Our aim is to make dharmic knowledge simple to understand yet profound enough to inspire every learner.",
  },
  {
    question: "What We Offer",
    answer:
      "We offer quizzes, learning modules, challenges, and curated content based on scriptures, mythology, rituals, values, festivals, and Hindu cultural foundations — all presented with clarity and accuracy.",
  },
  {
    question: "Who Is Hindutva For?",
    answer:
      "Whether you are a student, a parent, a devotee, or simply someone curious about India’s spiritual heritage, Hindutva offers tools for everyone to learn, grow, and rediscover the essence of dharma.",
  },
  {
    question: "Why Hindu Dharma?",
    answer:
      "Hinduism is one of the world’s oldest and richest knowledge systems. Its philosophies on life, duty, devotion, and inner growth offer guidance that remains timeless. Through our platform, we help learners explore these teachings in an approachable way.",
  },
   {
    question: "Our Commitment",
    answer:
      "We are committed to accuracy, respect, and authenticity. Every quiz and learning element is thoughtfully crafted to honor Hindu beliefs and present them responsibly to learners around the world.",
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
