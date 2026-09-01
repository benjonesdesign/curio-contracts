import XCTest
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

    func testFindsVectors() throws {
        // Guards the path resolution above. A runner that silently found zero vectors would report
        // green while running nothing — the exact shape this suite was written to stop.
        XCTAssertGreaterThan(try loadVectors().count, 0, "no vectors loaded — check the fixture path")
    }

    func testEveryVectorDecodesAndRoundTripsUnchanged() throws {
        for v in try loadVectors() {
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
}
