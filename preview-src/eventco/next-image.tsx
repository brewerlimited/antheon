import type { ImgHTMLAttributes } from 'react';
export default function Image({ unoptimized, priority, fill, ...props }: ImgHTMLAttributes<HTMLImageElement> & { unoptimized?: boolean; priority?: boolean; fill?: boolean }) { return <img {...props} />; }
