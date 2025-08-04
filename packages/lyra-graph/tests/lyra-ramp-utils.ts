import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  FeeCollected,
  OwnershipTransferred,
  RampRequestCompleted,
  RampRequestCreated,
  RateUpdated
} from "../generated/LyraRamp/LyraRamp"

export function createFeeCollectedEvent(
  requestId: BigInt,
  feeAmount: BigInt,
  token: Address,
  timestamp: BigInt
): FeeCollected {
  let feeCollectedEvent = changetype<FeeCollected>(newMockEvent())

  feeCollectedEvent.parameters = new Array()

  feeCollectedEvent.parameters.push(
    new ethereum.EventParam(
      "requestId",
      ethereum.Value.fromUnsignedBigInt(requestId)
    )
  )
  feeCollectedEvent.parameters.push(
    new ethereum.EventParam(
      "feeAmount",
      ethereum.Value.fromUnsignedBigInt(feeAmount)
    )
  )
  feeCollectedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  feeCollectedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return feeCollectedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createRampRequestCompletedEvent(
  requestId: BigInt,
  sender: Address,
  recipient: Address,
  amount: BigInt,
  currency: string,
  usdtAmount: BigInt,
  selectedChain: string,
  timestamp: BigInt
): RampRequestCompleted {
  let rampRequestCompletedEvent =
    changetype<RampRequestCompleted>(newMockEvent())

  rampRequestCompletedEvent.parameters = new Array()

  rampRequestCompletedEvent.parameters.push(
    new ethereum.EventParam(
      "requestId",
      ethereum.Value.fromUnsignedBigInt(requestId)
    )
  )
  rampRequestCompletedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )
  rampRequestCompletedEvent.parameters.push(
    new ethereum.EventParam("recipient", ethereum.Value.fromAddress(recipient))
  )
  rampRequestCompletedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  rampRequestCompletedEvent.parameters.push(
    new ethereum.EventParam("currency", ethereum.Value.fromString(currency))
  )
  rampRequestCompletedEvent.parameters.push(
    new ethereum.EventParam(
      "usdtAmount",
      ethereum.Value.fromUnsignedBigInt(usdtAmount)
    )
  )
  rampRequestCompletedEvent.parameters.push(
    new ethereum.EventParam(
      "selectedChain",
      ethereum.Value.fromString(selectedChain)
    )
  )
  rampRequestCompletedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return rampRequestCompletedEvent
}

export function createRampRequestCreatedEvent(
  requestId: BigInt,
  recipient: Address,
  currency: string,
  recipientName: string,
  amount: BigInt,
  usdtEquivalent: BigInt,
  selectedChain: string,
  timestamp: BigInt
): RampRequestCreated {
  let rampRequestCreatedEvent = changetype<RampRequestCreated>(newMockEvent())

  rampRequestCreatedEvent.parameters = new Array()

  rampRequestCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "requestId",
      ethereum.Value.fromUnsignedBigInt(requestId)
    )
  )
  rampRequestCreatedEvent.parameters.push(
    new ethereum.EventParam("recipient", ethereum.Value.fromAddress(recipient))
  )
  rampRequestCreatedEvent.parameters.push(
    new ethereum.EventParam("currency", ethereum.Value.fromString(currency))
  )
  rampRequestCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "recipientName",
      ethereum.Value.fromString(recipientName)
    )
  )
  rampRequestCreatedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  rampRequestCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "usdtEquivalent",
      ethereum.Value.fromUnsignedBigInt(usdtEquivalent)
    )
  )
  rampRequestCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "selectedChain",
      ethereum.Value.fromString(selectedChain)
    )
  )
  rampRequestCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return rampRequestCreatedEvent
}

export function createRateUpdatedEvent(
  currency: string,
  oldRate: BigInt,
  newRate: BigInt,
  timestamp: BigInt
): RateUpdated {
  let rateUpdatedEvent = changetype<RateUpdated>(newMockEvent())

  rateUpdatedEvent.parameters = new Array()

  rateUpdatedEvent.parameters.push(
    new ethereum.EventParam("currency", ethereum.Value.fromString(currency))
  )
  rateUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "oldRate",
      ethereum.Value.fromUnsignedBigInt(oldRate)
    )
  )
  rateUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newRate",
      ethereum.Value.fromUnsignedBigInt(newRate)
    )
  )
  rateUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return rateUpdatedEvent
}
