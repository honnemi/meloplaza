"use client";

import { useEffect, useRef, useState } from "react";
import { Application, Container, Graphics, Text } from "pixi.js";
import { AVATAR_FACES } from "@/app/avatar-customisation";
import { useRouter } from "next/navigation";
import Popup from "@/components/PopupWindow";
import { getCurrentUserId, getUserById } from "@/app/actions";
import { RealtimeCursors } from "@/components/realtime-cursors";
import { usePlazaPresence } from "@/hooks/use-plaza-presence";
import OnlineCounter from "@/components/OnlineCounter";

export interface PlazaAvatar {
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

// CONSTANTS

const AVATAR_RADIUS = 24;
const NAME_OFFSET = 40;
const AVATAR_SPEED = 0.001;

// Size of the explorable world
const WORLD_WIDTH = 3000;
const WORLD_HEIGHT = 2000;

// Camera edge scrolling
const EDGE_SCROLL_SIZE = 100;
const EDGE_SCROLL_SPEED = 8;

// Camera drag sensitivity
const CAMERA_DRAG_SPEED = 1;

// Messages that avatars can say when dragged
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

// CREATE AVATAR

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

  // Random message
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

  // Display name

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

  // Hover icon

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

  // Avatar hover

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

// PLAZA

export default function Plaza({ avatars }: PlazaProps) {
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);

  // Collection button

  const [isCollectionHovered, setIsCollectionHovered] = useState(false);

  // Welcome popup

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Play sound

  function playClickSound(file: string) {
    if (typeof window !== "undefined") {
      const clickAudio = new Audio(file);

      clickAudio.volume = 0.2;

      clickAudio
        .play()
        .catch((err) => console.error("Audio blocked by browser:", err));
    }
  }

  // PIXI + CAMERA

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const app = new Application();

    // State

    let destroyed = false;
    let initialized = false;

    const activeAvatars: AnimatedContainer[] = [];

    // World

    const world = new Container();

    let cameraX = 0;
    let cameraY = 0;

    // Avatar dragging

    let draggedAvatar: AnimatedContainer | null = null;

    let draggedAvatarData: PlazaAvatar | null = null;

    let dragPointerId: number | null = null;

    let dragOffsetX = 0;
    let dragOffsetY = 0;

    let startPointerX = 0;
    let startPointerY = 0;

    let hasMoved = false;

    const MOVE_THRESHOLD = 5;

    // Camera panning

    let isPanning = false;

    let panPointerId: number | null = null;

    let panStartX = 0;
    let panStartY = 0;

    let panStartCameraX = 0;
    let panStartCameraY = 0;

    // CAMERA HELPERS

    const clampCamera = () => {
      if (!initialized) return;

      const maxCameraX = Math.max(0, WORLD_WIDTH - app.screen.width);

      const maxCameraY = Math.max(0, WORLD_HEIGHT - app.screen.height);

      cameraX = Math.max(0, Math.min(maxCameraX, cameraX));

      cameraY = Math.max(0, Math.min(maxCameraY, cameraY));

      world.x = -cameraX;
      world.y = -cameraY;
    };

    // RESIZE

    const resize = () => {
      if (!initialized || destroyed) {
        return;
      }

      app.renderer.resize(container.clientWidth, container.clientHeight);

      clampCamera();
    };

    // POINTER MOVE

