"use client";

import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: true,
  theme: "dark",
  securityLevel: "loose",
  fontFamily: "inherit",
});

interface MermaidProps {
  chart: string;
}

export const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");

  useEffect(() => {
    const renderChart = async () => {
      if (ref.current && chart) {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        try {
          const { svg } = await mermaid.render(id, chart);
          setSvg(svg);
        } catch (error) {
          console.error("Mermaid rendering failed:", error);
        }
      }
    };

    renderChart();
  }, [chart]);

  return (
    <div className="flex justify-center my-8 overflow-x-auto rounded-2xl bg-[#0d1117]/50 p-6 border border-white/5 backdrop-blur-sm shadow-inner group">
      <div
        ref={ref}
        className="mermaid transition-all duration-700 ease-in-out transform group-hover:scale-[1.02]"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
};
