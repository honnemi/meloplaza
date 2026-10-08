"use client";

import { Cursor } from "@/components/cursor";
import { CursorEventPayload } from "@/hooks/use-plaza-presence";

export const RealtimeCursors = ({
  cursors,
}: {
  cursors: Record<string, CursorEventPayload>;
}) => {
  return (
    <div>
      {Object.keys(cursors).map((id) => (
        <Cursor
          key={id}
          className="fixed transition-transform ease-in-out z-50"
          style={{
            transitionDuration: "20ms",
            top: 0,
            left: 0,
            transform: `translate(${cursors[id].position.x}px, ${cursors[id].position.y}px)`,
          }}
          color={cursors[id].color}
          name={cursors[id].user.name}
        />
      ))}
    </div>
  );
};