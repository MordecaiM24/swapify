import React from "react";

interface EllipsisTextProps {
  text: string;
  className?: string;
}

const EllipsisText: React.FC<EllipsisTextProps> = ({
  text,
  className = "",
}) => {
  return (
    <div className={`flex-1 min-h-0 overflow-hidden ${className}`}>
      <p className="line-clamp-3">{text}</p>
    </div>
  );
};

export default EllipsisText;
