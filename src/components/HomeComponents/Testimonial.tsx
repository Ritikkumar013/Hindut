// "use client";
// import React, { useState, useEffect } from "react";
// import Image from "next/image";
// import { motion } from "framer-motion"; // Import Framer Motion

// const testimonials = [
//   {
//     text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. It has been the industry's standard dummy",
//     name: "Sweta Tripathi",
//     designation: "Senior Designer",
//     image: "/jaya.jpg",
//   },
//   {
//     text: "The quick brown fox jumps over the lazy dog. A classic sentence used to showcase fonts and text appearance in various designs.",
//     name: "John Doe",
//     designation: "Software Engineer",
//     image: "/1.png",
//   },
//   {
//     text: "Design is intelligence made visible. The best designs come from a deep understanding of the user experience.",
//     name: "Jane Smith",
//     designation: "Creative Director",
//     image: "/2.png",
//   },
// ];

// const Testimonial = () => {
//   const [activeIndex, setActiveIndex] = useState(0);

//   // Auto-slide every 5 seconds
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
//     }, 5000);

//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className=" relative">
//       {/* Background Image Container */}
//       <Image 
//         src="/goldenF.png"
//         alt="goldenFrame.png"
//         width={1438}
//         height={424}
//         className="w-full"
//         />
      
//         <div className="absolute left-[50%] lg:top-[25%] top-8 w-full" >
//         <div className="flex items-center  lg:pl-32 pl-24" style={{transform: 'translateX(-50%)'}}>
//           {/* Left Side - Text */}
//           <motion.div
//             key={activeIndex} // Key changes, triggering animation
//             initial={{ opacity: 0, y: 10 }} // Start hidden and slightly below
//             animate={{ opacity: 1, y: 0 }} // Fade in and move up
//             exit={{ opacity: 0, y: -10 }} // Fade out and move up
//             transition={{ duration: 0.8, ease: "easeOut" }} // Smooth transition
//             className="basis-1/2"
//           >
//             <p className="lg:text-xl md:text-md  text-gray-700 lg:mb-8 mb-4">{testimonials[activeIndex].text}</p>
//             <h1 className="lg:mt-4  lg:text-2xl md:text-md font-semibold text-orange-600">
//               {testimonials[activeIndex].name}
//             </h1>
//             <p className="text-gray-500">{testimonials[activeIndex].designation}</p>

//             {/* Pagination Dots Below Designation */}
//             <div className="flex justify-start mt-4 space-x-2">
//               {testimonials.map((_, index) => (
//                 <div
//                   key={index}
//                   onClick={() => setActiveIndex(index)} // Clickable dots
//                   className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
//                     index === activeIndex ? "bg-orange-500 lg:w-4 lg:h-4 w-1 h-1" : "bg-gray-300"
//                   }`}
//                 />
//               ))}
//             </div>
//           </motion.div>

//           {/* Right Side - Image */}
//           <motion.div
//             key={`image-${activeIndex}`} // Ensure image also fades in
//             initial={{ opacity: 0, scale: 0.9 }} // Start faded out and smaller
//             animate={{ opacity: 1, scale: 1 }} // Fade in and scale up
//             exit={{ opacity: 0, scale: 0.9 }} // Fade out and shrink
//             transition={{ duration: 0.8, ease: "easeOut" }}
//             className="basis-1/2 flex justify-center pl-32"
//           >
//             <div>
//             <Image
//               className="lg:w-60 w-32 rounded-full"
//               src={testimonials[activeIndex].image}
//               alt={testimonials[activeIndex].name}
//               width={1080}
//               height={828}
//             /></div>
//           </motion.div>
//         </div>
//         </div>
      
//     </div>
//   );
// };

// export default Testimonial;


"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const testimonials = [
  {
    text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. It has been the industry's standard dummy",
    name: "Sweta Tripathi",
    designation: "Senior Designer",
    image: "/jaya.jpg",
  },
  {
    text: "The quick brown fox jumps over the lazy dog. A classic sentence used to showcase fonts and text appearance in various designs.",
    name: "John Doe",
    designation: "Software Engineer",
    image: "/1.png",
  },
  {
    text: "Design is intelligence made visible. The best designs come from a deep understanding of the user experience.",
    name: "Jane Smith",
    designation: "Creative Director",
    image: "/2.png",
  },
];

const Testimonial = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      {/* Background Image */}
      <div className="w-full">
        <Image
          src="/goldenF.png"
          alt="Background"
          width={1438}
          height={424}
          className="w-full  hidden md:block"
        />
        <Image
          src="/goldenF2.png"
          alt="Background Mobile"
          width={750}
          height={300}
          className="w-full h-[620px] md:hidden"
        />
      </div>

      {/* Content Container */}
      <div className="absolute left-[50%] md:top-8 top-20 lg:top-[20%] w-full lg:px-0 md:px-6">
        <div
          className="flex flex-col md:flex-row items-center lg:pl-32 md:pl-8  md:px-0 px-8"
          style={{ transform: "translateX(-50%)" }}
        >
          {/* Left Side - Text */}
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="md:basis-1/2 text-center md:text-left"
          >
            <p className="text-lg md:text-sm lg:text-lg text-gray-700 mb-10 md:mb-6">
              {testimonials[activeIndex].text}
            </p>
            <h1 className="text-xl md:text-lg lg:text-2xl font-semibold text-orange-600">
              {testimonials[activeIndex].name}
            </h1>
            <p className="text-gray-500">{testimonials[activeIndex].designation}</p>

            {/* Pagination Dots */}
            <div className="flex justify-center md:justify-start mt-4 space-x-2">
              {testimonials.map((_, index) => (
                <div
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
                    index === activeIndex ? "bg-orange-500  md:w-3 md:h-3" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </motion.div>

          {/* Right Side - Image */}
          <motion.div
            key={`image-${activeIndex}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mt-6 md:mt-0 md:basis-1/2 flex justify-center md:pl-28"
          >
            <Image
              className="w-56 md:w-40 lg:w-60 rounded-full"
              src={testimonials[activeIndex].image}
              alt={testimonials[activeIndex].name}
              width={1080}
              height={828}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Testimonial;
