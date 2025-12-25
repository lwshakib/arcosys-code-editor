import { useState, useEffect } from "react";
import { useStdout } from "ink";

export const useStdoutDimensions = () => {
  const { stdout } = useStdout();
  const [dimensions, setDimensions] = useState({
    columns: stdout ? stdout.columns : 80,
    rows: stdout ? stdout.rows : 24,
  });

  useEffect(() => {
    if (!stdout) return;
    const handler = () => {
      setDimensions({
        columns: stdout.columns,
        rows: stdout.rows,
      });
    };

    stdout.on("resize", handler);
    return () => {
      stdout.off("resize", handler);
    };
  }, [stdout]);

  return dimensions;
};
