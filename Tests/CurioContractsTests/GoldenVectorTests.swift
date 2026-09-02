import XCTest
/// MUTATION-CHECKED 2026-09-02: red (2 of 12) against `.decode(String.self, forKey: .code)` in
/// place of `.decodeIfPresent(...) ?? ""` in the generated union decoder; green against current.
@testable import CurioContracts

/// The Swift runner for decisions/0026's golden vectors.
///
/// Reads `vectors/enum-forward-compat.json` — the SAME file TypeScript and Kotlin read. Three
/// copies of a fixture drift; one file cannot.
///
/// ## Why this exists at all
///
/// iOS reported that their `0027` fallback case **has never executed**. No server has ever sent an
/// unrecognised enum, so `.unrecognised` decoding, `.rawValue` on it, and the
/// `gameLabel(game.rawValue) ?? "Pokémon"` fallback are all unexercised — and that last one would
/// label a ninth game "Pokémon".
///
/// These fixtures reach that path with no server change and no ninth game needing to exist. That
/// is the argument for vectors over waiting: the failure is available today.
///
/// TypeScript asserts these payloads are REJECTED (a server must never emit an unknown value);
/// Swift and Kotlin assert they DECODE (a client must never fall over on receiving one). Same
/// fixture, opposite assertions, because the platforms have opposite jobs.
final class GoldenVectorTests: XCTestCase {

    private struct Vector: Decodable {
        let name: String
        let type: String
        let why: String
        let payload: JSONValue
        /// See the fixture's own $comment. An accept-class vector carries an unknown FIELD on a
        /// KNOWN arm, which decodes and is then dropped on re-encode — a typed struct has nowhere
        /// to keep it. Those are asserted by arm, not by round-trip.
        let serverAccepts: Bool?
    }

    /// JSON with every explicit `null` removed, recursively.
    ///
    /// Swift's `JSONEncoder` omits a nil Optional rather than writing `"k": null`, so a strict
    /// comparison fails on `"rarity": null` — an encoder convention, not data loss. Normalising
    /// both sides keeps the assertion aimed at the property that matters: a value that was PRESENT
    /// must still be present, and unchanged. A non-null field going missing still fails.
    private func stripNulls(_ any: Any) -> Any {
        if let dict = any as? [String: Any] {
            var out: [String: Any] = [:]
            for (k, v) in dict where !(v is NSNull) { out[k] = stripNulls(v) }
            return out
        }
        if let arr = any as? [Any] { return arr.map(stripNulls) }
        return any
    }

