import { z } from "zod";
export declare const InventoryStatusKeySchema: z.ZodEnum<["ready", "listed", "held", "needs_you", "identifying", "not_identified", "mine", "set_aside", "sold", "archived"]>;
export type InventoryStatusKey = z.infer<typeof InventoryStatusKeySchema>;
/**
 * A value of the Filters > Status control. Every status key, `archived` included: "Archived" is a
 * filter option, OFF by default (archived copies are hidden until asked for; when the only matches
 * are archived the empty state says "{n} archived cards are hidden" with "Show archived").
 * The same vocabulary as the row's status, so a filter and a pill never disagree.
 */
export declare const InventoryStatusFilterSchema: z.ZodEnum<["ready", "listed", "held", "needs_you", "identifying", "not_identified", "mine", "set_aside", "sold", "archived"]>;
export type InventoryStatusFilter = z.infer<typeof InventoryStatusFilterSchema>;
/**
 * "Select all {total} matching" is capped: above this many, a screen offers "Select the first 200".
 * A bulk action (List, Mine, Put back, Stop holding) takes at most this many ids per request anyway
 * (`ids` is 1..500 on the change routes; the list's select-all cap is the stricter 200). A
 * constant, not a schema: for the server (to refuse an over-cap select-all) and the clients.
 */
export declare const INVENTORY_SELECT_ALL_CAP = 200;
