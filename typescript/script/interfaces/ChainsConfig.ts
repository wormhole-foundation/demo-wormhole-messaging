export interface Chain {
	description: string;
	rpc: string;
	wormholeRelayer: string;
}

export interface ChainsConfig {
	chains: Chain[];
}
