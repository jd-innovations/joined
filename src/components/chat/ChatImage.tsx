import { useEffect, useState } from "react";
import { signedImageUrl } from "../../lib/chat";

export function ChatImage({
  path,
  width,
  height,
  className,
}: {
  path: string;
  width: number | null;
  height: number | null;
  className?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;
    void signedImageUrl(path).then((u) => {
      if (active) setUrl(u);
    });
    return () => {
      active = false;
    };
  }, [path]);

  const ratio = width && height ? width / height : 4 / 3;

  return (
    <>
      <button
        type="button"
        onClick={() => url && setOpen(true)}
        className={`block w-full overflow-hidden rounded-2xl bg-surface-tertiary ${className ?? ""}`}
        style={{ aspectRatio: String(ratio) }}
      >
        {url && (
          <img
            src={url}
            alt="Shared photo"
            loading="lazy"
            className="h-full w-full object-cover"
          />
        )}
      </button>

      {open && url && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setOpen(false)}
        >
          <img
            src={url}
            alt="Shared photo"
            className="max-h-full max-w-full rounded-xl object-contain"
          />
        </div>
      )}
    </>
  );
}
