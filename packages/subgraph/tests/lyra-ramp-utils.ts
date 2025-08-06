import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  FeeCollected,
  OwnershipTransferred,
  PaymentCompleted,
  StablecoinAdded,
  StablecoinRemoved
} from "../generated/LyraRamp/LyraRamp"

export function createFeeCollectedEvent(
  paymentId: BigInt,
  feeAmount: BigInt,
  token: Address,
  timestamp: BigInt
): FeeCollected {
  let feeCollectedEvent = changetype<FeeCollected>(newMockEvent())

  feeCollectedEvent.parameters = new Array()

  feeCollectedEvent.parameters.push(
    new ethereum.EventParam(
      "paymentId",
      ethereum.Value.fromUnsignedBigInt(paymentId)
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

export function createPaymentCompletedEvent(
  paymentId: BigInt,
  sender: Address,
  recipient: Address,
  amount: BigInt,
  currency: string,
  stablecoinAmount: BigInt,
  sourceChain: string,
  targetChain: string,
  stablecoinToken: Address,
  timestamp: BigInt
): PaymentCompleted {
  let paymentCompletedEvent = changetype<PaymentCompleted>(newMockEvent())

  paymentCompletedEvent.parameters = new Array()

  paymentCompletedEvent.parameters.push(
    new ethereum.EventParam(
      "paymentId",
      ethereum.Value.fromUnsignedBigInt(paymentId)
    )
  )
  paymentCompletedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )
  paymentCompletedEvent.parameters.push(
    new ethereum.EventParam("recipient", ethereum.Value.fromAddress(recipient))
  )
  paymentCompletedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  paymentCompletedEvent.parameters.push(
    new ethereum.EventParam("currency", ethereum.Value.fromString(currency))
  )
  paymentCompletedEvent.parameters.push(
    new ethereum.EventParam(
      "stablecoinAmount",
      ethereum.Value.fromUnsignedBigInt(stablecoinAmount)
    )
  )
  paymentCompletedEvent.parameters.push(
    new ethereum.EventParam(
      "sourceChain",
      ethereum.Value.fromString(sourceChain)
    )
  )
  paymentCompletedEvent.parameters.push(
    new ethereum.EventParam(
      "targetChain",
      ethereum.Value.fromString(targetChain)
    )
  )
  paymentCompletedEvent.parameters.push(
    new ethereum.EventParam(
      "stablecoinToken",
      ethereum.Value.fromAddress(stablecoinToken)
    )
  )
  paymentCompletedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return paymentCompletedEvent
}

export function createStablecoinAddedEvent(
  token: Address,
  timestamp: BigInt
): StablecoinAdded {
  let stablecoinAddedEvent = changetype<StablecoinAdded>(newMockEvent())

  stablecoinAddedEvent.parameters = new Array()

  stablecoinAddedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  stablecoinAddedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return stablecoinAddedEvent
}

export function createStablecoinRemovedEvent(
  token: Address,
  timestamp: BigInt
): StablecoinRemoved {
  let stablecoinRemovedEvent = changetype<StablecoinRemoved>(newMockEvent())

  stablecoinRemovedEvent.parameters = new Array()

  stablecoinRemovedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  stablecoinRemovedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return stablecoinRemovedEvent
}
