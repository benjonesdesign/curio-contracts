package com.curio.contracts

import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

// v0.2.0 — the priced breakdown attached to real responses, the ONE closed refusal vocabulary, game
// availability, and the copy (SKU on every copy, UNMATCHED and HELD). Mirrors
// BreakdownAndRefusalTests.swift. The cross-field rules are SERVER-side guards in the Zod schemas;
// what these prove is the part the generated Kotlin owns: the shapes decode, a null stays null WITH
// its reason, and an unrecognised value of any new closed enum decodes to Unknown instead of
// losing the response (decisions/0027).
class BreakdownAndRefusalTest {
    private val json = Json { ignoreUnknownKeys = true }

    private val feeUnset = """
        {
          "mode": "selling",
          "lines": [
            {"key": "sale_price", "label": "Sale price", "amountGbp": 167.0, "unknownReason": null, "source": "request",
             "assumed": false, "estimate": false, "editable": false, "editKey": null, "included": true, "note": null},
            {"key": "ebay_fee", "label": "eBay fee", "amountGbp": null, "unknownReason": "seller_type_not_set", "source": "fee_model",
             "assumed": false, "estimate": false, "editable": false, "editKey": null, "included": true, "note": null},
            {"key": "you_receive", "label": "You receive", "amountGbp": null, "unknownReason": "seller_type_not_set", "source": "fee_model",
             "assumed": false, "estimate": false, "editable": false, "editKey": null, "included": true, "note": null}
          ],
          "beside": [{"key": "listing_time", "label": "Listing time (estimate)", "amountGbp": 1.0, "unknownReason": null, "source": "seller_profile",
             "assumed": false, "estimate": true, "editable": false, "editKey": null, "included": false, "minutes": 5, "note": "not_included"}],
      "totals": {"youReceiveGbp": null, "maxBuyGbp": null},
          "compare": null,
          "feePosition": {"sellerType": null, "vatRegistered": null, "channel": "ebay", "feeBasis": "not_set"},
          "notSet": ["sellerType"],
          "price": {"gbp": 167.0, "source": null, "kind": null, "asOf": null, "cached": false},
          "computedAt": "2026-10-08T09:30:00.000Z"
        }
    """.trimIndent()

    @Test
    fun `an unknown figure is null with its reason never zero, and listing time sits beside the sum`() {
        val b = json.decodeFromString<PricedBreakdown>(feeUnset)
        val fee = b.lines.first { it.key == "ebay_fee" }
        assertNull(fee.amountGbp)
        assertEquals(MaxBuyUnavailableReason.SELLER_TYPE_NOT_SET, fee.unknownReason)
        assertNull(b.totals.youReceiveGbp)
        assertEquals(listOf(PricedNotSet.SELLER_TYPE), b.notSet)
        assertNull(b.lines.firstOrNull { it.key == "listing_time" }, "listing time is never in the arithmetic")
        val listing = b.beside.first { it.key == "listing_time" }
        assertEquals(false, listing.included)
        assertTrue(listing.estimate)
        assertEquals(1.0, listing.amountGbp, "a positive magnitude, not a deduction")
        assertEquals(5.0, listing.minutes)
    }

    @Test
    fun `the fee line carries its band and whether the basis is verified`() {
        val j = feeUnset.replace("\"amountGbp\": null, \"unknownReason\": \"seller_type_not_set\", \"source\": \"fee_model\"",
            "\"amountGbp\": -18.28, \"unknownReason\": null, \"perOrderBand\": \"high\", \"feeBasisVerified\": false, \"source\": \"fee_model\"")
        val fee = json.decodeFromString<PricedBreakdown>(j).lines.first { it.key == "ebay_fee" }
        assertEquals(PerOrderBand.HIGH, fee.perOrderBand)
        assertEquals(false, fee.feeBasisVerified)
        val unknown = json.decodeFromString<PricedBreakdown>(feeUnset).lines.first { it.key == "ebay_fee" }
        assertNull(unknown.feeBasisVerified)
        assertNull(unknown.perOrderBand)
    }

    @Test
    fun `an unrecognised line reason decodes to Unknown and the other lines survive`() {
        val b = json.decodeFromString<PricedBreakdown>(
            feeUnset.replaceFirst("\"unknownReason\": \"seller_type_not_set\", \"source\": \"fee_model\"", "\"unknownReason\": \"awaiting_review\", \"source\": \"fee_model\""))
        val fee = b.lines.first { it.key == "ebay_fee" }
        assertEquals(MaxBuyUnavailableReason.Unknown("awaiting_review"), fee.unknownReason)
        assertNull(fee.amountGbp)
        assertEquals(3, b.lines.size)
    }

