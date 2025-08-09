import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  GovSwapNativeSent,
  GovSwapUsdtSent,
  GovUpdated,
  MerchantSwapLyraToNative,
  MerchantSwapLyraToUsdt,
  MerchantUpdated,
  OwnershipTransferred,
  PricesUpdated
} from "../generated/LyraOtcSeller/LyraOtcSeller"

export function createGovSwapNativeSentEvent(
  gov: Address,
  recipient: Address,
  nativeIn: BigInt,
  lyraOut: BigInt,
  nativeFee: BigInt
): GovSwapNativeSent {
  let govSwapNativeSentEvent = changetype<GovSwapNativeSent>(newMockEvent())

  govSwapNativeSentEvent.parameters = new Array()

  govSwapNativeSentEvent.parameters.push(
    new ethereum.EventParam("gov", ethereum.Value.fromAddress(gov))
  )
  govSwapNativeSentEvent.parameters.push(
    new ethereum.EventParam("recipient", ethereum.Value.fromAddress(recipient))
  )
  govSwapNativeSentEvent.parameters.push(
    new ethereum.EventParam(
      "nativeIn",
      ethereum.Value.fromUnsignedBigInt(nativeIn)
    )
  )
  govSwapNativeSentEvent.parameters.push(
    new ethereum.EventParam(
      "lyraOut",
      ethereum.Value.fromUnsignedBigInt(lyraOut)
    )
  )
  govSwapNativeSentEvent.parameters.push(
    new ethereum.EventParam(
      "nativeFee",
      ethereum.Value.fromUnsignedBigInt(nativeFee)
    )
  )

  return govSwapNativeSentEvent
}

export function createGovSwapUsdtSentEvent(
  gov: Address,
  recipient: Address,
  usdtIn: BigInt,
  lyraOut: BigInt,
  nativeFee: BigInt
): GovSwapUsdtSent {
  let govSwapUsdtSentEvent = changetype<GovSwapUsdtSent>(newMockEvent())

  govSwapUsdtSentEvent.parameters = new Array()

  govSwapUsdtSentEvent.parameters.push(
    new ethereum.EventParam("gov", ethereum.Value.fromAddress(gov))
  )
  govSwapUsdtSentEvent.parameters.push(
    new ethereum.EventParam("recipient", ethereum.Value.fromAddress(recipient))
  )
  govSwapUsdtSentEvent.parameters.push(
    new ethereum.EventParam("usdtIn", ethereum.Value.fromUnsignedBigInt(usdtIn))
  )
  govSwapUsdtSentEvent.parameters.push(
    new ethereum.EventParam(
      "lyraOut",
      ethereum.Value.fromUnsignedBigInt(lyraOut)
    )
  )
  govSwapUsdtSentEvent.parameters.push(
    new ethereum.EventParam(
      "nativeFee",
      ethereum.Value.fromUnsignedBigInt(nativeFee)
    )
  )

  return govSwapUsdtSentEvent
}

export function createGovUpdatedEvent(
  who: Address,
  enabled: boolean
): GovUpdated {
  let govUpdatedEvent = changetype<GovUpdated>(newMockEvent())

  govUpdatedEvent.parameters = new Array()

  govUpdatedEvent.parameters.push(
    new ethereum.EventParam("who", ethereum.Value.fromAddress(who))
  )
  govUpdatedEvent.parameters.push(
    new ethereum.EventParam("enabled", ethereum.Value.fromBoolean(enabled))
  )

  return govUpdatedEvent
}

export function createMerchantSwapLyraToNativeEvent(
  merchant: Address,
  lyraIn: BigInt,
  nativeOut: BigInt
): MerchantSwapLyraToNative {
  let merchantSwapLyraToNativeEvent =
    changetype<MerchantSwapLyraToNative>(newMockEvent())

  merchantSwapLyraToNativeEvent.parameters = new Array()

  merchantSwapLyraToNativeEvent.parameters.push(
    new ethereum.EventParam("merchant", ethereum.Value.fromAddress(merchant))
  )
  merchantSwapLyraToNativeEvent.parameters.push(
    new ethereum.EventParam("lyraIn", ethereum.Value.fromUnsignedBigInt(lyraIn))
  )
  merchantSwapLyraToNativeEvent.parameters.push(
    new ethereum.EventParam(
      "nativeOut",
      ethereum.Value.fromUnsignedBigInt(nativeOut)
    )
  )

  return merchantSwapLyraToNativeEvent
}

export function createMerchantSwapLyraToUsdtEvent(
  merchant: Address,
  lyraIn: BigInt,
  usdtOut: BigInt
): MerchantSwapLyraToUsdt {
  let merchantSwapLyraToUsdtEvent =
    changetype<MerchantSwapLyraToUsdt>(newMockEvent())

  merchantSwapLyraToUsdtEvent.parameters = new Array()

  merchantSwapLyraToUsdtEvent.parameters.push(
    new ethereum.EventParam("merchant", ethereum.Value.fromAddress(merchant))
  )
  merchantSwapLyraToUsdtEvent.parameters.push(
    new ethereum.EventParam("lyraIn", ethereum.Value.fromUnsignedBigInt(lyraIn))
  )
  merchantSwapLyraToUsdtEvent.parameters.push(
    new ethereum.EventParam(
      "usdtOut",
      ethereum.Value.fromUnsignedBigInt(usdtOut)
    )
  )

  return merchantSwapLyraToUsdtEvent
}

export function createMerchantUpdatedEvent(
  who: Address,
  enabled: boolean
): MerchantUpdated {
  let merchantUpdatedEvent = changetype<MerchantUpdated>(newMockEvent())

  merchantUpdatedEvent.parameters = new Array()

  merchantUpdatedEvent.parameters.push(
    new ethereum.EventParam("who", ethereum.Value.fromAddress(who))
  )
  merchantUpdatedEvent.parameters.push(
    new ethereum.EventParam("enabled", ethereum.Value.fromBoolean(enabled))
  )

  return merchantUpdatedEvent
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

export function createPricesUpdatedEvent(
  priceUsdtPerNative: BigInt,
  lyraPerUsdt: BigInt
): PricesUpdated {
  let pricesUpdatedEvent = changetype<PricesUpdated>(newMockEvent())

  pricesUpdatedEvent.parameters = new Array()

  pricesUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "priceUsdtPerNative",
      ethereum.Value.fromUnsignedBigInt(priceUsdtPerNative)
    )
  )
  pricesUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "lyraPerUsdt",
      ethereum.Value.fromUnsignedBigInt(lyraPerUsdt)
    )
  )

  return pricesUpdatedEvent
}
