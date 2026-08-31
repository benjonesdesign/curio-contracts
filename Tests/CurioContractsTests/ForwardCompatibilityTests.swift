import XCTest
@testable import CurioContracts

/// decisions/0027 — enum values are only additive if clients decode forward-compatibly.
///
/// Kotlin has had this since 2026-08-27; Swift never did, and nothing noticed because there was no
/// Swift target in CI at all — the package was generated, committed, and never compiled or run.
/// These are the assertions that make the Swift half real rather than asserted.
final class ForwardCompatibilityTests: XCTestCase {

    private struct Holder: Codable, Equatable {
        let game: Game
        let side: Side
    }

    /// The failure 0027 was written to prevent: Swift's synthesised `Codable` throws
    /// `DecodingError.dataCorrupted` on an unrecognised raw value, and the throw propagates to the
    /// ENCLOSING OBJECT — so a ninth game in one candidate of a candidate list fails the whole
    /// response. The client doesn't degrade; it errors.
    func testUnknownValueDecodesInsteadOfFailingTheWholeObject() throws {
        let json = #"{"game":"kryptonite-tcg","side":"front"}"#.data(using: .utf8)!
        let decoded = try JSONDecoder().decode(Holder.self, from: json)
        guard case .unrecognised(let raw) = decoded.game else {
            return XCTFail("a ninth game should decode to .unrecognised, not throw")
        }
        XCTAssertEqual(raw, "kryptonite-tcg")
        // The rest of the object survived, which is the entire point.
        XCTAssertEqual(decoded.side, .front)
    }

    /// 0027 item 2a: an unknown value may be PRESERVED on round-trip, never originated. Dropping a
    /// value the client read but did not touch is silent data loss.
    func testUnknownValueRoundTripsUnchanged() throws {
        let json = #"{"game":"kryptonite-tcg","side":"back"}"#.data(using: .utf8)!
        let decoded = try JSONDecoder().decode(Holder.self, from: json)
        let out = String(data: try JSONEncoder().encode(decoded), encoding: .utf8)!
        XCTAssertTrue(out.contains("kryptonite-tcg"), "unknown value was dropped on re-encode: \(out)")
    }

    /// A schema may contain a domain value literally called "unknown" — capture-commit's
    /// orientation, exposure and side all do. Kotlin separates them by casing (object UNKNOWN vs
    /// data class Unknown); Swift case names are lowerCamel and would collide outright, so the
    /// generated fallback takes a name no domain value has. If that ever silently merged, a real
    /// "unknown" reading would be indistinguishable from a value we failed to recognise.
    func testDomainUnknownIsNotTheFallbackCase() throws {
        let decoded = try JSONDecoder().decode(Holder.self, from: #"{"game":"mtg","side":"unknown"}"#.data(using: .utf8)!)
        XCTAssertEqual(decoded.side, .unknown, "the domain value 'unknown' must decode to its own case")
        if case .unrecognised = decoded.side { XCTFail("domain 'unknown' collided with the fallback") }
        XCTAssertEqual(decoded.side.rawValue, "unknown")
    }

    /// Guards against the fix being vacuous — if every value decoded to the fallback the tests
    /// above would still pass.
    func testKnownValuesStillDecodeToTheirOwnCases() throws {
        for (raw, expected) in [("pokemon", Game.pokemon), ("one-piece", .onePiece), ("dbs-fusion", .dbsFusion)] {
            let json = #"{"game":"\#(raw)","side":"front"}"#.data(using: .utf8)!
            XCTAssertEqual(try JSONDecoder().decode(Holder.self, from: json).game, expected)
        }
    }

    /// 0027 item 4a: a field carrying a schema default must emit as optional-with-default, never
    /// required — an absent key otherwise throws `keyNotFound` and takes the response down. That is
    /// a ROLLBACK-safety property: App Store latency means clients cannot be rolled back in step
    /// with a server.
    func testAbsentDefaultedKeyDoesNotFailTheDecode() throws {
        // cataloguesUnavailable carries .default([]) — a server that predates it omits the key.
        let json = #"{"results":[]}"#.data(using: .utf8)!
        let decoded = try JSONDecoder().decode(CardSearchResponse.self, from: json)
        XCTAssertEqual(decoded.cataloguesUnavailable ?? [], [])
    }
}
