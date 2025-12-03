import React from 'react';

const AncientScroll = () => {
  return (
    <div className="mt-20 bg-[url('/Group2.png')] md:bg-[url('/Group30.png')] bg-center bg-cover lg:min-h-screen md:min-h-screen flex items-center min-h-[200vh] md:py-0">
      <div className="container mx-auto px-16 lg:px-6">
        <div className="flex flex-col md:flex-row gap-8 md:gap-4 lg:mx-16 text-center">
          {/* Card 1 */}
          <div className="w-full md:w-1/4 px-2 py-8 lg:px-10">
            <h1 className="text-xl font-semibold font-serif">Learn & Explore</h1>
            <p className="mt-4 text-sm leading-7 font-serif">
              It is a long established fact that a reader will be distracted by
              the readable content of a page when looking at its layout.
            </p>
          </div>

          {/* Card 2 */}
          <div className="w-full md:w-1/4 px-2 py-8 lg:px-10 ">
            <h1 className="text-xl font-semibold">Learn & Explore</h1>
            <p className="mt-4 text-sm leading-7">
              It is a long established fact that a reader will be distracted by
              the readable content of a page when looking at its layout.
            </p>
          </div>

          {/* Card 3 */}
          <div className="w-full md:w-1/4 px-2 py-8 lg:px-10">
            <h1 className="text-xl font-semibold">Learn & Explore</h1>
            <p className="mt-4 text-sm leading-7">
              It is a long established fact that a reader will be distracted by
              the readable content of a page when looking at its layout.
            </p>
          </div>

          {/* Card 4 */}
          <div className="w-full md:w-1/4 px-2 py-8 lg:px-10">
            <h1 className="text-xl font-semibold">Learn & Explore</h1>
            <p className="mt-4 text-sm leading-7">
              It is a long established fact that a reader will be distracted by
              the readable content of a page when looking at its layout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AncientScroll;