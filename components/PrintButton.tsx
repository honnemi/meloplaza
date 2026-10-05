"use client";

import { SecondaryButton } from "@/components/Button";

export default function PrintButton() {
  // Print window on button click
  return <SecondaryButton label="Print" icon={<i className="hn hn-print-solid"></i>}onClick={() => window.print()} />;
}
