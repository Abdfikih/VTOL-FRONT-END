import React, { useState } from "react";

const PageNotFound = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => {
    setIsOpen(!isOpen);
  };
  return (
    <div className={`${isOpen ? "fixed h-screen w-full" : ""} flex flex-col min-h-screen min-w-[300px]`}>
      <div className="flex mx-20">
        <div className="">Halaman Sedang Maintenance Yach...</div>
        <div className=""></div>
      </div>
    </div>
  );
};
export default PageNotFound;
