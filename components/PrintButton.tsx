"use client";

import { SecondaryButton } from "@/components/Button";

export default function PrintButton() {
    return (
        <SecondaryButton
            label="Print"
            onClick={() => window.print()}
        />
    );
}



