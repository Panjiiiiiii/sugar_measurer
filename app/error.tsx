"use client";

import React from "react";
import ServerErrorPage from "./505/page";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log the error to an error reporting service
    console.error("Runtime error caught by boundary:", error);
  }, [error]);

  return <ServerErrorPage reset={reset} />;
}
