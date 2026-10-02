"use client";

import { SecondaryButton } from "@/components/Button";

export default function PrintButton() {
  return <SecondaryButton label="Print" icon={<i className="hn hn-print-solid"></i>}onClick={() => window.print()} />;
}
