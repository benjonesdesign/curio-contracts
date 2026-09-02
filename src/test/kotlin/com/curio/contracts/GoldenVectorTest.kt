package com.curio.contracts
// MUTATION-CHECKED 2026-09-02: red (2 of 7) against `Unknown(tag ?: "", JsonObject(emptyMap()))`
// in place of `Unknown(tag ?: "", obj)` in the generated union deserializer; green against current.

import kotlinx.serialization.json.*
import java.io.File
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlin.test.assertTrue
import kotlin.test.fail

/**
 * The Kotlin runner for decisions/0026's golden vectors.
 *
 * Reads `vectors/enum-forward-compat.json` — the SAME file TypeScript and Swift read. Three copies
 * of a fixture drift; one file cannot. That is the entire mechanism 0026 specified and nobody built.
 *
 * TypeScript asserts these payloads are REJECTED (a server must never emit an unknown enum value);
 * Kotlin and Swift assert they DECODE (a client must never fall over on receiving one). Same
 * fixture, opposite assertions, because the platforms have opposite jobs.
 */
class GoldenVectorTest {
    // `encodeDefaults = true` on the RE-ENCODE side, deliberately.
    //
    // Each language omits something different when encoding, and none of it is data loss:
    //   Swift    drops a nil Optional             -> "rarity": null disappears
    //   kotlinx  drops a value equal to its default -> "candidates": [] disappears
    //   Zod/TS   keeps everything
    //
    // Three conventions, one fixture — which the vectors surfaced on their first run, and which is
    // a fair advertisement for having them. The round-trip assertion is about whether the DATA
    // survived, so each runner normalises away its own convention rather than asserting it.
    private val json = Json { ignoreUnknownKeys = true; explicitNulls = false }
    private val encoder = Json { ignoreUnknownKeys = true; explicitNulls = false; encodeDefaults = true }

    private fun vectors(): List<JsonObject> {
        // Walk up to the repo root. The fixture stays a plain file at a path all three languages
        // can read — the moment it is copied into a per-language resource bundle it can drift
        // from the other two copies, which is the failure this file exists to prevent.
        var dir = File(System.getProperty("user.dir"))
        while (!File(dir, "vectors/enum-forward-compat.json").exists() && dir.parentFile != null) {
            dir = dir.parentFile
        }
        val f = File(dir, "vectors/enum-forward-compat.json")
        assertTrue(f.exists(), "fixture not found from ${System.getProperty("user.dir")}")
        val root = json.parseToJsonElement(f.readText()).jsonObject
        return root["vectors"]!!.jsonArray.map { it.jsonObject }
    }

    /** Explicit nulls removed, recursively — kotlinx omits nulls when encoding, so comparing raw
     *  JSON would assert an encoder convention rather than the property we care about. */
    private fun stripNulls(e: JsonElement): JsonElement = when (e) {
        is JsonObject -> buildJsonObject {
            e.forEach { (k, v) -> if (v !is JsonNull) put(k, stripNulls(v)) }
        }
        is JsonArray -> buildJsonArray { e.forEach { add(stripNulls(it)) } }
        else -> e
    }

    @Test
    fun `finds vectors to run`() {
        // A runner that silently found zero vectors would report green while running nothing —
        // the exact shape this suite exists to stop.
        assertTrue(vectors().isNotEmpty(), "no vectors loaded — check the fixture path")
    }

    @Test
    fun `every vector decodes and round-trips unchanged`() {
        // Accept-class vectors are excluded: they carry an unknown FIELD on a KNOWN arm, which
        // decodes and is then dropped on re-encode because a typed data class has nowhere to keep
        // it. See the fixture's own $comment — that is a real limit of forward compatibility, not
        // a bug to normalise away, and it is asserted by arm below instead.
        for (v in vectors().filter { it["serverAccepts"]?.jsonPrimitive?.booleanOrNull != true }) {
            val name = v["name"]!!.jsonPrimitive.content
            val type = v["type"]!!.jsonPrimitive.content
            val payload = v["payload"]!!.jsonObject

            when (type) {
                // Decoded through the CONTAINING response type, never the enum alone: the failure
                // being guarded is a decode error PROPAGATING from a field to the whole object.
                "CatalogueLookupResponse" -> {
                    val decoded = json.decodeFromJsonElement(CatalogueLookupResponse.serializer(), payload)
                    val reencoded = encoder.encodeToJsonElement(CatalogueLookupResponse.serializer(), decoded)
                    assertEquals(
                        stripNulls(payload), stripNulls(reencoded),
                        "vector $name did not round-trip unchanged",
                    )
                }
                "EbayPublishErrorResponse" -> {
                    val decoded = json.decodeFromJsonElement(EbayPublishErrorResponse.serializer(), payload)
                    val reencoded = encoder.encodeToJsonElement(EbayPublishErrorResponse.serializer(), decoded)
                    assertEquals(
                        stripNulls(payload), stripNulls(reencoded),
                        "vector $name did not round-trip unchanged",
                    )
                }
                else -> fail("vector $name names type $type, which this runner does not handle — add it rather than letting it skip")
            }
        }
    }

