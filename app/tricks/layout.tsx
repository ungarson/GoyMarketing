import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marketing Tricks",
  description: "Classification of common marketing tricks and patterns for educational awareness",
  authors: [{ name: "Daniil Orain" }],
};

export default function TitlesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
