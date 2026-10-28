// Original image URLs remain unchanged as src/large-screen fallbacks.
const files = import.meta.glob("../../assets/opt/home-responsive/*.webp", {
  eager: true, query: "?url", import: "default",
});
const variants = (name, original, width, height, sizes, icon = false) => ({
  width, height, sizes,
  srcSet: [
    ...(icon ? [128, 192] : [320, 640, 960, 1280]).map((size) => {
      const url = files[`../../assets/opt/home-responsive/${name}-${size}.webp`];
      if (!url) throw new Error(`Missing responsive image: ${name}-${size}`);
      return `${url} ${size}w`;
    }),
    `${original} ${width}w`,
  ].join(", "),
});

// Account for object-fit:cover: these landscape sources fill taller frames.
export const servicePhotoSizes = "(max-width: 760px) 42vw, (max-width: 1100px) 55vw, (max-width: 1400px) 36vw, 500px";
export const fleetPhotoSizes = "(max-width: 760px) 110vw, (max-width: 960px) 60vw, (max-width: 1632px) 42vw, 670px";

const services = {
  airport: ["noi-bai-airport-private-transfer-car", 1600, 900],
  sapa: ["long-distance-private-transfer", 1672, 941],
  custom: ["custom-trip-private-car", 1600, 900],
  haGiang: ["business-private-transfer-car", 1600, 900],
};
const fleet = {
  limoLux: ["limo-lux-private-car-white-exterior", 1672, 941],
  limoGreen: ["limo-prime-private-transfer-front-view", 1672, 941],
  vf9: ["hoang-luxury-travel-vf9-private-car", 1600, 900],
};
const icons = ["airport-private-transfer-icon", "long-distance-private-transfer-icon", "custom-private-trip-icon", "business-private-transfer-icon"];
export function servicePhotoProps(key, original) {
  const [name, width, height] = services[key];
  return variants(name, original, width, height, servicePhotoSizes);
}
export function fleetPhotoProps(key, original) {
  const [name, width, height] = fleet[key];
  return variants(name, original, width, height, fleetPhotoSizes);
}
export const serviceIconProps = (index, original) => variants(icons[index], original, 512, 512, "58px", true);
