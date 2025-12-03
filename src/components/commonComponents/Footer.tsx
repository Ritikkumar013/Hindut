import React from "react";
import { FaHome, FaPhone } from "react-icons/fa";
import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

const Footer = () => {
  // Get the current year
  function getCurrentYear() {
    return new Date().getFullYear();
  }
  
  // // Example usage:
  // console.log(getCurrentYear()); // Outputs: 2025
  
  return (
    <div className='bg-orange-400 bg-[url("/Rectangle52.png")] bg-cover bg-center bg-no-repeat p-10 md:p-14 lg:p-20 lg:py-28'>
      <div className="container mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-6">Contact Us</h3>
            <div className="flex items-start gap-3 text-white">
              <FaHome className="mt-1" size={20} />
              <p className="text-sm md:text-base">
                4-158/9 5th Cross Road, Sainikpuri, secunderabad 500092 ,TS ,IND
              </p>
            </div>
            <div className="flex items-center gap-3 text-white">
              <FaPhone size={20} />
              <p className="text-sm md:text-base">+91-8425325525</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-white hover:text-orange-200 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/aboutus" className="text-white hover:text-orange-200 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white hover:text-orange-200 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/quiz" className="text-white hover:text-orange-200 transition-colors">
                  Quiz
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-6">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-orange-200 transition-colors">
                <Facebook size={24} />
              </a>
              <a href="#" className="text-white hover:text-orange-200 transition-colors">
                <Twitter size={24} />
              </a>
              <a href="#" className="text-white hover:text-orange-200 transition-colors">
                <Instagram size={24} />
              </a>
              <a href="#" className="text-white hover:text-orange-200 transition-colors">
                <Youtube size={24} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="mt-16 pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white text-sm md:text-base text-center md:text-left">
              © {getCurrentYear()} Hindutva, All Rights Reserved | Developed by{" "}
              <Link href="https://crobstacle.com/" target="_blank" className="hover:text-orange-200 transition-colors">
                Crobstacle
              </Link>
            </p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              <Link href="/privacy" className="text-white hover:text-orange-200 transition-colors text-sm md:text-base">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-white hover:text-orange-200 transition-colors text-sm md:text-base">
                Terms & Condition
              </Link>
              <Link href="/disclaimer" className="text-white hover:text-orange-200 transition-colors text-sm md:text-base">
                Disclaimer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
