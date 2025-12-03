"use client"
import React, { useState } from 'react';
import Image from 'next/image';

const AboutUs = () => {
  const [selected, setSelected] = useState<number | null>(null);

  const toggle = (id: number) => {
    if (selected === id) {
      return setSelected(null);
    }
    setSelected(id);
  };

  return (
    <div className="">
      {/* Section 1 */}
      <div className="w-full h-[70vh] flex items-center bg-[url('/4.jpg')] bg-cover bg-center lg:h-[80vh]">
        <div className="container flex flex-col items-start max-w-[1280px] mx-auto gap-[10px] text-white px-5 md:px-10 lg:mb-[-80px]">
          <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl">About Us</h1>
        </div>
      </div>

      {/* Section 2 */}
      <div className="py-14">
        <div className="max-w-screen-xl container mx-auto px-5 md:px-10">
          <div className="flex flex-col md:flex-row mb-8 gap-8">
            <div className="basis-3/4 md:pr-14">
              <h2 className="text-4xl mb-4 leading-10">We reimagine the way the world moves for the better</h2>
              <p className="text-sm">
                Movement is what we power. It’s our lifeblood. It runs through our veins. It’s what gets us out of bed each morning.
                It pushes us to constantly reimagine how we can move better. For you. For all the places you want to go. For all the things
                you want to get. For all the ways you want to earn. Across the entire world. In real time. At the incredible speed of now.
              </p>
            </div>
            <div className="basis-1/4">
              <Image
              width={500}
              height={500}
                alt="Globe Background"
                src="https://www.uber-assets.com/image/upload/q_auto:eco,c_fill,w_698,h_465/v1555543261/assets/cb/bed1c3-cb3e-4a20-9790-df8c8a2951fc/original/globe_background-01.svg"
                className="bg-transparent"
              />
            </div>
          </div>

          {/* Accordion Section */}
          <div className="p-3 rounded-md border-b text-black bg-white">
            <div className="flex justify-between" onClick={() => toggle(1)}>
              <h2 className="text-base">1.) This is Accordion 1</h2>
              <i className={`fa-solid fa-angle-down flex items-center ${selected === 1 ? 'rotate-180' : ''}`}></i>
            </div>
            <div className={selected === 1 ? 'text-sm py-2 text-[#ABA3A3] duration-1000 ease-in-out' : 'hidden'}>
              <p className="text-sm">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever
                since the 1500s. Lorem Ipsum is simply dummy text of the printing
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: CEO Message */}
      <div className="bg-[url('/2.jpg')] bg-cover bg-center py-40">
        <div className="max-w-screen-xl container mx-auto px-5 md:px-10">
          <div>
            <h1 className="text-white text-4xl mb-5">A letter from our CEO</h1>
            <p className="text-white mb-5 max-w-[600px] text-sm">
              Read about our team&apos;s commitment to provide everyone on our global platform with the technology that can help them move ahead.
            </p>
            <button type="button" className="text-white underline underline-offset-4">Read More!</button>
          </div>
        </div>
      </div>

      {/* Section 4: Sustainability */}
      <div className="py-6 lg:py-14 mt-10">
        <div className="max-w-screen-xl container mx-auto px-5 md:px-10">
          <div className="flex flex-col md:flex-row gap-5 items-center">
            <div className="basis-1/2">
              <Image width={200} height={200} alt='image' src="/5.jpg" className="w-full md:max-w-[500px] h-[300px] rounded-lg" />
            </div>
            <div className="basis-1/2">
              <h3 className="text-3xl mb-5">Sustainability</h3>
              <p className="text-md mb-3">
                Auto Bargain is committing to becoming a fully electric, zero-emission platform by 2040, with 100% of rides taking place in zero-emission
                vehicles, on public transit, or with micromobility. It is our responsibility as the largest mobility platform in the world to more aggressively
                tackle the challenge of climate change. We will do this by offering riders more ways to ride green, helping drivers go electric, making transparency
                a priority and partnering with NGOs and the private sector to help expedite a clean and just energy transition.
              </p>
              <p className="underline underline-offset-4 text-sm font-bold"><a href="#">Learn More</a></p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Another Sustainability */}
      <div className="py-8 pb-14 md:py-14">
        <div className="max-w-screen-xl container mx-auto px-5 md:px-10">
          <div className="flex flex-col-reverse md:flex-row gap-5 items-center">
            <div className="basis-1/2 pr-4">
              <h3 className="text-3xl mb-5">Sustainability</h3>
              <p className="text-md mb-3">
                Auto Bargain is committing to becoming a fully electric, zero-emission platform by 2040, with 100% of rides taking place in zero-emission
                vehicles, on public transit, or with micromobility. It is our responsibility as the largest mobility platform in the world to more aggressively
                tackle the challenge of climate change. We will do this by offering riders more ways to ride green, helping drivers go electric, making transparency
                a priority and partnering with NGOs and the private sector to help expedite a clean and just energy transition.
              </p>
              <p className="underline underline-offset-4 text-sm font-bold"><a href="#">Learn More</a></p>
            </div>
            <div className="basis-1/2">
              <Image width={200} height={200} alt='image' src="/2.jpg" className="w-full md:max-w-[500px] ml-auto rounded-lg h-[300px]" />
            </div>
          </div>
        </div>
      </div>

      {/* Section 6: Top Reads */}
      <div className="py-14 bg-white">
        <div className="max-w-screen-xl container mx-auto px-5 md:px-10 text-center">
          <h2 className="text-3xl text-[#0D0D0D] pb-3 text-center">Our Top Reads</h2>
          <p className="text-xs text-[#626262] max-w-[400px] mx-auto text-center mb-10 lg:mb-5">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
          </p>
          <div className="flex flex-col md:flex-row gap-8 md:gap-5 mb-4 text-left">
            <div className="basis-1/3 border bg-gray-100 rounded-lg">
              <Image width={400} height={400} alt='image' src="/2.jpg" className="w-full rounded-t-lg" />
              <div className="p-3 flex flex-col gap-2 pb-4">
                <h5 className="text-lg">Who&apos;s driving Auto Bargain</h5>
                <p className="text-sm mb-2 text-gray-600">
                  We’re building a culture within Auto Bargain that emphasizes doing the right thing, period, for riders, drivers, and employees.
                </p>
                <p className="text-xs"><a className="underline-offset-2 underline text-black font-bold" href="#">See our leadership</a></p>
              </div>
            </div>
            <div className="basis-1/3 border bg-gray-100 rounded-lg">
              <Image width={400} height={400} alt='image' src="/2.jpg" className="w-full rounded-t-lg" />
              <div className="p-3 flex flex-col gap-2 pb-4">
                <h5 className="text-lg">Who`&apos;s driving Auto Bargain</h5>
                <p className="text-sm mb-2 text-gray-600">
                  We’re building a culture within Auto Bargain that emphasizes doing the right thing, period, for riders, drivers, and employees.
                </p>
                <p className="text-xs"><a className="underline-offset-2 underline text-black font-bold" href="#">See our leadership</a></p>
              </div>
            </div>
            <div className="basis-1/3 border bg-gray-100 rounded-lg">
              <Image width={400} height={400} alt='image' src="/3.jpg" className="w-full rounded-t-lg" />
              <div className="p-3 flex flex-col gap-2 pb-4">
                <h5 className="text-lg">Who`&apos;s driving Auto Bargain</h5>
                <p className="text-sm mb-2 text-gray-600">
                  We&apos;re building a culture within Auto Bargain that emphasizes doing the right thing, period, for riders, drivers, and employees.
                </p>
                <p className="text-xs"><a className="underline-offset-2 underline text-black font-bold" href="#">See our leadership</a></p>
              </div>
            </div>
          </div>
          <button className="bg-[#0D0D0D] text-[#FFFFFF] text-[13px] rounded-[25px] py-[12px] px-5 my-5 mx-auto">
            Read All!
          </button>
        </div>
      </div>

      {/* Section 7: Company Info */}
      {/* <div className="py-14 bg-[#1A1919]">
        <div className="max-w-screen-xl container mx-auto px-5 md:px-10">
          <h2 className="text-3xl text-white pb-3 text-center">Company Info</h2>
          <p className="text-xs text-[#626262] max-w-[500px] mx-auto text-center mb-12 lg:mb-5">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
          </p>
          <div className="flex flex-col md:flex-row gap-10 md:gap-5 text-white">
            <div className="basis-1/3">
              <img src="./Images/megaphone-outlined.svg" className="img-fluid mb-3" />
              <h5 className="text-xl mb-2">Newsroom</h5>
              <p className="text-sm mb-3 text-[#626262]">
                Get announcements about partnerships, app updates, initiatives, and more near you and around the world.
              </p>
              <a className="text-sm text-white underline underline-offset-2" href="#">Go to Newsroom</a>
            </div>
            <div className="basis-1/3">
              <img src="./Images/person_group-filled.svg" className="img-fluid mb-3" />
              <h5 className="text-xl mb-2">Blog</h5>
              <p className="text-sm mb-3 text-[#626262]">
                Get announcements about partnerships, app updates, initiatives, and more near you and around the world.
              </p>
              <a className="text-sm text-white underline underline-offset-2" href="#">Read our Posts</a>
            </div>
            <div className="basis-1/3">
              <img src="./Images/network-filled.svg" className="img-fluid mb-3" />
              <h5 className="text-xl mb-2">Investor Relations</h5>
              <p className="text-sm mb-3 text-[#626262]">
                Get announcements about partnerships, app updates, initiatives, and more near you and around the world.
              </p>
              <a className="text-sm text-white underline underline-offset-2" href="#">See our Investors</a>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default AboutUs;