    const handleWindowPointerMove = (event: PointerEvent) => {
      if (destroyed) return;

      // Camera dragging

      if (
        isPanning &&
        panPointerId !== null &&
        event.pointerId === panPointerId
      ) {
        const dx = event.clientX - panStartX;

        const dy = event.clientY - panStartY;

        cameraX = panStartCameraX - dx * CAMERA_DRAG_SPEED;

        cameraY = panStartCameraY - dy * CAMERA_DRAG_SPEED;

        clampCamera();

        return;
      }

      // Avatar dragging

      if (!draggedAvatar) {
        return;
      }

      if (dragPointerId !== null && event.pointerId !== dragPointerId) {
        return;
      }

      event.preventDefault();

      const dx = event.clientX - startPointerX;

      const dy = event.clientY - startPointerY;

      // Determine whether the avatar
      // has actually been dragged
      if (
        !hasMoved &&
        (Math.abs(dx) > MOVE_THRESHOLD || Math.abs(dy) > MOVE_THRESHOLD)
      ) {
        hasMoved = true;

        draggedAvatar.isDragging = true;

        draggedAvatar.hoverIcon.visible = false;

        draggedAvatar.speechBubble.visible = true;

        // Make the shadow smaller and lighter to create a lifted effect
        draggedAvatar.shadow.visible = true;
        draggedAvatar.shadow.scale.set(0.55, 0.65);
        draggedAvatar.shadow.alpha = 0.35;
        draggedAvatar.shadow.y = 30;
      }

      if (!hasMoved) {
        return;
      }

      // Convert screen position to world position

      const rect = app.canvas.getBoundingClientRect();

      const scaleX = app.screen.width / rect.width;

      const scaleY = app.screen.height / rect.height;

      const screenX = (event.clientX - rect.left) * scaleX;

      const screenY = (event.clientY - rect.top) * scaleY;

      // Add camera offset
      const pointerX = screenX + cameraX;

      const pointerY = screenY + cameraY;

      let newX = pointerX - dragOffsetX;

      let newY = pointerY - dragOffsetY;

      // Keep avatar inside world

      newX = Math.max(
        AVATAR_RADIUS,
        Math.min(WORLD_WIDTH - AVATAR_RADIUS, newX),
      );

      newY = Math.max(
        AVATAR_RADIUS,
        Math.min(WORLD_HEIGHT - AVATAR_RADIUS, newY),
      );

      draggedAvatar.x = newX;

      draggedAvatar.y = newY;
    };

    // POINTER UP

