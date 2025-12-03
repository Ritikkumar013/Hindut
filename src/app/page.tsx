import React from "react";
import Banner2 from "@/components/HomeComponents/Banner2";
import Ancientscroll from "@/components/HomeComponents/Ancientscroll";
import Videosection from "@/components/HomeComponents/Videosection";
import Papercards from "@/components/HomeComponents/Papercards";
import Testimonial from "@/components/HomeComponents/Testimonial";
import Faqs from "@/components/HomeComponents/Faqs";
import { ToastContainer, Zoom } from "react-toastify";
import Aboutus from "@/components/HomeComponents/Aboutus";
const page = () => {
  return (
    <div className="bg-[#fff5e5] overflow-x-hidden font-serif">
      {/* Toast Container - Required for toasts to appear */}
      <ToastContainer position="top-center" autoClose={3000} transition={Zoom} />

      <div>
        <Banner2 />
      </div>

      <div className="-mt-32 bg-[url('/Group_48.png')] bg-cover bg-center min-h-[220vh]">
        <Ancientscroll />

        <Aboutus />
      </div>

      <div className="lg:-mt-35 md:-mt-45 mt-20">
        <Videosection />
      </div>

      <div>
        <Papercards />
      </div>

      <div>
        <Testimonial />
      </div>

      <div>
        <Faqs />
      </div>

      
    </div>
  );
};

export default page;
