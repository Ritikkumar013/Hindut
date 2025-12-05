import React from "react";
import Image from "next/image";

const Videosection = () => {
  return (
    <div className="bg-[url('/Group45.jpg')] bg-cover bg-center min-h-[150vh] lg:py-32 md:py-16 py-32">
      <h1 className=" text-white text-center text-5xl font-bold">
       Your Path to the Ultimate<br /> Quiz Challenge
      </h1>

      <div className="lg:mx-20 md:mx-14 mx-10 my-16">
        <iframe
          className="w-full lg:h-[500px] md:h-[400px] h-[250px]"
          src="https://www.youtube.com/embed/leVoi6kkp3o"
          title="YouTube Video"
          allow="autoplay; encrypted-media"
          allowFullScreen
        ></iframe>
      </div>

      <div className="flex lg:flex-row md:flex-row flex-col items-center gap-10 relative lg:mx-16">
        <div className="basis-1/2 lg:px-10 pl-10 px-5  relative">
          <h1 className="text-5xl text-white font-bold">Join the Quiz</h1>
          <p className="mt-6 text-white">
            Test your knowledge of Hinduism with fun, engaging, and thoughtfully designed quizzes. From mythology to traditions, challenge yourself and improve with every step.
          </p>
          <button className="bg-orange-600 p-2 px-10 mt-6 text-white rounded-sm">
            Start Quiz →
          </button>
          <Image
            className="lg:max-w-36 max-w-30 absolute lg:right-[30%] right-[0%] top-[75%] lg:top-[90%]"
            src="/Group34.png"
            alt="block"
            width={500}
            height={500}
          />
        </div>
        <div className="basis-1/2 flex lg:justify-center">
          <Image
            className="lg:max-w-sm max-w-xs"
            src="/temple.png"
            alt="Ram"
            width={500}
            height={500}
          />
        </div>
      </div>
    </div>
  );
};

export default Videosection;
