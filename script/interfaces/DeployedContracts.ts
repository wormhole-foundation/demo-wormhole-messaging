export interface ContractDetails {
	[contractName: string]: string;
}

export interface DeployedContracts {
	[key: string]: ContractDetails & { deployedAt?: string };
}