    @Test
    fun `the unknown value is reachable as rawValue`() {
        // The property iOS found unexercised on their side: reading the raw wire value off the
        // fallback case. A label helper written as `gameLabel(game.rawValue) ?? "Pokémon"` is only
        // safe if rawValue really carries it — otherwise a ninth game is labelled "Pokémon" and
        // there is no decode error to warn anyone.
        val v = vectors().first { it["name"]!!.jsonPrimitive.content == "ninth_game_in_catalogue_lookup" }
        val decoded = json.decodeFromJsonElement(
            CatalogueLookupResponse.serializer(), v["payload"]!!.jsonObject)

        val game = decoded.match?.game
        assertIs<Game.Unknown>(game, "a ninth game must decode to Unknown, not throw")
        assertEquals("kryptonite-tcg", game.rawValue, "rawValue must carry the wire value")
    }

    // ── Discriminated unions ────────────────────────────────────────────────────────────────

    private fun payloadOf(name: String): JsonObject =
        vectors().first { it["name"]!!.jsonPrimitive.content == name }["payload"]!!.jsonObject

    @Test
    fun `an unknown union arm decodes and keeps its payload`() {
        // eBay's error codes are an OPEN set arriving from upstream, so an arm this build has
        // never seen is next month rather than a hypothetical — and a hard failure here would
        // break listing at the moment a seller is trying to sell.
        val decoded = json.decodeFromJsonElement(
            EbayPublishErrorResponse.serializer(), payloadOf("unknown_ebay_error_code"))
        val err = decoded.error
        assertIs<EbayPublishError.Unknown>(err, "an unknown code must decode to Unknown, not throw")
        assertEquals("ebay_rate_limited_v3", err.code, "the wire discriminator must survive")
        // The whole payload is kept, not just the tag — otherwise "unknown error" is all a log or
        // a support ticket ever gets, and the retryAfterSec the server sent is thrown away.
        assertEquals(42, err.payload["retryAfterSec"]!!.jsonPrimitive.int,
            "the unknown arm must keep its data, not just its name")
    }

    @Test
    fun `a known arm survives an additive field`() {
        // A newer server adding a field to a KNOWN arm must not break an older client. The
        // ordinary case, and the one that fails silently — nobody writes a fixture for a change
        // they consider harmless.
        val decoded = json.decodeFromJsonElement(
            EbayPublishErrorResponse.serializer(), payloadOf("known_ebay_error_with_extra_field"))
        val err = decoded.error
        assertIs<EbayPublishErrorTitleTooLong>(err, "a known arm with an extra field must still decode as that arm")
        assertEquals(84, err.titleLength)
        assertEquals(80, err.maxLength)
    }

    @Test
    fun `a missing discriminator degrades rather than throwing`() {
        // PARITY, not forward-compatibility. Swift's generated decoder used `decode` and this one
        // degraded, so the two platforms disagreed about the same malformed body — Swift losing
        // the whole response, Kotlin surfacing an unknown error. Both degrade now.
        val decoded = json.decodeFromJsonElement(
            EbayPublishErrorResponse.serializer(), payloadOf("ebay_error_missing_discriminator"))
        val err = decoded.error
        assertIs<EbayPublishError.Unknown>(err, "a body with no discriminator must degrade, not throw")
        assertEquals("", err.code, "an absent discriminator reads as absent, never as a real code")
    }

    @Test
    fun `both vector classes are populated`() {
        // An empty class asserts nothing.
        val all = vectors()
        assertTrue(all.any { it["serverAccepts"]?.jsonPrimitive?.booleanOrNull == true })
        assertTrue(all.any { it["serverAccepts"]?.jsonPrimitive?.booleanOrNull != true })
    }
}
