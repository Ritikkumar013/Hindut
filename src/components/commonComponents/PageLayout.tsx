import React from "react";
import Image from "next/image";

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-12">
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
            <h1 className="text-5xl text-orange-500 font-bold">{title}</h1>
            {children}
          </div>
        </div>
      </div>
      <div className="relative w-full">
        <div className="absolute left-1/2 transform -translate-x-1/2 -top-20">
          <Image
            src="/Group31.png"
            alt="Arrow"
            width={1080}
            height={828}
            className="w-full max-w-screen-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default PageLayout; 