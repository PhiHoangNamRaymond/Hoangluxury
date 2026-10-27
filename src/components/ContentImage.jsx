import React, { useState } from "react";

// Render directly inside the existing aspect-ratio frame: no extra wrapper.
export default function ContentImage({ alt, src, srcSet, onError, ...props }) {
  const source = `${src}|${srcSet || ""}`;
  const [failedSource, setFailedSource] = useState(null);
  if (failedSource === source) {
    return <span className="hlt-image-unavailable" role="img" aria-label={`${alt || "Photo"} — image unavailable`}>
      <span aria-hidden="true">Image unavailable</span>
    </span>;
  }
  return <img {...props} src={src} srcSet={srcSet} alt={alt} onError={(event) => {
    setFailedSource(source);
    onError?.(event);
  }} />;
}
