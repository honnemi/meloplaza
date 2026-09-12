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

const AVATAR_RADIUS = 24;
const NAME_OFFSET = 40;
const AVATAR_SPEED = 0.001;

function createAvatar(data: PlazaAvatar) {
  const avatar = new Container();

  /*
   * Ground shadow
   */
  const shadow = new Graphics();

  shadow.ellipse(0, 25, 20, 5).fill({
    color: 0x000000,
    alpha: 0.2,
  });

  avatar.addChild(shadow);

  /*
   * Bubble
   */
  const bubble = new Graphics();

  const colour = parseInt(data.colour.replace("#", ""), 16);

  bubble.circle(0, 0, AVATAR_RADIUS).fill({
    color: colour,
  });

  avatar.addChild(bubble);

  /*
   * Angled highlight
   */
  const highlight = new Graphics();

  highlight.ellipse(-6, -16, 6, 3).fill({
    color: 0xffffff,
    alpha: 0.5,
  });

  highlight.rotation = (-25 * Math.PI) / 180;

  avatar.addChild(highlight);

  /*
   * Face
   */
  const face = new Text({
    text: AVATAR_FACES[data.faceIndex],
    style: {
      fontFamily: "Geist Pixel",
      fontSize: 12,
    },
  });

  face.anchor.set(0.5);

  avatar.addChild(face);

  /*
   * Username
   */
  const name = new Text({
    text: data.displayName,
    style: {
      fontFamily: "Geist Pixel",
      fontSize: 12,
      fill: 0x000000,
    },
  });

  name.anchor.set(0.5);

  // Place name above the avatar
  name.y = -NAME_OFFSET;

  avatar.addChild(name);

  /*
   * Hover icon
   */
  const hoverIcon = new Text({
    text: "♫",
    style: {
      fontFamily: "Geist Pixel",
      fontSize: 18,
      fill: 0x000000,
    },
  });

  hoverIcon.anchor.set(0.5);
  hoverIcon.y = -62;
  hoverIcon.visible = false;
  hoverIcon.eventMode = "none";

  avatar.addChild(hoverIcon);

  avatar.on("pointerover", () => {
    hoverIcon.visible = true;
  });

  avatar.on("pointerout", () => {
    hoverIcon.visible = false;
  });

  return avatar;
}

export default function Plaza({ avatars }: PlazaProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const app = new Application();

    let destroyed = false;
    let initialized = false;

    const resize = () => {
      if (!initialized || destroyed) return;

      app.renderer.resize(container.clientWidth, container.clientHeight);
    };

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

      /*
       * Create avatars
       */
      for (const avatarData of avatars) {
        const avatar = createAvatar(avatarData);

        const margin = AVATAR_RADIUS;

        avatar.x = margin + Math.random() * (app.screen.width - margin * 2);

        avatar.y = margin + Math.random() * (app.screen.height - margin * 2);

        avatar.eventMode = "static";
        avatar.cursor = "pointer";

        avatar.on("pointerdown", () => {
          document.startViewTransition(() => {
            router.push(`/profile/${avatarData.id}`);
          });
        });

        app.stage.addChild(avatar);

        /*
         * Movement
         */
        let targetX = margin + Math.random() * (app.screen.width - margin * 2);

        let targetY = margin + Math.random() * (app.screen.height - margin * 2);

        app.ticker.add((ticker) => {
          if (destroyed) return;

          avatar.x += (targetX - avatar.x) * AVATAR_SPEED * ticker.deltaTime;

          avatar.y += (targetY - avatar.y) * AVATAR_SPEED * ticker.deltaTime;

          const distance = Math.hypot(targetX - avatar.x, targetY - avatar.y);

          if (distance < 5) {
            targetX = margin + Math.random() * (app.screen.width - margin * 2);

            targetY = margin + Math.random() * (app.screen.height - margin * 2);
          }
        });
      }

      window.addEventListener("resize", resize);
    }

    setup();

    return () => {
      destroyed = true;

      window.removeEventListener("resize", resize);

      if (!initialized) return;

      app.destroy(true, {
        children: true,
        texture: true,
      });
    };
  }, [avatars, router]);

  return <div ref={containerRef} className="h-screen w-full overflow-hidden" />;
}
