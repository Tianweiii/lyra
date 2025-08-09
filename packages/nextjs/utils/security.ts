export interface SecurityCheckResult {
  cybercrime: string;
  money_laundering: string;
  number_of_malicious_contracts_created: string;
  gas_abuse: string;
  financial_crime: string;
  darkweb_transactions: string;
  reinit: string;
  phishing_activities: string;
  contract_address: string;
  fake_kyc: string;
  blacklist_doubt: string;
  fake_standard_interface: string;
  data_source: string;
  stealing_attack: string;
  blackmail_activities: string;
  sanctioned: string;
  malicious_mining_activities: string;
  mixer: string;
  fake_token: string;
  honeypot_related_address: string;
}

export interface SecurityCheckResponse {
  success: boolean;
  data?: SecurityCheckResult;
  address: string;
  chainId: string;
  error?: string;
}

export const SecurityRiskLabels: Record<keyof SecurityCheckResult, string> = {
  cybercrime: "网络犯罪",
  money_laundering: "洗钱活动",
  number_of_malicious_contracts_created: "恶意合约创建",
  gas_abuse: "Gas滥用",
  financial_crime: "金融犯罪",
  darkweb_transactions: "暗网交易",
  reinit: "重新初始化",
  phishing_activities: "钓鱼活动",
  contract_address: "合约地址",
  fake_kyc: "虚假KYC",
  blacklist_doubt: "黑名单疑点",
  fake_standard_interface: "虚假标准接口",
  data_source: "数据源",
  stealing_attack: "盗窃攻击",
  blackmail_activities: "勒索活动",
  sanctioned: "制裁",
  malicious_mining_activities: "恶意挖矿",
  mixer: "混币器",
  fake_token: "虚假代币",
  honeypot_related_address: "蜜罐相关地址",
};

export async function checkAddressSecurity(address: string, chainId: string = "137"): Promise<SecurityCheckResponse> {
  try {
    const response = await fetch(`/api/security/address?address=${address}&chainId=${chainId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to check address security");
    }

    return data;
  } catch (error) {
    console.error("Security check error:", error);
    return {
      success: false,
      address,
      chainId,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export function getSecurityRisks(
  result: SecurityCheckResult,
): Array<{ key: keyof SecurityCheckResult; label: string; value: string }> {
  const risks: Array<{ key: keyof SecurityCheckResult; label: string; value: string }> = [];

  Object.entries(result).forEach(([key, value]) => {
    if (value === "1" && key !== "data_source") {
      risks.push({
        key: key as keyof SecurityCheckResult,
        label: SecurityRiskLabels[key as keyof SecurityCheckResult] || key,
        value,
      });
    }
  });

  return risks;
}

export function isAddressSuspicious(result: SecurityCheckResult): boolean {
  return Object.entries(result).some(([key, value]) => key !== "data_source" && value === "1");
}
