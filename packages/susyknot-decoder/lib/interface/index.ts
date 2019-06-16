import { AstDefinition } from "susyknot-decode-utils";
import { DataPointer } from "../types/pointer";
import { SvmInfo } from "../types/svm";
import decode from "../decode";
import SusyknotDecoder from "./contract-decoder";
import { ContractObject } from "susyknot-contract-schema/spec";
import { Provider } from "susyweb/providers";
import { DecoderRequest } from "../types/request";

export { getStorageAllocations, storageSize } from "../allocate/storage";
export { getCalldataAllocations } from "../allocate/calldata";
export { getMemoryAllocations } from "../allocate/memory";
export { readStack } from "../read/stack";
export { slotAddress } from "../read/storage";

export function forContract(contract: ContractObject, relevantContracts: ContractObject[], provider: Provider, address?: string): SusyknotDecoder {
  return new SusyknotDecoder(contract, relevantContracts, provider, address);
}

export function* forSvmState(definition: AstDefinition, pointer: DataPointer, info: SvmInfo): IterableIterator<any | DecoderRequest> {
  return yield* decode(definition, pointer, info);
}
