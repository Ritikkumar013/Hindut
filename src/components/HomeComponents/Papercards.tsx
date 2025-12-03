// import React from "react";
// import Image from "next/image";

// const Papercards = () => {
//   return (
//     <div className="bg-[url('/Group45-2.png')] bg-cover bg-center bg-no-repeat pt-10">
//       {/* Section with background image */}
//       <h1 className="text-center text-5xl text-orange-600 font-bold bg-opacity-70 px-6 py-4 rounded-lg">
//         Extra Feature To Enhance <br /> <span className="text-orange-400">User Experience</span>
//       </h1>

//       {/* Image Section */}
//       <div className="container flex justify-center gap-10 mx-auto mt-10 pb-60">
//         <div className="text-center content-center">
//           <Image
//             className="max-w-sm mx-auto"
//             src="/paper1.png"
//             alt="Ram"
//             width={500}
//             height={500}
//           />
//           <div className="text-center px-20 -mt-76 w-full">
//             <h1 className="text-2xl mb-5">Time-Based Challenges</h1>
//             <p className="">
//               {" "}
//               Lorem Ipsum is simply dummy text of the printing and typesetting
//               industry.
//             </p>
//           </div>
//         </div>

//         <div>
//           <Image
//             className="max-w-sm mx-auto"
//             src="/paper2.png"
//             alt="Ram"
//             width={500}
//             height={500}
//           />
//           <div className="text-center px-20 -mt-76 w-full">
//             <h1 className="text-2xl mb-5">Misson & Challenges</h1>
//             <p className="">
//               {" "}
//               Lorem Ipsum is simply dummy text of the printing and typesetting
//               industry.
//             </p>
//           </div>
//         </div>

//         <div className="">
//           <Image
//             className="max-w-sm mx-auto"
//             src="/paper3.png"
//             alt="Ram"
//             width={500}
//             height={500}
//           />
//           <div className="text-center px-20 -mt-76 w-full">
//             <h1 className="text-2xl mb-5">Customizable Quiz Difficulty</h1>
//             <p className="">
//               {" "}
//               Lorem Ipsum is simply dummy text of the printing and typesetting
//               industry.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Papercards;


"use client";
import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const Papercards = () => {
  const features = [
    {
      img: "/paper1.png",
      title: "Time-Based Challenges",
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    },
    {
      img: "/paper2.png",
      title: "Mission & Challenges",
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    },
    {
      img: "/paper3.png",
      title: "Customizable Quiz Difficulty",
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    },
  ];

  return (
    <div className="bg-[url('/Group45-2.png')] bg-cover bg-center bg-no-repeat pt-10 font-serif">
      <h1 className="text-center text-5xl text-orange-600 font-bold bg-opacity-70 px-6 py-4 rounded-lg">
        Extra Feature To Enhance <br />{" "}
        <span className="text-orange-400">User Experience</span>
      </h1>

      {/* Swiper for Responsive Design */}
      <div className="container mx-auto pb-20 px-4"> {/* Reduced pb-60 to pb-20 */}
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={20}
          slidesPerView={1}
          pagination={{ clickable: true }}
          navigation
          breakpoints={{
            768: { slidesPerView: 1.5 },
            1024: { slidesPerView: 3 },
          }}
          className="pb-14" 
        >
          {features.map((feature, index) => (
            <SwiperSlide key={index}>
              <div className="text-center relative">
                <div className="relative">
                  <Image
                    className="mx-auto w-96"
                    src={feature.img}
                    alt={feature.title}
                    width={500}
                    height={500}
                  />
                  <div className="absolute inset-0 flex flex-col justify-center items-center px-20 mt-24">
                    <h1 className="text-2xl font-semibold mb-3">{feature.title}</h1>
                    <p className="max-w-xs">{feature.description}</p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default Papercards;

