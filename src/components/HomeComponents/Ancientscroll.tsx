import React from "react";

const AncientScroll = () => {
  return (
    <div className="mt-10 bg-[url('/Group2.png')] md:bg-[url('/Group30.png')] bg-center bg-cover lg:min-h-screen md:min-h-screen flex items-center min-h-[200vh] md:py-0">
      <div className="container mx-auto px-16 lg:px-6">
        <div className="flex flex-col md:flex-row gap-8 md:gap-4 lg:mx-16 text-center">
          {/* Card 1 */}
          <div className="w-full md:w-1/4 px-2 py-8 lg:px-10">
            <h1 className="text-xl font-semibold font-serif">
              Sacred Teachings
            </h1>
            <p className="mt-4 text-sm leading-7 font-serif">
              Learn the key spiritual principles of Hinduism explained in a
              simple and approachable format for all age groups..
            </p>
          </div>

          {/* Card 2 */}
          <div className="w-full md:w-1/4 px-2 py-8 lg:px-10 ">
            <h1 className="text-xl font-semibold">Mythology & Epics</h1>
            <p className="mt-4 text-sm leading-7">
              Explore inspiring stories and divine characters from the Ramayana,
              Mahabharata, Puranas, and other ancient scriptures.
            </p>
          </div>

          {/* Card 3 */}
          <div className="w-full md:w-1/4 px-2 py-8 lg:px-10">
            <h1 className="text-xl font-semibold">Festivals & Traditions</h1>
            <p className="mt-4 text-sm leading-7">
              Understand the meaning, significance, and cultural importance of
              major Hindu festivals and rituals.
            </p>
          </div>

          {/* Card 4 */}
          <div className="w-full md:w-1/4 px-2 py-8 lg:px-10">
            <h1 className="text-xl font-semibold">Values & Life Lessons</h1>
            <p className="mt-4 text-sm leading-7">
              Values & Life Lessons Discover the universal teachings of truth,
              duty, compassion, and discipline that help guide a balanced life.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AncientScroll;