    @Test
    fun `a breakdown round-trips with its nulls and reasons`() {
        val b = json.decodeFromString<PricedBreakdown>(feeUnset)
        assertEquals(b, json.decodeFromString<PricedBreakdown>(json.encodeToString(PricedBreakdown.serializer(), b)))
    }

    @Test
    fun `quick scan has a null breakdown exactly when it has a null decision`() {
        val q = json.decodeFromString<QuickScanResponse>("""{"identified": false, "candidates": [], "decision": null, "breakdown": null}""")
        assertNull(q.decision)
        assertNull(q.breakdown)
    }

    @Test
    fun `card_not_listable carries its reason and an unknown reason decodes`() {
        val known = json.decodeFromString<ListingRefusal>("""{"error": "Kept as yours", "code": "card_not_listable", "reason": "mine"}""")
        assertEquals(ListingRefusalCode.CARD_NOT_LISTABLE, known.code)
        assertEquals(ListingRefusalReason.MINE, known.reason)
        val future = json.decodeFromString<ListingRefusal>("""{"error": "x", "code": "card_not_listable", "reason": "quarantined"}""")
        assertEquals(ListingRefusalReason.Unknown("quarantined"), future.reason)
        assertNull(json.decodeFromString<ListingRefusal>("""{"error": "x", "code": "card_read_failed", "reason": null}""").reason)
    }

    @Test
    fun `the publish envelope carries the new arms`() {
        val e = json.decodeFromString<EbayPublishErrorResponse>(
            """{"error": "Kept", "code": "card_not_listable", "failure": {"code": "card_not_listable", "message": "Kept", "reason": "set_aside"}}""")
        val arm = assertIs<EbayPublishErrorCardNotListable>(e.failure)
        assertEquals(ListingRefusalReason.SET_ASIDE, arm.reason)
    }

    @Test
    fun `publish success carries the sku`() {
        val s = json.decodeFromString<EbayPublishSuccess>("""{"status":"published","sku":"SKU-ABC12345","offerId":"o","listingId":"l","listingUrl":null,"production":true}""")
        assertEquals("SKU-ABC12345", s.sku)
    }

    @Test
    fun `games response decodes and an unrecognised availability is not read as available`() {
        val g = json.decodeFromString<GamesResponse>(
            """{"games": [{"game": "pokemon", "displayName": "Pokémon", "availability": "available"}, {"game": "mtg", "displayName": "Magic", "availability": "beta"}]}""")
        assertEquals(GameAvailability.AVAILABLE, g.games[0].availability)
        assertEquals(GameAvailability.Unknown("beta"), g.games[1].availability)
    }

    @Test
    fun `a held copy has a non-null sku and heldAt, and a future status does not lose the copy`() {
        val c = json.decodeFromString<PhysicalCard>(
            """{"id": "a", "sku": "SKU-11111111", "status": "HELD", "game": "pokemon", "name": "Giratina V", "setName": null, "cardNumber": "186/196", "condition": "NM", "conditionConfirmed": true, "heldAt": "2026-10-06T10:15:00.000Z"}""")
        assertEquals("SKU-11111111", c.sku)
        assertEquals(PhysicalCardStatus.HELD, c.status)
        assertNotNull(c.heldAt)
        val f = json.decodeFromString<PhysicalCard>(
            """{"id": "a", "sku": "SKU-11111111", "status": "QUARANTINED", "game": "pokemon", "name": null, "setName": null, "cardNumber": null, "condition": null, "conditionConfirmed": false, "heldAt": null}""")
        assertEquals(PhysicalCardStatus.Unknown("QUARANTINED"), f.status)
        assertEquals("SKU-11111111", f.sku)
        assertEquals(PhysicalCardStatus.UNMATCHED, json.decodeFromString<PhysicalCard>(
            """{"id": "a", "sku": "SKU-1", "status": "UNMATCHED", "game": "pokemon", "name": "Charzard", "setName": null, "cardNumber": null, "condition": null, "conditionConfirmed": false, "heldAt": null}""").status)
    }

    @Test
    fun `a null tax rate is not set, and zero is a chosen none`() {
        val p = json.decodeFromString<StoredPricingSettings>("""{"ebayFeeRate": null, "ebayFeeFixed": null, "packagingCost": 0.34, "shippingCost": 0, "taxRate": null, "minProfitPct": 0.25, "minSaleValue": 1.5, "postageCost": 1.55}""")
        assertNull(p.taxRate)
        val z = json.decodeFromString<StoredPricingSettings>("""{"ebayFeeRate": null, "ebayFeeFixed": null, "packagingCost": 0.34, "shippingCost": 0, "taxRate": 0, "minProfitPct": 0.25, "minSaleValue": 1.5, "postageCost": 1.55}""")
        assertEquals(0.0, z.taxRate)
    }
}