    const handleWindowPointerUp = (event: PointerEvent) => {
      if (destroyed) return;

      // Finish camera panning

      if (
        isPanning &&
        panPointerId !== null &&
        event.pointerId === panPointerId
      ) {
        isPanning = false;
        panPointerId = null;

        document.body.style.cursor = "";

        return;
      }

      // Finish avatar interaction

      if (!draggedAvatar) {
        return;
      }

      if (dragPointerId !== null && event.pointerId !== dragPointerId) {
        return;
      }

      const avatar = draggedAvatar;

      const avatarData = draggedAvatarData;

      // Avatar clicked

      if (!hasMoved && avatarData) {
        avatar.isDragging = false;

        avatar.speechBubble.visible = false;

        avatar.hoverIcon.visible = false;

        router.push(`/recommendation/${avatarData.id}`);
      }

      // Avatar dragged
      else {
        avatar.targetX = avatar.x;

        avatar.targetY = avatar.y;

        avatar.isDragging = false;

        avatar.speechBubble.visible = false;

        // Restore normal shadow
        avatar.shadow.visible = true;
        avatar.shadow.scale.set(1, 1);
        avatar.shadow.alpha = 1;
        avatar.shadow.y = 0;

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

    // POINTER CANCEL

    const handleWindowPointerCancel = (event: PointerEvent) => {
      if (destroyed) return;

      // Cancel camera pan
      if (
        isPanning &&
        panPointerId !== null &&
        event.pointerId === panPointerId
      ) {
        isPanning = false;
        panPointerId = null;

        document.body.style.cursor = "";

        return;
      }

      if (!draggedAvatar) {
        return;
      }

      if (dragPointerId !== null && event.pointerId !== dragPointerId) {
        return;
      }

      draggedAvatar.isDragging = false;

      draggedAvatar.speechBubble.visible = false;

      // Restore normal shadow
      draggedAvatar.shadow.visible = true;
      draggedAvatar.shadow.scale.set(1, 1);
      draggedAvatar.shadow.alpha = 1;
      draggedAvatar.shadow.y = 0;

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

    // WINDOW EVENTS

    window.addEventListener("pointermove", handleWindowPointerMove, {
      passive: false,
    });

    window.addEventListener("pointerup", handleWindowPointerUp);

    window.addEventListener("pointercancel", handleWindowPointerCancel);

    // PIXI SETUP

    async function setup() {
      const container = containerRef.current;

      if (!container) return;

      try {
        await app.init({
          width: container.clientWidth,

          height: container.clientHeight,

          backgroundAlpha: 0,

          resolution: window.devicePixelRatio,

          antialias: true,

          autoDensity: true,
        });

        await document.fonts.ready;

        // Component was unmounted
        // while Pixi was loading
        if (destroyed) {
          app.destroy(true, {
            children: true,
            texture: true,
          });
          return;
        }

        initialized = true;

        // Canvas

        container.appendChild(app.canvas);

        app.canvas.addEventListener("dragstart", (event) => {
          event.preventDefault();
        });

        app.canvas.style.userSelect = "none";

        app.canvas.style.touchAction = "none";

        // World

        app.stage.addChild(world);

        world.x = 0;
        world.y = 0;

        // Ground pointer events
        //
        // Clicking empty ground starts
        // camera dragging.

        app.canvas.addEventListener("pointerdown", (event) => {
          // If an avatar is being interacted
          // with, don't start camera movement.
          if (draggedAvatar) {
            return;
          }

          isPanning = true;

          panPointerId = event.pointerId;

          panStartX = event.clientX;

          panStartY = event.clientY;

          panStartCameraX = cameraX;

          panStartCameraY = cameraY;

          app.canvas.setPointerCapture(event.pointerId);

          document.body.style.cursor = "grabbing";
        });

        // Create avatars

        const margin = AVATAR_RADIUS;

        for (const avatarData of avatars) {
          if (destroyed) {
            return;
          }

          const avatar = createAvatar(avatarData);

          // Initial position
          avatar.x = margin + Math.random() * (WORLD_WIDTH - margin * 2);

          avatar.y = margin + Math.random() * (WORLD_HEIGHT - margin * 2);

          // Target position
          avatar.targetX = margin + Math.random() * (WORLD_WIDTH - margin * 2);

          avatar.targetY = margin + Math.random() * (WORLD_HEIGHT - margin * 2);

          avatar.eventMode = "static";

          avatar.cursor = "pointer";

          // Avatar pointer down

          avatar.on("pointerdown", (event) => {
            playClickSound("/assets/melo.mp3");

            if (draggedAvatar || isPanning) {
              return;
            }

            event.stopPropagation();

            draggedAvatar = avatar;

            draggedAvatarData = avatarData;

            dragPointerId = event.pointerId;

            startPointerX = event.global.x;

            startPointerY = event.global.y;

            hasMoved = false;

            // Get position in world
            const localPos = event.getLocalPosition(world);

            dragOffsetX = localPos.x - avatar.x;

            dragOffsetY = localPos.y - avatar.y;

            avatar.targetX = avatar.x;

            avatar.targetY = avatar.y;

            avatar.speechBubble.visible = false;

            avatar.hoverIcon.visible = false;

            document.body.style.userSelect = "none";

            document.body.style.cursor = "default";

            event.preventDefault?.();
          });

          // Put avatar inside world
          world.addChild(avatar);

          activeAvatars.push(avatar);
        }

        // TICKER

        app.ticker.add((ticker) => {
          if (destroyed) {
            return;
          }

          // EDGE SCROLLING

          if (!isPanning && !draggedAvatar) {
            const pointer = app.renderer.events.pointer.global;

            const mouseX = pointer.x;

            const mouseY = pointer.y;

            if (mouseX < EDGE_SCROLL_SIZE) {
              cameraX -= EDGE_SCROLL_SPEED * ticker.deltaTime;
            }

            if (mouseX > app.screen.width - EDGE_SCROLL_SIZE) {
              cameraX += EDGE_SCROLL_SPEED * ticker.deltaTime;
            }

            if (mouseY < EDGE_SCROLL_SIZE) {
              cameraY -= EDGE_SCROLL_SPEED * ticker.deltaTime;
            }

            if (mouseY > app.screen.height - EDGE_SCROLL_SIZE) {
              cameraY += EDGE_SCROLL_SPEED * ticker.deltaTime;
            }

            clampCamera();
          }

          // AVATAR MOVEMENT

          for (const avatar of activeAvatars) {
            if (avatar.isDragging) {
              continue;
            }

            avatar.x +=
              (avatar.targetX - avatar.x) * AVATAR_SPEED * ticker.deltaTime;

            avatar.y +=
              (avatar.targetY - avatar.y) * AVATAR_SPEED * ticker.deltaTime;

            const distance = Math.hypot(
              avatar.targetX - avatar.x,
              avatar.targetY - avatar.y,
            );

            // New random target
            if (distance < 5) {
              avatar.targetX =
                margin + Math.random() * (WORLD_WIDTH - margin * 2);

              avatar.targetY =
                margin + Math.random() * (WORLD_HEIGHT - margin * 2);
            }
          }

          // AVATAR COLLISIONS

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
                    margin + Math.random() * (WORLD_WIDTH - margin * 2);

                  a.targetY =
                    margin + Math.random() * (WORLD_HEIGHT - margin * 2);
                }

                if (!b.isDragging) {
                  b.x += separationX;

                  b.y += separationY;

                  b.targetX =
                    margin + Math.random() * (WORLD_WIDTH - margin * 2);

                  b.targetY =
                    margin + Math.random() * (WORLD_HEIGHT - margin * 2);
                }
              }
            }
          }
        });

        // Resize listener

        window.addEventListener("resize", resize);

        // Initial camera clamp
        clampCamera();
      } catch (error) {
        console.error("Failed to initialise Plaza:", error);
      }
    }

    setup();

    // CLEANUP

    return () => {
      destroyed = true;

      window.removeEventListener("resize", resize);

      window.removeEventListener("pointermove", handleWindowPointerMove);

      window.removeEventListener("pointerup", handleWindowPointerUp);

      window.removeEventListener("pointercancel", handleWindowPointerCancel);

      document.body.style.userSelect = "";

      document.body.style.cursor = "";

      if (initialized) {
        try {
          app.destroy(true, {
            children: true,
            texture: true,
          });
        } catch (error) {
          console.error("Error destroying Plaza Pixi app:", error);
        }
      }
    };
  }, [avatars, router]);

  // GET CURRENT USER TO BROADCAST CURSOR

  const [currentUser, setCurrentUser] = useState<PlazaAvatar | null>(null);

  useEffect(() => {
    const loadCurrentUser = async () => {
      const userId = await getCurrentUserId();

      if (!userId) return;

      const user = await getUserById(userId);

      if (user) {
        setCurrentUser({
          id: user.id,
          colour: user.colour,
          faceIndex: user.face_index,
          displayName: user.display_name,
        });
      }
    };

    loadCurrentUser();

    // WELCOME POPUP

    let cancelled = false;

    const checkPopup = async () => {
      const userId = await getCurrentUserId();

      if (cancelled || !userId) {
        return;
      }

      const hasSeenPopup = localStorage.getItem(
        `meloplaza-welcome-seen-${userId}`,
      );

      if (!hasSeenPopup) {
        setIsPopupOpen(true);
      }
    };

    checkPopup();

    return () => {
      cancelled = true;
    };
  }, []);

  // CLOSE POPUP

  const closePopup = async () => {
    const userId = await getCurrentUserId();

    if (!userId) {
      return;
    }

    setIsPopupOpen(false);

    localStorage.setItem(`meloplaza-welcome-seen-${userId}`, "true");

    playClickSound("/assets/click.mp3");
  };

  const { onlineCount, cursors } = usePlazaPresence({
    user: currentUser,
    throttleMs: 50,
  });

  // RENDER

  return (
    <>
      <div ref={containerRef} className="fixed inset-0 overflow-hidden">
        {currentUser && <RealtimeCursors cursors={cursors} />}

        <OnlineCounter count={onlineCount} />

        {/* Welcome popup */}
        <div id="welcome-popup">
          <Popup title="Welcome!" isOpen={isPopupOpen} onClose={closePopup}>
            <div className="flex flex-col gap-4 text-center">
              <p className="text-lg font-bold">About</p>

              <p className="text-sm">
                <b>meloplaza</b> is a music recommendation platform which
                allows you to introduce songs to strangers in a meaningful way.
              </p>

              <p className="text-sm mb-2">
                By exploring recommendations at your own pace instead of
                relying on heavily- algorithmed streaming services, you might
                discover new music you would never have heard otherwise!
              </p>

              <p className="font-bold">How to Play:</p>

              <ul className="list-disc list-inside text-left text-sm mb-2">
                <li>
                  Move your mouse to the edge of the screen or drag the ground
                  to move the camera.
                </li>
                <li>
                  Try dragging and clicking on avatars to interact with them.
                </li>

                <li>Add songs you like to your collection.</li>

                <li>Print your collection to take home as a memento.</li>
              </ul>

              <p className="text-lg font-bold text-center">
                That's all, have fun!
              </p>

              <p className="text-lg font-bold text-center">ヽ(・∀・)ﾉ</p>
            </div>
          </Popup>
        </div>

        {/* Collection button */}
        <div
          id="collection-button"
          className="fixed bottom-8 right-8 flex flex-col items-center justify-center hover:cursor-pointer"
          onMouseEnter={() => setIsCollectionHovered(true)}
          onMouseLeave={() => setIsCollectionHovered(false)}
          onClick={() => {
            playClickSound("/assets/click.mp3");

            router.push("/collection");
          }}
        >
          <img
            id="folder"
            className="w-30 h-30"
            src={
              isCollectionHovered
                ? "/assets/folder-open.png"
                : "/assets/folder-closed.png"
            }
            alt="Collection"
          />

          <h1 className="font-bold text-lg -mt-4">Go to Collection</h1>
        </div>
      </div>
    </>
  );
}