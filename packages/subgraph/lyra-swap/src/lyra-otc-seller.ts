import {
  GovSwapNativeSent as GovSwapNativeSentEvent,
  GovSwapUsdtSent as GovSwapUsdtSentEvent,
  GovUpdated as GovUpdatedEvent,
  MerchantSwapLyraToNative as MerchantSwapLyraToNativeEvent,
  MerchantSwapLyraToUsdt as MerchantSwapLyraToUsdtEvent,
  MerchantUpdated as MerchantUpdatedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  PricesUpdated as PricesUpdatedEvent
} from "../generated/LyraOtcSeller/LyraOtcSeller"
import {
  GovSwapNativeSent,
  GovSwapUsdtSent,
  GovUpdated,
  MerchantSwapLyraToNative,
  MerchantSwapLyraToUsdt,
  MerchantUpdated,
  OwnershipTransferred,
  PricesUpdated
} from "../generated/schema"

export function handleGovSwapNativeSent(event: GovSwapNativeSentEvent): void {
  let entity = new GovSwapNativeSent(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.gov = event.params.gov
  entity.recipient = event.params.recipient
  entity.nativeIn = event.params.nativeIn
  entity.lyraOut = event.params.lyraOut
  entity.nativeFee = event.params.nativeFee

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleGovSwapUsdtSent(event: GovSwapUsdtSentEvent): void {
  let entity = new GovSwapUsdtSent(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.gov = event.params.gov
  entity.recipient = event.params.recipient
  entity.usdtIn = event.params.usdtIn
  entity.lyraOut = event.params.lyraOut
  entity.nativeFee = event.params.nativeFee

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleGovUpdated(event: GovUpdatedEvent): void {
  let entity = new GovUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.who = event.params.who
  entity.enabled = event.params.enabled

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMerchantSwapLyraToNative(
  event: MerchantSwapLyraToNativeEvent
): void {
  let entity = new MerchantSwapLyraToNative(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.merchant = event.params.merchant
  entity.lyraIn = event.params.lyraIn
  entity.nativeOut = event.params.nativeOut

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMerchantSwapLyraToUsdt(
  event: MerchantSwapLyraToUsdtEvent
): void {
  let entity = new MerchantSwapLyraToUsdt(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.merchant = event.params.merchant
  entity.lyraIn = event.params.lyraIn
  entity.usdtOut = event.params.usdtOut

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

export function handlePricesUpdated(event: PricesUpdatedEvent): void {
  let entity = new PricesUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.priceUsdtPerNative = event.params.priceUsdtPerNative
  entity.lyraPerUsdt = event.params.lyraPerUsdt

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
