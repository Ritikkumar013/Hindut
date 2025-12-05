// import React from "react";

// const Banner2 = () => {
//   return (
//     <div className="bg-[url('/bgRed.jpg')] sm:bg-[url('/bgRed.jpg')] bg-center bg-cover md:min-h-screen min-h-[70vh] w-full flex items-center lg:py-24 md:py-20 pt-32">
//       <div className="lg:p-20 p-10  flex flex-col md:flex-row lg:flex-row items-center lg:gap-28 gap-2">
//         {/* Left Side - Text */}
//         <div className="w-full  text-left space-y-6">
//           <h1 className="text-3xl lg:text-4xl xl:text-5xl text-orange-100 font-bold leading-tight">
//             Discover Hinduism the Simple Way
//           </h1>
//           <p className="text-base lg:text-lg text-white">
//             Learn, explore, and experience the timeless wisdom, culture, and
//             values of Hinduism through stories, lessons, and interactive
//             quizzes.<br />
//            <span className="font-bold text-lg mt-2"> Start Learning</span>
//           </p>

//           <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
//             <input
//               placeholder="Enter Email"
//               className="w-full placeholder:text-white sm:w-72 p-3 border border-orange-50 focus:ring-2 focus:ring-orange-500 outline-none rounded-md"
//               type="email"
//             />
//             <button className="w-full sm:w-auto bg-orange-200 hover:bg-orange-300 hover:text-white/80 p-3 px-8 text-orange-600 font-semibold  transition duration-300 rounded-md">
//               Submit
//             </button>
//           </div>
//         </div>

//         {/* Right Side - Image */}
//         <div className="w-full lg:w-1/2">
//           <div className="relative w-full aspect-square max-w-xl mx-auto">
//             {/* <Image
//               src="/bannerOm.png"
//               alt="Banner"
//               fill
//               className="object-contain"
//               priority
//             /> */}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Banner2;

import React from "react";
import Link from "next/link";

const Banner2 = () => {
  return (
    <div className="bg-[url('/bgRed.jpg')] sm:bg-[url('/bgRed.jpg')] bg-center bg-cover md:min-h-screen min-h-[70vh] w-full flex items-center lg:py-24 md:py-20 py-32 ">
      <div className="lg:p-20 md:p-10 p-10 pb-0 flex flex-col md:flex-row lg:flex-row items-center lg:gap-28 gap-2">
        {/* Left Side - Text */}
        <div className="w-full text-left space-y-6">
          <h1 className="text-3xl lg:text-4xl xl:text-5xl text-orange-100 font-bold leading-tight">
            Discover Hinduism the Simple Way
          </h1>
          <p className="text-base lg:text-lg text-white">
            Learn, explore, and experience the timeless wisdom, culture, and
            values of Hinduism through stories, lessons, and interactive
            quizzes.<br />
           {/* <span className="font-bold text-lg mt-2"> Start Learning</span> */}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* <input
              placeholder="Enter Email"
              className="w-full placeholder:text-white sm:w-72 p-3 border border-orange-50 focus:ring-2 focus:ring-orange-500 outline-none rounded-md"
              type="email"
            /> */}
            {/* <button className="w-full sm:w-auto bg-orange-200 hover:bg-orange-300 hover:text-white/80 p-3 px-8 text-orange-600 font-semibold transition duration-300 rounded-md">
              Submit
            </button> */}

           <Link href='/quiz'> <button className="w-full sm:w-auto bg-orange-200 hover:bg-orange-300 hover:text-white/80 p-3 px-8 text-orange-600 font-semibold transition duration-300 rounded-md">
             Earn & Learn
            </button></Link>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="w-full lg:w-1/2 hidden md:block">
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