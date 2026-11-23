/**
 * Local persistence for direct messages between a customer and a DJ.
 *
 * A conversation is opened from a DJ's public profile ("Send besked") and is
 * scoped to a (customer, DJ) pair. Messages are plain text, except for
 * *custom offers* — a DJ can send a tailored price offer inside the chat
 * (like Airbnb). When the customer accepts an offer we spin up a normal
 * booking request in `pending_customer` so it flows straight into the
 * existing deposit/payment step.
 *
 * Until we have a real backend, everything lives in `localStorage`. The DJ
 * inbox falls back to all conversations when the logged-in DJ's id doesn't
 * match any stored conversation (common in the single-browser demo where the
 * mock DJ id differs from the profile id a message was sent to).
 */

export type MessageSender = "customer" | "dj";

export type MessageKind = "text" | "offer";

export type OfferStatus = "pending" | "accepted" | "declined" | "withdrawn";

/** A tailored price offer sent by a DJ inside a conversation. */
export type CustomOffer = {
  title: string;
  description?: string;
  fullPriceMinor: number;
  currency: string;
  eventDate?: string;
  status: OfferStatus;
  /** Set once the customer accepts — links to the created booking request. */
  bookingRequestId?: string;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  sender: MessageSender;
  createdAtMs: number;
  kind: MessageKind;
  /** Body for `text` messages (and the note under an `offer`, if any). */
  text?: string;
  /** Present only for `offer` messages. */
  offer?: CustomOffer;
  readByCustomer: boolean;
  readByDj: boolean;
};

export type Conversation = {
  id: string;
  createdAtMs: number;
  updatedAtMs: number;
  customerId?: string; // undefined for anonymous (guest) senders
  customerName?: string;
  customerEmail?: string; // captured for guest senders
  djId: string;
  djUsername: string;
  djStageName: string;
  djAvatarUrl?: string;
  djCity?: string;
  djCurrency: string;
};

const CONV_PREFIX = "djconnect.message.conversation.";
const CONV_INDEX_KEY = "djconnect.message.conversationIndex";
const MESSAGES_PREFIX = "djconnect.message.messages.";

function convKey(id: string): string {
  return `${CONV_PREFIX}${id}`;
}

function messagesKey(conversationId: string): string {
  return `${MESSAGES_PREFIX}${conversationId}`;
}

function emitUpdate(conversationId: string): void {
  window.dispatchEvent(
    new CustomEvent("message:update", { detail: { conversationId } }),
  );
}

function slug(value: string): string {
  return value.replace(/[^a-z0-9]/gi, "").slice(0, 24) || "x";
}

/** Deterministic id so re-opening the same DJ reuses one thread per customer. */
export function conversationIdFor(
  customerId: string | undefined,
  djId: string,
): string {
  return `conv-${customerId ? slug(customerId) : "guest"}-${slug(djId)}`;
}

export function newMessageId(): string {
  const t = Date.now().toString(36);
  const r = Math.floor(Math.random() * 36 ** 4)
    .toString(36)
    .padStart(4, "0");
  return `msg-${t}-${r}`;
}

// ---- conversations ---------------------------------------------------------

