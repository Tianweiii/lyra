import {
  FeeCollected as FeeCollectedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  RampRequestCompleted as RampRequestCompletedEvent,
  RampRequestCreated as RampRequestCreatedEvent,
  RateUpdated as RateUpdatedEvent
} from "../generated/LyraRamp/LyraRamp"
import {
  FeeCollected,
  OwnershipTransferred,
  RampRequestCompleted,
  RampRequestCreated,
  RateUpdated
} from "../generated/schema"

export function handleFeeCollected(event: FeeCollectedEvent): void {
  let entity = new FeeCollected(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.requestId = event.params.requestId
  entity.feeAmount = event.params.feeAmount
  entity.token = event.params.token
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRampRequestCompleted(
  event: RampRequestCompletedEvent
): void {
  let entity = new RampRequestCompleted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.requestId = event.params.requestId
  entity.sender = event.params.sender
  entity.recipient = event.params.recipient
  entity.amount = event.params.amount
  entity.currency = event.params.currency
  entity.usdtAmount = event.params.usdtAmount
  entity.selectedChain = event.params.selectedChain
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRampRequestCreated(event: RampRequestCreatedEvent): void {
  let entity = new RampRequestCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.requestId = event.params.requestId
  entity.recipient = event.params.recipient
  entity.currency = event.params.currency
  entity.recipientName = event.params.recipientName
  entity.amount = event.params.amount
  entity.usdtEquivalent = event.params.usdtEquivalent
  entity.selectedChain = event.params.selectedChain
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRateUpdated(event: RateUpdatedEvent): void {
  let entity = new RateUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.currency = event.params.currency
  entity.oldRate = event.params.oldRate
  entity.newRate = event.params.newRate
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
