"use client";

import { useEffect, useRef } from "react";
import { Application, Assets, Container, Graphics, Text, Sprite } from "pixi.js";
import { AVATAR_FACES } from "@/app/avatar-customisation";
import { useRouter } from 'next/navigation';

interface PlazaAvatar {
    id: string;
    displayName: string;
    colour: string;
    faceIndex: number;
}

interface PlazaProps {
    avatars: PlazaAvatar[];
}

function createAvatar(data: PlazaAvatar) {
    const avatar = new Container();

    /*
     * Shadow
     */
    const shadow = new Graphics();

    shadow
        .ellipse(0, 25, 20, 5)
        .fill({
            color: 0x000000,
            alpha: 0.25,
        });

    avatar.addChild(shadow);

    /*
     * Bubble
     */
    const bubble = new Graphics();

    const colour = parseInt(data.colour.replace("#", ""), 16);

    bubble
        .circle(0, 0, 24)
        .fill({
            color: colour,
        })
        .stroke({
            color: colour,
            width: 1,
        });

    avatar.addChild(bubble);

    /*
     * Glossy highlight
     */
    const highlight = new Graphics();

    highlight
        .ellipse(-10, -12, 5, 3)
        .fill({
            color: 0xffffff,
            alpha: 0.45,
        });

    avatar.addChild(highlight);

    /*
     * Face
     */
    const face = new Text({
        text: AVATAR_FACES[data.faceIndex],
        style: {
            fontFamily: "Arial",
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
            fontFamily: "Arial",
            fontSize: 12,
            fill: 0x000000,
        },
    });

    name.anchor.set(0.5);
    name.y = 40;

    avatar.addChild(name);

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

            app.renderer.resize(
                container.clientWidth,
                container.clientHeight
            );
        };

        async function setup() {
            await app.init({
                width: container.clientWidth,
                height: container.clientHeight,
                backgroundAlpha: 0,
                resolution: window.devicePixelRatio,
                antialias: true,
                autoDensity: true
            });

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

                avatar.x = Math.random() * app.screen.width - 24;
                avatar.y = Math.random() * app.screen.height - 24;

                avatar.eventMode = 'static';
                avatar.cursor = 'pointer';
                avatar.on('pointerdown', () => {
                router.push(`/profile/${avatarData.id}`);
                });

                app.stage.addChild(avatar);
                
                let targetX = Math.random() * app.screen.width;
                let targetY = Math.random() * app.screen.height;
                const speed = 0.001;
                
                app.ticker.add((ticker) => {
                    avatar.x += (targetX - avatar.x) * speed * ticker.deltaTime;
                    avatar.y += (targetY - avatar.y) * speed * ticker.deltaTime;

                    // Calculate distance to target
                    const dx = targetX - avatar.x;
                    const dy = targetY - avatar.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // If close to the target, pick a new random target
                    if (distance < 5) {
                        targetX = Math.random() * app.screen.width;
                        targetY = Math.random() * app.screen.height;
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

            if (app.canvas.parentNode === container) {
                container.removeChild(app.canvas);
            }

            app.destroy();
        };
    }, [avatars]);

    return (
        <div
            ref={containerRef}
            className="h-screen w-full overflow-hidden"
        />
    );
}