function listConversationIds(): string[] {
  try {
    const raw = window.localStorage.getItem(CONV_INDEX_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function addConversationToIndex(id: string): void {
  const ids = listConversationIds();
  if (!ids.includes(id)) {
    ids.push(id);
    window.localStorage.setItem(CONV_INDEX_KEY, JSON.stringify(ids));
  }
}

export function readConversation(id: string): Conversation | null {
  try {
    const raw = window.localStorage.getItem(convKey(id));
    if (!raw) return null;
    return JSON.parse(raw) as Conversation;
  } catch {
    return null;
  }
}

function writeConversation(conv: Conversation): void {
  try {
    window.localStorage.setItem(convKey(conv.id), JSON.stringify(conv));
    addConversationToIndex(conv.id);
  } catch {
    // ignore quota / privacy failures
  }
}

/** Merge a partial patch into a stored conversation and persist it. */
export function updateConversation(
  id: string,
  patch: Partial<Conversation>,
): Conversation | null {
  const existing = readConversation(id);
  if (!existing) return null;
  const next: Conversation = { ...existing, ...patch };
  writeConversation(next);
  emitUpdate(id);
  return next;
}

export function listConversations(): Conversation[] {
  return listConversationIds()
    .map((id) => readConversation(id))
    .filter((c): c is Conversation => c !== null)
    .sort((a, b) => b.updatedAtMs - a.updatedAtMs);
}

export function listConversationsForCustomer(
  customerId: string | null,
): Conversation[] {
  const all = listConversations();
  if (customerId === null) return all.filter((c) => !c.customerId);
  return all.filter((c) => !c.customerId || c.customerId === customerId);
}

/**
 * Conversations addressed to a specific DJ. Falls back to all conversations
 * when nothing matches the given `djId` so the mock DJ can still reply in a
 * single-browser demo.
 */
export function listConversationsForDj(djId: string | null): Conversation[] {
  const all = listConversations();
  if (!djId) return all;
  const mine = all.filter((c) => c.djId === djId);
  return mine.length > 0 ? mine : all;
}

/** Find the existing thread for a (customer, DJ) pair or create a new one. */
export function findOrCreateConversation(args: {
  customerId?: string;
  customerName?: string;
  djId: string;
  djUsername: string;
  djStageName: string;
  djAvatarUrl?: string;
  djCity?: string;
  djCurrency: string;
}): Conversation {
  const id = conversationIdFor(args.customerId, args.djId);
  const existing = readConversation(id);
  if (existing) return existing;
  const now = Date.now();
  const conv: Conversation = {
    id,
    createdAtMs: now,
    updatedAtMs: now,
    customerId: args.customerId,
    customerName: args.customerName,
    djId: args.djId,
    djUsername: args.djUsername,
    djStageName: args.djStageName,
    djAvatarUrl: args.djAvatarUrl,
    djCity: args.djCity,
    djCurrency: args.djCurrency,
  };
  writeConversation(conv);
  emitUpdate(id);
  return conv;
}

// ---- messages --------------------------------------------------------------

export function listMessages(conversationId: string): ChatMessage[] {
  try {
    const raw = window.localStorage.getItem(messagesKey(conversationId));
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

function writeMessages(conversationId: string, messages: ChatMessage[]): void {
  try {
    window.localStorage.setItem(
      messagesKey(conversationId),
      JSON.stringify(messages),
    );
  } catch {
    // ignore quota / privacy failures
  }
}

function touchConversation(conversationId: string): void {
  const conv = readConversation(conversationId);
  if (conv) writeConversation({ ...conv, updatedAtMs: Date.now() });
}

export function appendMessage(
  msg: Omit<ChatMessage, "id" | "createdAtMs" | "readByCustomer" | "readByDj">,
): ChatMessage {
  const full: ChatMessage = {
    ...msg,
    id: newMessageId(),
    createdAtMs: Date.now(),
    // Author has implicitly read their own message.
    readByCustomer: msg.sender === "customer",
    readByDj: msg.sender === "dj",
  };
  const messages = listMessages(msg.conversationId);
  messages.push(full);
  writeMessages(msg.conversationId, messages);
  touchConversation(msg.conversationId);
  emitUpdate(msg.conversationId);
  return full;
}

export function sendText(
  conversationId: string,
  sender: MessageSender,
  text: string,
): ChatMessage {
  return appendMessage({ conversationId, sender, kind: "text", text });
}

export function sendOffer(
  conversationId: string,
  offer: Omit<CustomOffer, "status">,
  note?: string,
): ChatMessage {
  return appendMessage({
    conversationId,
    sender: "dj",
    kind: "offer",
    text: note,
    offer: { ...offer, status: "pending" },
  });
}

/** Merge a partial patch into a stored message and persist it. */
export function updateMessage(
  conversationId: string,
  messageId: string,
  patch: Partial<ChatMessage>,
): void {
  const messages = listMessages(conversationId);
  const idx = messages.findIndex((m) => m.id === messageId);
  if (idx === -1) return;
  messages[idx] = { ...messages[idx], ...patch };
  writeMessages(conversationId, messages);
  touchConversation(conversationId);
  emitUpdate(conversationId);
}

/** Update the offer embedded in a message. */
export function updateOffer(
  conversationId: string,
  messageId: string,
  patch: Partial<CustomOffer>,
): void {
  const messages = listMessages(conversationId);
  const idx = messages.findIndex((m) => m.id === messageId);
  if (idx === -1 || !messages[idx].offer) return;
  messages[idx] = {
    ...messages[idx],
    offer: { ...messages[idx].offer, ...patch } as CustomOffer,
  };
  writeMessages(conversationId, messages);
  touchConversation(conversationId);
  emitUpdate(conversationId);
}

/** Mark every message in a conversation as read by the given viewer. */
export function markConversationRead(
  conversationId: string,
  viewer: MessageSender,
): void {
  const messages = listMessages(conversationId);
  let changed = false;
  const next = messages.map((m) => {
    if (viewer === "customer" && !m.readByCustomer) {
      changed = true;
      return { ...m, readByCustomer: true };
    }
    if (viewer === "dj" && !m.readByDj) {
      changed = true;
      return { ...m, readByDj: true };
    }
    return m;
  });
  if (changed) {
    writeMessages(conversationId, next);
    emitUpdate(conversationId);
  }
}

export function unreadCountFor(
  conversationId: string,
  viewer: MessageSender,
): number {
  return listMessages(conversationId).filter((m) =>
    viewer === "customer" ? !m.readByCustomer : !m.readByDj,
  ).length;
}

export function lastMessageOf(conversationId: string): ChatMessage | null {
  const messages = listMessages(conversationId);
  return messages.length ? messages[messages.length - 1] : null;
}
