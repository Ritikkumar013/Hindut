import React from "react";


const Banner2 = () => {
  return (
    <div className="bg-[url('/bannerDark.jpg')] sm:bg-[url('/bannerDark.jpg')] bg-center bg-cover min-h-screen w-full flex items-center lg:py-24 md:py-20 pt-32">
      <div className="   mx-auto px-8 flex flex-col md:flex-row lg:flex-row items-center lg:gap-8 md:gap-2">
        {/* Left Side - Text */}
        <div className="w-full lg:w-1/2 text-left space-y-6">
          <h1 className="text-3xl lg:text-4xl xl:text-5xl text-orange-100 font-bold leading-tight">
            Lorem Ipsum is simply dummy text of the printing industry.
          </h1>
          <p className="text-base lg:text-lg text-white">
            It is a long established fact that a reader will be distracted by
            the readable content of a page when looking at its layout. The point
            of using Lorem Ipsum is that it has a more-or-less normal
            distribution of letters.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <input
              placeholder="Enter Email"
              className="w-full placeholder:text-white sm:w-72 p-3 border border-orange-50 focus:ring-2 focus:ring-orange-500 outline-none rounded-md"
              type="email"
            />
            <button className="w-full sm:w-auto bg-orange-200 p-3 px-8 text-orange-600 font-semibold  transition duration-300 rounded-md">
              Submit
            </button>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="w-full lg:w-1/2">
          <div className="relative w-full aspect-square max-w-xl mx-auto">
            {/* <Image
              src="/bannerOm.png"
              alt="Banner"
              fill
              className="object-contain"
              priority
            /> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner2;