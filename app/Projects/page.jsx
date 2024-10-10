"use client";
import { useState } from "react";
import Footer from "@/components/Footer";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { PinContainer } from "@/components/ui/3d-pin";
import { projects, companies, testimonials } from "@/data";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { FaLocationArrow } from "react-icons/fa6";

const Projects = () => {
  // Pagination state: current page, and projects per page
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 4;

  // Calculate the total number of pages
  const totalPages = Math.ceil(projects.length / projectsPerPage);

  // Get current projects for pagination
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = projects.slice(
    indexOfFirstProject,
    indexOfLastProject
  );

  // Function to handle page changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <>
      <Navbar />
      <h1 className="text-[1.75rem] md:text-3xl lg:text-5xl font-bold max-w-[1200px] mx-auto my-3 text-center">
        Imagination Trumps Knowledge!
      </h1>
      <main className="max-w-[1200px] mx-auto sm:px-16 px-8 my-3">
        <section className="projects">
          {/* Card Section */}
          <div className="flex flex-wrap items-center justify-center p-4 gap-x-28 gap-y-20 my-5">
            {currentProjects.map(({ id, title, des, img, iconLists, link }) => (
              <div
                key={id}
                className="sm:h-[30rem] h-[32rem] flex items-center justify-center sm:w-[500px] md:w-[350px] w-[80vw] max-w-[90vw]"
              >
                <PinContainer title={link} href={link}>
                  <div className="relative flex items-center justify-center w-[400px] h-[20rem] sm:h-[20rem] mb-3">
                    <div className="relative w-full h-full overflow-hidden rounded-ss-xl rounded-se-xl bg-[#13162d]">
                      <Image
                        src="/bg.png"
                        alt="bg-img"
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                    <Image
                      src={img}
                      alt={title}
                      className="z-10 absolute bottom-0"
                      width={400}
                      height={300}
                    />
                  </div>
                  <h1 className="font-bold lg:text-2xl md:text-xl text-lg line-clamp-1">
                    {title}
                  </h1>
                  <p className="md:text-lg font-light text-base line-clamp-2">
                    {des}
                  </p>
                  <div className="flex items-center justify-between my-3">
                    <div className="flex items-center">
                      {iconLists.map((icon, index) => (
                        <div
                          key={icon}
                          className="border border-white/[0.2] rounded-full bg-black lg:w-10 lg:h-10 w-8 h-8 flex items-center justify-center"
                          style={{
                            transform: `translateX(-${5 * index * 2}px)`,
                          }}
                        >
                          <Image src={icon} alt={icon} width={24} height={24} />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center items-center">
                      <p className="flex lg:text-lg text-sm">Check Live Site</p>
                      <FaLocationArrow className="ml-1 text-sm lg:text-lg" />
                    </div>
                  </div>
                </PinContainer>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center space-x-4 mt-10">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`p-2 px-4 rounded-md ${
                  currentPage === index + 1
                    ? "bg-purple-500 text-white"
                    : "bg-gray-200 text-black"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </section>

        {/* Client Section */}
        <section className="clients mt-10">
          <h3 className="text-2xl font-bold text-center mb-3">
            Kind words from satisfied clients
          </h3>

          <div className="flex flex-col items-center mt-5">
            <InfiniteMovingCards
              items={testimonials}
              direction="right"
              speed="slow"
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Projects;
