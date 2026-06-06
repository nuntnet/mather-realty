import { ImageResponse } from "next/og";
import { getProperty } from "@/lib/notion";
import { SITE_NAME } from "@/lib/site";

export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };
export const alt = "Property";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function Image({ params }: Props) {
  const { locale, slug } = await params;
  const property = await getProperty(slug, locale).catch(() => null);

  if (!property) {
    // Fallback branded image when property not found
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #1e3a5f 0%, #0f2340 100%)",
          }}
        >
          <div
            style={{
              color: "#ffffff",
              fontSize: 64,
              fontWeight: 700,
              letterSpacing: "-1px",
            }}
          >
            {SITE_NAME}
          </div>
        </div>
      ),
      { width: 1200, height: 630 },
    );
  }

  const title = property.title[locale] ?? property.title["en"] ?? "";
  const city = property.city ?? "";
  const price = property.priceTHB
    ? new Intl.NumberFormat("en-US").format(property.priceTHB) + " THB/mo"
    : "";
  const bedrooms = property.bedrooms;
  const coverImage = property.coverImage;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Background cover image */}
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImage}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(135deg, #1e3a5f 0%, #0f2340 100%)",
            }}
          />
        )}

        {/* Dark overlay gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.1) 100%)",
          }}
        />

        {/* Content overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "48px 56px",
          }}
        >
          {/* Site badge */}
          <div
            style={{
              position: "absolute",
              top: 40,
              right: 56,
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 8,
              padding: "8px 18px",
              color: "#ffffff",
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            {SITE_NAME}
          </div>

          {/* Property details */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {/* Location pill */}
            {city ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: "#93c5fd",
                  fontSize: 22,
                  fontWeight: 500,
                }}
              >
                <span>📍</span>
                <span>{city}</span>
                {bedrooms > 0 && (
                  <>
                    <span style={{ color: "rgba(255,255,255,0.4)", margin: "0 8px" }}>·</span>
                    <span style={{ color: "#d1fae5" }}>
                      {bedrooms} {bedrooms === 1 ? "Bedroom" : "Bedrooms"}
                    </span>
                  </>
                )}
              </div>
            ) : null}

            {/* Title */}
            <div
              style={{
                color: "#ffffff",
                fontSize: title.length > 60 ? 36 : 46,
                fontWeight: 700,
                lineHeight: 1.2,
                maxWidth: 980,
                letterSpacing: "-0.5px",
              }}
            >
              {title}
            </div>

            {/* Price */}
            {price ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: 8,
                }}
              >
                <div
                  style={{
                    background: "#2563eb",
                    borderRadius: 10,
                    padding: "10px 24px",
                    color: "#ffffff",
                    fontSize: 28,
                    fontWeight: 700,
                    letterSpacing: "0.01em",
                  }}
                >
                  ฿ {price}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
