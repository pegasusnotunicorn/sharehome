declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.css" {}

declare module "swiper/css" {}
declare module "swiper/css/navigation" {}
declare module "swiper/css/pagination" {}
declare module "swiper/css/autoplay" {}
declare module "swiper/css/a11y" {}

declare module "webfontloader" {
  const WebFont: {
    load: (config: { custom?: { families: string[] } }) => void;
  };
  export default WebFont;
}
