"use client";

import React, { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { useInView } from "react-intersection-observer";
import Body from "@/components/Body";
import Navbar from "@/components/Navbar";
import { sections } from "@/data/sections";

const Footer = dynamic(() => import("@/components/Footer"), {
  loading: () => <div className="h-20 bg-gray-900" />,
  ssr: true,
});

const Page: React.FC = () => {
  const [currentBackground, setCurrentBackground] = useState(
    sections[0]?.backgroundImage || '/assets/bg-poster.png'
  );
 
  const sectionRefs = sections.map(() =>
    useInView({
      threshold: 0.5,
      triggerOnce: false,
    })
  );

  useEffect(() => {
    const inViewStates = sectionRefs.map(ref => ref.inView);
    const visibleSectionIndex = inViewStates.findIndex(inView => inView);
    if (visibleSectionIndex !== -1) {
      const backgroundImage = sections[visibleSectionIndex]?.backgroundImage || '/assets/bg-poster.png';
      setCurrentBackground(backgroundImage);
    }
  }, [sectionRefs]); 

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Body
          sectionRefs={sectionRefs}
          sections={sections.map(({ id, title, description, places }) => ({
            id,
            title,
            description,
            places: places.map(place => place.name)
          }))}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Page;