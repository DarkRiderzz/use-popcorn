import { useState } from "react";

export default function TextExpendeture() {
  return (
    <div>
      <TextExpander>
        Space travel is the ultimate adventure! Imagine soaring past the stars
        and exploring new worlds. It's the stuff of dreams and science fiction,
        but believe it or not, space travel is a real thing. Humans and robots
        are constantly venturing out into the cosmos to uncover its secrets and
        push the boundaries of what's possible.
      </TextExpander>

      <TextExpander
        collapsedNumWords={20}
        expandButtonText="Show text"
        collapseButtonText="Collapse text"
        buttonColor="#ff6622"
      >
        Space travel requires some seriously amazing technology and
        collaboration between countries, private companies, and international
        space organizations. And while it's not always easy (or cheap), the
        results are out of this world. Think about the first time humans stepped
        foot on the moon or when rovers were sent to roam around on Mars.
      </TextExpander>
    </div>
  );
}

function TextExpander({
  children,
  collapsedNumWords = 10,
  expandButtonText = "show more",
  collapseButtonText = "Show lesss",
  buttonColor = "blue",
}) {
  const [showMore, setShowMore] = useState(false);
  function handleShowMore() {
    setShowMore(!showMore);
  }
  return (
    // we can also use slice instead of filter slice(0, collapseNumber)
    <div>
      <p>
        {children
          .split(" ")
          .filter(
            (el, i) => i <= (showMore ? collapsedNumWords : children.length)
          )
          .join(" ")}
        <span
          o
          style={{ color: buttonColor, cursor: "pointer" }}
          onClick={handleShowMore}
        >
          {" "}
          {showMore ? expandButtonText + "..." : collapseButtonText}
        </span>
      </p>
    </div>
  );
}
