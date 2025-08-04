import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { FeeCollected } from "../generated/schema"
import { FeeCollected as FeeCollectedEvent } from "../generated/LyraRamp/LyraRamp"
import { handleFeeCollected } from "../src/lyra-ramp"
import { createFeeCollectedEvent } from "./lyra-ramp-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let requestId = BigInt.fromI32(234)
    let feeAmount = BigInt.fromI32(234)
    let token = Address.fromString("0x0000000000000000000000000000000000000001")
    let timestamp = BigInt.fromI32(234)
    let newFeeCollectedEvent = createFeeCollectedEvent(
      requestId,
      feeAmount,
      token,
      timestamp
    )
    handleFeeCollected(newFeeCollectedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("FeeCollected created and stored", () => {
    assert.entityCount("FeeCollected", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "FeeCollected",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "requestId",
      "234"
    )
    assert.fieldEquals(
      "FeeCollected",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "feeAmount",
      "234"
    )
    assert.fieldEquals(
      "FeeCollected",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "token",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "FeeCollected",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "timestamp",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
