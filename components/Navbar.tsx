"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-blue-700 py-4 px-4 md:px-6 shadow text-white sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2 md:space-x-3 text-lg md:text-xl font-bold">
          {/* Spiral Logo (external) */}
          <Image
            onClick={() => router.push("/")}
            src="https://bruneltalentmarketplace.com/static/media/Navbar-icon.9b1893f0b90313489b9f.png"
            alt="Spiral Logo"
            width={40}
            height={40}
            className="rounded-full hover:cursor-pointer"
          />
          <span className="flex items-center">
            <span className="text-xl md:text-2xl mr-1 md:mr-2">🚀</span>
            <span className="hidden sm:inline">SE EDUCATION TOOLKIT</span>
            <span className="sm:hidden">SE TOOLKIT</span>
          </span>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-6 text-white font-medium">
            <li>
              <Link href="/#features" className="hover:underline">
                Features
              </Link>
            </li>
            <li>
              <Link href="/#personas" className="hover:underline">
                Personas
              </Link>
            </li>
            <li>
              <Link href="/labs" className="hover:underline">
                Labs
              </Link>
            </li>
            <li>
              <Link href="/#assessments" className="hover:underline">
                Assessment
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:underline">
                About
              </Link>
            </li>
            {/* New Talks tab */}
            <li>
              <Link href="/talks" className="hover:underline">
                Talks
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-blue-700 w-full absolute left-0 top-full border-t border-blue-600 shadow-lg">
          <ul className="flex flex-col text-white font-medium py-2">
            <li>
              <Link
                href="/#features"
                className="block px-6 py-3 hover:bg-blue-600"
                onClick={toggleMenu}
              >
                Features
              </Link>
            </li>
            <li>
              <Link
                href="/#personas"
                className="block px-6 py-3 hover:bg-blue-600"
                onClick={toggleMenu}
              >
                Personas
              </Link>
            </li>
            <li>
              <Link
                href="/labs"
                className="block px-6 py-3 hover:bg-blue-600"
                onClick={toggleMenu}
              >
                Labs
              </Link>
            </li>
            <li>
              <Link
                href="/#assessments"
                className="block px-6 py-3 hover:bg-blue-600"
                onClick={toggleMenu}
              >
                Assessment
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="block px-6 py-3 hover:bg-blue-600"
                onClick={toggleMenu}
              >
                About
              </Link>
            </li>
            {/* New Talks tab for mobile */}
            <li>
              <Link
                href="/talks"
                className="block px-6 py-3 hover:bg-blue-600"
                onClick={toggleMenu}
              >
                Talks
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Navbar;