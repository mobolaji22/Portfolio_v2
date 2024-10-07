"use client";
import Footer from "@/components/Footer";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { FaGithub } from "react-icons/fa";
import { PinContainer } from "@/components/ui/3d-pin";
import { projects } from "@/data";

const Projects = () => {
  return (
    <>
      <Navbar />
      <h1 className="text-3xl md:text-6xl font-bold max-w-[1200px] mx-auto my-1 text-center">
        Imagination Trumps Knowledge!
      </h1>
      <main className="bg-black-100 max-w-[1200px] mx-auto sm:px-16 px-8">
        <section className="projects">
          {/* Card */}
          <div className="flex flex-wrap items-center justify-center p-4 gap-x-24 gap-y-2">
            {projects.map(({ id, title, des, img, iconLists, link }) => (
              <div
                key={id}
                className="sm:h-[41rem] h-[32rem] lg:min-h-[32.5rem] flex items-center justify-center sm:w-[570px] w-[80vw]"
              >
                <PinContainer title={link} href={link}>
                  <div className="relative flex items-center justify-center sm:w-[570px] w-[80vw] overflow-hidden sm:h-[40vh] h-[30vh] mb-10">
                    <div className="relative w-full h-full overflow-hidden lg:rounded-3xl bg-[#13162d]">
                      <img src="/bg.png" alt="bg-img" />
                    </div>
                    <img
                      src={img}
                      alt={title}
                      className="z-10 absolute bottom-0"
                    />
                  </div>
                  <h1 className="font-bold lg:text-2xl md:text-xl text-base line-clamp-1">
                    {title}
                  </h1>

                  <p className="lg:text-xl lg:font-normal font-light text-sm line-clamp-2">
                    {des}
                  </p>

                  <div className="flex items-center justify-between mt-7 mb-3">
                    <div className="flex items-center">
                      {iconLists.map((icon, index) => (
                        <div
                          key={icon}
                          className="border border-white/[0.2] rounded-full bg-black lg:w-10 lg:h-10 w-8 h-8 flex items-center justify-center"
                          style={{
                            transform: `translateX(-${5 * index * 2}px)`,
                          }}
                        >
                          <img src={icon} alt={icon} className="p-2" />
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-center items-center">
                      <p className="flex lg:text-xl md:text-xs text-sm text-purple">
                        Check Live Site
                      </p>
                      {/* <FaLocationArrow className="ms-3" color="#CBACF9" /> */}
                    </div>
                  </div>
                </PinContainer>
              </div>
            ))}
          </div>

          {/* Card */}
          {/* <PinContainer
            title="/ui.aceternity.com"
            href="https://twitter.com/mannupaaji"
          >
            <div className="flex flex-col col-span-4 justify-center items-center gap-3 px-2 py-4 border-border border-2 rounded-3xl shadow-[8px_8px_15px_rgba(255,255,255,0.5)] w-[25rem]">
              <Image
                src="/images/projects/crypto-screener-cover-image.jpg"
                alt="Profile picture of the developer"
                width={400}
                height={300}
                className="object-cover rounded-2xl"
              />

              <div className="w-full space-y-6">
                <h1 className="font-semibold text-2xl lg:text-3xl tracking-wide">
                  Turning Vision Into Reality With Code And Design.
                </h1>

                <p className="my-6 text-gray-500">
                  As a skilled full-stack developer, I am dedicated to turning
                  ideas into innovative web applications. Explore my latest
                  projects and articles, showcasing my expertise in React.js and
                  web development.
                </p>

                <div className="flex items-center space-x-4">
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-4xl cursor-pointer"
                    label="GitHub"
                  >
                    <FaGithub />
                  </a>
                  <a
                    href="/resume.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary text-secondary font-semibold rounded-md p-2 inline-flex items-center hover:text-gray-300 transition"
                  >
                    visit project
                  </a>
                </div>
              </div>
            </div>
          </PinContainer> */}
        </section>
        <section className="clients"></section>
      </main>
      <Footer />
    </>
  );
};

export default Projects;
