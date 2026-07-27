import React from "react";

interface StarBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  className?: string;
  color?: string;
  speed?: string;
  children: React.ReactNode;
}

const StarBorder = ({
  as: Component = "div",
  className = "",
  color = "rgba(234, 179, 8, 0.8)", // yellow-500
  speed = "4s",
  children,
  ...rest
}: StarBorderProps) => {
  return (
    <Component 
      className={`relative inline-block overflow-hidden rounded-2xl p-[1px] ${className}`} 
      {...rest}
    >
      <div
        className="absolute w-[300%] h-[50%] opacity-70 bottom-[-20%] right-[-250%] rounded-full z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animation: `star-movement-bottom ${speed} linear infinite`,
        }}
      ></div>
      <div
        className="absolute w-[300%] h-[50%] opacity-70 top-[-20%] left-[-250%] rounded-full z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animation: `star-movement-top ${speed} linear infinite`,
        }}
      ></div>
      <div className="relative z-10 w-full h-full bg-ink-900/90 backdrop-blur-md rounded-2xl border border-ink-800">
        {children}
      </div>

      <style>{`
        @keyframes star-movement-bottom {
          0% {
            transform: translate(0%, 0%);
            opacity: 1;
          }
          100% {
            transform: translate(-100%, 0%);
            opacity: 0;
          }
        }
        @keyframes star-movement-top {
          0% {
            transform: translate(0%, 0%);
            opacity: 1;
          }
          100% {
            transform: translate(100%, 0%);
            opacity: 0;
          }
        }
      `}</style>
    </Component>
  );
};

export default StarBorder;
