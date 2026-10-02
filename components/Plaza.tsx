"use client";

import { useEffect, useRef } from "react";
import { Application, Container, Graphics, Text } from "pixi.js";
import { AVATAR_FACES } from "@/app/avatar-customisation";
import { useRouter } from "next/navigation";

interface PlazaAvatar {
  id: string;
  displayName: string;
  colour: string;
  faceIndex: number;
}

interface PlazaProps {
  avatars: PlazaAvatar[];
}

interface AnimatedContainer extends Container {
  targetX: number;
  targetY: number;
  isDragging: boolean;
  speechBubble: Container;
  hoverIcon: Text;
  shadow: Graphics;
}

const AVATAR_RADIUS = 24;
const NAME_OFFSET = 40;
const AVATAR_SPEED = 0.001;

const DRAG_MESSAGES = [
  "hey!",
  "put me down!",
  "weeeee",
  "ow",
  "ouch",
  "wah!",
  "unhand me",
  "let me go!",
];

const ALIEN_NOISES = [
  "/assets/alien01.mp3",
  "/assets/alien02.mp3",
]

function createAvatar(data: PlazaAvatar): AnimatedContainer {
  const avatar = new Container() as AnimatedContainer;

  avatar.targetX = 0;
  avatar.targetY = 0;
  avatar.isDragging = false;

  // Avatar shadow
  const shadow = new Graphics();

  shadow.ellipse(0, 25, 20, 5).fill({
    color: 0x000000,
    alpha: 0.2,
  });

  avatar.addChild(shadow);
  avatar.shadow = shadow;

  // Avatar body
  const bubble = new Graphics();

  const colour = parseInt(data.colour.replace("#", ""), 16);

  bubble.circle(0, 0, AVATAR_RADIUS).fill({
    color: colour,
  });

  avatar.addChild(bubble);

  // Avatar highlight
  const highlight = new Graphics();

  highlight.ellipse(-6, -16, 6, 3).fill({
    color: 0xffffff,
    alpha: 0.5,
  });

  highlight.rotation = (-25 * Math.PI) / 180;

  avatar.addChild(highlight);

  // Avatar face
  const face = new Text({
    text: AVATAR_FACES[data.faceIndex],
    style: {
      fontFamily: "M PLUS Rounded 1c",
      fontSize: 12,
    },
  });

  face.anchor.set(0.5);

  avatar.addChild(face);

  // Speech bubble
  const speechBubble = new Container();

  speechBubble.visible = false;
  speechBubble.y = -90;
  speechBubble.eventMode = "none";

  const bubbleShape = new Graphics();

  bubbleShape
    .roundRect(-55, -22, 110, 42, 12)
    .fill({
      color: 0xffffff,
    })
    .stroke({
      color: 0x000000,
      width: 2,
    });

  // Speech bubble tail
  bubbleShape
    .moveTo(-8, 20)
    .lineTo(0, 31)
    .lineTo(8, 20)
    .closePath()
    .fill({
      color: 0xffffff,
    })
    .stroke({
      color: 0x000000,
      width: 2,
    });

  speechBubble.addChild(bubbleShape);

  const randomMessage =
    DRAG_MESSAGES[Math.floor(Math.random() * DRAG_MESSAGES.length)];

  const speechText = new Text({
    text: randomMessage,
    style: {
      fontFamily: "M PLUS Rounded 1c",
      fontSize: 11,
      fill: 0x000000,
      align: "center",
    },
  });

  speechText.anchor.set(0.5);
  speechText.y = -1;

  speechBubble.addChild(speechText);

  avatar.addChild(speechBubble);

  avatar.speechBubble = speechBubble;

  // Avatar name
  const name = new Text({
    text: data.displayName,
    style: {
      fontFamily: "M PLUS Rounded 1c",
      fontSize: 12,
      fill: 0x000000,
    },
  });

  name.anchor.set(0.5);
  name.y = -NAME_OFFSET;

  avatar.addChild(name);

  // Avatar hover
  const hoverIcon = new Text({
    text: "♫",
    style: {
      fontFamily: "M PLUS Rounded 1c",
      fontSize: 18,
      fill: 0x000000,
    },
  });

  hoverIcon.anchor.set(0.5);
  hoverIcon.y = -62;
  hoverIcon.visible = false;
  hoverIcon.eventMode = "none";

  avatar.addChild(hoverIcon);

  avatar.hoverIcon = hoverIcon;

  // Hover logic
  avatar.on("pointerover", () => {
    if (!avatar.isDragging) {
      hoverIcon.visible = true;
    }
  });

  avatar.on("pointerout", () => {
    hoverIcon.visible = false;
  });

  return avatar;
}

