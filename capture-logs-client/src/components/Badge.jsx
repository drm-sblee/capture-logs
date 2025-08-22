const wrap = { display: "inline-flex", alignItems: "center", gap: 6 };

const OS_ICON_MAP = {
  "Windows": "windows",
  "macOS": "mac",
  "Linux": "linux",
};

const BROWSER_ICON_MAP = {
  "Google Chrome": "chrome",
  "Microsoft Edge": "edge",
  "Mozilla Firefox": "firefox",
  "Safari": "safari",
  "Opera":  "opera",
  "Naver Whale": "whale",
  "Vivaldi": "vivaldi"
};

export function OSBadge({ name, className, title }) {
  const src = OS_ICON_MAP[name];

  return (
    <span style={wrap} className={className}>
      <i
        className={src}
      />
    </span>
  );
}

export function BrowserBadge({ name, className, title }) {
  const src = BROWSER_ICON_MAP[name];
  return (
    <span style={wrap} className={className}>
      <i
        className={src}
      />
    </span>
  );
}
  
  export default { OSBadge, BrowserBadge };