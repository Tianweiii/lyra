declare module "@goplus/sdk-node" {
  export interface GoPlusAPI {
    addressSecurity: (
      chainId: string,
      address: string,
      timeout?: number,
    ) => Promise<{
      code: number;
      message: string;
      result: Record<string, any>;
    }>;
  }

  export const GoPlus: GoPlusAPI;

  export enum ErrorCode {
    SUCCESS = 1,
    FAILURE = 0,
  }
}
