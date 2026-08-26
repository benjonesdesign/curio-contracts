import { z } from "zod";
export declare const CatalogueLookupRequestSchema: z.ZodObject<{
    /** Optional — a narrowing HINT when the caller happens to know it (e.g. deep in a
     * game-specific flow), never a precondition to looking a card up. Omit it and the resolver
     * searches every game; a supplied game only breaks a genuine cross-game tie, it can never
     * exclude the right answer in a different game. */
    game: z.ZodOptional<z.ZodEnum<["pokemon", "pokemon-jp", "mtg", "yugioh", "lorcana", "one-piece", "digimon", "dbs-fusion"]>>;
    /** Optional as of W15 — a card whose collector number OCR'd cleanly but whose name did not
     * (stylised type, holo glare, foreign printing) can still resolve via Tier 0's number+setCode
     * path with no name at all. A caller with only a name keeps working exactly as before. */
    name: z.ZodOptional<z.ZodString>;
    /** As printed, e.g. "4/102" — optional because a name-only lookup is still meaningful (lower
     * confidence tier), just never the highest-confidence exact tier. */
    collectorNumber: z.ZodOptional<z.ZodString>;
    /** OCR'd set code printed on the card (e.g. "OTJ", "OBF") — W15 Tier 0's strongest set signal.
     * Tried ahead of the name-first resolver when `collectorNumber` is present. */
    setCode: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | undefined;
    name?: string | undefined;
    collectorNumber?: string | undefined;
    setCode?: string | undefined;
}, {
    game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | undefined;
    name?: string | undefined;
    collectorNumber?: string | undefined;
    setCode?: string | undefined;
}>;
export type CatalogueLookupRequest = z.infer<typeof CatalogueLookupRequestSchema>;
export declare const CatalogueLookupMatchSchema: z.ZodObject<{
    /** Which game this match actually belongs to — the route always populates it once matched
     * (a game-optional lookup can resolve to any of them, and the follow-up `/api/quick-scan` call
     * should use THIS value, not whatever the client originally guessed). Optional/nullable —
     * additive, same shape as `image`, so older callers and matches built before this field existed
     * keep validating. */
    game: z.ZodOptional<z.ZodNullable<z.ZodEnum<["pokemon", "pokemon-jp", "mtg", "yugioh", "lorcana", "one-piece", "digimon", "dbs-fusion"]>>>;
    nativeId: z.ZodString;
    name: z.ZodString;
    setName: z.ZodNullable<z.ZodString>;
    cardNumber: z.ZodNullable<z.ZodString>;
    rarity: z.ZodNullable<z.ZodString>;
    language: z.ZodString;
    /** Reference image URL for the matched catalogue card (small/display size), sourced from the
     * catalogue provider (e.g. pokemontcg.io) that produced this match — see card-search.ts's
     * `image` field for the existing precedent. Display-only: callers must hotlink this URL, never
     * download/cache/re-host/store the artwork in our own storage (curio-shared/decisions/ ADR on
     * catalogue image display). Optional/nullable — additive, so older callers and matches without
     * a known image keep working. Confirm layout A (curio-shared canon/design/design-reference/
     * confirm-step.html) needs this to render the captured⇄matched side-by-side pair on both web
     * and iOS. */
    image: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    language: string;
    rarity: string | null;
    setName: string | null;
    cardNumber: string | null;
    nativeId: string;
    game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
    image?: string | null | undefined;
}, {
    name: string;
    language: string;
    rarity: string | null;
    setName: string | null;
    cardNumber: string | null;
    nativeId: string;
    game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
    image?: string | null | undefined;
}>;
export type CatalogueLookupMatch = z.infer<typeof CatalogueLookupMatchSchema>;
export declare const CatalogueLookupResponseSchema: z.ZodObject<{
    match: z.ZodNullable<z.ZodObject<{
        /** Which game this match actually belongs to — the route always populates it once matched
         * (a game-optional lookup can resolve to any of them, and the follow-up `/api/quick-scan` call
         * should use THIS value, not whatever the client originally guessed). Optional/nullable —
         * additive, same shape as `image`, so older callers and matches built before this field existed
         * keep validating. */
        game: z.ZodOptional<z.ZodNullable<z.ZodEnum<["pokemon", "pokemon-jp", "mtg", "yugioh", "lorcana", "one-piece", "digimon", "dbs-fusion"]>>>;
        nativeId: z.ZodString;
        name: z.ZodString;
        setName: z.ZodNullable<z.ZodString>;
        cardNumber: z.ZodNullable<z.ZodString>;
        rarity: z.ZodNullable<z.ZodString>;
        language: z.ZodString;
        /** Reference image URL for the matched catalogue card (small/display size), sourced from the
         * catalogue provider (e.g. pokemontcg.io) that produced this match — see card-search.ts's
         * `image` field for the existing precedent. Display-only: callers must hotlink this URL, never
         * download/cache/re-host/store the artwork in our own storage (curio-shared/decisions/ ADR on
         * catalogue image display). Optional/nullable — additive, so older callers and matches without
         * a known image keep working. Confirm layout A (curio-shared canon/design/design-reference/
         * confirm-step.html) needs this to render the captured⇄matched side-by-side pair on both web
         * and iOS. */
        image: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        language: string;
        rarity: string | null;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string;
        game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
        image?: string | null | undefined;
    }, {
        name: string;
        language: string;
        rarity: string | null;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string;
        game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
        image?: string | null | undefined;
    }>>;
    /** Null when there's no match at all. Mirrors the resolver's own tier confidence (high = number
     * + name both agree; medium = number+set or name-alone; low = fuzzy). A caller deciding whether
     * to skip the vision call should treat anything below "high" as NOT unambiguous. */
    confidence: z.ZodNullable<z.ZodEnum<["high", "medium", "low"]>>;
    /** Populated only on a genuine cross-candidate tie (`match` is null when this is non-empty) —
     * a bounded picker, never a model call to break the tie. Each candidate's `game` is the visible
     * differentiator the seller taps between (e.g. "Windsinger (MTG)" vs "…(Lorcana)"). Defaults to
     * empty so a caller can treat "no candidates" and "field omitted" identically without a null
     * check, and so a response built before this field existed still validates. */
    candidates: z.ZodDefault<z.ZodArray<z.ZodObject<{
        /** Which game this match actually belongs to — the route always populates it once matched
         * (a game-optional lookup can resolve to any of them, and the follow-up `/api/quick-scan` call
         * should use THIS value, not whatever the client originally guessed). Optional/nullable —
         * additive, same shape as `image`, so older callers and matches built before this field existed
         * keep validating. */
        game: z.ZodOptional<z.ZodNullable<z.ZodEnum<["pokemon", "pokemon-jp", "mtg", "yugioh", "lorcana", "one-piece", "digimon", "dbs-fusion"]>>>;
        nativeId: z.ZodString;
        name: z.ZodString;
        setName: z.ZodNullable<z.ZodString>;
        cardNumber: z.ZodNullable<z.ZodString>;
        rarity: z.ZodNullable<z.ZodString>;
        language: z.ZodString;
        /** Reference image URL for the matched catalogue card (small/display size), sourced from the
         * catalogue provider (e.g. pokemontcg.io) that produced this match — see card-search.ts's
         * `image` field for the existing precedent. Display-only: callers must hotlink this URL, never
         * download/cache/re-host/store the artwork in our own storage (curio-shared/decisions/ ADR on
         * catalogue image display). Optional/nullable — additive, so older callers and matches without
         * a known image keep working. Confirm layout A (curio-shared canon/design/design-reference/
         * confirm-step.html) needs this to render the captured⇄matched side-by-side pair on both web
         * and iOS. */
        image: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        language: string;
        rarity: string | null;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string;
        game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
        image?: string | null | undefined;
    }, {
        name: string;
        language: string;
        rarity: string | null;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string;
        game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
        image?: string | null | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    confidence: "high" | "medium" | "low" | null;
    candidates: {
        name: string;
        language: string;
        rarity: string | null;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string;
        game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
        image?: string | null | undefined;
    }[];
    match: {
        name: string;
        language: string;
        rarity: string | null;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string;
        game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
        image?: string | null | undefined;
    } | null;
}, {
    confidence: "high" | "medium" | "low" | null;
    match: {
        name: string;
        language: string;
        rarity: string | null;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string;
        game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
        image?: string | null | undefined;
    } | null;
    candidates?: {
        name: string;
        language: string;
        rarity: string | null;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string;
        game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
        image?: string | null | undefined;
    }[] | undefined;
}>;
export type CatalogueLookupResponse = z.infer<typeof CatalogueLookupResponseSchema>;
