import React from "react";

const outlines = {
  boat: <path d="M2 24h38c0-3 4-8 6-10-8 0-12 3-21 3H11c-4 0-6 2-7 7m5-9c1-2 2-3 5-3h18c2 0 3 1 4 2m-24-4 2-3h15l2 3" />,
  /* Xe SUV nhìn nghiêng theo mẫu khách gửi 23/11/2026; vẽ theo toạ độ ảnh mẫu
     (1240px) rồi thu về khung 48×32, nét 35 ≈ 1.7 sau khi thu. */
  car: <g transform="translate(-5.8 -15.4) scale(0.0487)" strokeWidth="35">
    <path d="M320 428H690C740 428 770 445 800 470L880 548C960 556 1020 575 1045 610C1065 635 1070 680 1068 705C1068 760 1050 790 1010 797H655" />
    <path d="M320 428C280 428 258 440 235 472L180 560C165 585 162 620 162 685C162 705 170 718 182 725M314 752 480 773M195 563 882 565M400 445 360 545M480 445 562 548" />
    <path d="M680 650H800M932 650H1042M728 733 1040 730M893 812A62 50 0 0 0 1017 812" />
    <ellipse cx="243" cy="737" rx="58" ry="83" /><ellipse cx="567" cy="765" rx="73" ry="98" />
  </g>,
  support: <>
    <path d="M11 19v-4a13 13 0 0 1 26 0v5m0 4c0 4-2 6-6 6h-4" />
    <rect x="9" y="16" width="6" height="10" rx="3" /><rect x="33" y="16" width="6" height="10" rx="3" />
    <rect x="22" y="27" width="8" height="4" rx="2" />
  </>,
  price: <>
    <path d="m10 19 17-16h11v11L21 30a2 2 0 0 1-3 0l-8-8a2 2 0 0 1 0-3Zm9 5 10-10" />
    <circle cx="33" cy="8" r="2.15" /><circle cx="20" cy="16" r="1.65" /><circle cx="27" cy="22" r="1.65" />
  </>,
  couples: <>
    <path d="m12 3 8 2-3 10c-1 3-3 5-6 6-2-2-3-5-2-8l3-10Zm-2 7 8 2m-7 9-2 8m-4-1 8 2M36 3l-8 2 3 10c1 3 3 5 6 6 2-2 3-5 2-8L36 3Zm2 7c-3 2-4 0-8 2m7 9 2 8m4-1-8 2" />
  </>,
  family: <>
    <circle cx="12" cy="8" r="4.5" /><circle cx="36" cy="8" r="4.5" /><circle cx="24" cy="17" r="3.1" />
    <path d="M5 29v-8a7 7 0 0 1 14-1m24 9v-8a7 7 0 0 0-14-1m-11 9v-3a6 6 0 0 1 12 0v3" />
  </>,
  luxury: <>
    <path d="M2 27c12-2 28 1 38 0 1-4 5-8 7-10-9 0-12 3-22 3H9c-3 0-5 3-6 7m5-9c1-2 2-3 5-3h19c2 0 3 1 4 2m-25-4c1-2 2-2 4-2h14l2 2m11-11c0 3 2 4 4 5-2 0-4 2-4 5-1-3-2-5-5-5 3-1 4-2 5-5Z" />
  </>,
  scenic: <path d="M2 27c10-3 16-2 22-1 8 2 14 2 22 0M7 25c-3-3-1-6 2-8 0-4 2-4 3-7 1-5 4-7 6-6 3 0 4 3 5 4 4 0 5 5 6 7 1 2 4 5 2 8l-2 3m9 0c-3-1-4-4-2-6 0-2 2-5 4-5 2-1 4 2 5 3 0 2 3 4 1 7" />,
  hotel: <>
    <path d="M11 29V12l13-5 13 5v17M8 29h32M11 12 9 12V9l15-6 15 6v3h-2M18 5V3l3-2h6l3 2v2M21 29v-7h6v7M17 9v20m14-20v20M13 21l8-2h6l8 2" />
    <path d="M14 14v2m0 2v1m20-5v2m0 2v1m-10-7v2m0 2v2" />
  </>,
  anchor: <>
    <circle cx="24" cy="6" r="4" />
    <path d="M24 10v19m-7-15h14m-20 4c1 7 6 11 13 11s12-4 13-11m-29-1 3 3 4-2m25-1-3 3-4-2" />
  </>,
  yacht: <path d="M3 23h35c2-5 5-8 8-11-7 0-13 3-20 3H12c-4 0-6 4-9 8Zm5-9 3-3 25-2c2 0 3 1 4 2M15 10l3-4h15c2 0 4 1 6 3m-19-3V4h7v2m-4-2V2m-9 26c9-5 11 4 20 0" />,
};

export default function CruiseDesktopIcon({ name }) {
  return <svg className="hlt-cruise-desktop-icon" data-cruise-icon={name} viewBox="0 0 48 32" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {outlines[name]}
  </svg>;
}
