import Image from "next/image";

import type { ImageRef } from "../../definition/types";

/**
 * Imagem de uma opção visual. Renders reais da Luísa aparecem como imagem;
 * o restante é um placeholder claramente provisório (a curadoria final fica
 * para o C2/B4).
 */
export function ProvisionalImage({ image }: { image: ImageRef }) {
  if (image.kind === "render") {
    return (
      <Image
        src={image.src}
        alt={image.alt}
        width={640}
        height={480}
        sizes="(max-width: 640px) 45vw, 260px"
        className="aspect-[4/3] w-full rounded-t-[inherit] object-cover"
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="flex aspect-[4/3] w-full items-center justify-center rounded-t-[inherit] bg-[repeating-linear-gradient(135deg,var(--color-sand)_0_12px,var(--color-paper)_12px_24px)]"
    >
      <span className="rounded-full bg-paper/90 px-2.5 py-1 text-[0.7rem] font-semibold tracking-wide text-ink-soft uppercase">
        Imagem provisória
      </span>
    </div>
  );
}
