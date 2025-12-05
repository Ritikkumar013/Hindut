"use client";
import React, { useState } from "react";
import Image from "next/image";

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
          <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl">
            About Us
          </h1>
        </div>
      </div>

      {/* Section 2 */}
      <div className="py-14">
        <div className="max-w-screen-xl container mx-auto px-5 md:px-10">
          <div className="flex flex-col md:flex-row mb-8 gap-8">
            <div className="basis-3/4 md:pr-14">
              <h2 className="text-4xl mb-4 leading-10">
                We inspire the world to rediscover Hindu wisdom through learning
              </h2>
              <p className="text-sm">
                HindutavQuiz is built with one purpose: to make the knowledge of
                Hindu dharma accessible, engaging, and meaningful for everyone.
                Our platform brings together timeless wisdom, sacred stories,
                and spiritual insights in a format that today’s generation can
                easily experience and enjoy.
                <br />
                We believe learning about our culture should be inspiring,
                interactive, and rooted in authenticity. For all who seek
                clarity, for all who seek truth, and for all who wish to
                understand Hindu heritage at a deeper level, HindutavQuiz is
                here to guide your journey.
              </p>
            </div>
            <div className="basis-1/4">
              <Image
                width={500}
                height={500}
                alt="Globe Background"
                // src="https://www.uber-assets.com/image/upload/q_auto:eco,c_fill,w_698,h_465/v1555543261/assets/cb/bed1c3-cb3e-4a20-9790-df8c8a2951fc/original/globe_background-01.svg"
                src="/ram1.png"
                className="bg-transparent"
              />
            </div>
          </div>

          {/* Accordion Section */}
          {/* <div className="p-3 rounded-md border-b text-black bg-white">
            <div className="flex justify-between" onClick={() => toggle(1)}>
              <h2 className="text-base">1.) This is Accordion 1</h2>
              <i
                className={`fa-solid fa-angle-down flex items-center ${
                  selected === 1 ? "rotate-180" : ""
                }`}
              ></i>
            </div>
            <div
              className={
                selected === 1
                  ? "text-sm py-2 text-[#ABA3A3] duration-1000 ease-in-out"
                  : "hidden"
              }
            >
              <p className="text-sm">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry&apos;s standard
                dummy text ever since the 1500s. Lorem Ipsum is simply dummy
                text of the printing
              </p>
            </div>
          </div> */}
        </div>
      </div>

      {/* Section 3: CEO Message */}
      <div className="bg-[url('/2.jpg')] bg-cover bg-center py-40">
        <div className="max-w-screen-xl container mx-auto px-5 md:px-10">
          <div>
            <h1 className="text-white text-4xl mb-5">A letter from our CEO</h1>
            <p className="text-white mb-5 max-w-[600px] text-sm">
              At Hindutav Quiz, our mission is simple — to empower people with
              the knowledge of Hindu dharma in a way that is engaging and
              accessible. We believe that understanding our cultural roots
              builds confidence, clarity, and inner strength.
              <br />
              Through technology and interactive learning, we are creating a
              platform where every user can deepen their connection with Hindu
              traditions, explore spiritual concepts, and celebrate the vast
              wisdom of our ancestors.
            </p>
            <button
              type="button"
              className="text-white underline underline-offset-4"
            >
              Read More!
            </button>
          </div>
        </div>
      </div>

      {/* Section 4: Sustainability */}
      <div className="py-6 lg:py-14 mt-10">
        <div className="max-w-screen-xl container mx-auto px-5 md:px-10">
          <div className="flex flex-col md:flex-row gap-5 items-center">
            <div className="basis-1/2">
              <Image
                width={200}
                height={200}
                alt="image"
                src="/5.jpg"
                className="w-full md:max-w-[500px] h-[300px] rounded-lg"
              />
            </div>
            <div className="basis-1/2">
              <h3 className="text-3xl mb-5">
                Preserving Knowledge for Future Generations
              </h3>
              <p className="text-md mb-3">
                Just as sustainability protects our planet, preserving
                traditional wisdom protects our cultural identity. At Hindutav
                Quiz, we are committed to safeguarding Hindu teachings by
                presenting them in formats that resonate with young learners
                today.
                <br />
                <br />
                Our vision is to keep ancient knowledge alive, respected, and
                relevant so it may continue to guide future generations with the
                same strength it offered our ancestors.
              </p>
              <p className="underline underline-offset-4 text-sm font-bold">
                <a href="#">Learn More</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Another Sustainability */}
      <div className="py-8 pb-14 md:py-14">
        <div className="max-w-screen-xl container mx-auto px-5 md:px-10">
          <div className="flex flex-col-reverse md:flex-row gap-5 items-center">
            <div className="basis-1/2 pr-4">
              <h3 className="text-3xl mb-5">
                Our Responsibility Toward Cultural Sustainability
              </h3>
              <p className="text-md mb-3">
                We understand that Hindu dharma is not just a religion — it is a living heritage. Our responsibility is to ensure that sacred teachings, scriptures, and stories are passed down accurately, respectfully, and engagingly.

