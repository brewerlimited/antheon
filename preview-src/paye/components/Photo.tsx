import images from '@/data/images.json';
type ImageInfo={width:number;height:number;widths:number[]};
export default function Photo({name,alt,className='',priority=false,sizes='100vw'}:{name:string;alt:string;className?:string;priority?:boolean;sizes?:string}){
 const info=(images as Record<string,ImageInfo>)[name];
 if(!info)return null;
 const base=info.widths.includes(1200)?1200:info.widths[0];
 return <img className={className} src={`/previews/paye/images/${name}-${base}.webp`} srcSet={info.widths.map(w=>`/previews/paye/images/${name}-${w}.webp ${w}w`).join(', ')} sizes={sizes} width={info.width} height={info.height} alt={alt} loading={priority?'eager':'lazy'} fetchPriority={priority?'high':undefined} decoding="async"/>;
}
