import { memo } from "react";

import { cn } from "@/lib/utils";
import { useImageUrl } from "@/data/images";

const ContextImage = memo(function ContextImage({
  imageId,
  className,
  ...props
}: React.ComponentProps<"img"> & {
  imageId: string;
}) {
  const url = useImageUrl(imageId);
  if (!url) return null;
  // TODO: placeholder image box
  return (
    <img className={cn("h-full w-auto", className)} src={url} {...props} />
  );
});

export default ContextImage;
