import { useEffect } from "react";

type MetaInput = {
  title?: string;
  description?: string;
  /** Absolute or path-relative canonical URL (e.g. "/wedding-djs"). */
  canonical?: string;
  /** Open Graph / Twitter image URL. */
  image?: string;
  /** Open Graph type, defaults to "website". */
  ogType?: string;
  /** JSON-LD structured data objects (one or many). */
  jsonLd?: object | object[];
};

const DATA_ATTR = "data-djconnect-head";

function setMeta(selector: string, attr: string, value: string) {
  if (!value) return;
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    if (selector.includes("property=")) {
      const property = selector.match(/property="([^"]+)"/)?.[1];
      if (property) el.setAttribute("property", property);
    } else if (selector.includes("name=")) {
      const name = selector.match(/name="([^"]+)"/)?.[1];
      if (name) el.setAttribute("name", name);
    }
    el.setAttribute(DATA_ATTR, "1");
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    el.setAttribute(DATA_ATTR, "1");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function setJsonLd(jsonLd: object | object[]) {
  document.head.querySelectorAll(`script[type="application/ld+json"][${DATA_ATTR}]`).forEach((n) => n.remove());
  const list = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
  for (const obj of list) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute(DATA_ATTR, "1");
    script.textContent = JSON.stringify(obj);
    document.head.appendChild(script);
  }
}

export function useDocumentHead({ title, description, canonical, image, ogType = "website", jsonLd }: MetaInput) {
  useEffect(() => {
    const previousTitle = document.title;
    if (title) document.title = title;
    if (description) setMeta('meta[name="description"]', "content", description);
    if (title) {
      setMeta('meta[property="og:title"]', "content", title);
      setMeta('meta[name="twitter:title"]', "content", title);
    }
    if (description) {
      setMeta('meta[property="og:description"]', "content", description);
      setMeta('meta[name="twitter:description"]', "content", description);
    }
    if (image) {
      setMeta('meta[property="og:image"]', "content", image);
      setMeta('meta[name="twitter:image"]', "content", image);
      setMeta('meta[name="twitter:card"]', "content", "summary_large_image");
    }
    if (ogType) setMeta('meta[property="og:type"]', "content", ogType);
    if (canonical && typeof window !== "undefined") {
      const url = canonical.startsWith("http") ? canonical : `${window.location.origin}${canonical}`;
      setLink("canonical", url);
      setMeta('meta[property="og:url"]', "content", url);
    }
    if (jsonLd) setJsonLd(jsonLd);

    return () => {
      document.title = previousTitle;
      document.head.querySelectorAll(`script[type="application/ld+json"][${DATA_ATTR}]`).forEach((n) => n.remove());
    };
  }, [title, description, canonical, image, ogType, JSON.stringify(jsonLd)]);
}
