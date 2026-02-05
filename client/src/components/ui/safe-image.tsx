import { useState } from "react";
import { ImageOff } from "lucide-react";

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  showPlaceholder?: boolean;
}

export function SafeImage({ src, alt, fallbackSrc, showPlaceholder = true, className = "", ...props }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    } else {
      setHasError(true);
    }
  };

  if (hasError && showPlaceholder) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`} {...props}>
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <ImageOff className="h-8 w-8 sm:h-12 sm:w-12" />
          <span className="text-xs sm:text-sm">Image unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={handleError}
      className={className}
      {...props}
    />
  );
}
