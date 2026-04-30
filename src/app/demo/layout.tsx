import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Live Demo",
  description:
    "Try ByteForm in 60 seconds. Experience a conversational form firsthand — no signup required.",
  openGraph: {
    title: "ByteForm Live Demo",
    description:
      "Try ByteForm in 60 seconds. Experience a conversational form firsthand — no signup required.",
  },
};

export default function DemoLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
