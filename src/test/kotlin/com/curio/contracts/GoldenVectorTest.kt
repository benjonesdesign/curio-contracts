package com.curio.contracts

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
        for (v in vectors()) {
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
}
