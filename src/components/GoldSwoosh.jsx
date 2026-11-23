import React, { useId } from "react";

/* Nét lượn vàng dưới tiêu đề (mẫu khách gửi 23/11/2026): hai nét thuôn nhọn hai
   đầu, tô màu vàng chuyển sắc. */
export default function GoldSwoosh({ className }) {
  const gradientId = `hlt-swoosh-${useId().replace(/:/g, "")}`;
  return (
    <svg className={className} viewBox="500 225 1000 210" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#c08d1c" />
          <stop offset=".45" stopColor="#efcc63" />
          <stop offset="1" stopColor="#c39021" />
        </linearGradient>
      </defs>
      <g fill={`url(#${gradientId})`}>
        <path d="M515 390C620 300 720 255 820 255C960 255 1020 300 1130 322C1260 345 1400 300 1485 238C1400 320 1260 365 1130 362C1010 360 950 300 820 297C700 295 600 330 515 390Z" />
        <path d="M625 375C690 345 750 333 800 333C900 333 970 400 1060 410C1150 418 1230 395 1280 370C1230 405 1150 425 1060 423C960 421 890 365 800 362C730 360 680 365 625 375Z" />
      </g>
    </svg>
  );
}
