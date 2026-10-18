import XCTest
@testable import CurioContracts

/// v0.2.0 — `Decision.maxBuyGbp` and the fee position are nullable, and a null carries its reason.
///
/// The rule "a null most-to-pay always says why" is a SERVER-side guard in the Zod schema
/// (`DecisionSchema.superRefine`); Swift's synthesised `Codable` cannot express it, so nothing
/// here pretends to enforce it. What these prove is the part the Swift side owns: the nullable
/// shape DECODES (a `Double` → `Double?` change that did not compile or did not decode would be
/// the release failing silently on iOS, which is what ADR 0027's history is), the reason survives,
/// and an old payload with a number still reads.
final class NullableMostToPayTests: XCTestCase {

    private let unset = #"""
    {
      "route": "list_single", "reason": "sound_single_listing", "alternatives": [],
      "confidence": "high", "liquidity": "high",
      "economics": {
        "marketValueGbp": 136.0, "feeGbp": null, "feeNotSetReason": "seller_type_not_set",
        "postageGbp": 3.29, "packagingGbp": 0.34, "costBasisGbp": null,
        "taxProvisionGbp": null, "expectedNetGbp": null
      },
      "maxBuyGbp": null, "maxBuyUnavailableReason": "seller_type_not_set", "askingPriceOnly": false, "askingPriceOnly": false,
      "minAcceptGbp": null, "offerPctAtMax": null,
      "degraded": false, "degradedReasons": []
    }
    """#

    private let known = #"""
    {
      "route": "list_single", "reason": "sound_single_listing", "alternatives": [],
      "confidence": "high", "liquidity": "high",
      "economics": {
        "marketValueGbp": 136.0, "feeGbp": 18.284, "feeNotSetReason": null,
        "postageGbp": 3.29, "packagingGbp": 0.34, "costBasisGbp": null,
        "taxProvisionGbp": 0.0, "expectedNetGbp": 114.09
      },
      "maxBuyGbp": 66, "maxBuyUnavailableReason": null, "askingPriceOnly": false,
      "minAcceptGbp": 12.5, "offerPctAtMax": 48.9,
      "degraded": false, "degradedReasons": []
    }
    """#

    private func decode(_ s: String) throws -> Decision {
        try JSONDecoder().decode(Decision.self, from: s.data(using: .utf8)!)
    }

    func testNullMostToPayAndFeeDecodeWithTheirReasons() throws {
        let d = try decode(unset)
        XCTAssertNil(d.maxBuyGbp)
        XCTAssertEqual(d.maxBuyUnavailableReason, .sellerTypeNotSet)
        XCTAssertNil(d.economics.feeGbp)
        XCTAssertEqual(d.economics.feeNotSetReason, .sellerTypeNotSet)
        XCTAssertNil(d.economics.expectedNetGbp)
        XCTAssertNil(d.minAcceptGbp)
        XCTAssertNil(d.offerPctAtMax)
    }

    func testANumberStillDecodesAsANumberWithNoReason() throws {
        let d = try decode(known)
        XCTAssertEqual(d.maxBuyGbp, 66)
        XCTAssertNil(d.maxBuyUnavailableReason)
        XCTAssertEqual(d.economics.feeGbp, 18.284)
        XCTAssertNil(d.economics.feeNotSetReason)
    }

    /// A reason added next year must not take the whole decision down on a pinned build (0027).
    /// It decodes to `.unrecognised`, and the caller decides what to show — never a number.
    func testAnUnrecognisedReasonDecodesInsteadOfLosingTheDecision() throws {
        let d = try decode(unset.replacingOccurrences(of: #""maxBuyUnavailableReason": "seller_type_not_set""#,
                                                      with: #""maxBuyUnavailableReason": "some_future_reason""#))
        XCTAssertNil(d.maxBuyGbp)
        guard case .unrecognised(let raw) = d.maxBuyUnavailableReason else {
            return XCTFail("an unknown reason should decode to .unrecognised")
        }
        XCTAssertEqual(raw, "some_future_reason")
    }

    /// Zero is a real most-to-pay ("pay nothing"); null is "no honest figure". They must not merge.
    func testZeroIsNotNull() throws {
        let d = try decode(known.replacingOccurrences(of: #""maxBuyGbp": 66"#, with: #""maxBuyGbp": 0"#))
        XCTAssertEqual(d.maxBuyGbp, 0)
        XCTAssertNotNil(d.maxBuyGbp)
    }

    func testNullSurvivesAnEncodeDecodeRoundTripWithItsReason() throws {
        let d = try decode(unset)
        let again = try JSONDecoder().decode(Decision.self, from: try JSONEncoder().encode(d))
        XCTAssertNil(again.maxBuyGbp)
        XCTAssertEqual(again.maxBuyUnavailableReason, .sellerTypeNotSet)
        XCTAssertEqual(again.economics.feeNotSetReason, .sellerTypeNotSet)
    }

    /// The profile of a seller who was never asked: `sellerType` is nil, not a placeholder
    /// "private", and eBay's detection arrives as a suggestion rather than an answer.
    func testProfileNeverAskedDecodesWithANilSellerType() throws {
        let json = #"""
        {
          "sellerType": null, "sellerTypeConfirmedAt": null, "sellerTypeSource": "manual",
          "suggestedSellerType": "business", "vatRegistered": null, "vatConfirmedAt": null,
          "feeNotSetReason": "seller_type_not_set",
          "buyingTargetMarginPct": null, "buyingTargetMarginSetAt": null,
          "dispatchAddress": {"line1": null, "city": null, "postcode": null, "country": "GB"},
          "agedInventoryDays": 60,
          "pricingSettings": {"ebayFeeRate": null, "ebayFeeFixed": null, "packagingCost": 0.1, "shippingCost": 0,
                              "taxRate": 0.2, "minProfitPct": 0.25, "minSaleValue": 2.5, "postageCost": 1.55},
          "effectivePricingSettings": {"ebayFeeRate": null, "ebayFeeFixed": null, "packagingCost": 0.1, "shippingCost": 0,
                              "taxRate": 0.2, "minProfitPct": 0.25, "minSaleValue": 2.5, "postageCost": 1.55},
          "isAdmin": false
        }
        """#
        let p = try JSONDecoder().decode(ProfileResponse.self, from: json.data(using: .utf8)!)
        XCTAssertNil(p.sellerType)
        XCTAssertEqual(p.suggestedSellerType, .business)
        XCTAssertNil(p.effectivePricingSettings.ebayFeeRate)
        XCTAssertEqual(p.feeNotSetReason, .sellerTypeNotSet)
    }
}
