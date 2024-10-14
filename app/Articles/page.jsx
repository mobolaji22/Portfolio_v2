import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ExpandableCardStandard from "@/components/blocks/expandable-card-demo-standard";
import ExpandableCardDemo from "@/components/blocks/expandable-card-demo-grid";

const Articles = () => {
  return (
    <>
      <Navbar />
      <h1 className="text-2xl md:text-5xl font-bold max-w-[1200px] mx-auto my-5 text-center px-10">
        Words Can Change The World!
      </h1>
      <main className="relative bg-black-100 max-w-[1200px] mx-auto sm:px-16 px-8 py-5">
        {/* Featured */}
        <ExpandableCardDemo />
        {/* List */}
        <ExpandableCardStandard />
      </main>
      <Footer />
    </>
  );
};

export default Articles;
