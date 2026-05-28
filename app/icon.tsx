import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 16,
          background: "linear-gradient(135deg, #2563EB 0%, #1B3A6B 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "4px",
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18 2L4 8V18C4 25.73 10.24 32.98 18 35C25.76 32.98 32 25.73 32 18V8L18 2Z"
            fill="url(#grad)"
          />
          <path
            d="M18 7L8 11.5V18C8 23.4 12.48 28.52 18 30.5C23.52 28.52 28 23.4 28 18V11.5L18 7Z"
            fill="#2E5EA8"
            fillOpacity="0.5"
          />
          <text
            x="18"
            y="22"
            textAnchor="middle"
            fill="white"
            fontSize="12"
            fontWeight="bold"
            fontFamily="serif"
          >
            ช
          </text>
          <defs>
            <linearGradient
              id="grad"
              x1="18"
              y1="2"
              x2="18"
              y2="35"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#2563EB" />
              <stop offset="1" stopColor="#1B3A6B" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
