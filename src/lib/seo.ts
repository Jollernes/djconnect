import { useDocumentHead } from "@/hooks/useDocumentHead";
import { PLATFORM_NAME } from "@/lib/constants";

export function useDanishPageSeo(input: { title: string; description: string; canonical?: string }) {
  useDocumentHead({
    title: `${input.title} | ${PLATFORM_NAME}`,
    description: input.description,
    canonical: input.canonical,
    ogType: "website",
  });
}
