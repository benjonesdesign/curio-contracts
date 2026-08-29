package com.curio.contracts

import kotlinx.serialization.json.Json
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue

// /api/decide and /api/quick-scan share ONE Decision. These lock the two decisions that shape it.
class DecideRoundTripTest {
    private val json = Json { ignoreUnknownKeys = true }

    private val decision = """
        {
          "route": "list_single",
          "reason": "sound_single_listing",
          "alternatives": [{"route": "bundle", "reason": "bundle_shares_postage"}],
          "confidence": "high",
          "liquidity": "high",
          "economics": {
            "marketValueGbp": 40.0, "feeGbp": 6.79, "postageGbp": 1.55, "packagingGbp": 0.1,
            "costBasisGbp": null, "taxProvisionGbp": 6.31, "expectedNetGbp": 25.25
          },
          "maxBuyGbp": 25.23, "minAcceptGbp": 1.65, "offerPctAtMax": 63.1,
          "degraded": false, "degradedReasons": []
        }
    """.trimIndent()

    @Test
    fun `an unresolved identity yields a NULL decision, not an empty one`() {
        // The composition decision. An ambiguous card has no decision to make, because there is no
        // card to price yet. An empty Decision with zeroed money would render as "£0 max buy"
        // rather than "we don't know what this is" — and required fields nobody populates is
        // decisions/0027's trap, which we would otherwise have rebuilt a week after fixing it.
        val body = """
            {"identified": false,
             "candidates": [{"game": "mtg", "nativeId": "m1", "name": "A", "setName": "S", "cardNumber": "1"}],
             "decision": null, "conditionAssessed": false}
        """.trimIndent()
        val decoded = json.decodeFromString<QuickScanResponse>(body)
        assertNull(decoded.decision)
        assertEquals(1, decoded.candidates.size)
    }

    @Test
    fun `a resolved identity carries a full decision alongside the match`() {
        val body = """
            {"identified": true, "candidates": [],
             "match": {"game": "pokemon", "nativeId": "base1-4", "name": "Charizard",
                       "setName": "Base", "cardNumber": "4"},
             "decision": $decision, "conditionAssessed": true}
        """.trimIndent()
        val d = json.decodeFromString<QuickScanResponse>(body)
        assertEquals("Charizard", d.match?.name)
        assertEquals(RecommendedRoute.LIST_SINGLE, d.decision?.route)
        assertEquals(25.23, d.decision?.maxBuyGbp)
        assertEquals(1.65, d.decision?.minAcceptGbp)
    }

    @Test
    fun `Decision carries no identity fields — it is about economics, not about knowing the card`() {
        // Guards the split from the other side: if identity were folded in, /api/decide would
        // return these permanently empty.
        val fields = Decision::class.java.declaredFields.map { it.name }
        for (forbidden in listOf("identified", "candidates", "match", "name", "setName")) {
            assertTrue(forbidden !in fields, "Decision must not carry $forbidden")
        }
    }

    @Test
    fun `the same Decision type decodes from BOTH endpoints`() {
        // One shape, two entry points. If the generator ever emitted two structurally-identical
        // classes, this would not compile.
        val fromDecide: Decision = json.decodeFromString<DecideResponse>("""{"decision": $decision}""").decision
        val fromQuickScan: Decision? = json.decodeFromString<QuickScanResponse>(
            """{"identified": true, "candidates": [], "decision": $decision}""",
        ).decision
        assertEquals(fromDecide, fromQuickScan)
    }

    @Test
    fun `defaulted arrays decode when ABSENT — the server need not send empty lists`() {
        val d = json.decodeFromString<QuickScanResponse>("""{"identified": false, "decision": null}""")
        assertEquals(emptyList(), d.candidates)
        assertEquals(false, d.conditionAssessed)
    }

    // ── Provenance composes BESIDE the decision, never inside it ────────────────────────────
    @Test
    fun `Decision carries no provenance — it is a fact about the INPUT, not an engine output`() {
        // Same reasoning that kept identity out. Where a price came from is true whether or not a
        // decision was reachable, and folding it in would give /api/decide a field the engine does
        // not produce -- which is how required-but-unpopulated fields get born.
        val fields = Decision::class.java.declaredFields.map { it.name }
        for (forbidden in listOf("price", "priceSource", "priceConfidence", "currencyNote", "gradeEV", "explanation")) {
            assertTrue(forbidden !in fields, "Decision must not carry $forbidden")
        }
    }

    @Test
    fun `provenance survives even when there is NO decision`() {
        // The case the migration would have silently broken: an unpriceable card still has a
        // provenance answer, and the pill is what marks a figure as true-for-a-UK-seller.
        val body = """
            {"identified": true, "candidates": [], "decision": null,
             "decisionUnavailable": "no_market_value",
             "price": {"source": "ebay-uk-sold", "confidence": "low", "currencyNote": null}}
        """.trimIndent()
        val d = json.decodeFromString<QuickScanResponse>(body)
        assertNull(d.decision)
        assertEquals("ebay-uk-sold", d.price?.source)
    }

    @Test
    fun `a decide response carries decision and provenance together`() {
        val body = """
            {"decision": $decision,
             "price": {"source": "poketrace-ebay", "confidence": "medium", "currencyNote": "Converted from USD"}}
        """.trimIndent()
        val d = json.decodeFromString<DecideResponse>(body)
        assertEquals(RecommendedRoute.LIST_SINGLE, d.decision.route)
        assertEquals("Converted from USD", d.price.currencyNote)
        assertNull(d.gradeEV)
    }

    @Test
    fun `setCode reaches the request — the OCR'd set signal a collapsed call would have dropped`() {
        val d = json.decodeFromString<QuickScanRequest>("""{"cardNumber": "138/221", "setCode": "SFD"}""")
        assertEquals("SFD", d.setCode)
    }
}
