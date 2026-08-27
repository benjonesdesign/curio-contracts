package com.curio.contracts

import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlin.test.assertTrue

// decisions/0027 item 5 — the unknown-enum-value fixtures.
//
// EVERY TEST HERE DECODES THROUGH THE CONTAINING RESPONSE TYPE, never the enum on its own. That
// is not a stylistic choice, it is the whole point: the failure mode being guarded is a decode
// error PROPAGATING from the enum to the enclosing object and taking the entire response with it.
// A fixture that called `Game.from("kryptonite")` directly would exercise the serializer, pass,
// and prove nothing about the path that actually breaks. Compare decisions/0026: a conformance
// suite that cannot reproduce the failure it was written for is worse than none, because it
// reports green over exactly that bug.
class UnknownEnumValueTest {
    private val json = Json { ignoreUnknownKeys = true }

    @Test
    fun `a ninth game does not fail the enclosing catalogue-lookup response`() {
        // The scenario the ADR was written for: a game this build has never heard of.
        val body = """
            {
              "match": {
                "game": "kryptonite",
                "nativeId": "kr-1",
                "name": "Some Card",
                "setName": "Some Set",
                "cardNumber": "1",
                "rarity": null,
                "language": "en",
                "image": null
              },
              "confidence": "high",
              "candidates": []
            }
        """.trimIndent()

        val decoded = json.decodeFromString<CatalogueLookupResponse>(body)

        // The response survived intact — every OTHER field is still readable, which is what a
        // plain `enum class` would have destroyed.
        assertEquals("Some Card", decoded.match?.name)
        assertEquals("1", decoded.match?.cardNumber)

        // And the unknown value arrived as DATA, carrying its raw value, rather than as a throw.
        val game = decoded.match?.game
        assertIs<Game.Unknown>(game)
        assertEquals("kryptonite", game.rawValue)
    }

    @Test
    fun `an unknown value in ONE candidate does not take out the whole list`() {
        // The shape that bites hardest: a list where most entries are fine. A propagating throw
        // loses the good candidates too, so the picker shows nothing rather than showing fewer.
        val body = """
            {
              "match": null,
              "confidence": "low",
              "candidates": [
                {"game": "mtg", "nativeId": "m1", "name": "A", "setName": "S", "cardNumber": "1",
                 "rarity": null, "language": "en", "image": null},
                {"game": "kryptonite", "nativeId": "k1", "name": "B", "setName": "S", "cardNumber": "2",
                 "rarity": null, "language": "en", "image": null}
              ]
            }
        """.trimIndent()

        val decoded = json.decodeFromString<CatalogueLookupResponse>(body)
        assertEquals(2, decoded.candidates.size)
        assertEquals(Game.POKEMON.rawValue, "pokemon")
        assertIs<Game.Unknown>(decoded.candidates[1].game)
        // The KNOWN candidate is untouched. This is the assertion that would fail today.
        assertEquals("A", decoded.candidates[0].name)
    }

    @Test
    fun `a known value still decodes to its own case, not to Unknown`() {
        // The other direction: forward-compatibility must not make everything Unknown.
        val body = """
            {
              "match": {"game": "mtg", "nativeId": "m1", "name": "A", "setName": "S",
                        "cardNumber": "1", "rarity": null, "language": "en", "image": null},
              "confidence": "high",
              "candidates": []
            }
        """.trimIndent()
        assertEquals(Game.MTG, json.decodeFromString<CatalogueLookupResponse>(body).match?.game)
    }

    @Test
    fun `an unknown value read is re-encoded unchanged, never dropped`() {
        // decisions/0027 item 2a: preserving a value the client read but did not touch is correct;
        // silently dropping it is data loss. Originating one is a different matter and is not
        // something this type makes easy.
        val body = """
            {
              "match": {"game": "kryptonite", "nativeId": "k1", "name": "A", "setName": "S",
                        "cardNumber": "1", "rarity": null, "language": "en", "image": null},
              "confidence": "high",
              "candidates": []
            }
        """.trimIndent()
        val decoded = json.decodeFromString<CatalogueLookupResponse>(body)
        assertTrue(json.encodeToString(decoded).contains("\"kryptonite\""))
    }

    @Test
    fun `nullability is NOT what protects a field — an absent game and an unknown game differ`() {
        // The Android lane's C3. `game: Game?` handles ABSENT and does nothing for UNRECOGNISED.
        // Both are exercised here so the distinction cannot quietly collapse.
        val absent = """
            {"match": {"nativeId": "x", "name": "A", "setName": "S", "cardNumber": "1",
                       "rarity": null, "language": "en", "image": null},
             "confidence": "high", "candidates": []}
        """.trimIndent()
        assertEquals(null, json.decodeFromString<CatalogueLookupResponse>(absent).match?.game)

        val unrecognised = """
            {"match": {"game": "kryptonite", "nativeId": "x", "name": "A", "setName": "S",
                       "cardNumber": "1", "rarity": null, "language": "en", "image": null},
             "confidence": "high", "candidates": []}
        """.trimIndent()
        assertIs<Game.Unknown>(json.decodeFromString<CatalogueLookupResponse>(unrecognised).match?.game)
    }

    @Test
    fun `the same guarantee holds for a non-GameId enum — item 4 is not a flourish`() {
        // 52 enum-typed fields across 14 modules are exposed, not one. RecommendedRoute is picked
        // here because the route engine is under active change, so it is the likeliest next
        // addition after a game.
        val body = """
            {"route": "teleport", "confidence": "high", "explanation": "x",
             "alternatives": [], "assumptions": [],
             "economics": {"expected_sale_gbp": 1.0, "fees_gbp": 0.0, "postage_gbp": 0.0,
                           "cost_basis_gbp": 0.0, "expected_net_gbp": 1.0, "liquidity": "high"},
             "calculation_version": "v", "physicalCardId": "p1"}
        """.trimIndent()
        val decoded = json.decodeFromString<RecommendResponse>(body)
        assertIs<RecommendedRoute.Unknown>(decoded.route)
        assertEquals("x", decoded.explanation)
    }
}
