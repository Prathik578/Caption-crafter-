import { createFileRoute } from "@tanstack/react-router";
import { CaptionFormatter } from "@/components/caption-formatter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Caption Studio — Clean, ready-to-share captions" },
      {
        name: "description",
        content:
          "Polish spacing, case, and hashtags in your social captions. Preview, copy, and download your words in a focused editor.",
      },
      { property: "og:title", content: "Caption Studio — Clean, ready-to-share captions" },
      {
        property: "og:description",
        content: "Polish spacing, case, and hashtags in your social captions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <CaptionFormatter />;
}
