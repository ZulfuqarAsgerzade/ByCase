"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "./ui";

/**
 * Düymə + açılan pəncərə. `children` pəncərəni bağlamaq üçün `close` funksiyası alır.
 * Hər açılışda məzmun yenidən qurulur, yəni forma həmişə təmiz açılır.
 */
export function Modal({
  trigger,
  title,
  description,
  variant = "primary",
  size = "md",
  children,
}: {
  trigger: string;
  title: string;
  description?: string;
  /** Açan düymənin görünüşü */
  variant?: "primary" | "secondary";
  size?: "sm" | "md";
  children: (api: { close: () => void }) => React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [round, setRound] = useState(0);

  // Pəncərənin açıq/qapalı vəziyyəti state ilə idarə olunur, dialog elementi ona uyğunlaşdırılır
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (isOpen && !d.open) d.showModal();
    if (!isOpen && d.open) d.close();
  }, [isOpen]);

  const open = () => {
    setRound((n) => n + 1);
    setIsOpen(true);
  };
  const close = () => setIsOpen(false);

  return (
    <>
      <Button type="button" variant={variant} size={size} onClick={open}>
        {trigger}
      </Button>
      <dialog
        ref={ref}
        aria-labelledby={titleId}
        onClick={(e) => e.target === e.currentTarget && close()}
        onClose={close}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl bg-white p-0 text-brand-900 shadow-lift backdrop:bg-brand-950/50 backdrop:backdrop-blur-sm"
      >
        <div className="p-6 sm:p-7">
          <h2 id={titleId} className="text-xl font-extrabold">
            {title}
          </h2>
          {description && <p className="mt-1 text-sm text-brand-500">{description}</p>}
          <div className="mt-5" key={round}>
            {children({ close })}
          </div>
        </div>
      </dialog>
    </>
  );
}
