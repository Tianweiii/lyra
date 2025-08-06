import {
  FeeCollected as FeeCollectedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  PaymentCompleted as PaymentCompletedEvent,
  StablecoinAdded as StablecoinAddedEvent,
  StablecoinRemoved as StablecoinRemovedEvent
} from "../generated/LyraRamp/LyraRamp"
import {
  FeeCollected,
  OwnershipTransferred,
  PaymentCompleted,
  StablecoinAdded,
  StablecoinRemoved
} from "../generated/schema"

export function handleFeeCollected(event: FeeCollectedEvent): void {
  let entity = new FeeCollected(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.paymentId = event.params.paymentId
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

export function handlePaymentCompleted(event: PaymentCompletedEvent): void {
  let entity = new PaymentCompleted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.paymentId = event.params.paymentId
  entity.sender = event.params.sender
  entity.recipient = event.params.recipient
  entity.amount = event.params.amount
  entity.currency = event.params.currency
  entity.stablecoinAmount = event.params.stablecoinAmount
  entity.sourceChain = event.params.sourceChain
  entity.targetChain = event.params.targetChain
  entity.stablecoinToken = event.params.stablecoinToken
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleStablecoinAdded(event: StablecoinAddedEvent): void {
  let entity = new StablecoinAdded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.token = event.params.token
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleStablecoinRemoved(event: StablecoinRemovedEvent): void {
  let entity = new StablecoinRemoved(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.token = event.params.token
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
