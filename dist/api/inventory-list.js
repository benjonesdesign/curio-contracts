// The vocabulary of the INVENTORY LIST (GET /api/inventory, the WE1 / E1 table): the status a row
// shows and the status a filter offers (v0.2.0, ADDITIVE).
//
// Only the vocabulary is here. The row, group and summary shapes are the follow-up list contract
// (pokemon-tool #258 plan, #261 core); they will reuse these keys. Words are never in the contract:
// they come from @curio/copy (HELD "Held", UNMATCHED "Not identified", in-flight "Identifying").
//
// ── WHAT A ROW SAYS, AND WHICH LIFECYCLE STATUS IT COMES FROM ───────────────────────────────
//   key              seller sees          from
//   ready            Ready to list        READY_TO_LIST (priced, condition confirmed, SKU, game live)
//   listed           Listed               LISTED, EBAY_DRAFT ("Draft on eBay")
//   held             Held                 HELD
//   needs_you        Needs you            NEEDS_ID_REVIEW, NEEDS_CONDITION, NEEDS_DECISION, EXCEPTION is not
//                                         here (set_aside), RETURNED ("Returned"), a ready copy that is
//                                         missing something
//   identifying      Identifying          RECEIVED, AWAITING_SCAN, PROCESSING: an in-flight scan. NOT
//                                         Needs you: the seller cannot act until identification
//                                         finishes (Ben, 2026-10-09). Identifying rows sit with their
//                                         batch and move to Needs you only if identification fails.
//   not_identified   Not identified       UNMATCHED. NOT pinned under Needs you (the seller chose to
//                                         keep it without a match)
//   mine             Mine                 allocation_channel keep (not a lifecycle status)
//   set_aside        Set aside            EXCEPTION
//   sold             Sold                 SOLD, PICKED, DISPATCHED, COMPLETED
//   archived         Archived             ARCHIVED
//
// Open and forward-compatible (ADR 0027): a client reads an unrecognised key as "not listable, not
// sold" and shows a neutral pill.
import { z } from "zod";
export const InventoryStatusKeySchema = z.enum([
    "ready",
    "listed",
    "held",
    "needs_you",
    "identifying",
    "not_identified",
    "mine",
    "set_aside",
    "sold",
    "archived",
]);
/**
 * A value of the Filters > Status control. Every status key, `archived` included: "Archived" is a
 * filter option, OFF by default (archived copies are hidden until asked for; when the only matches
 * are archived the empty state says "{n} archived cards are hidden" with "Show archived").
 * The same vocabulary as the row's status, so a filter and a pill never disagree.
 */
export const InventoryStatusFilterSchema = InventoryStatusKeySchema;
/**
 * "Select all {total} matching" is capped: above this many, a screen offers "Select the first 200".
 * A bulk action (List, Mine, Put back, Stop holding) takes at most this many ids per request anyway
 * (`ids` is 1..500 on the change routes; the list's select-all cap is the stricter 200). A
 * constant, not a schema: for the server (to refuse an over-cap select-all) and the clients.
 */
export const INVENTORY_SELECT_ALL_CAP = 200;
