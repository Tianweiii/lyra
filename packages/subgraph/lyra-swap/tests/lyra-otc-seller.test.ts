import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { GovSwapNativeSent } from "../generated/schema"
import { GovSwapNativeSent as GovSwapNativeSentEvent } from "../generated/LyraOtcSeller/LyraOtcSeller"
import { handleGovSwapNativeSent } from "../src/lyra-otc-seller"
import { createGovSwapNativeSentEvent } from "./lyra-otc-seller-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let gov = Address.fromString("0x0000000000000000000000000000000000000001")
    let recipient = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let nativeIn = BigInt.fromI32(234)
    let lyraOut = BigInt.fromI32(234)
    let nativeFee = BigInt.fromI32(234)
    let newGovSwapNativeSentEvent = createGovSwapNativeSentEvent(
      gov,
      recipient,
      nativeIn,
      lyraOut,
      nativeFee
    )
    handleGovSwapNativeSent(newGovSwapNativeSentEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("GovSwapNativeSent created and stored", () => {
    assert.entityCount("GovSwapNativeSent", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "GovSwapNativeSent",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "gov",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "GovSwapNativeSent",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "recipient",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "GovSwapNativeSent",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "nativeIn",
      "234"
    )
    assert.fieldEquals(
      "GovSwapNativeSent",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "lyraOut",
      "234"
    )
    assert.fieldEquals(
      "GovSwapNativeSent",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "nativeFee",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#asserts
  })
})
