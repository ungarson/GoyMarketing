import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "YouTube Titles",
  description: "Classification of YouTube videos titles that showed prominence",
  authors: [{ name: "Daniil Orain" }],
};

export default function TitlesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
