import XCTest
@testable import CurioContracts

/// v0.2.0 — the priced breakdown attached to real responses, the ONE closed refusal vocabulary,
/// game availability, and the copy (SKU on every copy, UNMATCHED and HELD).
///
/// As with `NullableMostToPayTests`: the cross-field rules ("a null amount always carries its
/// reason", "totals are the sum of the rows") are SERVER-side guards in the Zod schemas, and
/// Swift's synthesised `Codable` cannot express them, so nothing here pretends to enforce them.
/// What these prove is the part Swift owns: the new shapes DECODE, a null stays nil WITH its
/// reason, an unrecognised value of any new closed enum decodes (decisions/0027) instead of losing
/// the response, and the fields renamed/added for adoption exist under the names the docs give.
final class BreakdownAndRefusalTests: XCTestCase {

    private func decode<T: Decodable>(_ type: T.Type, _ json: String) throws -> T {
        try JSONDecoder().decode(T.self, from: json.data(using: .utf8)!)
    }

    // MARK: PricedBreakdown

    private let feeUnset = #"""
    {
      "mode": "selling",
      "lines": [
        {"key": "sale_price", "label": "Sale price", "amountGbp": 167.0, "unknownReason": null, "source": "request",
         "assumed": false, "estimate": false, "editable": false, "editKey": null, "note": null},
        {"key": "ebay_fee", "label": "eBay fee", "amountGbp": null, "unknownReason": "seller_type_not_set", "source": "fee_model",
         "assumed": false, "estimate": false, "editable": false, "editKey": null, "note": null},
        {"key": "packing", "label": "Packing (estimate)", "amountGbp": -0.34, "unknownReason": null, "source": "default",
         "assumed": true, "estimate": true, "editable": true, "editKey": "packingKey", "note": "estimate"},
        {"key": "you_receive", "label": "You receive", "amountGbp": null, "unknownReason": "seller_type_not_set", "source": "fee_model",
         "assumed": false, "estimate": false, "editable": false, "editKey": null, "note": null}
      ],
      "totals": {"youReceiveGbp": null, "maxBuyGbp": null, "askingPriceOnly": false},
      "compare": null,
      "feePosition": {"sellerType": null, "vatRegistered": null, "channel": "ebay", "feeBasis": "not_set"},
      "notSet": ["sellerType"],
      "price": {"gbp": 167.0, "source": null, "kind": null, "asOf": null, "cached": false},
      "computedAt": "2026-10-08T09:30:00.000Z"
    }
    """#

    func testUnknownFigureIsNilWithItsReasonNeverZero() throws {
        let b = try decode(PricedBreakdown.self, feeUnset)
        let fee = try XCTUnwrap(b.lines.first { $0.key == "ebay_fee" })
        XCTAssertNil(fee.amountGbp)
        XCTAssertEqual(fee.unknownReason, .sellerTypeNotSet)
        XCTAssertNil(b.totals.youReceiveGbp)
        XCTAssertEqual(b.feePosition.feeBasis, .notSet)
        XCTAssertNil(b.feePosition.sellerType)
        XCTAssertEqual(b.notSet, [.sellerType])
    }

    func testEstimateAndAssumedAreSeparateFlagsAndThereIsNoListingTime() throws {
        let b = try decode(PricedBreakdown.self, feeUnset)
        let packing = try XCTUnwrap(b.lines.first { $0.key == "packing" })
        XCTAssertTrue(packing.estimate); XCTAssertTrue(packing.assumed)
        XCTAssertNil(b.lines.first { $0.key == "listing_time" }, "there is no listing time line anywhere")
    }

    func testTheFeeLineCarriesItsBandAndWhetherTheBasisIsVerified() throws {
        let j = feeUnset.replacingOccurrences(
            of: #""amountGbp": null, "unknownReason": "seller_type_not_set", "source": "fee_model""#,
            with: #""amountGbp": -18.28, "unknownReason": null, "perOrderBand": "high", "feeBasisVerified": false, "source": "fee_model""#)
        let b = try decode(PricedBreakdown.self, j)
        let fee = try XCTUnwrap(b.lines.first { $0.key == "ebay_fee" })
        XCTAssertEqual(fee.perOrderBand, .high)
        XCTAssertEqual(fee.feeBasisVerified, false, "false until eBay's page confirms the band basis")
        let unknownFee = try decode(PricedBreakdown.self, feeUnset).lines.first { $0.key == "ebay_fee" }
        XCTAssertNil(unknownFee?.feeBasisVerified)
        XCTAssertNil(unknownFee?.perOrderBand)
    }

    func testAnUnrecognisedLineReasonDecodesAndTheOtherLinesSurvive() throws {
        let j = feeUnset.replacingOccurrences(of: #""unknownReason": "seller_type_not_set""#, with: #""unknownReason": "awaiting_review""#)
        let b = try decode(PricedBreakdown.self, j)
        let fee = try XCTUnwrap(b.lines.first { $0.key == "ebay_fee" })
        guard case .unrecognised(let raw)? = fee.unknownReason else { return XCTFail("expected .unrecognised") }
        XCTAssertEqual(raw, "awaiting_review")
        XCTAssertNil(fee.amountGbp, "an unrecognised reason is still NO figure")
        XCTAssertEqual(b.lines.count, 4)
    }

    func testBreakdownRoundTripsWithItsNullsAndReasons() throws {
        let b = try decode(PricedBreakdown.self, feeUnset)
        let again = try JSONDecoder().decode(PricedBreakdown.self, from: try JSONEncoder().encode(b))
        XCTAssertEqual(again.lines.first { $0.key == "ebay_fee" }?.unknownReason, .sellerTypeNotSet)
        XCTAssertNil(again.lines.first { $0.key == "you_receive" }?.amountGbp)
    }

    // MARK: DecideResponse carries the breakdown, QuickScan nullable

    func testQuickScanBreakdownIsNilExactlyWhenTheDecisionIs() throws {
        let q = try decode(QuickScanResponse.self, #"""
        {"identified": false, "candidates": [], "decision": null, "breakdown": null, "conditionAssessed": false, "editionAmbiguity": null}
        """#)
        XCTAssertNil(q.decision)
        XCTAssertNil(q.breakdown)
    }

    // MARK: Refusals

    func testCardNotListableCarriesItsReasonAndAnUnknownReasonDecodes() throws {
        let known = try decode(ListingRefusal.self, #"{"error": "Kept as yours", "code": "card_not_listable", "reason": "mine"}"#)
        XCTAssertEqual(known.code, .cardNotListable)
        XCTAssertEqual(known.reason, .mine)
        let future = try decode(ListingRefusal.self, #"{"error": "x", "code": "card_not_listable", "reason": "quarantined"}"#)
        guard case .unrecognised(let raw)? = future.reason else { return XCTFail("expected .unrecognised") }
        XCTAssertEqual(raw, "quarantined")
        let other = try decode(ListingRefusal.self, #"{"error": "x", "code": "card_read_failed", "reason": null}"#)
        XCTAssertNil(other.reason)
    }

    func testEveryReasonInTheClosedListDecodes() throws {
        for r in ["mine", "set_aside", "unmatched", "condition_not_confirmed", "no_price", "no_sku", "game_not_available", "already_live"] {
            let x = try decode(ListingRefusal.self, "{\"error\":\"x\",\"code\":\"card_not_listable\",\"reason\":\"\(r)\"}")
            XCTAssertEqual(x.reason?.rawValue, r)
            if case .unrecognised = x.reason! { XCTFail("\(r) must be a known case") }
        }
    }

    func testThePublishEnvelopeCarriesTheNewArms() throws {
        let e = try decode(EbayPublishErrorResponse.self, #"""
        {"error": "Kept as yours", "code": "card_not_listable",
         "failure": {"code": "card_not_listable", "message": "Kept as yours", "reason": "set_aside"}}
        """#)
        guard case .cardNotListable(let arm) = e.failure else { return XCTFail("expected cardNotListable, got \(e.failure)") }
        XCTAssertEqual(arm.reason, .setAside)
        let g = try decode(EbayPublishErrorResponse.self, #"""
        {"error": "Magic isn't available to list yet.",
         "failure": {"code": "game_not_available", "message": "Magic isn't available to list yet.", "game": "mtg", "displayName": "Magic: The Gathering"}}
        """#)
        guard case .gameNotAvailable(let arm2) = g.failure else { return XCTFail("expected gameNotAvailable") }
        XCTAssertEqual(arm2.displayName, "Magic: The Gathering")
    }

    func testPublishSuccessCarriesTheSku() throws {
        let s = try decode(EbayPublishSuccess.self, #"{"status":"published","sku":"SKU-ABC12345","offerId":"o","listingId":"l","listingUrl":null,"production":true}"#)
        XCTAssertEqual(s.sku, "SKU-ABC12345")
    }

    // MARK: Games

    func testGamesResponseAndAnUnrecognisedAvailabilityIsNotAvailable() throws {
        let g = try decode(GamesResponse.self, #"""
        {"games": [{"game": "pokemon", "displayName": "Pokémon", "availability": "available"},
                   {"game": "mtg", "displayName": "Magic: The Gathering", "availability": "beta"}]}
        """#)
        XCTAssertEqual(g.games[0].availability, .available)
        guard case .unrecognised(let raw) = g.games[1].availability else { return XCTFail("expected .unrecognised") }
        XCTAssertEqual(raw, "beta")
    }

    func testGameRefusalDecodes() throws {
        let r = try decode(GameRefusal.self, #"{"error":"Pricing for Yu-Gi-Oh! is coming.","code":"game_coming","game":"yugioh","displayName":"Yu-Gi-Oh!","availability":"coming"}"#)
        XCTAssertEqual(r.code, .gameComing)
        XCTAssertEqual(r.availability, .coming)
    }

    // MARK: The copy

    func testPhysicalCardHasANonNullSkuAndHeldCarriesHeldAt() throws {
        let c = try decode(PhysicalCard.self, #"""
        {"id": "a", "sku": "SKU-11111111", "status": "HELD", "game": "pokemon", "name": "Giratina V", "setName": null, "cardNumber": "186/196",
         "condition": "NM", "conditionConfirmed": true, "heldAt": "2026-10-06T10:15:00.000Z", "isMine": false, "mineSetAt": null, "setAsideReason": null, "setAsideAt": null}
        """#)
        XCTAssertEqual(c.sku, "SKU-11111111")
        XCTAssertEqual(c.status, .hELD)
        XCTAssertEqual(c.heldAt, "2026-10-06T10:15:00.000Z")
    }

    func testUnmatchedDecodesAndAFutureStatusDoesNotLoseTheCopy() throws {
        let u = try decode(PhysicalCard.self, #"""
        {"id": "a", "sku": "SKU-11111111", "status": "UNMATCHED", "game": "pokemon", "name": "Charzard", "setName": null, "cardNumber": null,
         "condition": null, "conditionConfirmed": false, "heldAt": null, "isMine": false, "mineSetAt": null, "setAsideReason": null, "setAsideAt": null}
        """#)
        XCTAssertEqual(u.status, .uNMATCHED)
        XCTAssertNil(u.heldAt)
        let f = try decode(PhysicalCard.self, #"""
        {"id": "a", "sku": "SKU-11111111", "status": "QUARANTINED", "game": "pokemon", "name": null, "setName": null, "cardNumber": null,
         "condition": null, "conditionConfirmed": false, "heldAt": null, "isMine": false, "mineSetAt": null, "setAsideReason": null, "setAsideAt": null}
        """#)
        guard case .unrecognised(let raw) = f.status else { return XCTFail("expected .unrecognised") }
        XCTAssertEqual(raw, "QUARANTINED")
        XCTAssertEqual(f.sku, "SKU-11111111", "the SKU survives an unknown status")
    }

    func testCaptureCommitResponseCarriesSkuAndStatus() throws {
        let r = try decode(CaptureCommitResponse.self, #"""
        {"physicalCardId": "abc", "sku": "SKU-ABC12345", "status": "READY_TO_LIST", "legacyCardId": null, "game": "pokemon", "gameDisplayName": "Pokémon",
         "name": "Charizard", "setName": "Base Set", "cardNumber": "4/102", "condition": "NM", "rarity": null, "suggestedPrice": 120.5,
         "ebay": null, "subGrades": null}
        """#)
        XCTAssertEqual(r.sku, "SKU-ABC12345")
        XCTAssertEqual(r.status, .rEADYTOLIST)
    }

    // MARK: Tax: null = not set

    func testANilTaxRateIsNotSetNotZero() throws {
        let p = try decode(StoredPricingSettings.self, #"{"ebayFeeRate": null, "ebayFeeFixed": null, "packagingCost": 0.34, "shippingCost": 0, "taxRate": null, "minProfitPct": 0.25, "minSaleValue": 1.5, "postageCost": 1.55}"#)
        XCTAssertNil(p.taxRate)
        let chosenNone = try decode(StoredPricingSettings.self, #"{"ebayFeeRate": null, "ebayFeeFixed": null, "packagingCost": 0.34, "shippingCost": 0, "taxRate": 0, "minProfitPct": 0.25, "minSaleValue": 1.5, "postageCost": 1.55}"#)
        XCTAssertEqual(chosenNone.taxRate, 0)
        XCTAssertNotNil(chosenNone.taxRate)
    }

    // MARK: Listing preview

    func testListingPreviewDecodesWithRefusalsAndTotals() throws {
        let j = #"""
        {"items": [
          {"card": {"id": "a", "sku": "SKU-AAAAAAAA", "status": "READY_TO_LIST", "game": "pokemon", "name": "A", "setName": null, "cardNumber": null, "condition": "NM", "conditionConfirmed": true, "heldAt": null, "isMine": false, "mineSetAt": null, "setAsideReason": null, "setAsideAt": null},
           "listable": false, "refusalReason": "mine", "breakdown": null, "belowFloor": null, "group": null}
        ],
         "groups": [],
         "totals": {"count": 1, "listableCount": 0, "belowFloorCount": 0, "youReceiveGbp": 0, "unknownReason": null},
         "floorGbp": 1.5, "computedAt": "2026-10-08T09:30:00.000Z"}
        """#
        let p = try decode(ListingPreviewResponse.self, j)
        XCTAssertEqual(p.items[0].refusalReason, .mine)
        XCTAssertNil(p.items[0].breakdown)
        XCTAssertEqual(p.items[0].card.sku, "SKU-AAAAAAAA")
        XCTAssertEqual(p.totals.youReceiveGbp, 0)
    }

    // MARK: Owner rulings 2026-10-09

    func testANegativeYouReceiveIsKeptNegativeAndFlaggedBelowCost() throws {
        let j = #"""
        {"mode": "selling", "lines": [
          {"key": "sale_price", "label": "Sale price", "amountGbp": 5.0, "unknownReason": null, "source": "request", "assumed": false, "estimate": false, "editable": false, "editKey": null, "note": null},
          {"key": "you_receive", "label": "You receive", "amountGbp": -13.62, "unknownReason": null, "source": "fee_model", "assumed": false, "estimate": false, "editable": false, "editKey": null, "note": "pays_to_sell"}],
         "totals": {"youReceiveGbp": -13.62, "maxBuyGbp": null, "askingPriceOnly": false}, "compare": null,
         "feePosition": {"sellerType": "business", "vatRegistered": true, "channel": "ebay", "feeBasis": "derived"}, "notSet": [],
         "price": {"gbp": 5.0, "source": null, "kind": null, "asOf": null, "cached": false}, "computedAt": "2026-10-09T09:30:00.000Z"}
        """#
        let b = try decode(PricedBreakdown.self, j)
        XCTAssertEqual(b.totals.youReceiveGbp, -13.62, "the true negative, never clamped to 0")
        XCTAssertEqual(b.lines.first { $0.key == "you_receive" }?.note, "pays_to_sell")
    }

    func testThePostageLineCarriesItsBasis() throws {
        let j = feeUnset.replacingOccurrences(of: #"{"key": "packing", "label": "Packing (estimate)""#,
            with: #"{"key": "postage", "label": "Postage", "amountGbp": -3.29, "unknownReason": null, "postageBasis": "ebay_policy", "source": "ebay_policy", "assumed": false, "estimate": false, "editable": false, "editKey": null, "note": null},{"key": "packing", "label": "Packing (estimate)""#)
        let b = try decode(PricedBreakdown.self, j)
        XCTAssertEqual(b.lines.first { $0.key == "postage" }?.postageBasis, .ebayPolicy)
        let future = try decode(PricedBreakdown.self, j.replacingOccurrences(of: "ebay_policy\", \"source", with: "carrier_quote\", \"source"))
        guard case .unrecognised(let raw)? = future.lines.first(where: { $0.key == "postage" })?.postageBasis else { return XCTFail("expected .unrecognised") }
        XCTAssertEqual(raw, "carrier_quote")
    }

    func testThereIsOneTaxRateAndNoBuyingTaxRate() throws {
        let p = try decode(ProfileResponse.self, #"""
        {"sellerType": null, "sellerTypeConfirmedAt": null, "sellerTypeSource": "manual", "suggestedSellerType": null, "vatRegistered": null, "vatConfirmedAt": null,
         "feeNotSetReason": "seller_type_not_set", "buyingTargetMarginPct": null, "buyingTargetMarginSetAt": null,
         "dispatchAddress": {"line1": null, "city": null, "postcode": null, "country": "GB"}, "agedInventoryDays": 60,
         "pricingSettings": {"ebayFeeRate": null, "ebayFeeFixed": null, "packagingCost": 0.34, "shippingCost": 0, "taxRate": null, "minProfitPct": 0.25, "minSaleValue": 1.5, "postageCost": 1.55},
         "effectivePricingSettings": {"ebayFeeRate": null, "ebayFeeFixed": null, "packagingCost": 0.34, "shippingCost": 0, "taxRate": null, "minProfitPct": 0.25, "minSaleValue": 1.5, "postageCost": 1.55},
         "isAdmin": false}
        """#)
        XCTAssertNil(p.pricingSettings.taxRate)
        XCTAssertNil(p.effectivePricingSettings.taxRate, "null = no tax set aside, buying or selling")
    }

    // MARK: Mine, set aside, put back, stats

    func testPerCopyChangeResultsDecodeAndAnUnknownRefusalReasonDoesNotLoseTheOthers() throws {
        let r = try decode(InventoryChangeResponse.self, #"""
        {"results": [{"id": "a", "outcome": "changed", "status": "EXCEPTION", "droppedChannel": "bundle"},
                     {"id": "b", "outcome": "refused", "reason": "live_on_ebay", "error": "End the listing first."},
                     {"id": "c", "outcome": "refused", "reason": "locked", "error": "Locked."},
                     {"id": "d", "outcome": "changed", "previousReason": "other"}],
         "summary": {"changed": 2, "unchanged": 0, "refused": 2, "failed": 0}}
        """#)
        XCTAssertEqual(r.results[0].droppedChannel, "bundle")
        XCTAssertEqual(r.results[1].reason, .liveOnEbay)
        guard case .unrecognised(let raw)? = r.results[2].reason else { return XCTFail("expected .unrecognised") }
        XCTAssertEqual(raw, "locked")
        XCTAssertEqual(r.results[3].previousReason, .other)
        XCTAssertEqual(r.summary.refused, 2)
    }

    func testSetAsideRequestTakesAChipOrNothing() throws {
        let enc = try JSONEncoder().encode(SetAsideRequest(ids: ["a"], reason: .looksOff))
        XCTAssertTrue(String(data: enc, encoding: .utf8)!.contains("looks_off"))
        let skipped = try decode(SetAsideRequest.self, #"{"ids": ["a"]}"#)
        XCTAssertNil(skipped.reason)
    }

    func testAMineCopyCarriesIsMineAndASetAsideCopySaysSinceWhenAndWhy() throws {
        let c = try decode(PhysicalCard.self, #"""
        {"id": "a", "sku": "SKU-11111111", "status": "EXCEPTION", "game": "pokemon", "name": "X", "setName": null, "cardNumber": null,
         "condition": "NM", "conditionConfirmed": true, "heldAt": null, "isMine": true, "mineSetAt": "2026-10-09T10:00:00.000Z",
         "setAsideReason": "looks_off", "setAsideAt": "2026-10-09T11:00:00.000Z"}
        """#)
        XCTAssertTrue(c.isMine)
        XCTAssertEqual(c.setAsideReason, .looksOff)
        XCTAssertEqual(c.status, .eXCEPTION)
    }

    func testStatsCarryCountsAndTheMineCollectionValuedApart() throws {
        let s = try decode(StatsResponse.self, #"""
        {"statusCounts": {"READY_TO_LIST": 4, "HELD": 1}, "costBasis": 120, "estValue": 4812, "heldValue": 320, "realisedGain": 12.5, "agedListings": 0, "totalCards": 8,
         "counts": {"stock": 4, "held": 1, "mine": 2, "setAside": 1},
         "collectionValue": {"count": 2, "pricedCount": 0, "notPricedCount": 2, "lowGbp": null, "highGbp": null, "sources": []}}
        """#)
        XCTAssertEqual(s.counts.mine, 2)
        XCTAssertEqual(s.counts.held, 1)
        XCTAssertEqual(s.heldValue, 320, "the held part, included in estValue: £4,812 · £320 held")
        XCTAssertNil(s.collectionValue.lowGbp, "an unpriced collection is nil, never 0")
        XCTAssertEqual(s.statusCounts["HELD"], 1)
    }

    // MARK: Graded slab

    func testASlabIsRefusedWithSlabUnverifiedAndAFutureReasonStillDecodes() throws {
        let r = try decode(ListingRefusal.self, #"{"error": "Not verified", "code": "card_not_listable", "reason": "slab_unverified"}"#)
        XCTAssertEqual(r.reason, .slabUnverified)
        let arm = try decode(EbayPublishErrorResponse.self, #"{"error": "x", "failure": {"code": "card_not_listable", "message": "x", "reason": "slab_unverified"}}"#)
        guard case .cardNotListable(let a) = arm.failure else { return XCTFail("expected cardNotListable") }
        XCTAssertEqual(a.reason, .slabUnverified)
    }

    func testTheGradedCreateResponseCarriesTheSkuAndWhetherTheCertWasVerified() throws {
        let g = try decode(GradedCreateResponse.self, #"""
        {"physicalCardId": "aaaaaaaa-2222-4333-8444-555555555555", "legacyCardId": null, "sku": "SKU-AAAAAAAA", "status": "NEEDS_ID_REVIEW",
         "created": false, "certVerified": false, "certCheck": "unsupported_grader", "catalogueMatched": false}
        """#)
        XCTAssertEqual(g.sku, "SKU-AAAAAAAA")
        XCTAssertFalse(g.certVerified)
        XCTAssertEqual(g.certCheck, .unsupportedGrader)
        XCTAssertFalse(g.created, "a retry returns the same copy")
        let enc = String(data: try JSONEncoder().encode(GradedCreateRequest(batchId: "11111111-2222-4333-8444-555555555555", game: nil, name: "Charizard", setName: nil, cardNumber: nil, language: nil, grader: .bGSBeckett, grade: "9.5", certNumber: "1", purchaseCost: nil, suggestedPrice: nil, collectionType: nil, photoPaths: nil, thumbPaths: nil, notes: nil)), encoding: .utf8)!
        XCTAssertTrue(enc.contains("Beckett"))
        XCTAssertFalse(enc.contains("certVerified"), "the request carries no verification flag")
        XCTAssertFalse(enc.contains("sku"), "and no sku")
    }

    func testPostageForAndCardsInParcelAreOptionalRequestFields() throws {
        let r = try decode(PricingBreakdownRequest.self, #"{"price": 167, "purchaseCost": 96, "marketMedian": 150, "postageFor": "published", "cardsInParcel": 3}"#)
        XCTAssertEqual(r.postageFor, .published)
        XCTAssertEqual(r.cardsInParcel, 3)
        let bare = try decode(PricingBreakdownRequest.self, #"{"price": 167, "purchaseCost": 96, "marketMedian": 150}"#)
        XCTAssertNil(bare.postageFor); XCTAssertNil(bare.cardsInParcel)
        let p = try decode(ListingPreviewRequest.self, #"{"postageFor": "estimate", "items": [{"physicalCardId": "a", "cardsInParcel": 2}]}"#)
        XCTAssertEqual(p.postageFor, .estimate)
        XCTAssertEqual(p.items[0].cardsInParcel, 2)
    }

    // MARK: Round 3 follow-ups (Ben, 2026-10-09)

    func testAnAskingPriceCeilingIsAShownFigureWithAFlag() throws {
        let d = try decode(Decision.self, #"""
        {"route": "list_single", "reason": "sound_single_listing", "alternatives": [], "confidence": "high", "liquidity": "high",
         "economics": {"marketValueGbp": 136, "feeGbp": 0, "feeNotSetReason": null, "postageGbp": 3.29, "packagingGbp": 0.34, "costBasisGbp": null, "taxProvisionGbp": 0, "expectedNetGbp": 132.37},
         "maxBuyGbp": 84, "maxBuyUnavailableReason": null, "askingPriceOnly": true, "minAcceptGbp": 12.5, "offerPctAtMax": 61.8,
         "degraded": false, "degradedReasons": []}
        """#)
        XCTAssertEqual(d.maxBuyGbp, 84, "the figure is shown")
        XCTAssertTrue(d.askingPriceOnly, "and flagged as a ceiling")
        XCTAssertNil(d.maxBuyUnavailableReason)
    }

    func testTheRetiredAskingPriceOnlyReasonStillDecodesToTheFallback() throws {
        let d = try decode(Decision.self, #"""
        {"route": "list_single", "reason": "sound_single_listing", "alternatives": [], "confidence": "high", "liquidity": "high",
         "economics": {"marketValueGbp": 136, "feeGbp": 0, "feeNotSetReason": null, "postageGbp": 3.29, "packagingGbp": 0.34, "costBasisGbp": null, "taxProvisionGbp": 0, "expectedNetGbp": 132.37},
         "maxBuyGbp": null, "maxBuyUnavailableReason": "asking_price_only", "askingPriceOnly": false, "minAcceptGbp": 12.5, "offerPctAtMax": null,
         "degraded": false, "degradedReasons": []}
        """#)
        XCTAssertNil(d.maxBuyGbp)
        guard case .unrecognised(let raw)? = d.maxBuyUnavailableReason else { return XCTFail("expected .unrecognised") }
        XCTAssertEqual(raw, "asking_price_only")
    }

    func testStopHoldingAndTheIdentifyingStatusKey() throws {
        let enc = String(data: try JSONEncoder().encode(StopHoldingRequest(ids: ["a", "b"])), encoding: .utf8)!
        XCTAssertTrue(enc.contains("\"ids\""))
        let k = try decode(InventoryStatusKey.self, #""identifying""#)
        XCTAssertEqual(k, .identifying)
        guard case .unrecognised(let raw) = try decode(InventoryStatusKey.self, #""snoozed""#) else { return XCTFail("expected .unrecognised") }
        XCTAssertEqual(raw, "snoozed")
    }

    func testSoldAndArchivedAreListingRefusalReasons() throws {
        for (raw, expected) in [("sold", ListingRefusalReason.sold), ("archived", .archived)] {
            let r = try decode(ListingRefusal.self, "{\"error\":\"x\",\"code\":\"card_not_listable\",\"reason\":\"\(raw)\"}")
            XCTAssertEqual(r.reason, expected)
        }
        XCTAssertEqual(try decode(InventoryChangeRefusalReason.self, #""sold""#).rawValue, "sold", "the same wire string in the change enum")
    }
}
