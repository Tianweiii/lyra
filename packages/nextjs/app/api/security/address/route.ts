import { NextRequest, NextResponse } from "next/server";
import { ErrorCode, GoPlus } from "@goplus/sdk-node";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    const chainId = searchParams.get("chainId") || "137"; // Default to Polygon

    if (!address) {
      return NextResponse.json({ error: "Address parameter is required" }, { status: 400 });
    }

    // Validate address format (basic check)
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json({ error: "Invalid address format" }, { status: 400 });
    }

    // Call GoPlus API
    const res = await GoPlus.addressSecurity(chainId, address, 30);

    if (res.code !== ErrorCode.SUCCESS) {
      console.error("GoPlus API error:", res.message);
      return NextResponse.json({ error: res.message || "Failed to check address security" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: res.result,
      address,
      chainId,
    });
  } catch (error) {
    console.error("Address security check error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