    private func loadVectors() throws -> [Vector] {
        // Path from the test bundle back to the repo root. SwiftPM resources would be tidier, but
        // the fixture must stay a plain file at a path all three languages can read — the moment
        // it is copied into a per-language bundle, it can drift from the other two copies.
        let here = URL(fileURLWithPath: #filePath)
        let root = here.deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
        let url = root.appendingPathComponent("vectors/enum-forward-compat.json")
        let data = try Data(contentsOf: url)
        struct File: Decodable { let vectors: [Vector] }
        return try JSONDecoder().decode(File.self, from: data).vectors
    }

    func testBothVectorClassesArePopulated() throws {
        // An empty class asserts nothing. Without this, deleting every accept-class vector would
        // leave a green suite whose additive-change guard had silently stopped existing.
        let all = try loadVectors()
        XCTAssertGreaterThan(all.filter { $0.serverAccepts == true }.count, 0)
        XCTAssertGreaterThan(all.filter { $0.serverAccepts != true }.count, 0)
    }

    func testFindsVectors() throws {
        // Guards the path resolution above. A runner that silently found zero vectors would report
        // green while running nothing — the exact shape this suite was written to stop.
        XCTAssertGreaterThan(try loadVectors().count, 0, "no vectors loaded — check the fixture path")
    }

    func testEveryVectorDecodesAndRoundTripsUnchanged() throws {
        for v in try loadVectors() where v.serverAccepts != true {
            let payload = try JSONEncoder().encode(v.payload)

            switch v.type {
            case "CatalogueLookupResponse":
                // Decoded through the CONTAINING response type, never the enum alone. The failure
                // being guarded is a decode error propagating from a field to the whole object; a
                // test that decoded `Game` directly would pass and prove nothing about that path.
                let decoded = try JSONDecoder().decode(CatalogueLookupResponse.self, from: payload)

                // Re-encode and compare. One assertion covers three properties: it decoded rather
                // than threw (0027 item 1), the unrecognised value survived rather than being
                // dropped (item 2a), and nothing else in the object was lost on the way.
                let reencoded = try JSONEncoder().encode(decoded)
                let before = stripNulls(try JSONSerialization.jsonObject(with: payload)) as? NSDictionary
                let after  = stripNulls(try JSONSerialization.jsonObject(with: reencoded)) as? NSDictionary
                XCTAssertEqual(before, after, "vector \(v.name) did not round-trip unchanged")

            case "EbayPublishErrorResponse":
                let decoded = try JSONDecoder().decode(EbayPublishErrorResponse.self, from: payload)
                let reencoded = try JSONEncoder().encode(decoded)
                let before = stripNulls(try JSONSerialization.jsonObject(with: payload)) as? NSDictionary
                let after  = stripNulls(try JSONSerialization.jsonObject(with: reencoded)) as? NSDictionary
                XCTAssertEqual(before, after, "vector \(v.name) did not round-trip unchanged")

            default:
                XCTFail("vector \(v.name) names type \(v.type), which this runner does not handle — "
                      + "add it rather than letting it skip")
            }
        }
    }

    func testTheUnknownValueIsReachableAsRawValue() throws {
        // The specific thing iOS said had never run: reading `.rawValue` off the fallback case.
        // `gameLabel(game.rawValue) ?? "Pokémon"` is only safe if rawValue carries the real wire
        // value — if it returned "" or a placeholder, that fallback would label a ninth game
        // "Pokémon" and nobody would see a decode error to warn them.
        let vectors = try loadVectors()
        guard let v = vectors.first(where: { $0.name == "ninth_game_in_catalogue_lookup" }) else {
            return XCTFail("the vector this test is named for is missing")
        }
        let decoded = try JSONDecoder().decode(
            CatalogueLookupResponse.self, from: try JSONEncoder().encode(v.payload))

        guard let game = decoded.match?.game else { return XCTFail("no game on the match") }
        guard case .unrecognised(let raw) = game else {
            return XCTFail("a ninth game must decode to .unrecognised, got \(game)")
        }
        XCTAssertEqual(raw, "kryptonite-tcg")
        XCTAssertEqual(game.rawValue, "kryptonite-tcg", "rawValue must carry the wire value")
    }

    // ── Discriminated unions ────────────────────────────────────────────────────────────────

    func testUnknownUnionArmDecodesAndCarriesItsPayload() throws {
        // The union equivalent of the enum test above. eBay's error codes are an OPEN set arriving
        // from upstream, so an arm this build has never seen is next month, not a hypothetical —
        // and a hard failure here would break listing at the moment a seller is trying to sell.
        let v = try requireVector("unknown_ebay_error_code")
        let decoded = try JSONDecoder().decode(
            EbayPublishErrorResponse.self, from: try JSONEncoder().encode(v.payload))

        guard case .unrecognised(let code, let payload) = decoded.failure else {
            return XCTFail("an unknown eBay code must decode to .unrecognised, got \(decoded.failure)")
        }
        XCTAssertEqual(code, "ebay_rate_limited_v3", "the wire discriminator must survive")
        XCTAssertEqual(decoded.failure.code, "ebay_rate_limited_v3", "readable without switching")
        // The whole payload is kept, not just the tag — otherwise "unknown error" is all a log or
        // a support ticket ever gets, and the retryAfterSec the server sent is thrown away.
        if case .number(let secs)? = payload["retryAfterSec"] {
            XCTAssertEqual(secs, 42, "the unknown arm must keep its data, not just its name")
        } else {
            XCTFail("the unrecognised arm dropped retryAfterSec: \(payload)")
        }
    }

    func testKnownArmSurvivesAnAdditiveField() throws {
        // A newer server adding a field to a KNOWN arm must not break an older client. This is the
        // ordinary case — additive changes ship constantly — and it is the one that would fail
        // silently, because nobody writes a fixture for a change they consider harmless.
        let v = try requireVector("known_ebay_error_with_extra_field")
        let decoded = try JSONDecoder().decode(
            EbayPublishErrorResponse.self, from: try JSONEncoder().encode(v.payload))
        guard case .titleTooLong(let arm) = decoded.failure else {
            return XCTFail("a known arm with an extra field must still decode as that arm")
        }
        XCTAssertEqual(arm.titleLength, 84)
        XCTAssertEqual(arm.maxLength, 80)
    }

    func testMissingDiscriminatorDegradesRatherThanThrowing() throws {
        // PARITY, not forward-compatibility. The generated Swift decoder used `decode` and Kotlin's
        // degraded to Unknown(""), so the two platforms disagreed about the same malformed body —
        // Swift losing the whole response, Kotlin surfacing an unknown error. Both degrade now.
        // Without this vector the divergence is invisible until a malformed body reaches one of
        // them in production.
        let v = try requireVector("ebay_error_missing_discriminator")
        let decoded = try JSONDecoder().decode(
            EbayPublishErrorResponse.self, from: try JSONEncoder().encode(v.payload))
        guard case .unrecognised(let code, _) = decoded.failure else {
            return XCTFail("a body with no discriminator must degrade, not throw")
        }
        XCTAssertEqual(code, "", "an absent discriminator reads as absent, never as a real code")
    }

    private func requireVector(_ name: String) throws -> Vector {
        guard let v = try loadVectors().first(where: { $0.name == name }) else {
            throw XCTSkip("the vector this test is named for is missing: \(name)")
        }
        return v
    }
}
