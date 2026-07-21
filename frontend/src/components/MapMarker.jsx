import L from "leaflet";

export const createPinIcon = (color = "#2563eb", size = 36) =>
  L.divIcon({
    className: "custom-pin-marker",
    html: `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size + 14}px;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));
      ">
        <svg width="${size}" height="${size + 14}" viewBox="0 0 36 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 0C8.06 0 0 8.06 0 18c0 12.6 18 32 18 32s18-19.4 18-32C36 8.06 27.94 0 18 0z" fill="${color}"/>
          <circle cx="18" cy="18" r="8" fill="white" opacity="0.9"/>
          <circle cx="18" cy="18" r="4" fill="${color}"/>
        </svg>
      </div>
    `,
    iconSize: [size, size + 14],
    iconAnchor: [size / 2, size + 14],
    popupAnchor: [0, -(size + 14)],
  });

export const defaultPinIcon = createPinIcon("#35503F");