export default function Plaza({ avatars }: PlazaProps) {
  // Play sound on click
  function playClickSound() {
    if (typeof window !== "undefined") {
      const clickAudio = new Audio("/assets/alien01.mp3");
      clickAudio.volume = 0.5;
      clickAudio.play().catch((err) => console.error("Audio blocked by browser:", err));
    }
  }
  
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const app = new Application();

    let destroyed = false;
    let initialized = false;

    const activeAvatars: AnimatedContainer[] = [];

    let draggedAvatar: AnimatedContainer | null = null;
    let draggedAvatarData: PlazaAvatar | null = null;

    let dragPointerId: number | null = null;

    let dragOffsetX = 0;
    let dragOffsetY = 0;

    let startPointerX = 0;
    let startPointerY = 0;

    let hasMoved = false;

    const MOVE_THRESHOLD = 5;

    const resize = () => {
      if (!initialized || destroyed) return;

      app.renderer.resize(container.clientWidth, container.clientHeight);
    };

    // Drag logic (if pointer down and moving)
    const handleWindowPointerMove = (event: PointerEvent) => {
      if (!draggedAvatar) return;

      if (dragPointerId !== null && event.pointerId !== dragPointerId) {
        return;
      }

      event.preventDefault();

      const dx = event.clientX - startPointerX;

      const dy = event.clientY - startPointerY;

      if (
        !hasMoved &&
        (Math.abs(dx) > MOVE_THRESHOLD || Math.abs(dy) > MOVE_THRESHOLD)
      ) {
        hasMoved = true;

        draggedAvatar.isDragging = true;

        draggedAvatar.hoverIcon.visible = false;

        // Show speech bubble on drag
        draggedAvatar.speechBubble.visible = true;

        draggedAvatar.shadow.visible = false;
      }

      if (!hasMoved) return;

      const rect = app.canvas.getBoundingClientRect();

      const scaleX = app.screen.width / rect.width;

      const scaleY = app.screen.height / rect.height;

      const pointerX = (event.clientX - rect.left) * scaleX;

      const pointerY = (event.clientY - rect.top) * scaleY;

      let newX = pointerX - dragOffsetX;

      let newY = pointerY - dragOffsetY;

      const margin = AVATAR_RADIUS;

      // Lock avatar movement to screen
      newX = Math.max(margin, Math.min(app.screen.width - margin, newX));

      newY = Math.max(margin, Math.min(app.screen.height - margin, newY));

      // Avatar follows mouse when dragging
      draggedAvatar.x = newX;
      draggedAvatar.y = newY;
    };

    // On pointer up, cancel drag state
    const handleWindowPointerUp = (event: PointerEvent) => {
      if (!draggedAvatar) return;

      if (dragPointerId !== null && event.pointerId !== dragPointerId) {
        return;
      }

      const avatar = draggedAvatar;
      const avatarData = draggedAvatarData;

      // On click, navigate to profile
      if (!hasMoved && avatarData) {
        avatar.isDragging = false;

        avatar.speechBubble.visible = false;
        avatar.hoverIcon.visible = false;

        if (document.startViewTransition) {
          document.startViewTransition(() => {
            router.push(`/profile/${avatarData.id}`);
          });
        } else {
          router.push(`/profile/${avatarData.id}`);
        }
      }

      // Drag release logic
      else {
        // Drop avatar where released
        avatar.targetX = avatar.x;
        avatar.targetY = avatar.y;

        avatar.isDragging = false;

        avatar.speechBubble.visible = false;
        avatar.shadow.visible = true;

        avatar.hoverIcon.visible = false;
      }

      draggedAvatar = null;
      draggedAvatarData = null;

      dragPointerId = null;

      dragOffsetX = 0;
      dragOffsetY = 0;

      hasMoved = false;

      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };

    // Pointer cancel logic
    const handleWindowPointerCancel = (event: PointerEvent) => {
      if (!draggedAvatar) return;

      if (dragPointerId !== null && event.pointerId !== dragPointerId) {
        return;
      }

      draggedAvatar.isDragging = false;

      draggedAvatar.speechBubble.visible = false;
      draggedAvatar.shadow.visible = true;
      draggedAvatar.hoverIcon.visible = false;

      draggedAvatar = null;
      draggedAvatarData = null;

      dragPointerId = null;

      dragOffsetX = 0;
      dragOffsetY = 0;

      hasMoved = false;

      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };

    window.addEventListener("pointermove", handleWindowPointerMove, {
      passive: false,
    });

    window.addEventListener("pointerup", handleWindowPointerUp);

    window.addEventListener("pointercancel", handleWindowPointerCancel);

    // Setup PixiJS
    async function setup() {
      await app.init({
        width: container.clientWidth,
        height: container.clientHeight,
        backgroundAlpha: 0,
        resolution: window.devicePixelRatio,
        antialias: true,
        autoDensity: true,
      });

      await document.fonts.ready;

      if (destroyed) {
        app.destroy();
        return;
      }

      initialized = true;

      container.appendChild(app.canvas);

      // Prevent native browser dragging
      app.canvas.addEventListener("dragstart", (event) => {
        event.preventDefault();
      });

      app.canvas.style.userSelect = "none";
      app.canvas.style.webkitUserSelect = "none";
      app.canvas.style.touchAction = "none";

      const margin = AVATAR_RADIUS;

      // Draw avatars
      for (const avatarData of avatars) {
        const avatar = createAvatar(avatarData);

        avatar.x = margin + Math.random() * (app.screen.width - margin * 2);

        avatar.y = margin + Math.random() * (app.screen.height - margin * 2);

        avatar.targetX =
          margin + Math.random() * (app.screen.width - margin * 2);

        avatar.targetY =
          margin + Math.random() * (app.screen.height - margin * 2);

        avatar.eventMode = "static";
        avatar.cursor = "pointer";

        // Pointer down logic
        avatar.on("pointerdown", (event) => {

          playClickSound();

          if (draggedAvatar) return;

          event.stopPropagation();

          draggedAvatar = avatar;
          draggedAvatarData = avatarData;

          dragPointerId = event.pointerId;

          startPointerX = event.global.x;

          startPointerY = event.global.y;

          hasMoved = false;

          const localPos = event.getLocalPosition(app.stage);

          dragOffsetX = localPos.x - avatar.x;

          dragOffsetY = localPos.y - avatar.y;

          avatar.targetX = avatar.x;
          avatar.targetY = avatar.y;

          // Always start with both hidden.
          avatar.speechBubble.visible = false;
          avatar.hoverIcon.visible = false;

          document.body.style.userSelect = "none";

          document.body.style.cursor = "default";

          event.preventDefault?.();
        });

        app.stage.addChild(avatar);

        activeAvatars.push(avatar);
      }

      // Animate random walk
      app.ticker.add((ticker) => {
        if (destroyed) return;

        for (const avatar of activeAvatars) {
          if (avatar.isDragging) continue;

          avatar.x +=
            (avatar.targetX - avatar.x) * AVATAR_SPEED * ticker.deltaTime;

          avatar.y +=
            (avatar.targetY - avatar.y) * AVATAR_SPEED * ticker.deltaTime;

          const distance = Math.hypot(
            avatar.targetX - avatar.x,
            avatar.targetY - avatar.y,
          );

          // Pick a new random destination
          if (distance < 5) {
            avatar.targetX =
              margin + Math.random() * (app.screen.width - margin * 2);

            avatar.targetY =
              margin + Math.random() * (app.screen.height - margin * 2);
          }
        }

        // Collision logic
        const minDistance = AVATAR_RADIUS * 2;

        for (let i = 0; i < activeAvatars.length; i++) {
          for (let j = i + 1; j < activeAvatars.length; j++) {
            const a = activeAvatars[i];
            const b = activeAvatars[j];

            const dx = b.x - a.x;
            const dy = b.y - a.y;

            const distance = Math.hypot(dx, dy);

            if (distance < minDistance) {
              const angle =
                distance === 0
                  ? Math.random() * Math.PI * 2
                  : Math.atan2(dy, dx);

              const overlap = minDistance - distance;

              const separationX = Math.cos(angle) * (overlap / 2);

              const separationY = Math.sin(angle) * (overlap / 2);

              if (!a.isDragging) {
                a.x -= separationX;
                a.y -= separationY;

                a.targetX =
                  margin + Math.random() * (app.screen.width - margin * 2);

                a.targetY =
                  margin + Math.random() * (app.screen.height - margin * 2);
              }

              if (!b.isDragging) {
                b.x += separationX;
                b.y += separationY;

                b.targetX =
                  margin + Math.random() * (app.screen.width - margin * 2);

                b.targetY =
                  margin + Math.random() * (app.screen.height - margin * 2);
              }
            }
          }
        }
      });

      window.addEventListener("resize", resize);
    }

    setup();

    // Cleanup
    return () => {
      destroyed = true;

      window.removeEventListener("resize", resize);

      window.removeEventListener("pointermove", handleWindowPointerMove);

      window.removeEventListener("pointerup", handleWindowPointerUp);

      window.removeEventListener("pointercancel", handleWindowPointerCancel);

      document.body.style.userSelect = "";
      document.body.style.cursor = "";

      if (!initialized) return;

      app.destroy(true, {
        children: true,
        texture: true,
      });
    };
  }, [avatars, router]);

  return <div ref={containerRef} className="h-screen w-full overflow-hidden" />;
}
