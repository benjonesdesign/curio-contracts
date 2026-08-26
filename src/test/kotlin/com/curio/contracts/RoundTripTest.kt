package com.curio.contracts

import kotlinx.serialization.json.Json
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull

// zod-to-kotlin.test.ts locks the GENERATOR's string output; this locks the GENERATED code's
// actual runtime behaviour — that kotlinx.serialization really does decode a real API response
// shape into these data classes (right @SerialName mapping, right nullability defaults), the same
// confidence Codable round-tripping gives the Swift side implicitly via the iOS app's own build.
class RoundTripTest {
    private val json = Json { ignoreUnknownKeys = true }

    @Test
    fun `decodes a real identify response, mapping snake_case keys and enums correctly`() {
        val body = """
            {
              "game": "pokemon",
              "game_confidence": "high",
              "game_low_confidence": false,
              "name": "Charizard",
              "set_name": "Base Set",
              "card_number": "4/102",
              "card_type": "Pokémon",
              "estimated_grade": "NM",
              "confidence": "high",
              "attributes": ["Holo"],
              "is_promo": false,
              "language": "English",
              "rarity": "Rare Holo",
              "image_roles": {"front": 0, "back": 1, "details": []},
              "flaws": [],
              "tier": "tier0",
              "ai_call_avoided": true
            }
        """.trimIndent()

        val decoded = json.decodeFromString<IdentifyResponse>(body)
        assertEquals("Charizard", decoded.name)
        assertEquals("4/102", decoded.cardNumber)
        assertEquals(GameConfidence.HIGH, decoded.gameConfidence)
        assertEquals(Tier.TIER0, decoded.tier)
        assertEquals(true, decoded.aiCallAvoided)
        assertNull(decoded.cached)
    }

    @Test
    fun `decodes the fail-closed ambiguous shape with an empty candidate list`() {
        val body = """{"tier": "ambiguous", "candidates": []}"""
        val decoded = json.decodeFromString<IdentifyAmbiguousResponse>(body)
        assertEquals(IdentifyAmbiguousTier.AMBIGUOUS, decoded.tier)
        assertEquals(0, decoded.candidates.size)
    }

    @Test
    fun `round-trips a decoded DB row back to equivalent JSON`() {
        val row = CatalogueCardsRow(
            attributes = listOf("Holo"),
            cardNumber = "4/102",
            createdAt = "2026-01-01T00:00:00Z",
            finishes = listOf("holofoil"),
            game = "pokemon",
            id = "row-1",
            imageRef = null,
            isPromo = false,
            language = "English",
            listingDescTemplate = null,
            listingTitleTemplate = null,
            name = "Charizard",
            nameConfidence = null,
            nativeCatalogueId = "base1-4",
            normalizedName = "charizard",
            normalizedNumber = "4",
            rarity = "Rare Holo",
            scryfallId = null,
            setConfidence = null,
            setName = "Base Set",
            source = "pokemontcg.io",
            tcgId = null,
            tcgplayerId = null,
            updatedAt = "2026-01-01T00:00:00Z",
            verifiedAt = null,
        )
        val encoded = json.encodeToString(CatalogueCardsRow.serializer(), row)
        val decoded = json.decodeFromString<CatalogueCardsRow>(encoded)
        assertEquals(row, decoded)
    }
}
