import React from "react";
import Image from "next/image";

const Aboutus = () => {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="flex lg:flex-row md:flex-row flex-col lg:items-center md:items-center items-start relative font-serif">
        <div className="basis-1/2 flex lg:justify-center pl-9">
          <Image
            className="lg:max-w-sm max-w-xs"
            src="/Group44.png"
            alt="Ram"
            width={500}
            height={500}
          />
        </div>
        <div className="basis-1/2 lg:pr-16 md:p-5 p-7">
          <h1 className="text-5xl text-orange-500 font-bold">About Us</h1>
          <p className="mt-6 text-gray-700 leading-relaxed">
            Hindutva is a simple and friendly learning platform designed to help people understand Hinduism with clarity. Through stories, examples, and interactive learning, we make ancient knowledge easy to understand for today’s generation.
          </p>
          <p className="mt-4 text-gray-700 leading-relaxed">
           Read More:
          </p>
          <ul className="mt-4 text-gray-700 list-disc list-inside space-y-2">
            <li>Ancient scriptures and their teachings</li>
            <li>Hindu mythology and epics</li>
            <li>Festivals and their significance</li>
            <li>Sacred places and pilgrimage sites</li>
            <li>Philosophical concepts and values</li>
          </ul>
          <p className="mt-4 text-gray-700 leading-relaxed">
            Whether you&apos;re a student, a practitioner, or someone curious about Hinduism, our platform provides an engaging way to learn and test your knowledge. Join our community of learners and embark on a journey of discovery through our interactive quizzes.
          </p>
        </div>

        <div className="absolute left-[50%] lg:bottom-[-75%] md:bottom-[-65%] bottom-[-21%] max-w-screen-lg w-full">
          <Image
            style={{ transform: "translateX(-50%)"}}
            className="w-full"
            src="/Group31.png"
            alt="Ram"
            width={1080}
            height={828}
          />
        </div>
      </div>
    </div>
  );
};

export default Aboutus; 