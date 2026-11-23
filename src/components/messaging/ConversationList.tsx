import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgeDollarSign } from "lucide-react";
import {
  lastMessageOf,
  unreadCountFor,
  type Conversation,
  type MessageSender,
} from "@/lib/messageStore";

interface ConversationListProps {
  conversations: Conversation[];
  /** Base path a row links to; the conversation id is appended. */
  basePath: string;
  viewer: MessageSender;
}

/** Shared list of message threads used by the customer and DJ dashboards. */
export function ConversationList({
  conversations,
  basePath,
  viewer,
}: ConversationListProps) {
  return (
    <ul className="divide-y divide-border/60 rounded-2xl border border-border/60 bg-card/40">
      {conversations.map((c) => (
        <ConversationRow
          key={c.id}
          conversation={c}
          basePath={basePath}
          viewer={viewer}
        />
      ))}
    </ul>
  );
}

function ConversationRow({
  conversation,
  basePath,
  viewer,
}: {
  conversation: Conversation;
  basePath: string;
  viewer: MessageSender;
}) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const onUpdate = () => setTick((t) => t + 1);
    window.addEventListener("message:update", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("message:update", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  const last = lastMessageOf(conversation.id);
  const unread = unreadCountFor(conversation.id, viewer);

  const title =
    viewer === "dj"
      ? conversation.customerName ?? "Kunde"
      : conversation.djStageName;

  const preview = last
    ? last.kind === "offer"
      ? `Tilbud: ${last.offer?.title ?? "Skræddersyet tilbud"}`
      : `${last.sender === viewer ? "Du: " : ""}${last.text ?? ""}`
    : "Ingen beskeder endnu";

  const avatar = viewer === "dj" ? undefined : conversation.djAvatarUrl;

  return (
    <li>
      <Link
        to={`${basePath}/${conversation.id}`}
        className="flex items-center justify-between gap-4 px-5 py-4 text-sm transition-colors hover:bg-muted/30"
      >
        <div className="flex min-w-0 items-center gap-3">
          {avatar ? (
            <img
              src={avatar}
              alt=""
              className="h-10 w-10 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
              {title.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{title}</p>
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
              {last?.kind === "offer" && (
                <BadgeDollarSign className="h-3 w-3 shrink-0 text-accent" />
              )}
              {preview}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {unread > 0 && (
            <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-accent px-1.5 text-[11px] font-semibold text-accent-foreground">
              {unread}
            </span>
          )}
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </Link>
    </li>
  );
}
