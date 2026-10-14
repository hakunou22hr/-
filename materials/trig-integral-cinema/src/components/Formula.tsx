import katex from "katex";
import { useMemo } from "react";
export function Formula({
  tex,
  className = "",
}: {
  tex: string;
  className?: string;
}) {
  const html = useMemo(
    () =>
      katex.renderToString(tex, {
        displayMode: true,
        throwOnError: true,
        output: "htmlAndMathml",
      }),
    [tex],
  );
  return (
    <div
      className={"formula " + className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
