import React, { useState, useEffect, FC } from "react";
import { Message } from "ai/react";
import { Fade } from "react-awesome-reveal";
import UserIcon from "./icons/UserIcon";
import OpenAiIcon from "./icons/OpenAiIcon";

const AnimatedList: FC<{ items: Message[] }> = ({ items }) => {
  const [visibleItems, setVisibleItems] = useState<Message[]>([]);

  useEffect(() => {
    setVisibleItems(
      items.length > 1 ? items.slice(items.length - 2, items.length) : items
    );
  }, [items]);

  //   const handleIntersection = (
  //     entry: IntersectionObserverEntry,
  //     item: Message
  //   ) => {
  //     if (!entry.isIntersecting) {
  //       setVisibleItems((prevVisibleItems) =>
  //         prevVisibleItems.filter((prevItem) => prevItem !== item)
  //       );
  //     }
  //   };

  const handleIntersection = (
    entry: IntersectionObserverEntry,
    item: Message
  ) => {
    if (!entry.isIntersecting) {
      setVisibleItems((prevVisibleItems) => {
        const index = prevVisibleItems.findIndex(
          (prevItem) => prevItem === item
        );
        if (index !== -1) {
          const newVisibleItems = [...prevVisibleItems];
          newVisibleItems.splice(index, 1);
          return newVisibleItems;
        }
        return prevVisibleItems;
      });
    }
  };

  return (
    <div>
      {visibleItems.map((item) => (
        <Fade key={item.id} direction="up">
          <div
            ref={(node) => {
              if (node) {
                const observer = new IntersectionObserver((entries) =>
                  handleIntersection(entries[0], item)
                );
                observer.observe(node);
              }
            }}
          >
            <div
              key={item.id}
              className={`whitespace-pre-wrap flex gap-2 p-4 text-[#16330F] leading-7`}
            >
              <div className="min-w-6">
                {item.role === "user" ? <UserIcon /> : <OpenAiIcon />}
              </div>
              {item.content}
            </div>
          </div>
        </Fade>
      ))}
    </div>
  );
};

export default AnimatedList;