<br /> <br /> 
By using digital learning, simplified content, and interactive tools, we help learners not only gain information but also connect emotionally and spiritually with the roots of Hindu culture.

              </p>
              <p className="underline underline-offset-4 text-sm font-bold">
                <a href="#">Learn More</a>
              </p>
            </div>
            <div className="basis-1/2">
              <Image
                width={200}
                height={200}
                alt="image"
                src="/2.jpg"
                className="w-full md:max-w-[500px] ml-auto rounded-lg h-[300px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 6: Top Reads */}
      <div className="py-14 bg-white">
        <div className="max-w-screen-xl container mx-auto px-5 md:px-10 text-center">
          <h2 className="text-3xl text-[#0D0D0D] pb-3 text-center">
            Our Top Reads
          </h2>
          <p className="text-xs text-[#626262] max-w-[400px] mx-auto text-center mb-10 lg:mb-5">
            Insights and articles designed to deepen your understanding of Hindu dharma.
          </p>
          <div className="flex flex-col md:flex-row gap-8 md:gap-5 mb-4 text-left">
            <div className="basis-1/3 border bg-gray-100 rounded-lg">
              <Image
                width={400}
                height={400}
                alt="image"
                src="/2.jpg"
                className="w-full rounded-t-lg"
              />
              <div className="p-3 flex flex-col gap-2 pb-4">
                <h5 className="text-lg">Understanding the Ramayana</h5>
                <p className="text-sm mb-2 text-gray-600">
                  A closer look at the lessons, values, and divine messages behind one of Hinduism’s most revered epics.
                </p>
                <p className="text-xs">
                  <a
                    className="underline-offset-2 underline text-black font-bold"
                    href="#"
                  >
                    See our leadership
                  </a>
                </p>
              </div>
            </div>
            <div className="basis-1/3 border bg-gray-100 rounded-lg">
              <Image
                width={400}
                height={400}
                alt="image"
                src="/2.jpg"
                className="w-full rounded-t-lg"
              />
              <div className="p-3 flex flex-col gap-2 pb-4">
                <h5 className="text-lg">The Significance of Hindu Festivals</h5>
                <p className="text-sm mb-2 text-gray-600">
                  Discover why our festivals hold such spiritual meaning and how they shape the cultural identity of millions.
                </p>
                <p className="text-xs">
                  <a
                    className="underline-offset-2 underline text-black font-bold"
                    href="#"
                  >
                    See our leadership
                  </a>
                </p>
              </div>
            </div>
            <div className="basis-1/3 border bg-gray-100 rounded-lg">
              <Image
                width={400}
                height={400}
                alt="image"
                src="/3.jpg"
                className="w-full rounded-t-lg"
              />
              <div className="p-3 flex flex-col gap-2 pb-4">
                <h5 className="text-lg">The Wisdom of the Bhagavad Gita</h5>
                <p className="text-sm mb-2 text-gray-600">
                   Explore the timeless teachings of Krishna that guide humanity toward duty, devotion, and self-realization.
                </p>
                <p className="text-xs">
                  <a
                    className="underline-offset-2 underline text-black font-bold"
                    href="#"
                  >
                    See our leadership
                  </a>
                </p>
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
