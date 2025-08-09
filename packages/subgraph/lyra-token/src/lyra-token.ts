import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  Approval as ApprovalEvent,
  GovernmentUpdated as GovernmentUpdatedEvent,
  MerchantUpdated as MerchantUpdatedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  Transfer as TransferEvent
} from "../generated/LyraToken/LyraToken"
import {
  Approval,
  GovernmentUpdated,
  MerchantUpdated,
  OwnershipTransferred,
  Transfer,
  Account
} from "../generated/schema"

function getOrCreateAccount(address: Bytes): Account {
  let account = Account.load(address)
  if (account == null) {
    account = new Account(address) // now it's Bytes, not string
    account.balance = BigInt.zero()
    account.save()
  }
  return account
}

export function handleApproval(event: ApprovalEvent): void {
  let entity = new Approval(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.spender = event.params.spender
  entity.value = event.params.value

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleGovernmentUpdated(event: GovernmentUpdatedEvent): void {
  let entity = new GovernmentUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.who = event.params.who
  entity.enabled = event.params.enabled

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMerchantUpdated(event: MerchantUpdatedEvent): void {
  let entity = new MerchantUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.who = event.params.who
  entity.enabled = event.params.enabled

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

export function handleTransfer(event: TransferEvent): void {
  let entity = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.from = event.params.from
  entity.to = event.params.to
  entity.value = event.params.value

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  const zeroAddress = Bytes.fromHexString("0x0000000000000000000000000000000000000000");

  // Update balances
  if (event.params.from != zeroAddress) {
    let fromAccount = getOrCreateAccount(event.params.from)
    fromAccount.balance = fromAccount.balance.minus(event.params.value)
    fromAccount.save()
  }

  if (event.params.to != zeroAddress) {
    let toAccount = getOrCreateAccount(event.params.to)
    toAccount.balance = toAccount.balance.plus(event.params.value)
    toAccount.save()
  }
}
