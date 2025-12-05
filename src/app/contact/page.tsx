"use client";
import React, { useState } from "react";
// import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { Phone, Mail, MapPin } from "lucide-react";  // Using Lucide React Icons
import ContactModal from "@/components/ContactModal";

const Contact = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Section 1 - Hero Image */}
      <div className="w-full h-[70vh] flex items-center bg-[url('/5.jpg')] bg-cover bg-center lg:h-[80vh]">
        <div className="container flex flex-col items-start max-w-[1280px] mx-auto gap-[10px] text-white px-5 md:px-10 lg:mb-[-80px]">
          <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl">
            Contact Us
          </h1>
        </div>
      </div>

      {/* Section 2 - Contact Information */}
      <div className="bg-white py-14">
        <div className="max-w-screen-xl container mx-auto md:px-10 text-center px-5">
          <h1 className="mb-3 text-3xl text-orange-600">Have a question or suggestion? We’d love to hear from you. Reach out anytime and our team will get back to you soon.</h1>
          <p className="mb-10 max-w-[650px] mx-auto text-xs text-gray-600">
            You can also submit your message through the contact form on this page, and we will respond as quickly as possible.

          </p>

          <div className="flex flex-col items-center md:flex-row md:max-w-3xl mx-auto gap-5 justify-center mb-4">
            <div className="w-[270px] md:h-[200px] lg:w-[240px] md:basis-1/3 shadow-sm rounded-md p-8 bg-orange-100 border">
              <div className="flex gap-2 flex-col items-center">
                <Phone className="text-orange-600" size={40} />
                <p className="text-md">Call Us:</p>
                <p className="text-xs">+91 1200 456 456</p>
              </div>
            </div>
            <div className="w-[270px] md:h-[200px] lg:w-[240px] md:basis-1/3 shadow-sm rounded-md p-8 bg-orange-100 border">
              <div className="flex gap-2 flex-col items-center">
                <Mail className="text-orange-600" size={40} />
                <p className="text-md">Email To:</p>
                <p className="text-xs">developers@crobstacle.com</p>
              </div>
            </div>
            <div className="w-[270px] md:h-[200px] lg:w-[240px] md:basis-1/3 shadow-sm rounded-md p-8 bg-orange-100 border">
              <div className="flex gap-2 flex-col items-center">
                <MapPin className="text-orange-600" size={40} />
                <p className="text-md">Our Location:</p>
                <p className="text-xs">1st floor, Opp. Lake Garden, Sewla Khurd, Uttarakhand 248001.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3 - Map and Contact Details */}
      <div className="text-sm">
        <div className="md:flex">
          <div className="md:basis-1/3">
            <iframe
              className="min-h-[280px]"
              src="https://maps.google.com/maps?q=manhatan&t=&z=13&ie=UTF8&iwloc=&output=embed"
              frameBorder="0"
              style={{ border: "0", width: "100%", height: "100%" }}
              allowFullScreen
              title="map"
            ></iframe>
          </div>

          <div className="md:basis-1/3 bg-[#e8e8e8] px-5 pt-10 pb-14">
            <h1 className="text-3xl underline underline-offset-8 mb-8">Reach Us:</h1>
            <div className="flex gap-2 mb-3">
              <Phone className="w-[24px] text-orange-600" />
              <p className="">+40724343949</p>
            </div>
            <div className="flex gap-2 mb-3">
              <Mail className="w-[23px] text-orange-600" />
              <p className="">contact@brandaffair.ro</p>
            </div>
            <div className="flex gap-2 mb-3">
              <MapPin className="w-[24px] text-orange-600" />
              <p className="">Amman St, no 35, 4th floor, ap 10, Bucharest</p>
            </div>
          </div>

          <div className="md:basis-1/3 bg-orange-600 px-5 pt-10 pb-14 text-white">
            <h1 className="text-3xl underline underline-offset-8 mb-6">Contact Us</h1>
            <p className="mb-3">
              <span className="text-lg leading-9 font-bold">Hello,</span>
              <br />
              Ready to get started? Click the button below to fill out our quick form and let us know how we can assist you!
            </p>
            <button
              type="button"
              className="bg-white text-orange-600 rounded-md px-4 py-2 hover:bg-orange-100 transition-colors"
              onClick={() => setIsModalOpen(true)}
            >
              Get in Touch!
            </button>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default Contact;
